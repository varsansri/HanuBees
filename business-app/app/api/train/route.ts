import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Owner teaches their agent: store the text as a knowledge fact the public agent
// answers from. RLS allows it because the account is owned by this auth user.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: account } = await supabase
    .from("accounts").select("id").eq("user_id", user.id).maybeSingle();
  if (!account) return NextResponse.json({ error: "No agent on this account yet." }, { status: 400 });

  const text = String((await req.json().catch(() => ({})))?.text || "").trim();
  if (!text) return NextResponse.json({ error: "Type or say something." }, { status: 400 });

  const { data: entry, error } = await supabase
    .from("data_entries")
    .insert({ account_id: account.id, content: text.slice(0, 2000), source: "manual", visibility: "public" })
    .select("id, content, created_at").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, entry });
}
