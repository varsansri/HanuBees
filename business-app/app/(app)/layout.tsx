import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("accounts").select("name").eq("user_id", user.id).maybeSingle();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Nav name={account?.name || user.email || "Your business"} />
      <main style={{ flex: 1, padding: "28px 32px", maxWidth: 1100 }}>{children}</main>
    </div>
  );
}
