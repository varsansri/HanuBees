import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { embedMissing } from "@/lib/ai/embed";

export const runtime = "nodejs";

// Backfills embeddings for the signed-in owner's data_entries that lack one.
// Called after manual adds, and usable to embed pre-existing data once.
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: account } = await supabase.from("accounts").select("id").eq("user_id", user.id).maybeSingle();
  if (!account) return NextResponse.json({ error: "no_account" }, { status: 400 });

  const embedded = await embedMissing(supabase, account.id, 200);
  return NextResponse.json({ embedded });
}
