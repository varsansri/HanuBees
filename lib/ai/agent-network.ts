// Agent-to-agent network orchestration.
// Runs entirely in-process: queries Supabase directly and calls the LLM helper.
// (No HTTP self-calls — those failed in production because there is no localhost.)

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { llmChat } from "./llm";

// Lazy client: never evaluate env at module load (breaks `next build` page-data
// collection when env isn't injected yet). Created on first use instead.
let _sb: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!_sb) {
    _sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _sb;
}

export interface NetworkAgent {
  id: string;
  name: string;
  bee_name: string;
  slug: string;
  category: string | null;
  city: string | null;
}

export interface AgentQueryResult {
  agentId: string;
  agentName: string;
  category: string;
  answer: string;
  relevanceScore: number;
}

/** Find business agents by (optional) category + city. */
export async function searchAgents(
  category?: string,
  city?: string,
  limit = 5
): Promise<NetworkAgent[]> {
  let q = db()
    .from("accounts")
    .select("id, name, bee_name, slug, category, city")
    .eq("type", "business")
    .limit(limit);
  if (category) q = q.ilike("category", `%${category}%`);
  if (city) q = q.ilike("city", `%${city}%`);
  const { data } = await q;
  return (data || []) as NetworkAgent[];
}

/** Ask one agent a question, answering from its own stored data. */
export async function queryOneAgent(
  agent: NetworkAgent,
  question: string
): Promise<AgentQueryResult> {
  const { data: facts } = await db()
    .from("data_entries")
    .select("content, info_type, tag, is_live_fact")
    .eq("account_id", agent.id)
    .eq("visibility", "public");

  const live = (facts || []).filter((f: any) => f.is_live_fact);
  const rich = (facts || []).filter((f: any) => !f.is_live_fact);

  const q = question.toLowerCase();
  const find = (type: string) =>
    live.find((f: any) => (f.info_type || f.tag) === type);

  // Fast paths: structured facts answered directly, no LLM cost.
  const pricing = find("pricing");
  if (pricing && /price|cost|charge|how much|rate|fee/.test(q)) {
    return result(agent, `${agent.name}: ${pricing.content}`, 1);
  }
  const hours = find("hours");
  if (hours && /hour|open|timing|when|close/.test(q)) {
    return result(agent, `${agent.name}: ${hours.content}`, 1);
  }
  const services = find("services");
  if (services && /service|offer|do you|provide/.test(q)) {
    return result(agent, `${agent.name}: ${services.content}`, 0.9);
  }

  // General: let the LLM answer from this agent's knowledge.
  const knowledge = [
    ...live.map((f: any) => `- ${f.info_type || f.tag}: ${f.content}`),
    ...rich.map((f: any) => `- ${f.tag || "info"}: ${f.content}`),
  ].join("\n");

  const sys = `You are ${agent.name}, a ${agent.category || "business"} in ${agent.city || "Coimbatore"}.
Answer the question concisely using ONLY this information:
${knowledge || "(no information on file)"}
If the answer isn't here, say you don't have that detail.`;

  const { text } = await llmChat(
    [
      { role: "system", content: sys },
      { role: "user", content: question },
    ],
    { maxTokens: 220, temperature: 0.3 }
  );

  return result(agent, text ? `${agent.name}: ${text}` : `${agent.name}: I don't have that detail.`, 0.5);
}

function result(agent: NetworkAgent, answer: string, score: number): AgentQueryResult {
  return {
    agentId: agent.id,
    agentName: agent.name,
    category: agent.category || "",
    answer,
    relevanceScore: score,
  };
}

/** Synthesize multiple agent answers into one comparison summary. */
export async function aggregateAgentResponses(
  question: string,
  results: AgentQueryResult[]
): Promise<string> {
  if (results.length === 0) return "No businesses found that can answer that yet.";
  if (results.length === 1) return results[0].answer;

  const block = results
    .map((r, i) => `${i + 1}. ${r.answer}`)
    .join("\n");

  const { text } = await llmChat(
    [
      {
        role: "system",
        content:
          "You compare options from multiple local businesses. Summarize clearly and concisely, highlighting price/option differences. Keep it short.",
      },
      { role: "user", content: `Question: "${question}"\n\nResponses:\n${block}` },
    ],
    { maxTokens: 350, temperature: 0.3 }
  );

  // If the LLM is unavailable, fall back to listing the raw answers.
  return text || block;
}

/** End-to-end: discover relevant agents, query them in parallel, synthesize. */
export async function consumerAgentNetworkQuery(
  question: string,
  category?: string,
  city = "Coimbatore"
): Promise<{
  question: string;
  summary: string;
  agents: AgentQueryResult[];
  responseCount: number;
}> {
  const agents = await searchAgents(category, city, 5);
  if (agents.length === 0) {
    return {
      question,
      summary: `No ${category || "businesses"} found in ${city} yet.`,
      agents: [],
      responseCount: 0,
    };
  }

  const settled = await Promise.allSettled(
    agents.map((a) => queryOneAgent(a, question))
  );
  const results = settled
    .filter((s): s is PromiseFulfilledResult<AgentQueryResult> => s.status === "fulfilled")
    .map((s) => s.value)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  const summary = await aggregateAgentResponses(question, results);

  return { question, summary, agents: results, responseCount: results.length };
}
