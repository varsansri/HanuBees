// Agent-to-agent network orchestration
// Allows consumer agents to query multiple business agents and aggregate responses

import { callLLM } from "./llm";

export interface AgentQueryResult {
  agentId: string;
  agentName: string;
  category: string;
  answer: string;
  relevanceScore: number;
}

export async function queryBusinessAgents(
  businessAgents: Array<{ id: string; name: string; category: string }>,
  question: string
): Promise<AgentQueryResult[]> {
  const results: AgentQueryResult[] = [];

  // Query each agent in parallel
  const promises = businessAgents.map(async (agent) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/agents/query`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId: agent.id,
            question,
          }),
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      return data;
    } catch {
      return null;
    }
  });

  const responses = await Promise.all(promises);

  // Filter valid responses and score relevance
  for (const response of responses) {
    if (response) {
      // Simple relevance scoring: check if answer contains key question words
      const questionWords = question.toLowerCase().split(" ");
      const answerLower = response.answer.toLowerCase();
      const matches = questionWords.filter(
        (w) => w.length > 3 && answerLower.includes(w)
      ).length;
      const relevanceScore = Math.min(
        1,
        matches / Math.max(1, questionWords.length)
      );

      results.push({
        agentId: response.agentId,
        agentName: response.agentName,
        category: response.category,
        answer: response.answer,
        relevanceScore,
      });
    }
  }

  // Sort by relevance
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

export async function aggregateAgentResponses(
  question: string,
  results: AgentQueryResult[]
): Promise<string> {
  if (results.length === 0) {
    return "No agents found that can help with your question.";
  }

  if (results.length === 1) {
    return results[0].answer;
  }

  // Use LLM to synthesize responses from multiple agents
  const responsesSummary = results
    .map(
      (r, i) =>
        `${i + 1}. ${r.agentName} (${r.category}):\n${r.answer}`
    )
    .join("\n\n");

  const synthesisPrompt = `
You are a helpful assistant that gathers information from multiple service providers.

A user asked: "${question}"

Here are responses from different providers:

${responsesSummary}

Synthesize these responses into a helpful summary for the user.
Highlight the key options and differences between providers.
Be concise and organized.`;

  const messages = [
    {
      role: "system" as const,
      content:
        "You are a helpful assistant synthesizing information from multiple providers.",
    },
    { role: "user" as const, content: synthesisPrompt },
  ];

  return await callLLM(messages);
}

export async function consumerAgentNetworkQuery(
  question: string,
  category?: string,
  city?: string
): Promise<{
  question: string;
  summary: string;
  agents: AgentQueryResult[];
  responseCount: number;
}> {
  // Step 1: Search for relevant agents
  const searchParams = new URLSearchParams();
  if (category) searchParams.append("category", category);
  if (city) searchParams.append("city", city || "Coimbatore");
  searchParams.append("limit", "5"); // Query top 5 agents

  const searchResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/agents/search?${searchParams}`,
    { method: "GET" }
  );

  if (!searchResponse.ok) {
    return {
      question,
      summary: "Unable to search for agents.",
      agents: [],
      responseCount: 0,
    };
  }

  const { agents } = await searchResponse.json();

  if (agents.length === 0) {
    return {
      question,
      summary: `No agents found for ${category || "your query"} in ${city || "Coimbatore"}.`,
      agents: [],
      responseCount: 0,
    };
  }

  // Step 2: Query each agent
  const results = await queryBusinessAgents(agents, question);

  // Step 3: Synthesize responses
  const summary = await aggregateAgentResponses(question, results);

  return {
    question,
    summary,
    agents: results,
    responseCount: results.length,
  };
}
