import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { period, periodDays, streak, maxStreak, totalLogs, healthScore,
    supplements, morning, afternoon, evening, dowCounts, weeklyVol, maxGap } = body;

  const supLines = supplements.map((s: any) =>
    `  ${s.name}: ${s.pct}% (${s.days} days logged), trend: ${s.trend}, 14-day sparkline values: [${s.sparkValues.join(",")}], current streak: ${s.supStreak}d, prev period: ${s.prevPct !== null ? s.prevPct + "%" : "n/a"}`
  ).join("\n");

  const prompt = `You are generating a health journal insights report. Output ONLY the formatted report — no intro, no explanation, just the report text.

USER DATA (${period}, ${periodDays} days):
Streak: ${streak} days (personal best: ${maxStreak}d)
Health score: ${healthScore}/100
Total logs: ${totalLogs}
Supplements:
${supLines}
Time of day — morning: ${morning}, afternoon: ${afternoon}, evening: ${evening} logs
Day of week (Mon–Sun): ${dowCounts.join(", ")}
Weekly volume last 8 weeks: ${weeklyVol.join(", ")}
Longest missed gap: ${maxGap} days

FORMAT RULES (follow exactly):
- Section headers: uppercase, no decoration (e.g. CONSISTENCY)
- Dividers: ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Consistency bars: use exactly 10 blocks of ▓ (filled) and ░ (empty), then 3 spaces, then %, then trend arrow
  Example: VITAMIN D      ▓▓▓▓▓▓▓▓▓░   90%  ↑
- Sparklines: use ▁▂▃▄▅▆▇█ and ░ for zero, exactly 14 chars, based on the spark values provided
  Example: VITAMIN D      ▁▂▄▆▇█▇▆▅▄▆▇▇█   ↑
- Watch items start with ·
- Blank lines between sections
- Narrative: specific and data-driven, no generic health advice
- The structure, sections chosen, and emphasis should reflect what is most interesting/notable in this user's actual data
- Do not include sections that have no data or are not relevant
- Total: 25–40 lines

Generate the report now:`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
        }),
      }
    );
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    return NextResponse.json({ report: text });
  } catch {
    return NextResponse.json({ report: "Could not generate report. Try again." });
  }
}
