import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { llmChat, parseJson, type ChatMsg } from "@/lib/ai/llm";

export const runtime = "nodejs";

// Consumer-first wedge: anyone (anonymous) drops specific/perishable/experiential
// info by voice or text. One box — the AI auto-detects which of four kinds it is,
// attaches it to a place, sets a freshness window, and asks one follow-up if a key
// detail is missing. This is the info Google/Insta/ChatGPT throw away.

const KINDS = ["availability", "experience", "tip", "question"] as const;

// Default freshness per kind (hours). null = evergreen.
const DEFAULT_TTL_HOURS: Record<string, number | null> = {
  availability: 72,   // slots/occupancy go stale fast
  experience: null,   // "great cheap bike seat here" stays true
  tip: null,
  question: null,
};

export async function POST(req: NextRequest) {
  const admin = adminClient();
  if (!admin) {
    return NextResponse.json({
      error: "Server not configured: set SUPABASE_SERVICE_ROLE_KEY in the environment, then redeploy.",
    }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const text = String(body?.text || "").trim();
  const authorId = String(body?.anonId || "").trim() || "anon-unknown";
  // Device "present location" (if the contributor granted permission) — primary signal.
  let lat: number | null = Number.isFinite(body?.lat) ? Number(body.lat) : null;
  let lng: number | null = Number.isFinite(body?.lng) ? Number(body.lng) : null;
  if (!text) return NextResponse.json({ error: "Say or type something to share." }, { status: 400 });

  // ── 1. LLM: free text/voice → structured contribution ─────────────────────
  const sys = `You turn a person's free voice/text note into ONE structured local-knowledge contribution.
This is hyper-specific, real-world info the open web misses — live availability, an experience worth sharing, a useful tip, or a question they couldn't get answered online.

Pick exactly one kind:
- "availability": something currently true that will go stale — free PG/hostel slots, occupancy, in-stock, current price, queue/wait. Perishable.
- "experience": a real first-hand experience worth others knowing — "bought a bike seat dirt cheap here, great quality".
- "tip": a how-to / problem→solution / heads-up that helps others.
- "question": they're ASKING something they couldn't find online (not sharing). content = the question.

Extract:
- place_name: the specific business/place named, else null.
- city, area: if stated, else null.
- category: short (e.g. "PG/Hostel", "Auto Parts", "Cafe"), else null.
- title: a short scannable summary (max ~8 words).
- content: the useful detail, cleaned up. For questions, the question itself.
- price: a number if a price is stated, else null.
- rating: 1–5 only if they clearly rated it, else null.
- ttl_hours: how many hours this stays TRUE. For availability default ~72 unless they imply otherwise (e.g. "today only" → 24). For experience/tip/question use null (evergreen).
- followup: ONE short question to make this more useful (e.g. ask the price, the area, or how many slots), or null if it's already solid.

- place_based: true if this is tied to a SPECIFIC physical place that belongs on a map (a named PG/shop/venue, "slots here", "this address"). false for general tips/questions with no specific place.

Never invent prices, places, or facts not stated. Respond with ONLY JSON (no markdown):
{"kind":"...","place_name":...,"city":...,"area":...,"category":...,"title":"...","content":"...","price":<number|null>,"rating":<1-5|null>,"ttl_hours":<number|null>,"place_based":<bool>,"followup":<string|null>}`;

  const msgs: ChatMsg[] = [{ role: "system", content: sys }, { role: "user", content: text }];
  const { text: out, error } = await llmChat(msgs, { maxTokens: 600, temperature: 0.2 });
  if (error) return NextResponse.json({ error }, { status: 500 });

  const p = parseJson<any>(out);
  if (!p?.content) {
    return NextResponse.json({ error: "I couldn't make sense of that — try again with the place and what happened." }, { status: 200 });
  }
  const kind = KINDS.includes(p.kind) ? p.kind : "tip";

  // ── 2. Try to attach to an existing place (best-effort) ───────────────────
  let account_id: string | null = null;
  let matchedName: string | null = null;
  if (p.place_name) {
    let q = admin.from("accounts").select("id, name, city").ilike("name", `%${String(p.place_name).slice(0, 60)}%`).limit(1);
    if (p.city) q = q.ilike("city", `%${String(p.city).slice(0, 40)}%`);
    const { data: match } = await q;
    if (match && match[0]) { account_id = match[0].id; matchedName = match[0].name; }
  }

  // ── 2b. Resolve coordinates ───────────────────────────────────────────────
  // Prefer device location. Else inherit the matched account's coords. Else
  // geocode the place text (keyless, via OpenStreetMap Nominatim) — best-effort.
  if ((lat == null || lng == null) && account_id) {
    const { data: acc } = await admin.from("accounts").select("lat, lng").eq("id", account_id).maybeSingle();
    if (acc?.lat != null && acc?.lng != null) { lat = Number(acc.lat); lng = Number(acc.lng); }
  }
  if (lat == null || lng == null) {
    const place = [p.place_name, p.area, p.city].filter(Boolean).join(", ");
    if (place) {
      try {
        const u = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(place)}`;
        const r = await fetch(u, { headers: { "User-Agent": "Hanubees/1.0 (hanubees.com)" } });
        if (r.ok) {
          const j = await r.json();
          if (Array.isArray(j) && j[0]?.lat && j[0]?.lon) { lat = parseFloat(j[0].lat); lng = parseFloat(j[0].lon); }
        }
      } catch {}
    }
  }

  // ── 3. Freshness window ───────────────────────────────────────────────────
  const ttl = p.ttl_hours != null ? Number(p.ttl_hours) : DEFAULT_TTL_HOURS[kind];
  const valid_until = ttl && ttl > 0 ? new Date(Date.now() + ttl * 3600_000).toISOString() : null;

  // ── 4. Save ───────────────────────────────────────────────────────────────
  const row = {
    kind,
    account_id,
    place_name: p.place_name ? String(p.place_name).slice(0, 120) : null,
    city: p.city ? String(p.city).slice(0, 60) : null,
    area: p.area ? String(p.area).slice(0, 120) : null,
    category: p.category ? String(p.category).slice(0, 60) : null,
    title: p.title ? String(p.title).slice(0, 140) : String(p.content).slice(0, 80),
    content: String(p.content).slice(0, 2000),
    price: p.price == null || p.price === "" ? null : Number(p.price),
    rating: p.rating && p.rating >= 1 && p.rating <= 5 ? Math.round(p.rating) : null,
    author_id: authorId.slice(0, 80),
    valid_until,
    lat,
    lng,
  };
  const { data: saved, error: insErr } = await admin
    .from("contributions").insert(row).select("id, kind, title, place_name, city, valid_until, lat, lng").single();
  if (insErr || !saved) {
    return NextResponse.json({ error: insErr?.message || "Could not save that." }, { status: 500 });
  }

  // Only ask the contributor for a location when this is about a specific place
  // AND we couldn't find it ourselves (no device coords, no match, no geocode).
  const place_based = p.place_based === true || kind === "availability";
  const needs_location = place_based && (lat == null || lng == null);

  return NextResponse.json({
    ok: true,
    contribution: saved,
    matched_place: matchedName,
    needs_location,
    place_label: [p.place_name, p.area, p.city].filter(Boolean).join(", ") || null,
    followup: p.followup ? String(p.followup).slice(0, 200) : null,
  });
}
