"use client";

import { useState, useEffect, useMemo } from "react";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const MUTED  = "#a9a9a7";
const BG2    = "#1a1a1a";
const BG3    = "#242424";
const FG     = "#eaeaea";
const BG     = "#121212";

type Period = "week" | "month" | "all";

interface JournalEntry {
  id: string; name: string; category: string;
  dose_amount: string; dose_unit: string; dose_time: string;
}
interface AIInsight { narrative: string; watch: string[]; }

const BLOCKS = "▁▂▃▄▅▆▇█";
function toSpark(values: number[]): string {
  const max = Math.max(...values, 1);
  return values.map(v => v === 0 ? "░" : BLOCKS[Math.min(7, Math.floor((v / max) * 8))]).join("");
}

function hBar(pct: number, total = 10): string {
  const f = Math.round((Math.min(pct, 100) / 100) * total);
  return "▓".repeat(f) + "░".repeat(total - f);
}

function VerticalBars({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 80 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 9, color: v > 0 ? MUTED : "transparent" }}>{v}</span>
          <div style={{
            width: "100%",
            height: v > 0 ? Math.max(4, Math.round((v / max) * 48)) : 0,
            background: v > 0 ? color : BG3,
            borderRadius: "3px 3px 0 0",
            transition: "height 0.4s ease",
          }} />
          <span style={{ fontSize: 9, color: MUTED, fontWeight: 700, letterSpacing: "0.03em" }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function InsightsSection({ entries }: { entries: JournalEntry[] }) {
  const [period, setPeriod]       = useState<Period>("month");
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError]     = useState("");

  const cacheKey = `hb_ins2_${new Date().toDateString()}_${entries.length}`;

  useEffect(() => {
    try { const c = localStorage.getItem(cacheKey); if (c) setAiInsight(JSON.parse(c)); } catch {}
  }, [cacheKey]);

  const stats = useMemo(() => {
    const now = new Date();

    // All-time day set
    const daySet = new Set(entries.map(e => e.dose_time.slice(0, 10)));

    // Streak
    let streak = 0;
    const sd = new Date();
    while (daySet.has(sd.toISOString().slice(0, 10))) { streak++; sd.setDate(sd.getDate() - 1); }

    // Personal best streak
    let maxStreak = 0, cur = 0;
    const sortedDays = [...daySet].sort();
    sortedDays.forEach((day, i) => {
      if (i === 0) { cur = 1; maxStreak = 1; return; }
      const diff = Math.round((new Date(day).getTime() - new Date(sortedDays[i - 1]).getTime()) / 86400000);
      cur = diff === 1 ? cur + 1 : 1;
      maxStreak = Math.max(maxStreak, cur);
    });

    // Period filter
    const periodDays = period === "week" ? 7 : period === "month" ? 30
      : entries.length > 0
        ? Math.max(1, Math.ceil((now.getTime() - new Date(entries[entries.length - 1].dose_time).getTime()) / 86400000) + 1)
        : 1;
    const periodStart = period === "all" ? new Date(0) : new Date(now.getTime() - periodDays * 86400000);
    const filtered    = entries.filter(e => new Date(e.dose_time) >= periodStart);

    // Previous period
    const prevStart   = new Date(periodStart.getTime() - periodDays * 86400000);
    const prev        = entries.filter(e => new Date(e.dose_time) >= prevStart && new Date(e.dose_time) < periodStart);
    const prevSupDays: Record<string, Set<string>> = {};
    prev.forEach(e => { if (!prevSupDays[e.name]) prevSupDays[e.name] = new Set(); prevSupDays[e.name].add(e.dose_time.slice(0, 10)); });

    // Supplement consistency
    const supDays: Record<string, Set<string>> = {};
    filtered.forEach(e => { if (!supDays[e.name]) supDays[e.name] = new Set(); supDays[e.name].add(e.dose_time.slice(0, 10)); });
    const halfStart = new Date(now.getTime() - (periodDays / 2) * 86400000);

    const consistency = Object.entries(supDays).map(([name, days]) => {
      const pct     = Math.min(100, Math.round((days.size / periodDays) * 100));
      const prevPct = prevSupDays[name] ? Math.min(100, Math.round((prevSupDays[name].size / periodDays) * 100)) : null;
      const recent  = filtered.filter(e => e.name === name && new Date(e.dose_time) >= halfStart).length;
      const older   = filtered.filter(e => e.name === name && new Date(e.dose_time) < halfStart).length;
      const trend: "up" | "flat" | "down" = recent > older * 1.2 ? "up" : recent < older * 0.8 ? "down" : "flat";

      let supStreak = 0;
      const ssd = new Date();
      while (days.has(ssd.toISOString().slice(0, 10))) { supStreak++; ssd.setDate(ssd.getDate() - 1); }

      const firstLog = entries.filter(e => e.name === name).sort((a, b) => new Date(a.dose_time).getTime() - new Date(b.dose_time).getTime())[0];
      const daysOld  = firstLog ? Math.ceil((now.getTime() - new Date(firstLog.dose_time).getTime()) / 86400000) : 0;

      return { name, pct, days: days.size, trend, supStreak, prevPct, isNew: daysOld <= 14, daysOld };
    }).sort((a, b) => b.pct - a.pct).slice(0, 7);

    // 14-day sparklines
    const sparklines: Record<string, string> = {};
    const dayCount: Record<string, number> = {};
    filtered.forEach(e => { const k = e.dose_time.slice(0, 10); dayCount[k] = (dayCount[k] || 0) + 1; });
    consistency.forEach(({ name }) => {
      const vals = Array.from({ length: 14 }, (_, i) => {
        const d2 = new Date(now.getTime() - (13 - i) * 86400000).toISOString().slice(0, 10);
        return filtered.filter(e => e.name === name && e.dose_time.startsWith(d2)).length;
      });
      sparklines[name] = toSpark(vals);
    });

    // Day of week (0=Mon)
    const dowCounts = [0, 0, 0, 0, 0, 0, 0];
    filtered.forEach(e => { dowCounts[(new Date(e.dose_time).getDay() + 6) % 7]++; });

    // Weekly volume (last 8 weeks)
    const weeklyVol = Array.from({ length: 8 }, (_, i) => {
      const ws = new Date(now.getTime() - (7 - i) * 7 * 86400000);
      const we = new Date(ws.getTime() + 7 * 86400000);
      return filtered.filter(e => { const t = new Date(e.dose_time); return t >= ws && t < we; }).length;
    });

    // Timing pattern
    const hours     = filtered.map(e => new Date(e.dose_time).getHours());
    const morning   = hours.filter(h => h >= 5  && h < 12).length;
    const afternoon = hours.filter(h => h >= 12 && h < 18).length;
    const evening   = hours.filter(h => h >= 18 || h < 5).length;
    const total     = hours.length || 1;
    const timeLabel = morning >= afternoon && morning >= evening ? "Morning person"
      : evening > morning ? "Evening routine" : "Afternoon logger";
    const timePct   = Math.round(Math.max(morning, afternoon, evening) / total * 100);

    // Gap detection
    let maxGap = 0;
    for (let i = 1; i < sortedDays.length; i++) {
      const gap = Math.round((new Date(sortedDays[i]).getTime() - new Date(sortedDays[i - 1]).getTime()) / 86400000) - 1;
      maxGap = Math.max(maxGap, gap);
    }

    // Rhythm grid (30 days)
    const rhythm = Array.from({ length: 30 }, (_, i) => {
      const d2 = new Date(now.getTime() - (29 - i) * 86400000);
      return daySet.has(d2.toISOString().slice(0, 10));
    });

    const lastEntry  = entries[0] ?? null;
    const lastLogTime = lastEntry
      ? new Date(lastEntry.dose_time).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : null;

    return {
      streak, maxStreak, isPersonalBest: streak > 0 && streak >= maxStreak && streak > 1,
      totalLogs: filtered.length, supplementCount: Object.keys(supDays).length,
      consistency, sparklines, dowCounts, weeklyVol,
      timeLabel, timePct, maxGap,
      rhythm, daysLogged: new Set(filtered.map(e => e.dose_time.slice(0, 10))).size,
      periodDays, lastEntry, lastLogTime,
    };
  }, [entries, period]);

  const generateAI = async (force = false) => {
    if (loadingAI || (!force && aiInsight)) return;
    setLoadingAI(true); setAiError("");
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streak: stats.streak, totalEntries: entries.length, period,
          supplements: stats.consistency.map(c => ({ name: c.name, pct: c.pct, trend: c.trend })),
          timeLabel: stats.timeLabel, timePct: stats.timePct, maxGap: stats.maxGap,
        }),
      });
      const data = await res.json();
      setAiInsight(data);
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch { setAiError("Could not generate. Try again."); }
    setLoadingAI(false);
  };

  useEffect(() => {
    if (entries.length >= 15 && !aiInsight && !loadingAI) generateAI();
  }, [entries.length]);

  if (entries.length < 5) {
    return (
      <div style={{ background: BG2, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 20, padding: "44px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 56, fontWeight: 800, color: FG, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.04em", lineHeight: 1 }}>
          {entries.length}<span style={{ fontSize: 28, color: MUTED, fontWeight: 500 }}>/5</span>
        </p>
        <p style={{ color: MUTED, fontSize: 14, marginTop: 14, lineHeight: 1.7 }}>
          Log {5 - entries.length} more {5 - entries.length === 1 ? "entry" : "entries"} to unlock your insights
        </p>
        <div style={{ marginTop: 22, height: 4, background: BG3, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${(entries.length / 5) * 100}%`, height: "100%", background: YELLOW, borderRadius: 2 }} />
        </div>
      </div>
    );
  }

  const card = (children: React.ReactNode) => (
    <div style={{ background: BG2, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 18, padding: "18px", marginBottom: 10 }}>
      {children}
    </div>
  );

  const sectionLabel = (text: string, right?: React.ReactNode) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>{text}</p>
      {right}
    </div>
  );

  return (
    <div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {(["week", "month", "all"] as Period[]).map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{
            padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer",
            background: period === p ? FG : BG2,
            color: period === p ? BG : MUTED,
            fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif",
            transition: "all 0.15s",
          }}>
            {p === "week" ? "Week" : p === "month" ? "Month" : "All time"}
          </button>
        ))}
      </div>

      {/* ── STREAK ── */}
      {card(<>
        {sectionLabel("Streak")}
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 14 }}>
          <p style={{ fontSize: 54, fontWeight: 800, color: YELLOW, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.04em", lineHeight: 1 }}>
            {stats.streak}
          </p>
          <div>
            <p style={{ fontSize: 16, color: FG, fontWeight: 600 }}>days</p>
            {stats.isPersonalBest
              ? <p style={{ fontSize: 12, color: GREEN, marginTop: 3, fontWeight: 600 }}>↑ personal best</p>
              : stats.maxStreak > 0
                ? <p style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>best: {stats.maxStreak}d</p>
                : null
            }
          </div>
        </div>
        <p style={{ fontFamily: "monospace", fontSize: 15, color: YELLOW, letterSpacing: 3, marginBottom: 4 }}>
          {hBar(stats.maxStreak > 0 ? (stats.streak / stats.maxStreak) * 100 : 0)}
          <span style={{ color: MUTED, fontSize: 11, marginLeft: 10, letterSpacing: 0 }}>
            {stats.streak}/{stats.maxStreak} best
          </span>
        </p>
        {stats.lastEntry && (
          <p style={{ fontSize: 12, color: MUTED, marginTop: 12 }}>
            Last log · <span style={{ color: FG }}>{stats.lastEntry.name}</span> · {stats.lastLogTime}
          </p>
        )}
      </>)}

      {/* ── CONSISTENCY ── */}
      {stats.consistency.length > 0 && card(<>
        {sectionLabel(`Consistency · ${period === "week" ? "this week" : period === "month" ? "this month" : "all time"}`)}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {stats.consistency.map(item => (
            <div key={item.name}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: FG }}>{item.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {item.prevPct !== null && item.prevPct !== item.pct && (
                    <span style={{ fontSize: 11, color: MUTED }}>was {item.prevPct}%</span>
                  )}
                  {item.isNew && <span style={{ fontSize: 11, color: GREEN }}>new · {item.daysOld}d</span>}
                  <span style={{ fontSize: 13, fontWeight: 700, color: FG }}>{item.pct}%</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: item.trend === "up" ? YELLOW : item.trend === "down" ? GREEN : MUTED }}>
                    {item.trend === "up" ? "↑" : item.trend === "down" ? "↓" : "→"}
                  </span>
                </div>
              </div>
              <div style={{ height: 5, background: BG3, borderRadius: 3, overflow: "hidden", marginBottom: 5 }}>
                <div style={{ width: `${item.pct}%`, height: "100%", background: GREEN, borderRadius: 3, transition: "width 0.6s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: MUTED }}>{item.days} days logged</span>
                {item.supStreak > 1 && (
                  <span style={{ fontSize: 11, color: MUTED }}>streak: <span style={{ color: FG, fontWeight: 600 }}>{item.supStreak}d</span></span>
                )}
              </div>
            </div>
          ))}
        </div>
      </>)}

      {/* ── 14-DAY SPARKLINES ── */}
      {stats.consistency.length > 0 && card(<>
        {sectionLabel("14-Day Trend")}
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          {stats.consistency.map(item => (
            <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: FG, minWidth: 100, flexShrink: 0 }}>{item.name}</span>
              <span style={{ fontFamily: "monospace", fontSize: 14, letterSpacing: 2, color: GREEN, flex: 1 }}>
                {stats.sparklines[item.name]}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: item.trend === "up" ? YELLOW : item.trend === "down" ? GREEN : MUTED, flexShrink: 0 }}>
                {item.trend === "up" ? "↑" : item.trend === "down" ? "↓" : "→"}
              </span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 10, color: MUTED, marginTop: 14, letterSpacing: "0.02em" }}>
          ░ no log &nbsp; ▁▂▃▄▅▆▇█ log volume
        </p>
      </>)}

      {/* ── DAY OF WEEK VERTICAL BARS ── */}
      {stats.totalLogs >= 7 && card(<>
        {sectionLabel("Most Active Days")}
        <VerticalBars
          data={stats.dowCounts}
          labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
          color={GREEN}
        />
      </>)}

      {/* ── WEEKLY VOLUME VERTICAL BARS ── */}
      {stats.totalLogs >= 14 && card(<>
        {sectionLabel("Weekly Volume · Last 8 Weeks")}
        <VerticalBars
          data={stats.weeklyVol}
          labels={["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]}
          color={YELLOW}
        />
      </>)}

      {/* ── RHYTHM GRID ── */}
      {card(<>
        {sectionLabel(
          "Rhythm · 30 Days",
          <p style={{ fontSize: 12, color: MUTED }}>
            <span style={{ color: FG, fontWeight: 700 }}>{stats.rhythm.filter(Boolean).length}</span>/30
          </p>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
          {["M","T","W","T","F","S","S"].map((d, i) => (
            <span key={i} style={{ fontSize: 10, color: MUTED, textAlign: "center", fontWeight: 700 }}>{d}</span>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {stats.rhythm.map((logged, i) => (
            <div key={i} style={{ aspectRatio: "1", borderRadius: "50%", background: logged ? GREEN : BG3 }} />
          ))}
        </div>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 7 }}>
          {stats.timePct >= 55 && (
            <p style={{ fontSize: 12, color: MUTED }}>
              {stats.timeLabel} · <span style={{ color: FG, fontWeight: 600 }}>{stats.timePct}%</span> of logs
            </p>
          )}
          {stats.maxGap >= 3 && (
            <p style={{ fontSize: 12, color: MUTED }}>
              Longest gap · <span style={{ color: FG, fontWeight: 600 }}>{stats.maxGap} days</span> missed
            </p>
          )}
        </div>
      </>)}

      {/* ── AI REPORT ── */}
      {entries.length >= 15 ? card(<>
        {sectionLabel("AI Report",
          <button onClick={() => generateAI(true)} disabled={loadingAI} style={{
            background: "none", border: "none", color: MUTED, fontSize: 12,
            cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, padding: 0,
          }}>
            {loadingAI ? "Generating…" : "Refresh"}
          </button>
        )}
        {aiInsight ? (
          <>
            <div style={{ borderLeft: `3px solid ${YELLOW}`, paddingLeft: 14 }}>
              <p style={{ fontSize: 14, color: FG, lineHeight: 1.8 }}>{aiInsight.narrative}</p>
            </div>
            {aiInsight.watch?.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(234,234,234,0.06)" }}>
                <p style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Watch</p>
                {aiInsight.watch.map((w, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: YELLOW, flexShrink: 0, marginTop: 5 }} />
                    <p style={{ fontSize: 13, color: FG, lineHeight: 1.6, margin: 0 }}>{w}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : loadingAI ? (
          <p style={{ fontSize: 14, color: MUTED }}>Analyzing your journal…</p>
        ) : (
          <>
            <button onClick={() => generateAI()} style={{
              width: "100%", background: "none", border: "1px solid rgba(234,234,234,0.1)",
              borderRadius: 12, padding: "13px 20px", color: FG, fontSize: 14,
              cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
            }}>
              Generate AI report
            </button>
            {aiError && <p style={{ color: GREEN, fontSize: 12, marginTop: 8 }}>{aiError}</p>}
          </>
        )}
      </>) : (
        <div style={{ background: BG2, border: "1px solid rgba(234,234,234,0.06)", borderRadius: 18, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 13, color: FG, fontWeight: 600 }}>AI Report</p>
            <p style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>{15 - entries.length} more logs to unlock</p>
          </div>
          <div style={{ height: 4, width: 80, background: BG3, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${(entries.length / 15) * 100}%`, height: "100%", background: YELLOW, borderRadius: 2 }} />
          </div>
        </div>
      )}

    </div>
  );
}
