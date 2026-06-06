import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { CITIES, CATEGORIES, getCity, getCategory, termFilter } from "@/lib/seo/registry";

export const revalidate = 86400; // ISR: rebuild daily

const YELLOW = "#ffbe00", GREEN = "#98aa9d", FG = "#eaeaea", MUTED = "#a9a9a7", BG2 = "#1a1a1a";

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

async function getBusinesses(cityName: string, catSlug: string) {
  const cat = getCategory(catSlug);
  if (!cat) return [];
  const { data } = await db()
    .from("accounts")
    .select("name, slug, bee_name, category, location, phone, website")
    .eq("type", "business")
    .ilike("city", `%${cityName}%`)
    .or(termFilter(cat))
    .limit(300);
  return data || [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; category: string }> }): Promise<Metadata> {
  const { slug, category } = await params;
  const city = getCity(slug), cat = getCategory(category);
  if (!city || !cat) return { title: "Not found — Hanubees" };
  const list = await getBusinesses(city.name, category);
  const title = `${cat.title} in ${city.name} (2026) — ${list.length} listed | Hanubees`;
  const description = `Find ${cat.title.toLowerCase()} in ${city.name}. ${list.length} listed with contact details — ask Hanubees' AI for prices, hours and more.`;
  const url = `https://www.hanubees.com/${city.slug}/${cat.slug}`;
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
  };
}

export default async function CityCategoryPage({ params }: { params: Promise<{ slug: string; category: string }> }) {
  const { slug, category } = await params;
  const city = getCity(slug), cat = getCategory(category);
  if (!city || !cat) notFound();

  const list = await getBusinesses(city.name, category);

  // JSON-LD: ItemList + Breadcrumb
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${cat.title} in ${city.name}`,
    numberOfItems: list.length,
    itemListElement: list.slice(0, 50).map((b: any, i: number) => ({
      "@type": "ListItem", position: i + 1,
      item: {
        "@type": "LocalBusiness",
        name: b.name,
        ...(b.phone ? { telephone: b.phone } : {}),
        ...(b.location ? { address: { "@type": "PostalAddress", addressLocality: b.location, addressRegion: city.name } } : {}),
        url: `https://www.hanubees.com/${b.slug}`,
      },
    })),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hanubees", item: "https://www.hanubees.com" },
      { "@type": "ListItem", position: 2, name: city.name, item: `https://www.hanubees.com/${city.slug}` },
      { "@type": "ListItem", position: 3, name: cat.title, item: `https://www.hanubees.com/${city.slug}/${cat.slug}` },
    ],
  };

  const otherCats = CATEGORIES.filter((c) => c.slug !== cat.slug).slice(0, 10);
  const otherCities = CITIES.filter((c) => c.slug !== city.slug);

  // FAQ — useful for people + highly citable by AI answer engines (FAQPage schema)
  const faqs = [
    { q: `How many ${cat.title.toLowerCase()} are there in ${city.name}?`,
      a: `Hanubees lists ${list.length} ${cat.title.toLowerCase()} in ${city.name}. You can ask any of them questions instantly through its AI.` },
    { q: `How do I contact ${cat.title.toLowerCase()} in ${city.name}?`,
      a: `Open any listing to see its phone and website, or just ask its AI agent on Hanubees — it answers prices, hours and availability 24/7.` },
    { q: `What is the best ${cat.singular} in ${city.name}?`,
      a: `Browse the list and ask each one directly. Hanubees ranks by profile completeness and how often each business is searched, with verified reviews coming soon.` },
    { q: `Is Hanubees free to use?`,
      a: `Yes — browsing and asking are completely free, with no signup. Businesses can claim a free AI agent too.` },
  ];
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div style={{ minHeight: "100vh", maxWidth: 760, margin: "0 auto", padding: "20px 16px 60px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* Breadcrumb */}
      <nav style={{ fontSize: 12.5, color: MUTED, marginBottom: 14 }}>
        <Link href="/" style={{ color: GREEN, textDecoration: "none" }}>Hanubees</Link>
        {" / "}
        <Link href={`/${city.slug}`} style={{ color: GREEN, textDecoration: "none" }}>{city.name}</Link>
        {" / "}<span>{cat.title}</span>
      </nav>

      <h1 style={{ fontSize: 27, fontWeight: 700, color: FG, margin: "0 0 8px", lineHeight: 1.15 }}>
        {cat.title} in {city.name}
      </h1>
      <p style={{ fontSize: 15, color: MUTED, margin: "0 0 8px", lineHeight: 1.5 }}>
        {list.length > 0
          ? `${list.length} ${cat.title.toLowerCase()} in ${city.name}. Tap any to see details, or ask the AI for prices, hours and directions.`
          : `We're still gathering ${cat.title.toLowerCase()} in ${city.name}. Check back soon.`}
      </p>
      <Link href="/chat" style={{ display: "inline-block", color: YELLOW, fontWeight: 600, fontSize: 14, textDecoration: "none", marginBottom: 22 }}>
        Ask the AI →
      </Link>

      {/* Listings */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.map((b: any) => (
          <Link key={b.slug} href={`/${b.slug}`} style={{ textDecoration: "none" }}>
            <div style={{ background: BG2, border: "1px solid rgba(234,234,234,0.06)", borderRadius: 12, padding: 14 }}>
              <p style={{ fontSize: 15.5, fontWeight: 600, color: FG, margin: 0 }}>{b.name}</p>
              <p style={{ fontSize: 12.5, color: MUTED, margin: "3px 0 0" }}>
                {[b.category, b.location].filter(Boolean).join(" · ")}
              </p>
              {b.phone && <p style={{ fontSize: 13, color: GREEN, margin: "5px 0 0" }}>{b.phone}</p>}
            </div>
          </Link>
        ))}
      </div>

      {/* Internal links */}
      <section style={{ marginTop: 34 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: FG, marginBottom: 10 }}>More in {city.name}</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {otherCats.map((c) => (
            <Link key={c.slug} href={`/${city.slug}/${c.slug}`} style={{ fontSize: 13, color: GREEN, background: BG2, padding: "7px 12px", borderRadius: 9, textDecoration: "none", border: "1px solid rgba(152,170,157,0.18)" }}>
              {c.title}
            </Link>
          ))}
        </div>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: FG, margin: "22px 0 10px" }}>{cat.title} in other cities</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {otherCities.map((c) => (
            <Link key={c.slug} href={`/${c.slug}/${cat.slug}`} style={{ fontSize: 13, color: GREEN, background: BG2, padding: "7px 12px", borderRadius: 9, textDecoration: "none", border: "1px solid rgba(152,170,157,0.18)" }}>
              {cat.title} in {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ marginTop: 34 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: FG, marginBottom: 12 }}>FAQ</h2>
        {faqs.map((f, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: FG, margin: 0 }}>{f.q}</p>
            <p style={{ fontSize: 13.5, color: MUTED, margin: "4px 0 0", lineHeight: 1.5 }}>{f.a}</p>
          </div>
        ))}
      </section>

      <footer style={{ marginTop: 40, paddingTop: 16, borderTop: "1px solid rgba(234,234,234,0.06)", fontSize: 12.5, color: MUTED }}>
        Powered by <Link href="/" style={{ color: GREEN, textDecoration: "none" }}>Hanubees</Link> — your business, answered by AI.
      </footer>
    </div>
  );
}
