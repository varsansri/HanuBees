// Concierge catalog: a compact, LLM-readable directory of businesses in a city
// plus their public LIVE FACTS (pricing / services / hours / contact).
// Small enough to stuff into the prompt for one city (~50 businesses), so the
// model can filter by budget, list, compare, recommend, and answer follow-ups.

type CatalogFact = { account_id: string; content: string; info_type: string | null; tag: string | null };

// Cities we have directory data for. If the query names one, search there.
const KNOWN_CITIES = ["coimbatore", "chennai", "los angeles", "melbourne"];

const STOP = new Set([
  "find","near","looking","for","the","any","with","what","that","this","your","you",
  "want","need","around","available","please","give","show","list","best","good","under",
  "over","from","have","does","area","city","there","about","much","cost","price",
  "rent","buy","sell","service","services","business","businesses",
  // 3-letter noise (we now keep 3-letter content words like "eye","ent","spa")
  "and","who","how","why","get","can","has","our","out","are","was","its","but","let",
  // city + country tokens (handled separately, shouldn't act as match terms)
  "coimbatore","chennai","los","angeles","melbourne",
  "usa","america","american","united","states","australia","australian","aussie","india","indian",
]);

// Country -> the cities we have data for.
const COUNTRY: [string[], string[], string][] = [
  [["usa", "u.s.", "america", "american", "united states"], ["Los Angeles"], "USA"],
  [["australia", "australian", "aussie"], ["Melbourne"], "Australia"],
  [["india", "indian"], ["Coimbatore", "Chennai"], "India"],
];

export type CatalogResult = { text: string; city: string; count: number; isSearch: boolean };

export async function loadCatalog(
  supabase: any,
  city = "Coimbatore",
  query = "",
  maxBusinesses = 50
): Promise<CatalogResult> {
  const ql = (query || "").toLowerCase();

  // Resolve location: a country (multiple cities), a named city, or the default.
  let citiesIn: string[] | null = null;
  let useCity = city;
  let cityLabel = city;
  for (const [keys, names, label] of COUNTRY) {
    if (keys.some((k) => ql.includes(k))) { citiesIn = names; cityLabel = label; break; }
  }
  if (!citiesIn) {
    for (const c of KNOWN_CITIES) if (ql.includes(c)) { useCity = c; break; }
    cityLabel = useCity;
  }
  const listingCity = citiesIn ? citiesIn[0] : useCity;

  // Scales to a large directory: filter businesses by the query's keywords
  // (category / name / area) instead of loading the whole city.
  const terms = (ql.match(/[a-z]{3,}/g) || []).filter((w) => !STOP.has(w)).slice(0, 6);
  const isSearch = terms.length > 0;

  let q = supabase
    .from("accounts")
    .select("id, name, bee_name, slug, category, city, phone, location")
    .eq("type", "business")
    .limit(maxBusinesses);
  q = citiesIn ? q.in("city", citiesIn) : q.ilike("city", `%${useCity}%`);

  if (terms.length) {
    const ors: string[] = [];
    for (const t of terms) {
      ors.push(`category.ilike.%${t}%`, `name.ilike.%${t}%`, `location.ilike.%${t}%`);
    }
    q = q.or(ors.join(","));
  }

  const { data: accounts } = await q;

  if (!accounts?.length) {
    return { text: "(no matching businesses listed yet)", city: cityLabel, count: 0, isSearch };
  }

  const ids = accounts.map((a: any) => a.id);
  const { data: facts } = await supabase
    .from("data_entries")
    .select("account_id, content, info_type, tag")
    .in("account_id", ids)
    .eq("is_live_fact", true)
    .eq("visibility", "public");

  const byAccount = new Map<string, CatalogFact[]>();
  for (const f of (facts || []) as CatalogFact[]) {
    const arr = byAccount.get(f.account_id) || [];
    arr.push(f);
    byAccount.set(f.account_id, arr);
  }

  const lines: string[] = [];
  for (const a of accounts as any[]) {
    const fs = byAccount.get(a.id) || [];
    const pick = (type: string) =>
      fs.find((f) => (f.info_type || f.tag) === type)?.content;
    const parts = [
      pick("pricing") && `pricing: ${pick("pricing")}`,
      pick("services") && `services: ${pick("services")}`,
      pick("hours") && `hours: ${pick("hours")}`,
      (pick("contact") || a.phone) && `contact: ${pick("contact") || a.phone}`,
    ].filter(Boolean);
    lines.push(
      `• ${a.name} (@${a.bee_name}) — ${a.category || "business"}\n  ${parts.join(" | ") || "(no public details yet)"}`
    );
  }

  const businessBlock = lines.join("\n");

  // Structured listings (secondhand / real estate / rentals / services / transport / b2b).
  // Fetched independent of the business-only filter above so individual providers count too.
  const { data: listings } = await supabase
    .from("listings")
    .select("vertical, title, description, price, area, status, accounts!inner(bee_name, slug, city)")
    .eq("status", "active")
    .ilike("accounts.city", `%${listingCity}%`)
    .limit(120);

  const listingLines: string[] = [];
  for (const l of (listings || []) as any[]) {
    const acc = l.accounts;
    if (!acc) continue;
    const price = l.price != null ? `₹${l.price}` : "price on ask";
    listingLines.push(
      `• @${acc.bee_name}.B — [${l.vertical}] ${l.title} | ${price}${l.area ? ` | ${l.area}` : ""}${l.description ? ` — ${l.description}` : ""}`
    );
  }

  const count = accounts.length + listingLines.length;
  const text = listingLines.length
    ? `${businessBlock}\n\nLISTINGS (specific items/properties/services — match these by vertical, price, area):\n${listingLines.join("\n")}`
    : businessBlock;

  return { text, city: cityLabel, count, isSearch };
}
