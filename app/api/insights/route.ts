import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { streak, totalEntries, period, supplements } = await req.json();

  const prompt = `You are a health journal analyst. Based on this user's supplement and medicine logging data, write a brief personalized insight.

Data:
- Logging streak: ${streak} days
- Total entries (${period}): ${totalEntries}
- Supplements/medicines: ${supplements.map((s: { name: string; pct: number; trend: string }) => `${s.name} (${s.pct}% consistency, trend: ${s.trend})`).join("; ")}

Return ONLY valid JSON, no markdown, no explanation:
{"narrative":"2-3 sentences specific to their supplements and patterns","watch":["issue 1","issue 2"]}

Rules:
- Mention actual supplement names from their data
- narrative: 2-3 sentences, personal, data-driven, encouraging but honest
- watch: only real issues (missed days, declining trend). Max 2 items. Empty array if no issues.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.4 },
        }),
      }
    );
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    const clean = text.replace(/```json\n?|\n?```/g, "").trim();
    return NextResponse.json(JSON.parse(clean));
  } catch {
    return NextResponse.json({ narrative: "Keep logging to get personalized insights.", watch: [] });
  }
}
