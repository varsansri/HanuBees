import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { callLLM } from "@/lib/ai/llm";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Agent-to-agent query endpoint
// One agent asks another agent a question
// Returns: answer from that agent's knowledge base

export async function POST(req: NextRequest) {
  try {
    const {
      agentId,
      question,
      context,
    } = await req.json();

    if (!agentId || !question) {
      return NextResponse.json(
        { error: "agentId and question required" },
        { status: 400 }
      );
    }

    // Get the agent's account info
    const { data: account, error: accErr } = await supabase
      .from("accounts")
      .select("id, name, bee_name, category")
      .eq("id", agentId)
      .maybeSingle();

    if (accErr || !account) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    // Retrieve agent's LIVE FACTS (structured data)
    const { data: liveFacts } = await supabase
      .from("data_entries")
      .select("content, info_type")
      .eq("account_id", agentId)
      .eq("is_live_fact", true);

    // Retrieve agent's RICH CONTEXT (about, portfolio, etc)
    const { data: richContext } = await supabase
      .from("data_entries")
      .select("content, tag")
      .eq("account_id", agentId)
      .eq("is_live_fact", false)
      .limit(5);

    // Build context for the agent
    const agentKnowledge = {
      name: account.name,
      category: account.category,
      liveFacts: liveFacts || [],
      richContext: richContext || [],
    };

    // Generate response using LLM
    const systemPrompt = `You are ${account.name}, a ${account.category} business in Coimbatore.

Your business information:
${agentKnowledge.liveFacts.map((f: any) => `- ${f.info_type}: ${f.content}`).join("\n")}

About your business:
${agentKnowledge.richContext.map((r: any) => `- ${r.tag}: ${r.content}`).join("\n")}

Answer the following question directly and concisely based on your business information.
If you don't have information about something, say so.`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: question },
    ];

    const reply = await callLLM(messages);

    return NextResponse.json({
      agentId,
      agentName: account.name,
      question,
      answer: reply,
      category: account.category,
    });
  } catch (err) {
    console.error("[AGENT_QUERY_ERROR]", err);
    return NextResponse.json(
      { error: "Query failed" },
      { status: 500 }
    );
  }
}
