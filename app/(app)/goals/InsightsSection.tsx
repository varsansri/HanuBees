"use client";

import { useState, useEffect, useMemo, useRef } from "react";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const MUTED  = "#a9a9a7";
const BG2    = "#1a1a1a";
const BG3    = "#242424";
const FG     = "#eaeaea";
const BG     = "#121212";

type Period = "week" | "month" | "all";
interface JournalEntry { id: string; name: string; category: string; dose_amount: string; dose_unit: string; dose_time: string; }
interface AIInsight { narrative: string; watch: string[]; }

const BLOCKS = "▁▂▃▄▅▆▇█";
function toSpark(vals: number[]): string {
  const max = Math.max(...vals, 1);
  return vals.map(v => v === 0 ? "░" : BLOCKS[Math.min(7, Math.floor((v / max) * 8))]).join("");
}

function scoreGrade(s: number) {
  if (s >= 93) return "A+"; if (s >= 87) return "A"; if (s >= 80) return "A−";
  if (s >= 75) return "B+"; if (s >= 68) return "B"; if (s >= 60) return "B−";
  if (s >= 53) return "C+"; if (s >= 45) return "C"; return "D";
}

function heatColor(n: number) {
  if (n === 0) return BG3;
  if (n === 1) return "rgba(152,170,157,0.28)";
  if (n === 2) return "rgba(152,170,157,0.58)";
  return GREEN;
}

function VerticalBars({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 72 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 9, color: v > 0 ? MUTED : "transparent", lineHeight: 1 }}>{v}</span>
          <div style={{ width: "100%", height: v > 0 ? Math.max(3, Math.round((v / max) * 44)) : 0, background: color, borderRadius: "3px 3px 0 0", transition: "height 0.5s ease" }} />
          <span style={{ fontSize: 9, color: MUTED, fontWeight: 700 }}>{labels[i]}</span>
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
  const aiCalledRef               = useRef(false);

  const cacheKey = `hb_ins3_${new Date().toDateString()}_${entries.length}`;

  useEffect(() => {
    try { const c = localStorage.getItem(cacheKey); if (c) { setAiInsight(JSON.parse(c)); aiCalledRef.current = true; } } catch {}
  }, [cacheKey]);

  const stats = useMemo(() => {
    const now = new Date();

    const daySet = new Set(entries.map(e => e.dose_time.slice(0, 10)));
    const dayCount: Record<string, number> = {};
    entries.forEach(e => { const k = e.dose_time.slice(0, 10); dayCount[k] = (dayCount[k] || 0) + 1; });

    // Streak + personal best
    let streak = 0;
    const sd = new Date();
    while (daySet.has(sd.toISOString().slice(0, 10))) { streak++; sd.setDate(sd.getDate() - 1); }
    let maxStreak = 0, cur = 0;
    [...daySet].sort().forEach((day, i, arr) => {
      if (i === 0) { cur = 1; maxStreak = 1; return; }
      const diff = Math.round((new Date(day).getTime() - new Date(arr[i - 1]).getTime()) / 86400000);
      cur = diff === 1 ? cur + 1 : 1;
      maxStreak = Math.max(maxStreak, cur);
    });

    // Period
    const periodDays = period === "week" ? 7 : period === "month" ? 30
      : entries.length > 0 ? Math.max(1, Math.ceil((now.getTime() - new Date(entries[entries.length - 1].dose_time).getTime()) / 86400000) + 1) : 1;
    const periodStart = period === "all" ? new Date(0) : new Date(now.getTime() - periodDays * 86400000);
    const filtered    = entries.filter(e => new Date(e.dose_time) >= periodStart);

    // Previous period
    const prevStart = new Date(periodStart.getTime() - periodDays * 86400000);
    const prev      = entries.filter(e => new Date(e.dose_time) >= prevStart && new Date(e.dose_time) < periodStart);
    const prevSupDays: Record<string, Set<string>> = {};
    prev.forEach(e => { if (!prevSupDays[e.name]) prevSupDays[e.name] = new Set(); prevSupDays[e.name].add(e.dose_time.slice(0, 10)); });

    const supDays: Record<string, Set<string>> = {};
    filtered.forEach(e => { if (!supDays[e.name]) supDays[e.name] = new Set(); supDays[e.name].add(e.dose_time.slice(0, 10)); });
    const halfStart = new Date(now.getTime() - (periodDays / 2) * 86400000);

    const consistency = Object.entries(supDays).map(([name, days]) => {
      const pct    = Math.min(100, Math.round((days.size / periodDays) * 100));
      const prev2  = prevSupDays[name] ? Math.min(100, Math.round((prevSupDays[name].size / periodDays) * 100)) : null;
      const recent = filtered.filter(e => e.name === name && new Date(e.dose_time) >= halfStart).length;
      const older  = filtered.filter(e => e.name === name && new Date(e.dose_time) < halfStart).length;
      const trend: "up"|"flat"|"down" = recent > older * 1.2 ? "up" : recent < older * 0.8 ? "down" : "flat";
      let supStreak = 0;
      const ssd = new Date();
      while (days.has(ssd.toISOString().slice(0, 10))) { supStreak++; ssd.setDate(ssd.getDate() - 1); }
      const firstLog = entries.filter(e => e.name === name).sort((a, b) => new Date(a.dose_time).getTime() - new Date(b.dose_time).getTime())[0];
      const daysOld  = firstLog ? Math.ceil((now.getTime() - new Date(firstLog.dose_time).getTime()) / 86400000) : 0;
      const spark14  = toSpark(Array.from({ length: 14 }, (_, i) => {
        const d2 = new Date(now.getTime() - (13 - i) * 86400000).toISOString().slice(0, 10);
        return filtered.filter(e => e.name === name && e.dose_time.startsWith(d2)).length;
      }));
      return { name, pct, days: days.size, trend, supStreak, prevPct: prev2, isNew: daysOld <= 14, daysOld, spark14 };
    }).sort((a, b) => b.pct - a.pct).slice(0, 8);

    // Health score
    const avgConsist  = consistency.length ? consistency.reduce((s, c) => s + c.pct, 0) / consistency.length : 0;
    const daysLogged  = new Set(filtered.map(e => e.dose_time.slice(0, 10))).size;
    const healthScore = Math.round(
      Math.min(streak / 30, 1) * 25 +
      (avgConsist / 100) * 40 +
      Math.min(Object.keys(supDays).length / 5, 1) * 15 +
      (daysLogged / Math.max(periodDays, 1)) * 20
    );

    // Day of week
    const dowCounts = [0,0,0,0,0,0,0];
    filtered.forEach(e => { dowCounts[(new Date(e.dose_time).getDay() + 6) % 7]++; });

    // Weekly volume (8 weeks)
    const weeklyVol = Array.from({ length: 8 }, (_, i) => {
      const ws = new Date(now.getTime() - (7 - i) * 7 * 86400000);
      const we = new Date(ws.getTime() + 7 * 86400000);
      return filtered.filter(e => { const t = new Date(e.dose_time); return t >= ws && t < we; }).length;
    });

    // Time of day
    const hours     = filtered.map(e => new Date(e.dose_time).getHours());
    const morning   = hours.filter(h => h >= 5  && h < 12).length;
    const afternoon = hours.filter(h => h >= 12 && h < 18).length;
    const evening   = hours.filter(h => h >= 18 || h < 5).length;
    const totalH    = hours.length || 1;

    // 35-day intensity heatmap (5 weeks, aligned Mon–Sun)
    const todayDow  = (now.getDay() + 6) % 7; // 0=Mon
    const heatCells = Array.from({ length: 35 }, (_, i) => {
      const cellIdx = 34 - i;
      const date    = new Date(now.getTime() - cellIdx * 86400000);
      const key     = date.toISOString().slice(0, 10);
      return { key, count: dayCount[key] || 0, inFuture: false };
    });
    // pad start so grid aligns to Mon
    const startDow = (heatCells[0] ? (new Date(heatCells[0].key).getDay() + 6) % 7 : 0);
    const padded   = [...Array(startDow).fill(null), ...heatCells];

    // Longest gap in all-time
    const sortedDays = [...daySet].sort();
    let maxGap = 0;
    for (let i = 1; i < sortedDays.length; i++) {
      const g = Math.round((new Date(sortedDays[i]).getTime() - new Date(sortedDays[i-1]).getTime()) / 86400000) - 1;
      maxGap = Math.max(maxGap, g);
    }

    // Forecast
    const forecast30 = streak > 0 && streak < 30 ? 30 - streak : null;

    const lastEntry = entries[0] ?? null;
    const lastLogTime = lastEntry
      ? new Date(lastEntry.dose_time).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : null;

    return {
      streak, maxStreak, isPersonalBest: streak > 0 && streak >= maxStreak && maxStreak > 1,
      totalLogs: filtered.length, supplementCount: Object.keys(supDays).length,
      consistency, healthScore, daysLogged, periodDays,
      dowCounts, weeklyVol,
      morning, afternoon, evening, totalH,
      padded, maxGap, forecast30,
      lastEntry, lastLogTime,
      avgConsist: Math.round(avgConsist),
    };
  }, [entries, period]);

  const generateAI = async (force = false) => {
    if (loadingAI || (!force && aiInsight)) return;
    setLoadingAI(true); setAiError("");
    try {
      const res = await fetch("/api/insights", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streak: stats.streak, totalEntries: entries.length, period,
          supplements: stats.consistency.map(c => ({ name: c.name, pct: c.pct, trend: c.trend })),
          healthScore: stats.healthScore,
        }),
      });
      const data = await res.json();
      setAiInsight(data);
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch { setAiError("Could not generate. Try again."); }
    setLoadingAI(false);
  };

  useEffect(() => {
    if (entries.length >= 15 && !aiCalledRef.current && !loadingAI) {
      aiCalledRef.current = true;
      generateAI();
    }
  }, [entries.length]);

  if (entries.length < 5) return (
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

  const C = (children: React.ReactNode, style: React.CSSProperties = {}) => (
    <div style={{ background: BG2, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 18, padding: "18px", marginBottom: 10, ...style }}>
      {children}
    </div>
  );

  const Label = ({ text, right }: { text: string; right?: React.ReactNode }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>{text}</p>
      {right}
    </div>
  );

  return (
    <div>

      {/* Period tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {(["week","month","all"] as Period[]).map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{
            padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer",
            background: period === p ? FG : BG2, color: period === p ? BG : MUTED,
            fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.15s",
          }}>
            {p === "week" ? "Week" : p === "month" ? "Month" : "All time"}
          </button>
        ))}
      </div>

      {/* ── HEALTH SCORE ── */}
      {C(<>
        <Label text="Health Score" />
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 72, fontWeight: 800, color: YELLOW, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.05em", lineHeight: 1 }}>
              {stats.healthScore}
            </p>
            <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>out of 100</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 42, fontWeight: 800, color: FG, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.03em", lineHeight: 1 }}>
              {scoreGrade(stats.healthScore)}
            </p>
            <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>grade</p>
          </div>
        </div>

        {/* Score breakdown */}
        {[
          { label: "Streak",      val: Math.round(Math.min(stats.streak / 30, 1) * 100), color: YELLOW },
          { label: "Consistency", val: stats.avgConsist,                                   color: GREEN  },
          { label: "Diversity",   val: Math.round(Math.min(stats.supplementCount / 5, 1) * 100), color: GREEN },
          { label: "Rhythm",      val: Math.round((stats.daysLogged / Math.max(stats.periodDays, 1)) * 100), color: YELLOW },
        ].map(item => (
          <div key={item.label} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: MUTED }}>{item.label}</span>
              <span style={{ fontSize: 12, color: FG, fontWeight: 600 }}>{item.val}%</span>
            </div>
            <div style={{ height: 4, background: BG3, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: `${item.val}%`, height: "100%", background: item.color, borderRadius: 2, transition: "width 0.6s ease" }} />
            </div>
          </div>
        ))}
      </>)}

      {/* ── STREAK ── */}
      {C(<>
        <Label text="Streak" right={
          stats.isPersonalBest
            ? <span style={{ fontSize: 11, color: GREEN, fontWeight: 700 }}>↑ personal best</span>
            : <span style={{ fontSize: 11, color: MUTED }}>best: {stats.maxStreak}d</span>
        } />
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
          <p style={{ fontSize: 60, fontWeight: 800, color: YELLOW, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.04em", lineHeight: 1 }}>{stats.streak}</p>
          <p style={{ fontSize: 18, color: FG, fontWeight: 600 }}>days</p>
        </div>
        {/* Milestone bar — 30-day target */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: MUTED }}>toward 30-day milestone</span>
            <span style={{ fontSize: 11, color: FG, fontWeight: 600 }}>{stats.streak}/30</span>
          </div>
          <div style={{ height: 5, background: BG3, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${Math.min((stats.streak / 30) * 100, 100)}%`, height: "100%", background: YELLOW, borderRadius: 3, transition: "width 0.6s ease" }} />
          </div>
        </div>
        {stats.forecast30 && <p style={{ fontSize: 12, color: MUTED, marginTop: 8 }}>Keep going · <span style={{ color: FG, fontWeight: 600 }}>{stats.forecast30} days</span> to 30-day milestone</p>}
        {stats.lastEntry && <p style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>Last log · <span style={{ color: FG }}>{stats.lastEntry.name}</span> · {stats.lastLogTime}</p>}
      </>)}

      {/* ── SUPPLEMENT CARDS (2-col grid) ── */}
      {stats.consistency.length > 0 && (<>
        <div style={{ marginBottom: 6 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            Supplements · {period === "week" ? "this week" : period === "month" ? "this month" : "all time"}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            {stats.consistency.map(item => (
              <div key={item.name} style={{ background: BG2, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 16, padding: "14px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: FG, lineHeight: 1.3, flex: 1, paddingRight: 6, wordBreak: "break-word" }}>{item.name}</p>
                  <span style={{ fontSize: 13, fontWeight: 800, color: item.trend === "up" ? YELLOW : item.trend === "down" ? GREEN : MUTED, flexShrink: 0 }}>
                    {item.trend === "up" ? "↑" : item.trend === "down" ? "↓" : "→"}
                  </span>
                </div>
                <p style={{ fontSize: 32, fontWeight: 800, color: YELLOW, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 8 }}>
                  {item.pct}%
                </p>
                <div style={{ height: 3, background: BG3, borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ width: `${item.pct}%`, height: "100%", background: GREEN, borderRadius: 2, transition: "width 0.6s ease" }} />
                </div>
                <p style={{ fontFamily: "monospace", fontSize: 11, color: GREEN, letterSpacing: 1, marginBottom: 6 }}>{item.spark14}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {item.supStreak > 1
                    ? <span style={{ fontSize: 10, color: MUTED }}>{item.supStreak}d streak</span>
                    : <span />
                  }
                  {item.isNew
                    ? <span style={{ fontSize: 10, color: GREEN, fontWeight: 700 }}>new</span>
                    : item.prevPct !== null && item.prevPct !== item.pct
                      ? <span style={{ fontSize: 10, color: MUTED }}>was {item.prevPct}%</span>
                      : <span />
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </>)}

      {/* ── ACTIVITY HEATMAP (intensity) ── */}
      {C(<>
        <Label text="Activity Heatmap · 5 Weeks" right={
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {[0,1,2,3].map(n => (
              <div key={n} style={{ width: 10, height: 10, borderRadius: 2, background: heatColor(n) }} />
            ))}
            <span style={{ fontSize: 10, color: MUTED }}>less → more</span>
          </div>
        } />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
          {["M","T","W","T","F","S","S"].map((d, i) => (
            <span key={i} style={{ fontSize: 9, color: MUTED, textAlign: "center", fontWeight: 700 }}>{d}</span>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {stats.padded.map((cell, i) => (
            <div key={i} style={{
              aspectRatio: "1", borderRadius: 3,
              background: cell ? heatColor(cell.count) : "transparent",
              transition: "background 0.3s",
            }} />
          ))}
        </div>
        {stats.maxGap >= 3 && (
          <p style={{ fontSize: 12, color: MUTED, marginTop: 12 }}>
            Longest gap · <span style={{ color: FG, fontWeight: 600 }}>{stats.maxGap} days</span> missed
          </p>
        )}
      </>)}

      {/* ── TIME OF DAY ── */}
      {stats.totalLogs >= 5 && C(<>
        <Label text="Time of Day" />
        {[
          { label: "Morning",   range: "5am – 12pm", count: stats.morning,   pct: Math.round(stats.morning / stats.totalH * 100) },
          { label: "Afternoon", range: "12pm – 6pm", count: stats.afternoon, pct: Math.round(stats.afternoon / stats.totalH * 100) },
          { label: "Evening",   range: "6pm – 12am", count: stats.evening,   pct: Math.round(stats.evening / stats.totalH * 100) },
        ].map(item => (
          <div key={item.label} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: FG }}>{item.label}</span>
                <span style={{ fontSize: 11, color: MUTED, marginLeft: 8 }}>{item.range}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: FG }}>{item.pct}%</span>
                <span style={{ fontSize: 11, color: MUTED }}>{item.count} logs</span>
              </div>
            </div>
            <div style={{ height: 6, background: BG3, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${item.pct}%`, height: "100%", background: item.label === "Morning" ? YELLOW : GREEN, borderRadius: 3, transition: "width 0.6s ease" }} />
            </div>
          </div>
        ))}
      </>)}

      {/* ── DAY OF WEEK ── */}
      {stats.totalLogs >= 7 && C(<>
        <Label text="Most Active Days" />
        <VerticalBars data={stats.dowCounts} labels={["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]} color={GREEN} />
      </>)}

      {/* ── WEEKLY VOLUME ── */}
      {stats.totalLogs >= 14 && C(<>
        <Label text="Weekly Volume · 8 Weeks" />
        <VerticalBars data={stats.weeklyVol} labels={["W1","W2","W3","W4","W5","W6","W7","W8"]} color={YELLOW} />
      </>)}

      {/* ── AI REPORT ── */}
      {entries.length >= 15 ? C(<>
        <Label text="AI Report" right={
          <button onClick={() => generateAI(true)} disabled={loadingAI} style={{
            background: "none", border: "none", color: MUTED, fontSize: 12,
            cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, padding: 0,
          }}>{loadingAI ? "Generating…" : "Refresh"}</button>
        } />
        {aiInsight ? (<>
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
        </>) : loadingAI ? (
          <p style={{ fontSize: 14, color: MUTED }}>Analyzing your journal…</p>
        ) : (<>
          <button onClick={() => generateAI()} style={{
            width: "100%", background: "none", border: "1px solid rgba(234,234,234,0.1)",
            borderRadius: 12, padding: "13px 20px", color: FG, fontSize: 14,
            cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
          }}>Generate AI report</button>
          {aiError && <p style={{ color: GREEN, fontSize: 12, marginTop: 8 }}>{aiError}</p>}
        </>)}
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
