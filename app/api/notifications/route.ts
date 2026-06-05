import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function ownAccount(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: account } = await supabase
    .from("accounts").select("id").eq("user_id", user.id).maybeSingle();
  return account?.id ?? null;
}

// List my notifications (optionally ?folder=primary|general|spam)
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const accountId = await ownAccount(supabase);
  if (!accountId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const folder = new URL(req.url).searchParams.get("folder");
  let q = supabase
    .from("notifications").select("*").eq("account_id", accountId)
    .order("created_at", { ascending: false }).limit(200);
  if (folder) q = q.eq("folder", folder);
  const { data } = await q;

  // unread counts per folder for the tab badges
  const { data: all } = await supabase
    .from("notifications").select("folder, read").eq("account_id", accountId);
  const counts: Record<string, number> = { primary: 0, general: 0, spam: 0 };
  for (const n of (all ?? []) as any[]) if (!n.read) counts[n.folder] = (counts[n.folder] || 0) + 1;

  return NextResponse.json({ notifications: data ?? [], unread: counts });
}

// Mark read / move folder. Body: {id, read?, folder?}  (no id = mark all read)
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const accountId = await ownAccount(supabase);
  if (!accountId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const patch: any = {};
  if (typeof body.read === "boolean") patch.read = body.read;
  if (body.folder) patch.folder = body.folder;
  if (!Object.keys(patch).length) return NextResponse.json({ error: "nothing to update" }, { status: 400 });

  let q = supabase.from("notifications").update(patch).eq("account_id", accountId);
  if (body.id) q = q.eq("id", body.id);
  await q;
  return NextResponse.json({ ok: true });
}
