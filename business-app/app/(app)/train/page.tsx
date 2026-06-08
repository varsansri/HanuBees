import { createClient } from "@/lib/supabase/server";
import TrainUI from "@/components/TrainUI";

export const dynamic = "force-dynamic";

export default async function Train() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: account } = await supabase
    .from("accounts").select("id, name, bee_name").eq("user_id", user!.id).maybeSingle();

  if (!account) {
    return <p style={{ color: "var(--fg2)" }}>Create your agent first (see Dashboard).</p>;
  }

  const { data: recent } = await supabase
    .from("data_entries").select("id, content, created_at")
    .eq("account_id", account.id).order("created_at", { ascending: false }).limit(8);

  return <TrainUI beeName={account.bee_name} recent={recent || []} />;
}
