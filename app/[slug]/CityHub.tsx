import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { CITIES, CATEGORIES, type City } from "@/lib/seo/registry";

const YELLOW = "#ffbe00", GREEN = "#98aa9d", FG = "#eaeaea", MUTED = "#a9a9a7", BG2 = "#1a1a1a";

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export default async function CityHub({ city }: { city: City }) {
  const { data } = await db()
    .from("accounts")
    .select("name, slug, category, location, phone")
    .eq("type", "business")
    .ilike("city", `%${city.name}%`)
    .limit(1000);
  const all = data || [];

  // Count businesses per registry category (term match on category + name)
  const counts = CATEGORIES.map((c) => {
    const n = all.filter((b: any) => {
      const hay = `${b.category || ""} ${b.name || ""}`.toLowerCase();
      return c.terms.some((t) => hay.includes(t));
    }).length;
    return { cat: c, n };
  }).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);

  const featured = all.slice(0, 12);
  const otherCities = CITIES.filter((c) => c.slug !== city.slug);

  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Businesses in ${city.name}`,
    url: `https://www.hanubees.com/${city.slug}`,
    about: `Local business directory for ${city.name}, ${city.country}`,
  };

  return (
    <div style={{ minHeight: "100vh", maxWidth: 760, margin: "0 auto", padding: "20px 16px 60px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <nav style={{ fontSize: 12.5, color: MUTED, marginBottom: 14 }}>
        <Link href="/" style={{ color: GREEN, textDecoration: "none" }}>Hanubees</Link>{" / "}<span>{city.name}</span>
      </nav>

      <h1 style={{ fontSize: 27, fontWeight: 700, color: FG, margin: "0 0 8px" }}>
        Businesses in {city.name}
      </h1>
      <p style={{ fontSize: 15, color: MUTED, margin: "0 0 8px", lineHeight: 1.5 }}>
        {all.length > 0
          ? `Explore ${all.length}+ businesses across ${counts.length} categories in ${city.name}, ${city.country}. Ask the AI to find exactly what you need.`
          : `We're building the ${city.name} directory. Check back soon.`}
      </p>
      <div style={{ display: "flex", gap: 16, marginBottom: 22 }}>
        <Link href="/chat" style={{ color: YELLOW, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Ask the AI →</Link>
        <Link href="/map" style={{ color: GREEN, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>View on map →</Link>
      </div>

      {/* Category grid */}
      {counts.length > 0 && (
        <section>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: FG, marginBottom: 10 }}>Categories</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
            {counts.map(({ cat, n }) => (
              <Link key={cat.slug} href={`/${city.slug}/${cat.slug}`} style={{ textDecoration: "none" }}>
                <div style={{ background: BG2, border: "1px solid rgba(152,170,157,0.18)", borderRadius: 10, padding: "11px 13px" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: FG, margin: 0 }}>{cat.title}</p>
                  <p style={{ fontSize: 12, color: GREEN, margin: "2px 0 0" }}>{n} listed</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: FG, marginBottom: 10 }}>Featured</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {featured.map((b: any) => (
              <Link key={b.slug} href={`/${b.slug}`} style={{ textDecoration: "none" }}>
                <div style={{ background: BG2, border: "1px solid rgba(234,234,234,0.06)", borderRadius: 10, padding: 12 }}>
                  <p style={{ fontSize: 14.5, fontWeight: 600, color: FG, margin: 0 }}>{b.name}</p>
                  <p style={{ fontSize: 12, color: MUTED, margin: "2px 0 0" }}>{[b.category, b.location].filter(Boolean).join(" · ")}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: FG, marginBottom: 10 }}>Other cities</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {otherCities.map((c) => (
            <Link key={c.slug} href={`/${c.slug}`} style={{ fontSize: 13, color: GREEN, background: BG2, padding: "7px 12px", borderRadius: 9, textDecoration: "none", border: "1px solid rgba(152,170,157,0.18)" }}>
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <footer style={{ marginTop: 40, paddingTop: 16, borderTop: "1px solid rgba(234,234,234,0.06)", fontSize: 12.5, color: MUTED }}>
        Powered by <Link href="/" style={{ color: GREEN, textDecoration: "none" }}>Hanubees</Link> — your business, answered by AI.
      </footer>
    </div>
  );
}
