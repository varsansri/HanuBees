import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import ConsumerChat from "./ConsumerChat";
import HanubeesChat from "./HanubeesChat";

export const dynamic = "force-dynamic";

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

async function getAccount(slug: string) {
  const isBee = slug.endsWith(".bee");
  const field = isBee ? "bee_name" : "slug";
  const value = isBee ? slug.slice(0, -4) : slug;
  const { data } = await db()
    .from("accounts")
    .select("id, name, slug, bee_name, category, city, location, bio, logo_url, rating, review_count, follower_count")
    .eq(field, value).maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "hanubees") return { title: "Hanubees — your local guide", description: "Find any local business and get instant answers, free." };
  const a = await getAccount(slug);
  if (!a) return { title: "Not found — Hanubees" };
  const title = `Chat with ${a.name} · Hanubees`;
  const description = a.bio || `Ask ${a.name} anything — answered instantly by their AI.`;
  return { title, description, openGraph: { title, description, type: "website" } };
}

export default async function ConsumerChatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Reserved: the Hanubees guide assistant (always available, not a business account)
  if (slug === "hanubees") return <HanubeesChat />;
  const account = await getAccount(slug);
  if (!account) notFound();

  const { data: entries } = await db()
    .from("data_entries").select("content, tag")
    .eq("account_id", account.id).eq("visibility", "public").limit(12);

  return <ConsumerChat account={account as any} highlights={(entries ?? []) as { content: string; tag: string | null }[]} />;
}
