// Concierge catalog: a compact, LLM-readable directory of businesses in a city
// plus their public LIVE FACTS (pricing / services / hours / contact).
// Small enough to stuff into the prompt for one city (~50 businesses), so the
// model can filter by budget, list, compare, recommend, and answer follow-ups.

type CatalogFact = { account_id: string; content: string; info_type: string | null; tag: string | null };

export async function loadCatalog(
  supabase: any,
  city = "Coimbatore",
  maxBusinesses = 80
): Promise<string> {
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name, bee_name, slug, category, city, phone")
    .eq("type", "business")
    .ilike("city", `%${city}%`)
    .limit(maxBusinesses);

  if (!accounts?.length) return "(no businesses listed in this city yet)";

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
    .ilike("accounts.city", `%${city}%`)
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

  if (!listingLines.length) return businessBlock;

  return `${businessBlock}

LISTINGS (specific items/properties/services — match these by vertical, price, area):
${listingLines.join("\n")}`;
}
