import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { llmChat, parseJson, type ChatMsg } from "@/lib/ai/llm";
import { embedText, embedMissing } from "@/lib/ai/embed";
import { consumerAgentNetworkQuery } from "@/lib/ai/agent-network";

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

  const mode: "owner" | "visitor" = body.mode === "visitor" ? "visitor" : "owner";
  const history: InMsg[] = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  const lastUser = [...history].reverse().find((m) => m.role === "user")?.content?.trim();
  if (!lastUser) return NextResponse.json({ error: "No message" }, { status: 400 });

  const supabase = await createClient();

  // ── OWNER: manage the agent (store info or answer about the business) ──────
  if (mode === "owner") {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

    const { data: account } = await supabase
      .from("accounts").select("*").eq("user_id", user.id).maybeSingle();
    if (!account) return NextResponse.json({ error: "no_account" }, { status: 200 });

    // Check if owner is asking about other businesses (network query)
    const networkKeywords = [
      "competitor",
      "other photographer",
      "other caterer",
      "other venue",
      "other dj",
      "other makeup",
      "how much do",
      "what do they charge",
      "what's the price for",
      "find me",
      "search for",
      "compare",
      "what do photographers charge",
      "what do caterers charge",
      "what do venues charge",
    ];

    const shouldQueryNetwork = networkKeywords.some((kw) =>
      lastUser.toLowerCase().includes(kw)
    );

    if (shouldQueryNetwork) {
      // Extract category from the question
      const categoryKeywords: { [key: string]: string } = {
        photographer: "photography",
        caterer: "catering",
        venue: "venue",
        dj: "dj",
        makeup: "makeup",
        florist: "flowers",
        cake: "cake",
        transport: "transport",
      };

      let detectedCategory = "";
      for (const [keyword, category] of Object.entries(categoryKeywords)) {
        if (lastUser.toLowerCase().includes(keyword)) {
          detectedCategory = category;
          break;
        }
      }

      const networkResult = await consumerAgentNetworkQuery(
        lastUser,
        detectedCategory,
        account.city || "Coimbatore"
      );

      return NextResponse.json({
        reply: networkResult.summary,
        agents: networkResult.agents.map((a) => ({
          name: a.agentName,
          category: a.category,
          response: a.answer,
        })),
        agentCount: networkResult.responseCount,
        isNetworkQuery: true,
      });
    }

    const entries = await retrieve(supabase, account.id, lastUser, false);

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

    const sys = `You are the management assistant for "${account.name}"${account.category ? `, a ${account.category} business` : ""}.
Today is ${new Date().toLocaleDateString()}.
The owner talks to you to manage their AI receptionist. Decide what to do with each message:
- If the owner is giving you business info to remember (prices, hours, services, policies, FAQs, anything a customer might ask), STORE it.
- If the owner is asking a question, just REPLY.

Tag each stored entry with one of: pricing, hours, services, location, contact, policy, faq, other.
Set visibility "public" for anything customers may see, "private" for owner-only notes.

When the owner asks about orders, bookings, leads, or customer activity, answer from the activity list below.

Existing info on file:
${dataBlock((entries ?? []) as any)}

Recent orders & flagged customer messages:
${activityBlock}

Respond with ONLY this JSON (no markdown):
{"action":"store"|"reply","entries":[{"content":"...","tag":"...","visibility":"public"|"private"}],"reply":"short confirmation or answer"}`;

    const msgs: ChatMsg[] = [{ role: "system", content: sys }, ...history.map((m) => ({ role: m.role, content: m.content })) as ChatMsg[]];
    const { text, error } = await llmChat(msgs, { maxTokens: 700, temperature: 0.3 });
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

  const sys = `You are the friendly AI receptionist for "${account.name}"${account.category ? `, a ${account.category} business` : ""}${account.city ? ` in ${account.city}` : ""}.
${account.bio ? account.bio + "\n" : ""}Answer customer questions using ONLY the information below. Be warm, concise, and helpful.
If the answer is not in the information, do NOT make it up — say you'll pass the question to the team and ask for their contact or details.

Business information:
${dataBlock((entries ?? []) as any)}

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
