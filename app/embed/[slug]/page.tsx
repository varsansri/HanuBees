import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import EmbedChat from "./EmbedChat";

export const dynamic = "force-dynamic";

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

async function getAccount(slug: string) {
  const isBee = slug.endsWith(".bee");
  const field = isBee ? "bee_name" : "slug";
  const val = isBee ? slug.slice(0, -4) : slug;
  const byField = await db().from("accounts").select("id, name, slug, bee_name, category, city").eq(field, val).maybeSingle();
  if (byField.data) return byField.data;
  // also allow passing the bee_name directly without .bee
  const byBee = await db().from("accounts").select("id, name, slug, bee_name, category, city").eq("bee_name", slug).maybeSingle();
  return byBee.data;
}

export default async function EmbedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const account = await getAccount(slug);
  if (!account) notFound();
  return <EmbedChat account={account as any} />;
}
