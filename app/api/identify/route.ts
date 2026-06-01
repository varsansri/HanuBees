import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { input } = await req.json();

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Identify this health item and return JSON only (no markdown, no explanation):
{"name": "proper name", "category": "supplement|medicine|drug|other"}

Input: "${input}"

Rules: name=common/proper name. category: supplement=vitamins/herbs/protein/minerals, medicine=prescription/OTC drugs, drug=recreational, other=anything else.`
            }]
          }],
          generationConfig: { maxOutputTokens: 100, temperature: 0 }
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Gemini error:", data);
      return NextResponse.json({ name: input, category: "supplement" });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    const json = JSON.parse(text);
    return NextResponse.json(json);
  } catch (e) {
    console.error("Identify error:", e);
    return NextResponse.json({ name: input, category: "supplement" });
  }
}
