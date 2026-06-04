import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import PublicAgent from "./PublicAgent";

export const dynamic = "force-dynamic";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

async function getAccount(slug: string) {
  // Support both hanubees.com/my-business and hanubees.com/rosa.bee
  const isBee = slug.endsWith(".bee");
  const lookupField = isBee ? "bee_name" : "slug";
  const lookupValue = isBee ? slug.slice(0, -4) : slug; // remove ".bee" suffix if present

  const { data: account } = await db()
    .from("accounts")
    .select("id, name, slug, bee_name, category, city, location, bio, logo_url, rating, review_count, follower_count")
    .eq(lookupField, lookupValue).maybeSingle();
  return account;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const account = await getAccount(slug);
  if (!account) return { title: "Not found — Hanubees" };
  const title = `${account.name} — ask their AI · Hanubees`;
  const description = account.bio || `Chat with ${account.name}'s AI receptionist. Ask anything — answered instantly.`;
  return {
    title, description,
    openGraph: { title, description, url: `https://hanubees.com/${slug}`, type: "website",
      images: [{ url: "https://hanubees.com/api/og", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PublicAgentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const account = await getAccount(slug);
  if (!account) notFound();

  const { data: entries } = await db()
    .from("data_entries").select("content, tag")
    .eq("account_id", account.id).eq("visibility", "public").limit(12);

  return <PublicAgent account={account} highlights={(entries ?? []) as { content: string; tag: string | null }[]} />;
}
