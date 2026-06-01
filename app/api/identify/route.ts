import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { input } = await req.json();

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 100,
    messages: [{
      role: "user",
      content: `Identify this health item and return JSON only (no markdown):
{"name": "proper name", "category": "supplement|medicine|drug|other"}

Input: "${input}"

Rules: name should be the common/proper name. category: supplement=vitamins/herbs/protein, medicine=prescription/OTC drugs, drug=recreational, other=anything else.`
    }]
  });

  try {
    const text = (message.content[0] as { type: string; text: string }).text.trim();
    const json = JSON.parse(text);
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ name: input, category: "supplement" });
  }
}
