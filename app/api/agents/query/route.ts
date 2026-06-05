import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { searchAgents, queryOneAgent, type NetworkAgent } from "@/lib/ai/agent-network";

export const runtime = "nodejs";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Agent-to-agent query endpoint: ask one agent (by id) a question.
// Answers from that agent's own stored data (shared logic with the network layer).
export async function POST(req: NextRequest) {
  try {
    const { agentId, question } = await req.json();
    if (!agentId || !question) {
      return NextResponse.json(
        { error: "agentId and question required" },
        { status: 400 }
      );
    }

    const { data: account } = await db()
      .from("accounts")
      .select("id, name, bee_name, slug, category, city")
      .eq("id", agentId)
      .maybeSingle();

    if (!account) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const result = await queryOneAgent(account as NetworkAgent, question);

    return NextResponse.json({
      agentId: result.agentId,
      agentName: result.agentName,
      category: result.category,
      question,
      answer: result.answer,
    });
  } catch (err) {
    console.error("[AGENT_QUERY_ERROR]", err);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }
}

// Optional helper: GET ?category=&city= to list agents (used by external callers).
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") || undefined;
  const city = url.searchParams.get("city") || undefined;
  const agents = await searchAgents(category, city, 10);
  return NextResponse.json({ count: agents.length, agents });
}
