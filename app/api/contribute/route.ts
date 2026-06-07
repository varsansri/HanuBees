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

Never invent prices, places, or facts not stated. Respond with ONLY JSON (no markdown):
{"kind":"...","place_name":...,"city":...,"area":...,"category":...,"title":"...","content":"...","price":<number|null>,"rating":<1-5|null>,"ttl_hours":<number|null>,"followup":<string|null>}`;

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
  };
  const { data: saved, error: insErr } = await admin
    .from("contributions").insert(row).select("id, kind, title, place_name, city, valid_until").single();
  if (insErr || !saved) {
    return NextResponse.json({ error: insErr?.message || "Could not save that." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    contribution: saved,
    matched_place: matchedName,
    followup: p.followup ? String(p.followup).slice(0, 200) : null,
  });
}
