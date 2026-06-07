import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { llmChat, parseJson, type ChatMsg } from "@/lib/ai/llm";

export const runtime = "nodejs";

// Call-Onboarding: the founder, on a phone call with a business, types or speaks
// everything about them in one free-form blob. We LLM-extract structured fields,
// knowledge entries and listings, create the account + agent (bypassing RLS via
// the service-role client, under a synthetic non-auth user_id so it never collides
// with the founder's own /chat account), and return the shareable @handle.bee link.

const FOUNDER_EMAILS = (process.env.FOUNDER_EMAILS || "varsansri88@gmail.com")
  .toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);

const VERTICALS = ["services", "secondhand", "realestate", "rental", "b2b", "transport", "product"];
const TAGS = ["pricing", "hours", "services", "faq", "about", "location", "contact"];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}
function beeify(s: string) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10);
  return clean || "bee";
}

export async function POST(req: NextRequest) {
  // ── 1. Founder-only gate (must be signed in + allowlisted) ──────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  if (!FOUNDER_EMAILS.includes((user.email || "").toLowerCase())) {
    return NextResponse.json({ error: "This tool is for the Hanubees team only." }, { status: 403 });
  }

  const admin = adminClient();
  if (!admin) {
    return NextResponse.json({
      error: "Server not configured: set SUPABASE_SERVICE_ROLE_KEY in the environment (Vercel → Settings → Environment Variables), then redeploy.",
    }, { status: 500 });
  }

  const text = String((await req.json().catch(() => ({})))?.text || "").trim();
  if (!text) return NextResponse.json({ error: "Describe the business (type or speak)" }, { status: 400 });

  // ── 2. LLM: free-form call notes → structured business ──────────────────
  const sys = `You turn a founder's free-form call notes about a local business into a structured profile for an AI agent. The notes are spoken/typed and messy. Extract only what's actually stated — never invent prices, phone numbers, or facts.

Respond with ONLY JSON (no markdown):
{
  "name": "<business name>",
  "type": "business",
  "category": "<short category e.g. 'Wedding Photography', 'Plumber', 'Cafe'>",
  "city": "<city or null>",
  "location": "<area/address line or null>",
  "phone": "<phone or null>",
  "email": "<email or null>",
  "website": "<url or null>",
  "instagram": "<handle without @ or null>",
  "bio": "<one warm sentence describing the business, for the public page>",
  "persona": "<short note on how the agent should answer: tone + any musts, or null>",
  "entries": [
    {"tag": "pricing|hours|services|faq|about|location|contact", "visibility": "public|private", "content": "<a single fact the agent can answer from>"}
  ],
  "listings": [
    {"vertical": "services|secondhand|realestate|rental|b2b|transport|product", "title": "<short>", "price": <number|null>, "area": "<string|null>", "description": "<details>"}
  ],
  "note": "<one short line: what you captured / what's still missing>"
}
Rules: entries should capture every concrete detail stated (prices, hours, what they offer, FAQs). visibility 'private' only for owner-only notes (e.g. margins, internal). listings only for explicitly listed items/properties/services with a clear title; otherwise return []. price is a number in local currency if stated, else null.`;

  const msgs: ChatMsg[] = [{ role: "system", content: sys }, { role: "user", content: text }];
  const { text: out, error } = await llmChat(msgs, { maxTokens: 1100, temperature: 0.2 });
  if (error) return NextResponse.json({ error }, { status: 500 });

  const p = parseJson<any>(out);
  if (!p?.name) {
    return NextResponse.json({ error: "Couldn't find a business name in that — try again, starting with the name." }, { status: 200 });
  }

  // ── 3. Unique slug + bee_name ───────────────────────────────────────────
  const uniqueField = async (field: "slug" | "bee_name", base: string) => {
    let val = base;
    for (let i = 0; i < 8; i++) {
      const { data } = await admin.from("accounts").select("id").eq(field, val).maybeSingle();
      if (!data) return val;
      const suffix = Math.random().toString(36).slice(2, 4);
      val = field === "bee_name" ? (base.slice(0, 8) + suffix) : `${base}-${suffix}`;
    }
    return `${base}-${Date.now().toString(36)}`.slice(0, field === "bee_name" ? 12 : 50);
  };
  const slug = await uniqueField("slug", slugify(p.name) || "business");
  const bee_name = await uniqueField("bee_name", beeify(p.name));

  // ── 4. Create the account (synthetic owner; claimable later) ─────────────
  const userId = `call-${crypto.randomUUID()}`;
  const { data: account, error: accErr } = await admin.from("accounts").insert({
    user_id: userId,
    type: "business",
    name: String(p.name).slice(0, 120),
    slug,
    bee_name,
    category: p.category ? String(p.category).slice(0, 60) : null,
    city: p.city ? String(p.city).slice(0, 60) : null,
    location: p.location ? String(p.location).slice(0, 200) : null,
    bio: p.bio ? String(p.bio).slice(0, 500) : null,
    persona: p.persona ? String(p.persona).slice(0, 500) : null,
    phone: p.phone ? String(p.phone).slice(0, 40) : null,
    email: p.email ? String(p.email).slice(0, 120) : null,
    website: p.website ? String(p.website).slice(0, 200) : null,
    instagram: p.instagram ? String(p.instagram).replace(/^@/, "").slice(0, 60) : null,
  }).select("id, name, slug, bee_name, city").single();

  if (accErr || !account) {
    return NextResponse.json({ error: accErr?.message || "Could not create the account." }, { status: 500 });
  }

  // ── 5. Knowledge entries + listings ─────────────────────────────────────
  const entries = (Array.isArray(p.entries) ? p.entries : [])
    .filter((e: any) => e?.content)
    .map((e: any) => ({
      account_id: account.id,
      content: String(e.content).slice(0, 2000),
      source: "voice",
      tag: TAGS.includes(e.tag) ? e.tag : null,
      visibility: e.visibility === "private" ? "private" : "public",
    }));
  if (entries.length) await admin.from("data_entries").insert(entries);

  const listings = (Array.isArray(p.listings) ? p.listings : [])
    .filter((l: any) => l?.title)
    .map((l: any) => ({
      account_id: account.id,
      vertical: VERTICALS.includes(l.vertical) ? l.vertical : "product",
      title: String(l.title).slice(0, 140),
      description: l.description ? String(l.description).slice(0, 1000) : null,
      price: l.price == null || l.price === "" ? null : Number(l.price),
      area: l.area ? String(l.area).slice(0, 80) : null,
    }));
  if (listings.length) await admin.from("listings").insert(listings);

  // ── 6. Hand back the shareable link ─────────────────────────────────────
  const base = "https://hanubees.com";
  return NextResponse.json({
    ok: true,
    account: { id: account.id, name: account.name, bee_name, slug, city: account.city },
    counts: { entries: entries.length, listings: listings.length },
    note: p.note || null,
    links: {
      bee: `${base}/${bee_name}.bee`,
      consumer: `${base}/c/${slug}`,
    },
  });
}
