import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runWatchers } from "@/lib/watchers/engine";

export const runtime = "nodejs";

// Run my watchers now and create any new notifications. Called when the
// notifications page opens and by a "Refresh" tap. (Overnight cron comes in Phase 2.)
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { data: account } = await supabase
    .from("accounts").select("id").eq("user_id", user.id).maybeSingle();
  if (!account) return NextResponse.json({ error: "no_account" }, { status: 200 });

  const created = await runWatchers(supabase, account.id);
  return NextResponse.json({ created });
}
