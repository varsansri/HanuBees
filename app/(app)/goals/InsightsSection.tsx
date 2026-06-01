"use client";

import { useState, useEffect, useMemo } from "react";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const MUTED  = "#a9a9a7";
const BG2    = "#1a1a1a";
const BG3    = "#242424";
const FG     = "#eaeaea";

type Period = "week" | "month" | "all";

interface JournalEntry {
  id: string; name: string; category: string;
  dose_amount: string; dose_unit: string; dose_time: string;
}
interface AIInsight { narrative: string; watch: string[]; }

// ── Inline SVG line graph — zero dependencies ──────────────────────────────────
function LineGraph({ points, avg }: { points: number[]; avg: number }) {
  const W = 320, H = 80;
  const maxVal = Math.max(...points, avg * 1.2, 1);
  const n = points.length;
  const toX = (i: number) => (i / Math.max(n - 1, 1)) * W;
  const toY = (v: number) => H - (v / maxVal) * H * 0.9 - H * 0.05;
  const polyPts = points.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const avgY    = toY(avg);
  const areaBot = H;
  const areaPts = `${toX(0)},${areaBot} ${points.map((v, i) => `${toX(i)},${toY(v)}`).join(" ")} ${toX(n - 1)},${areaBot}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 80 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={YELLOW} stopOpacity="0.18" />
          <stop offset="100%" stopColor={YELLOW} stopOpacity="0"    />
        </linearGradient>
      </defs>
      {/* grid */}
      {[0.33, 0.66, 1].map(f => (
        <line key={f} x1="0" y1={H * (1 - f * 0.9 + 0.05)} x2={W} y2={H * (1 - f * 0.9 + 0.05)}
          stroke="rgba(234,234,234,0.05)" strokeWidth="1" />
      ))}
      {/* area fill */}
      <polygon points={areaPts} fill="url(#ig)" />
      {/* average dashed */}
      <line x1="0" y1={avgY} x2={W} y2={avgY}
        stroke={MUTED} strokeWidth="1.5" strokeDasharray="5 4" opacity="0.5" />
      {/* actual line */}
      <polyline points={polyPts} fill="none" stroke={YELLOW} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
      {/* dots */}
      {points.map((v, i) => v > 0 && (
        <circle key={i} cx={toX(i)} cy={toY(v)} r="3.5" fill={YELLOW} />
      ))}
    </svg>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function InsightsSection({ entries }: { entries: JournalEntry[] }) {
  const [period, setPeriod]       = useState<Period>("month");
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError]     = useState("");

  const cacheKey = `hb_insights_${new Date().toDateString()}_${entries.length}`;

  useEffect(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) setAiInsight(JSON.parse(cached));
    } catch {}
  }, [cacheKey]);

  // ── Compute all stats client-side ──────────────────────────────────────────
  const stats = useMemo(() => {
    const now        = new Date();
    const periodDays = period === "week" ? 7 : period === "month" ? 30
      : entries.length > 0
        ? Math.max(1, Math.ceil((now.getTime() - new Date(entries[entries.length - 1].dose_time).getTime()) / 86400000) + 1)
        : 1;
    const periodStart = period === "all" ? new Date(0) : new Date(now.getTime() - periodDays * 86400000);
    const filtered    = entries.filter(e => new Date(e.dose_time) >= periodStart);

    // All-time streak (based on all entries)
    const daySet = new Set(entries.map(e => e.dose_time.slice(0, 10)));
    let streak = 0;
    const d = new Date();
    while (daySet.has(d.toISOString().slice(0, 10))) { streak++; d.setDate(d.getDate() - 1); }

    // Supplement consistency
    const supDays: Record<string, Set<string>> = {};
    filtered.forEach(e => {
      if (!supDays[e.name]) supDays[e.name] = new Set();
      supDays[e.name].add(e.dose_time.slice(0, 10));
    });

    const halfStart = new Date(now.getTime() - (periodDays / 2) * 86400000);
    const consistency = Object.entries(supDays)
      .map(([name, days]) => {
        const pct     = Math.min(100, Math.round((days.size / periodDays) * 100));
        const recent  = filtered.filter(e => e.name === name && new Date(e.dose_time) >= halfStart).length;
        const older   = filtered.filter(e => e.name === name && new Date(e.dose_time) < halfStart).length;
        const trend: "up" | "flat" | "down" =
          recent > older * 1.2 ? "up" : recent < older * 0.8 ? "down" : "flat";
        return { name, pct, days: days.size, trend };
      })
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 6);

    // Day-by-day log count
    const dayCount: Record<string, number> = {};
    filtered.forEach(e => {
      const key = e.dose_time.slice(0, 10);
      dayCount[key] = (dayCount[key] || 0) + 1;
    });

    // Graph: last 14 days (or 7 for week)
    const graphDays = period === "week" ? 7 : 14;
    const graphPoints = Array.from({ length: graphDays }, (_, i) => {
      const date = new Date(now.getTime() - (graphDays - 1 - i) * 86400000);
      return dayCount[date.toISOString().slice(0, 10)] || 0;
    });
    const graphLabels = Array.from({ length: graphDays }, (_, i) => {
      const date = new Date(now.getTime() - (graphDays - 1 - i) * 86400000);
      return date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1);
    });
    const avgPerDay = filtered.length / periodDays;

    // Rhythm: last 30 days
    const rhythm = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 86400000);
      return daySet.has(date.toISOString().slice(0, 10));
    });
    const daysLogged = new Set(filtered.map(e => e.dose_time.slice(0, 10))).size;

    return { streak, totalLogs: filtered.length, supplementCount: Object.keys(supDays).length,
      consistency, graphPoints, graphLabels, avgPerDay, rhythm, daysLogged, periodDays };
  }, [entries, period]);

  // ── AI generation ──────────────────────────────────────────────────────────
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
        }),
      });
      const data = await res.json();
      setAiInsight(data);
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch { setAiError("Could not generate insights. Try again."); }
    setLoadingAI(false);
  };

  useEffect(() => {
    if (entries.length >= 15 && !aiInsight && !loadingAI) generateAI();
  }, [entries.length]);

  // ── Locked state ───────────────────────────────────────────────────────────
  if (entries.length < 5) {
    return (
      <div style={{ background: BG2, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 20, padding: "36px 24px", textAlign: "center", marginBottom: 24 }}>
        <p style={{ fontSize: 48, fontWeight: 800, color: FG, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.04em", lineHeight: 1 }}>
          {entries.length}<span style={{ fontSize: 24, color: MUTED, fontWeight: 600 }}>/5</span>
        </p>
        <p style={{ color: MUTED, fontSize: 14, marginTop: 10, lineHeight: 1.6 }}>
          Log {5 - entries.length} more {5 - entries.length === 1 ? "entry" : "entries"} to unlock your health insights
        </p>
        <div style={{ marginTop: 20, height: 4, background: BG3, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${(entries.length / 5) * 100}%`, height: "100%", background: YELLOW, borderRadius: 2, transition: "width 0.5s ease" }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 24 }}>

      {/* ── Filter tabs ── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {(["week", "month", "all"] as Period[]).map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{
            padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer",
            background: period === p ? FG : BG2,
            color: period === p ? "#121212" : MUTED,
            fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: "0.01em", transition: "all 0.15s",
          }}>
            {p === "week" ? "Week" : p === "month" ? "Month" : "All time"}
          </button>
        ))}
      </div>

      {/* ── Overview numbers ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
        {[
          { value: stats.streak,          label: "Day Streak"   },
          { value: stats.totalLogs,        label: "Total Logs"   },
          { value: stats.supplementCount,  label: "Supplements"  },
        ].map(item => (
          <div key={item.label} style={{ background: BG2, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 16, padding: "18px 12px", textAlign: "center" }}>
            <p style={{ fontSize: 30, fontWeight: 800, color: FG, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.03em", lineHeight: 1 }}>
              {item.value}
            </p>
            <p style={{ fontSize: 10, color: MUTED, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 7 }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Logging Activity (SVG line graph) ── */}
      <div style={{ background: BG2, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 18, padding: "18px 18px 14px", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Logging Activity
          </p>
          <p style={{ fontSize: 12, color: MUTED }}>{stats.daysLogged} of {stats.periodDays} days</p>
        </div>
        <LineGraph points={stats.graphPoints} avg={stats.avgPerDay} />
        {/* X-axis labels */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          {stats.graphLabels.map((l, i) => {
            const step = Math.ceil(stats.graphLabels.length / 7);
            if (i % step !== 0 && i !== stats.graphLabels.length - 1) return null;
            return <span key={i} style={{ fontSize: 10, color: MUTED, fontWeight: 600 }}>{l}</span>;
          })}
        </div>
        {/* Legend */}
        <div style={{ display: "flex", gap: 18, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 20, height: 2.5, background: YELLOW, borderRadius: 2 }} />
            <span style={{ fontSize: 11, color: MUTED }}>Your logs</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="20" height="3" viewBox="0 0 20 3" style={{ flexShrink: 0 }}>
              <line x1="0" y1="1.5" x2="20" y2="1.5" stroke={MUTED} strokeWidth="1.5" strokeDasharray="4 3" />
            </svg>
            <span style={{ fontSize: 11, color: MUTED }}>Daily avg</span>
          </div>
        </div>
      </div>

      {/* ── Supplement Consistency ── */}
      {stats.consistency.length > 0 && (
        <div style={{ background: BG2, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 18, padding: "18px", marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 18 }}>
            Consistency
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {stats.consistency.map(item => (
              <div key={item.name}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: FG }}>{item.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: FG }}>{item.pct}%</span>
                    <span style={{
                      fontSize: 14, fontWeight: 700, lineHeight: 1,
                      color: item.trend === "up" ? YELLOW : item.trend === "down" ? GREEN : MUTED,
                    }}>
                      {item.trend === "up" ? "↑" : item.trend === "down" ? "↓" : "→"}
                    </span>
                  </div>
                </div>
                {/* Bar */}
                <div style={{ height: 6, background: BG3, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${item.pct}%`, height: "100%", background: GREEN, borderRadius: 3, transition: "width 0.6s ease" }} />
                </div>
                <p style={{ fontSize: 11, color: MUTED, marginTop: 5 }}>{item.days} day{item.days !== 1 ? "s" : ""} logged</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Rhythm Grid (30-day dot calendar) ── */}
      <div style={{ background: BG2, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 18, padding: "18px", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Logging Rhythm · 30 Days
          </p>
          <p style={{ fontSize: 12, color: MUTED }}>
            <span style={{ color: FG, fontWeight: 700 }}>{stats.rhythm.filter(Boolean).length}</span> / 30
          </p>
        </div>
        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5, marginBottom: 6 }}>
          {["M","T","W","T","F","S","S"].map((day, i) => (
            <span key={i} style={{ fontSize: 10, color: MUTED, textAlign: "center", fontWeight: 700, letterSpacing: "0.05em" }}>
              {day}
            </span>
          ))}
        </div>
        {/* Dots */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 }}>
          {stats.rhythm.map((logged, i) => (
            <div key={i} style={{
              aspectRatio: "1",
              borderRadius: "50%",
              background: logged ? GREEN : BG3,
              transition: "background 0.2s",
            }} />
          ))}
        </div>
      </div>

      {/* ── AI Report (unlocks at 15 entries) ── */}
      {entries.length >= 15 && (
        <div style={{ background: BG2, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 18, padding: "18px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              AI Report
            </p>
            <button onClick={() => generateAI(true)} disabled={loadingAI} style={{
              background: "none", border: "none", color: MUTED, fontSize: 12, cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, padding: 0,
            }}>
              {loadingAI ? "Generating…" : "Refresh"}
            </button>
          </div>

          {aiInsight ? (
            <>
              <div style={{ borderLeft: `3px solid ${YELLOW}`, paddingLeft: 14, marginBottom: aiInsight.watch?.length > 0 ? 16 : 0 }}>
                <p style={{ fontSize: 14, color: FG, lineHeight: 1.8 }}>{aiInsight.narrative}</p>
              </div>

              {aiInsight.watch?.length > 0 && (
                <div style={{ paddingTop: 16, borderTop: "1px solid rgba(234,234,234,0.06)" }}>
                  <p style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                    Watch
                  </p>
                  {aiInsight.watch.map((w, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
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
                width: "100%", background: "none",
                border: "1px solid rgba(234,234,234,0.1)",
                borderRadius: 12, padding: "13px 20px", color: FG, fontSize: 14,
                cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
              }}>
                Generate AI report
              </button>
              {aiError && <p style={{ color: GREEN, fontSize: 12, marginTop: 8 }}>{aiError}</p>}
            </>
          )}
        </div>
      )}

      {/* teaser for 5-14 entries */}
      {entries.length >= 5 && entries.length < 15 && (
        <div style={{ background: BG2, border: "1px solid rgba(234,234,234,0.06)", borderRadius: 18, padding: "18px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 13, color: FG, fontWeight: 600 }}>AI Report</p>
            <p style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>{15 - entries.length} more logs to unlock</p>
          </div>
          <div style={{ height: 4, width: 100, background: BG3, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${(entries.length / 15) * 100}%`, height: "100%", background: YELLOW, borderRadius: 2 }} />
          </div>
        </div>
      )}
    </div>
  );
}
