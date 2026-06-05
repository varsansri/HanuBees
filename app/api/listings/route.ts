import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const VERTICALS = ["services", "secondhand", "realestate", "rental", "b2b", "transport", "product"];

async function ownAccount(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: account } = await supabase
    .from("accounts").select("id").eq("user_id", user.id).maybeSingle();
  return account?.id ?? null;
}

// List my listings
export async function GET() {
  const supabase = await createClient();
  const accountId = await ownAccount(supabase);
  if (!accountId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { data } = await supabase
    .from("listings").select("*").eq("account_id", accountId)
    .order("created_at", { ascending: false });
  return NextResponse.json({ listings: data ?? [] });
}

// Create a listing
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const accountId = await ownAccount(supabase);
  if (!accountId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const b = await req.json().catch(() => ({}));
  const title = String(b.title || "").trim();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
  const vertical = VERTICALS.includes(b.vertical) ? b.vertical : "product";

  const { data, error } = await supabase
    .from("listings")
    .insert({
      account_id: accountId,
      vertical,
      title: title.slice(0, 140),
      description: b.description ? String(b.description).slice(0, 1000) : null,
      price: b.price === "" || b.price == null ? null : Number(b.price),
      area: b.area ? String(b.area).slice(0, 80) : null,
    })
    .select()
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ listing: data });
}

// Update status/fields (body: {id, status?, price?, ...})
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const accountId = await ownAccount(supabase);
  if (!accountId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const patch: any = {};
  if (b.status) patch.status = b.status;
  if ("price" in b) patch.price = b.price === "" || b.price == null ? null : Number(b.price);
  if ("title" in b) patch.title = String(b.title).slice(0, 140);
  if ("description" in b) patch.description = String(b.description).slice(0, 1000);
  if ("area" in b) patch.area = String(b.area).slice(0, 80);
  if (!Object.keys(patch).length) return NextResponse.json({ error: "nothing to update" }, { status: 400 });

  await supabase.from("listings").update(patch).eq("id", b.id).eq("account_id", accountId);
  return NextResponse.json({ ok: true });
}

// Delete (?id=)
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const accountId = await ownAccount(supabase);
  if (!accountId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await supabase.from("listings").delete().eq("id", id).eq("account_id", accountId);
  return NextResponse.json({ ok: true });
}
