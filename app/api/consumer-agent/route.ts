import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { consumerAgentNetworkQuery } from "@/lib/ai/agent-network";
import { analytics } from "@/lib/analytics";

export const runtime = "nodejs";

// Consumer agent that queries the network of business agents
// Allows a person/consumer to ask questions and get answers from multiple businesses

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Bad request" },
        { status: 400 }
      );
    }

    const {
      question,
      category,
      city = "Coimbatore",
    } = body;

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: "Question required" },
        { status: 400 }
      );
    }

    // Query the network of business agents
    const result = await consumerAgentNetworkQuery(
      question,
      category,
      city
    );

    // Demand logging: what consumers search + whether the network had an answer.
    try {
      const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      await db.from("searches").insert({
        query: String(question).slice(0, 200),
        city,
        category: category || null,
        result_count: result.responseCount,
        found: result.responseCount > 0,
        source: "discover",
      });
    } catch {}

    // Track analytics
    analytics.customerQuestionAsked("consumer-network", question.split(/\s+/).length);

    // If we got results, track that agent answered
    if (result.responseCount > 0) {
      analytics.agentAnswerProvided(
        "network",
        result.summary.length,
        result.responseCount / 5 // rough confidence based on number of responses
      );
    }

    return NextResponse.json({
      success: true,
      question: result.question,
      answer: result.summary,
      agents: result.agents.map((a) => ({
        name: a.agentName,
        category: a.category,
        response: a.answer,
        relevance: (a.relevanceScore * 100).toFixed(0) + "%",
      })),
      agentCount: result.responseCount,
      city,
      category: category || "all",
    });
  } catch (err) {
    console.error("[CONSUMER_AGENT_ERROR]", err);
    return NextResponse.json(
      { error: "Query failed" },
      { status: 500 }
    );
  }
}
