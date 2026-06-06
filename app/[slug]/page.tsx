import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import PublicAgent from "./PublicAgent";
import CityHub from "./CityHub";
import { getCity } from "@/lib/seo/registry";

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
    .select("id, name, slug, bee_name, category, city, location, bio, logo_url, rating, review_count, follower_count, phone, website")
    .eq(lookupField, lookupValue).maybeSingle();
  return account;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  // City hub (e.g. /coimbatore)
  const city = getCity(slug);
  if (city) {
    const title = `Businesses in ${city.name} — local directory | Hanubees`;
    const description = `Find local businesses in ${city.name}, ${city.country} — hospitals, restaurants, services and more. Ask Hanubees' AI.`;
    return { title, description, alternates: { canonical: `https://www.hanubees.com/${city.slug}` }, openGraph: { title, description, url: `https://www.hanubees.com/${city.slug}`, type: "website" } };
  }
  const account = await getAccount(slug);
  if (!account) return { title: "Not found — Hanubees" };
  const title = `${account.name} — ask their AI · Hanubees`;
  const description = account.bio || `Chat with ${account.name}'s AI receptionist. Ask anything — answered instantly.`;
  return {
    title, description,
    openGraph: { title, description, url: `https://www.hanubees.com/${slug}`, type: "website",
      images: [{ url: "https://www.hanubees.com/api/og", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PublicAgentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // City hub (e.g. /coimbatore) takes priority over business lookup.
  const city = getCity(slug);
  if (city) return <CityHub city={city} />;

  const account = await getAccount(slug);
  if (!account) notFound();

  const { data: entries } = await db()
    .from("data_entries").select("content, tag")
    .eq("account_id", account.id).eq("visibility", "public").limit(12);

  // LocalBusiness structured data — lets Google + AI engines read/cite this business.
  const a = account as any;
  const ld: any = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: a.name,
    url: `https://www.hanubees.com/${a.slug}`,
    ...(a.category ? { description: `${a.category}${a.city ? " in " + a.city : ""}` } : {}),
    ...(a.bio ? { slogan: String(a.bio).slice(0, 200) } : {}),
    ...(a.phone ? { telephone: a.phone } : {}),
    ...(a.website ? { sameAs: [a.website] } : {}),
    ...(a.logo_url ? { image: a.logo_url } : {}),
    address: { "@type": "PostalAddress", ...(a.location ? { addressLocality: a.location } : {}), ...(a.city ? { addressRegion: a.city } : {}) },
    ...(a.review_count > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: a.rating, reviewCount: a.review_count } } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PublicAgent account={account} highlights={(entries ?? []) as { content: string; tag: string | null }[]} />
    </>
  );
}
