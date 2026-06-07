import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { llmChat, parseJson, type ChatMsg } from "@/lib/ai/llm";
import { embedText, embedMissing } from "@/lib/ai/embed";
import { loadCatalog } from "@/lib/ai/concierge";
import { loadContributionsBlock } from "@/lib/ai/contributions";

export const runtime = "nodejs";

type InMsg = { role: "user" | "assistant"; content: string };
type Entry = { content: string; tag: string | null };

function dataBlock(entries: Entry[]): string {
  if (!entries.length) return "(no information provided yet)";
  return entries
    .map((e) => `- ${e.tag ? `[${e.tag}] ` : ""}${e.content}`.slice(0, 600))
    .join("\n");
}

/**
 * Two-tier retrieval:
 * 1. LIVE FACTS (structured, current): pricing, hours, services, contact, policy
 * 2. RICH CONTEXT (semantic search): about, portfolio, faq, offer
 */
async function retrieve(supabase: any, accountId: string, question: string, publicOnly: boolean): Promise<Entry[]> {
  const live_types = ['pricing', 'hours', 'services', 'contact', 'policy'];

  // Tier 1: LIVE FACTS — current versions (not superseded). Classify by info_type OR tag,
  // so both seeded data (info_type) and owner-typed data (tag) are picked up.
  let liveQ = supabase
    .from("data_entries")
    .select("content, tag")
    .eq("account_id", accountId)
    .eq("is_live_fact", true)
    .is("supersedes", null);
  if (publicOnly) liveQ = liveQ.eq("visibility", "public");
  const { data: liveFacts } = await liveQ;

  // Tier 2: RICH CONTEXT — semantic search (needs embeddings + match_data_entries RPC)
  let contextFacts: Entry[] = [];
  const v = await embedText(question);
  if (v) {
    const { data, error } = await supabase.rpc("match_data_entries", {
      p_account: accountId, query_embedding: v, match_count: 6, public_only: publicOnly,
    });
    if (!error && Array.isArray(data)) contextFacts = data as Entry[];
  }

  // Fallback when embeddings aren't ready yet: return a few recent non-live entries
  // (about / portfolio / faq) so the agent still has context to answer from.
  if (!contextFacts.length) {
    let ctxQ = supabase
      .from("data_entries")
      .select("content, tag")
      .eq("account_id", accountId)
      .eq("is_live_fact", false)
      .order("created_at", { ascending: false })
      .limit(6);
    if (publicOnly) ctxQ = ctxQ.eq("visibility", "public");
    const { data: ctx } = await ctxQ;
    contextFacts = (ctx || []) as Entry[];
  }

  return [...(liveFacts || []), ...contextFacts];
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const mode: "owner" | "visitor" | "concierge" =
    body.mode === "visitor" ? "visitor" : body.mode === "concierge" ? "concierge" : "owner";
  const history: InMsg[] = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  const lastUser = [...history].reverse().find((m) => m.role === "user")?.content?.trim();
  if (!lastUser) return NextResponse.json({ error: "No message" }, { status: 400 });

  const supabase = await createClient();

  // ── CONCIERGE: public discovery, no login. Search/compare/recommend across the directory. ──
  if (mode === "concierge") {
    const city = (body.city as string) || "Coimbatore";
    const catalog = await loadCatalog(supabase, city, lastUser);
    if (catalog.isSearch) {
      supabase.from("searches").insert({
        query: lastUser.slice(0, 200), city: catalog.city, result_count: catalog.count,
        found: catalog.count > 0, source: "browse",
      }).then(() => {}, () => {});
    }
    const community = await loadContributionsBlock(supabase, lastUser);
    const sys = `You are Hanubees — a friendly local-services concierge. Help people find and compare
local businesses. Default city: ${city} (but if the user names a city/country, answer for that).
- CLARIFY then match: if the request is vague, ask 1–2 short questions (budget, area) FIRST, don't list yet.
- Then list ONLY businesses that fit, as short bullets, each starting with the business's @handle.
  Refer to a business EXACTLY by its @handle from the catalog (renders as a tappable link). If none fit,
  say so and offer the closest options.
- Recommend 1–3 with WHY (price/area/services). Use numbers/specifics, keep it tight.
- If COMMUNITY KNOWLEDGE below has something relevant (live availability, an experience, a tip,
  someone's answer), lead with it and say it's from people on Hanubees. It is real and current — use it.
- If asked to see results on a map, end with a bare link: /map?city=<City>&category=<keyword>.
- Use ONLY catalog/community facts; never invent prices/contacts.
${community ? `\n== COMMUNITY KNOWLEDGE (people's posts, matched to this query) ==\n${community}\n` : ""}
== CATALOG: businesses in ${catalog.city} ==
${catalog.text}`;
    const msgs: ChatMsg[] = [{ role: "system", content: sys }, ...history.map((m) => ({ role: m.role, content: m.content })) as ChatMsg[]];
    const { text, error } = await llmChat(msgs, { maxTokens: 1000, temperature: 0.4 });
    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json({ reply: text || "Tell me what you're looking for and your area." });
  }

  // ── OWNER: manage the agent (store info or answer about the business) ──────
  if (mode === "owner") {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

    const { data: account } = await supabase
      .from("accounts").select("*").eq("user_id", user.id).maybeSingle();
    if (!account) return NextResponse.json({ error: "no_account" }, { status: 200 });

    const entries = await retrieve(supabase, account.id, lastUser, false);

    // Concierge catalog: every business in the city + their public prices/services/hours,
    // so the assistant can search by budget, list, compare, recommend, and drill into one.
    const catalog = await loadCatalog(supabase, account.city || "Coimbatore", lastUser);
    const community = await loadContributionsBlock(supabase, lastUser);
    // Demand logging: capture discovery searches (what people look for + whether we had it).
    if (catalog.isSearch) {
      supabase.from("searches").insert({
        account_id: account.id,
        query: lastUser.slice(0, 200),
        city: catalog.city,
        result_count: catalog.count,
        found: catalog.count > 0,
        source: "chat",
      }).then(() => {}, () => {});
    }

    // Recent orders / important customer messages so the owner can ask about them
    const { data: convs } = await supabase.from("conversations").select("id").eq("account_id", account.id);
    let activity: { content: string; is_order: boolean; fulfilled: boolean; created_at: string }[] = [];
    if (convs?.length) {
      const { data: am } = await supabase
        .from("messages").select("content, is_order, fulfilled, created_at")
        .in("conversation_id", convs.map((c) => c.id))
        .eq("is_important", true)
        .order("created_at", { ascending: false }).limit(25);
      activity = am ?? [];
    }
    const activityBlock = activity.length
      ? activity.map((m) => `- ${new Date(m.created_at).toLocaleString()} ${m.is_order ? "[ORDER]" : "[QUESTION]"}${m.fulfilled ? " (done)" : ""}: ${m.content}`).join("\n")
      : "(no orders or flagged customer messages yet)";

    const sys = `You are the assistant inside Hanubees for "${account.name}"${account.category ? `, a ${account.category} business` : ""} in ${account.city || "Coimbatore"}.
Today is ${new Date().toLocaleDateString()}. You do TWO jobs — decide per message which applies:

A) MANAGE THIS BUSINESS
- If the owner gives you info to remember (prices, hours, services, policies, FAQs), STORE it.
  Tag each entry: pricing, hours, services, location, contact, policy, faq, other.
  visibility "public" for anything customers may see, "private" for owner-only notes.
- If they ask about their own info, orders, bookings, or customer activity, REPLY from the data below.

B) LOCAL SERVICES CONCIERGE (use the CATALOG below)
- If the message is a discovery/shopping request — e.g. budgets ("under ₹500", "cheapest"),
  "what services are available", "find/compare/recommend", or asking about ANOTHER business —
  answer from the CATALOG. Then action is "reply".

- CLARIFY FIRST, then match. Do NOT dump a list immediately if the request is vague.
  • If the query is missing the 1–2 details needed to match well (e.g. budget, area/locality,
    category, or a key attribute), ASK those 1–2 short questions FIRST and stop — don't list yet.
    Keep questions tight: "What's your budget, and which part of ${account.city || "Coimbatore"}?"
  • Ask at most 2 questions total, then answer with whatever you have. Never interrogate.
  • If the user already gave enough (or says "just show me / anything"), skip questions and match.
- MATCH ONLY WHAT EXISTS. After you have the criteria, include ONLY businesses that actually fit
  ALL stated criteria. Silently skip the rest — don't show near-misses as if they match.
  • If nothing fits, say so plainly ("No exact match for X under ₹Y") and THEN offer the closest
    alternatives, clearly labelled as "closest options".
- ALWAYS refer to a business by its @handle exactly as shown in the catalog (e.g. @aromacaterin),
  including its price. The @handle becomes a tappable link to that business's profile — so never
  write raw "/slug" links, just the @handle.
- Listing: short bullets, each starting with the @handle then its price.
- Recommendations: pick 1–3 and say WHY (price, services, hours). End by offering a next step,
  e.g. "Want me to compare @handle1 and @handle2?"
- Drill-down: if they name one business, give its details from the catalog by @handle.
- MAP: you can't draw a map in chat, but if the user asks to "see/show on a map" (or wants
  to see where things are), end your reply with a link in this exact form:
  /map?city=<City>&category=<keyword>  (e.g. /map?city=Coimbatore&category=hospital).
  Use the city you're searching and a single keyword for the category. Write the link bare
  (no markdown) — it renders as an "Open map" button. Omit &category for all businesses.
- Only use catalog facts. Never invent prices. If something isn't listed, say so.

== THIS BUSINESS — info on file ==
${dataBlock((entries ?? []) as any)}

== THIS BUSINESS — recent orders & flagged messages ==
${activityBlock}

${community ? `== COMMUNITY KNOWLEDGE (people's posts on Hanubees, matched to this query) ==\n${community}\nIf relevant, answer from this and say it's from people on Hanubees — it's real and current.\n\n` : ""}== CATALOG: businesses in ${account.city || "Coimbatore"} ==
${catalog.text}

Respond with ONLY this JSON (no markdown):
{"action":"store"|"reply","entries":[{"content":"...","tag":"...","visibility":"public"|"private"}],"reply":"your concise answer; use line breaks and bullets for lists"}`;

    const msgs: ChatMsg[] = [{ role: "system", content: sys }, ...history.map((m) => ({ role: m.role, content: m.content })) as ChatMsg[]];
    const { text, error } = await llmChat(msgs, { maxTokens: 1100, temperature: 0.3 });
    if (error) return NextResponse.json({ error }, { status: 500 });

    const parsed = parseJson<{ action: string; entries?: any[]; reply: string }>(text);
    if (!parsed) return NextResponse.json({ reply: text || "Got it." });

    let stored = 0;
    if (parsed.action === "store" && Array.isArray(parsed.entries) && parsed.entries.length) {
      const LIVE_TAGS = ["pricing", "hours", "services", "contact", "location", "policy"];
      const today = new Date().toISOString().split("T")[0];
      const rows = parsed.entries
        .filter((e) => e?.content)
        .map((e) => {
          const tag = e.tag ?? "other";
          const isLive = LIVE_TAGS.includes(tag);
          return {
            account_id: account.id,
            content: String(e.content).slice(0, 2000),
            tag,
            visibility: e.visibility === "private" ? "private" : "public",
            source: "manual",
            // Connect owner-typed facts to retrieval: live tags become LIVE FACTS,
            // everything else stays as RICH CONTEXT (semantic).
            is_live_fact: isLive,
            info_type: isLive ? tag : null,
            effective_date: isLive ? today : null,
          };
        });
      const { error: insErr } = await supabase.from("data_entries").insert(rows);
      if (!insErr) {
        stored = rows.length;
        await embedMissing(supabase, account.id);
      }
    }

    return NextResponse.json({ reply: parsed.reply || "Done.", stored });
  }

  // ── VISITOR: a customer chatting with a business's public agent ────────────
  const slug = String(body.slug ?? "").trim();
  if (!slug) return NextResponse.json({ error: "No business" }, { status: 400 });

  const { data: account } = await supabase
    .from("accounts").select("id, name, category, city, location, bio").eq("slug", slug).maybeSingle();
  if (!account) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // RAG retrieval; anon RLS + public_only keep private facts out — safe by construction
  const entries = await retrieve(supabase, account.id, lastUser, true);

  // This business's active listings (items/properties/services) so the agent can answer about them.
  const { data: lst } = await supabase
    .from("listings")
    .select("vertical, title, description, price, area, status")
    .eq("account_id", account.id)
    .eq("status", "active")
    .limit(50);
  const listingsBlock = (lst && lst.length)
    ? lst.map((l: any) => `- [${l.vertical}] ${l.title}${l.price != null ? ` — ₹${l.price}` : ""}${l.area ? ` (${l.area})` : ""}${l.description ? `: ${l.description}` : ""}`).join("\n")
    : "(no active listings)";

  const sys = `You are the friendly AI receptionist for "${account.name}"${account.category ? `, a ${account.category} business` : ""}${account.city ? ` in ${account.city}` : ""}.
${account.bio ? account.bio + "\n" : ""}Answer customer questions using ONLY the information below. Be warm, concise, and helpful.
If the answer is not in the information, do NOT make it up — say you'll pass the question to the team and ask for their contact or details.

Business information:
${dataBlock((entries ?? []) as any)}

Listings (items / properties / services for sale or rent):
${listingsBlock}

Respond with ONLY this JSON (no markdown):
{"reply":"your message to the customer","answered":true|false,"isOrder":true|false}
answered=false if the info wasn't available. isOrder=true if the customer is trying to book, order, or buy.`;

  const msgs: ChatMsg[] = [{ role: "system", content: sys }, ...history.map((m) => ({ role: m.role, content: m.content })) as ChatMsg[]];
  const { text, error } = await llmChat(msgs, { maxTokens: 600, temperature: 0.4 });
  if (error) return NextResponse.json({ error }, { status: 500 });

  const parsed = parseJson<{ reply: string; answered: boolean; isOrder: boolean }>(text);
  const reply = parsed?.reply || text || "Thanks for reaching out — I'll pass this to the team.";
  const answered = parsed?.answered !== false;
  const isOrder = parsed?.isOrder === true;

  // persist (anon insert allowed for public channel; ids generated here so we
  // never need to SELECT back rows the visitor can't read)
  let conversationId: string = body.conversationId || crypto.randomUUID();
  const now = new Date().toISOString();
  if (!body.conversationId) {
    await supabase.from("conversations").insert({
      id: conversationId,
      account_id: account.id,
      channel: "public",
      visitor_name: body.visitorName ?? null,
      last_message_at: now,
    });
  }
  await supabase.from("messages").insert([
    {
      conversation_id: conversationId, role: "visitor", content: lastUser,
      is_important: !answered || isOrder, is_order: isOrder,
    },
    { conversation_id: conversationId, role: "agent", content: reply },
  ]);

  return NextResponse.json({ reply, conversationId, answered, isOrder });
}
