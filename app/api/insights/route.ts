import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { period, supplements, streak, totalLogs, dailyCounts, dowCounts, weeklyVol, morning, afternoon, evening, maxGap } = body;

  // Pre-compute normalized graph points (0-100) for last 7 days
  const maxDaily = Math.max(...dailyCounts, 1);
  const graphPts  = dailyCounts.map((v: number) => Math.round((v / maxDaily) * 100));

  const supList = supplements.map((s: any) =>
    `${s.name} — consistency: ${s.pct}%, trend: ${s.trend}, 7-day logs: [${s.spark7.join(",")}], current streak: ${s.supStreak} days`
  ).join("\n");

  const prompt = `Generate a rich, detailed health journal insights report as a single ASCII art box.

USER'S ACTUAL DATA (${period}):
Streak: ${streak} days
Total logs: ${totalLogs}
Supplements being tracked:
${supList}
Time: morning ${morning} / afternoon ${afternoon} / evening ${evening} logs
Day activity (Mon–Sun): ${dowCounts.join(", ")}
7-day log counts: ${dailyCounts.join(", ")} (normalized to 0-100: ${graphPts.join(", ")})
Longest missed gap: ${maxGap} days

INSTRUCTIONS:
1. Generate a single large ASCII box using ╔═╗ ║ ╠═╣ ╚═╝ borders, exactly 66 chars wide including borders
2. Title: reference the actual supplement names and what they're for (e.g. skin care, energy, brain, diabetes — infer from supplements)
3. STATUS BARS — create 5-8 metrics SPECIFIC to these supplements (e.g. for Vitamin C: Brightening, Antioxidant; for Magnesium: Sleep Quality, Muscle Recovery). Use █ (filled) and ░ (empty), 20 blocks total per bar
4. LINE GRAPH — draw an ASCII growth chart for the last 7 days using the normalized values [${graphPts.join(",")}]:
   - Y-axis: 0 to 100, show labels 0,20,40,60,80,100
   - X-axis: Day1 through Day7
   - Use ● for data points, ─ to connect them, ┤ for Y-axis ticks, ┼ for origin
   - Plot each point at the correct Y position based on the values above
5. INGREDIENT BREAKDOWN — one bar per supplement showing its key benefit (20 █ blocks)
6. ADVANTAGES & DISADVANTAGES — list 4-5 advantages and 3-4 disadvantages SPECIFIC to these exact supplements (real health knowledge)
7. DAILY BREAKDOWN — show Mon–Sun activity using the dowCounts data as bars (10 █ blocks)
8. FINAL SUMMARY — overall condition name (creative, specific), key gains, one recommendation

RULES:
- Width of content inside borders: 64 chars
- Every line must be exactly: ║ + 64 chars of content + ║
- Use real health knowledge about the actual supplements to generate relevant metrics and insights
- The structure and what you emphasize changes based on what's interesting in the data
- No emojis, no generic text, no placeholders
- Make it look impressive and data-rich`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2048, temperature: 0.8 },
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: `Gemini error: ${data?.error?.message ?? res.status}` }, { status: 500 });
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    if (!text) return NextResponse.json({ error: "Empty response from AI" }, { status: 500 });
    return NextResponse.json({ report: text });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Network error" }, { status: 500 });
  }
}
