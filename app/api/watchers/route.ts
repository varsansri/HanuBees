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

// List my watchers
export async function GET() {
  const supabase = await createClient();
  const accountId = await ownAccount(supabase);
  if (!accountId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { data } = await supabase
    .from("watchers").select("*").eq("account_id", accountId)
    .order("created_at", { ascending: false });
  return NextResponse.json({ watchers: data ?? [] });
}

// Create a watcher
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const accountId = await ownAccount(supabase);
  if (!accountId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const label = String(body.label || "").trim();
  if (!label) return NextResponse.json({ error: "label required" }, { status: 400 });

  const params: any = {};
  if (body.query) params.query = String(body.query).slice(0, 80);
  if (body.category) params.category = String(body.category).slice(0, 60);
  if (body.discountAtLeast != null && body.discountAtLeast !== "")
    params.discountAtLeast = Math.max(0, Math.min(100, Number(body.discountAtLeast)));
  if (body.priceUnder != null && body.priceUnder !== "")
    params.priceUnder = Math.max(0, Number(body.priceUnder));

  const { data, error } = await supabase
    .from("watchers")
    .insert({
      account_id: accountId,
      label,
      kind: body.kind || "offer",
      params,
      color: body.color || "#ffbe00",
    })
    .select()
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ watcher: data });
}

// Delete a watcher  (?id=)
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const accountId = await ownAccount(supabase);
  if (!accountId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await supabase.from("watchers").delete().eq("id", id).eq("account_id", accountId);
  return NextResponse.json({ ok: true });
}
