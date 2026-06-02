import { NextRequest, NextResponse } from "next/server";

const BLOCKS = "▁▂▃▄▅▆▇█";
function spark(vals: number[]): string {
  const max = Math.max(...vals, 1);
  return vals.map(v => v === 0 ? "░" : BLOCKS[Math.min(7, Math.floor((v / max) * 8))]).join("");
}
function bar(pct: number, w = 20): string {
  const f = Math.round((Math.min(pct, 100) / 100) * w);
  return "█".repeat(f) + "░".repeat(w - f);
}
function row(content: string, width = 64): string {
  const trimmed = content.slice(0, width);
  return "║ " + trimmed + " ".repeat(Math.max(0, width - trimmed.length - 1)) + "║";
}
function divider(width = 66): string { return "╠" + "═".repeat(width - 2) + "╣"; }
function top(width = 66): string { return "╔" + "═".repeat(width - 2) + "╗"; }
function bot(width = 66): string { return "╚" + "═".repeat(width - 2) + "╝"; }

function staticReport(body: any): string {
  const { period, supplements, streak, totalLogs, dailyCounts, dowCounts, morning, afternoon, evening, maxGap } = body;
  const lines: string[] = [];
  const W = 66;
  const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const totalH = Math.max(morning + afternoon + evening, 1);
  const maxDow = Math.max(...dowCounts, 1);

  // Title
  const names = supplements.slice(0, 3).map((s: any) => s.name).join(" · ");
  lines.push(top(W));
  lines.push(row(""));
  lines.push(row(`  HEALTH JOURNAL INSIGHTS · ${period.toUpperCase()}`));
  lines.push(row(`  ${names}`));
  lines.push(row(""));
  lines.push(divider(W));

  // Overview stats
  lines.push(row(""));
  lines.push(row(`  STREAK   ${streak} days    TOTAL LOGS   ${totalLogs}    GAP   ${maxGap}d`));
  lines.push(row(""));
  lines.push(divider(W));

  // Consistency
  lines.push(row(""));
  lines.push(row("  CONSISTENCY"));
  lines.push(row(""));
  for (const s of supplements.slice(0, 6)) {
    const label = s.name.slice(0, 16).padEnd(17);
    const arrow = s.trend === "up" ? "↑" : s.trend === "down" ? "↓" : "→";
    lines.push(row(`  ${label} ${bar(s.pct, 18)}  ${String(s.pct).padStart(3)}%  ${arrow}`));
  }
  lines.push(row(""));
  lines.push(divider(W));

  // 7-day trend sparklines
  lines.push(row(""));
  lines.push(row("  14-DAY TREND"));
  lines.push(row(""));
  for (const s of supplements.slice(0, 6)) {
    const label = s.name.slice(0, 14).padEnd(15);
    const arrow = s.trend === "up" ? "↑" : s.trend === "down" ? "↓" : "→";
    lines.push(row(`  ${label} ${spark(s.spark7)}  ${arrow}  streak: ${s.supStreak}d`));
  }
  lines.push(row("  ░ = no log   ▁▂▃▄▅▆▇█ = log volume"));
  lines.push(row(""));
  lines.push(divider(W));

  // Daily activity (log counts last 7 days)
  lines.push(row(""));
  lines.push(row("  DAILY ACTIVITY · LAST 7 DAYS"));
  lines.push(row(""));
  const maxDaily = Math.max(...dailyCounts, 1);
  for (let i = 0; i < 7; i++) {
    const v    = dailyCounts[i] ?? 0;
    const b    = bar(Math.round((v / maxDaily) * 100), 12);
    const day  = DAYS[i].padEnd(4);
    lines.push(row(`  ${day}  ${b}  ${v} log${v !== 1 ? "s" : ""}`));
  }
  lines.push(row(""));
  lines.push(divider(W));

  // Day of week breakdown
  lines.push(row(""));
  lines.push(row("  BEST DAYS OF WEEK"));
  lines.push(row(""));
  for (let i = 0; i < 7; i++) {
    const v   = dowCounts[i] ?? 0;
    const b   = bar(Math.round((v / maxDow) * 100), 10);
    const day = DAYS[i].padEnd(4);
    lines.push(row(`  ${day}  ${b}  ${v}`));
  }
  lines.push(row(""));
  lines.push(divider(W));

  // Time of day
  lines.push(row(""));
  lines.push(row("  TIME OF DAY"));
  lines.push(row(""));
  lines.push(row(`  Morning   (5am–12pm)  ${bar(Math.round(morning/totalH*100),14)}  ${Math.round(morning/totalH*100)}%`));
  lines.push(row(`  Afternoon (12pm–6pm)  ${bar(Math.round(afternoon/totalH*100),14)}  ${Math.round(afternoon/totalH*100)}%`));
  lines.push(row(`  Evening   (6pm–12am)  ${bar(Math.round(evening/totalH*100),14)}  ${Math.round(evening/totalH*100)}%`));
  lines.push(row(""));
  lines.push(divider(W));

  // Summary
  const best = supplements[0];
  lines.push(row(""));
  lines.push(row("  SUMMARY"));
  lines.push(row(""));
  if (best) lines.push(row(`  Top supplement   ${best.name}  (${best.pct}% consistency)`));
  lines.push(row(`  Logging pattern  ${morning > evening ? "Morning" : "Evening"} person`));
  if (maxGap >= 3) lines.push(row(`  Watch            ${maxGap}-day gap detected`));
  if (streak > 0)  lines.push(row(`  Keep going       ${streak} days strong`));
  lines.push(row(""));
  lines.push(bot(W));

  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { period, supplements, streak, totalLogs, dailyCounts, dowCounts, weeklyVol, morning, afternoon, evening, maxGap } = body;

  const maxDaily = Math.max(...dailyCounts, 1);
  const graphPts = dailyCounts.map((v: number) => Math.round((v / maxDaily) * 100));
  const supList  = supplements.map((s: any) =>
    `${s.name} — ${s.pct}% consistency, trend: ${s.trend}, 7-day: [${s.spark7.join(",")}], streak: ${s.supStreak}d`
  ).join("\n");

  const prompt = `Generate a rich health journal insights report as a single ASCII art box.

USER DATA (${period}):
Streak: ${streak} days · Total logs: ${totalLogs}
Supplements:
${supList}
Time: morning ${morning} / afternoon ${afternoon} / evening ${evening}
Day of week (Mon–Sun): ${dowCounts.join(", ")}
7-day counts: ${dailyCounts.join(", ")} (normalized: ${graphPts.join(",")})
Longest gap: ${maxGap} days

RULES:
- Single box: ╔═╗ ║ ╠═╣ ╚═╝, exactly 66 chars wide
- Every content line: ║ + 64 chars + ║
- Infer supplement purpose (skin, brain, fitness, diabetes etc.) from names
- STATUS BARS: 5–7 metrics specific to these supplements, 20 █░ blocks each
- LINE GRAPH: last 7 days using values [${graphPts.join(",")}], Y-axis 0–100, use ● ─ ┤ ┼
- INGREDIENT BARS: one per supplement, 20 blocks
- ADVANTAGES & DISADVANTAGES: 4–5 pros, 3–4 cons, specific to actual supplements
- DAILY BREAKDOWN: Mon–Sun bars using [${dowCounts.join(",")}]
- FINAL SUMMARY: creative condition name, key stats
- No emojis. Data-driven. Impressive.`;

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
    if (res.ok) {
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
      if (text) return NextResponse.json({ report: text });
    }
  } catch {}

  // Fallback: computed static report (always works, no AI needed)
  return NextResponse.json({ report: staticReport(body) });
}
