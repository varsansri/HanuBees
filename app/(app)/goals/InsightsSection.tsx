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
interface JournalEntry { id: string; name: string; category: string; dose_amount: string; dose_unit: string; dose_time: string; }

export default function InsightsSection({ entries }: { entries: JournalEntry[] }) {
  const [period, setPeriod]   = useState<Period>("week");
  const [report, setReport]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const stats = useMemo(() => {
    const now = new Date();
    const daySet = new Set(entries.map(e => e.dose_time.slice(0, 10)));

    let streak = 0;
    const sd = new Date();
    while (daySet.has(sd.toISOString().slice(0, 10))) { streak++; sd.setDate(sd.getDate() - 1); }

    const periodDays  = period === "week" ? 7 : period === "month" ? 30
      : entries.length > 0 ? Math.max(1, Math.ceil((now.getTime() - new Date(entries[entries.length - 1].dose_time).getTime()) / 86400000) + 1) : 1;
    const periodStart = period === "all" ? new Date(0) : new Date(now.getTime() - periodDays * 86400000);
    const filtered    = entries.filter(e => new Date(e.dose_time) >= periodStart);

    const supDays: Record<string, Set<string>> = {};
    filtered.forEach(e => { if (!supDays[e.name]) supDays[e.name] = new Set(); supDays[e.name].add(e.dose_time.slice(0, 10)); });
    const halfStart = new Date(now.getTime() - (periodDays / 2) * 86400000);

    const supplements = Object.entries(supDays).map(([name, days]) => {
      const pct    = Math.min(100, Math.round((days.size / periodDays) * 100));
      const recent = filtered.filter(e => e.name === name && new Date(e.dose_time) >= halfStart).length;
      const older  = filtered.filter(e => e.name === name && new Date(e.dose_time) < halfStart).length;
      const trend: "up"|"flat"|"down" = recent > older * 1.2 ? "up" : recent < older * 0.8 ? "down" : "flat";
      let supStreak = 0;
      const ssd = new Date();
      while (days.has(ssd.toISOString().slice(0, 10))) { supStreak++; ssd.setDate(ssd.getDate() - 1); }
      const spark7 = Array.from({ length: 7 }, (_, i) => {
        const d2 = new Date(now.getTime() - (6 - i) * 86400000).toISOString().slice(0, 10);
        return filtered.filter(e => e.name === name && e.dose_time.startsWith(d2)).length;
      });
      return { name, pct, days: days.size, trend, supStreak, spark7 };
    }).sort((a, b) => b.pct - a.pct).slice(0, 8);

    const dowCounts = [0,0,0,0,0,0,0];
    filtered.forEach(e => { dowCounts[(new Date(e.dose_time).getDay() + 6) % 7]++; });

    // Daily counts last 7 days
    const dailyCounts = Array.from({ length: 7 }, (_, i) => {
      const d2 = new Date(now.getTime() - (6 - i) * 86400000).toISOString().slice(0, 10);
      return filtered.filter(e => e.dose_time.startsWith(d2)).length;
    });

    const hours     = filtered.map(e => new Date(e.dose_time).getHours());
    const morning   = hours.filter(h => h >= 5 && h < 12).length;
    const afternoon = hours.filter(h => h >= 12 && h < 18).length;
    const evening   = hours.filter(h => h >= 18 || h < 5).length;

    const sortedDays = [...daySet].sort();
    let maxGap = 0;
    for (let i = 1; i < sortedDays.length; i++) {
      const g = Math.round((new Date(sortedDays[i]).getTime() - new Date(sortedDays[i-1]).getTime()) / 86400000) - 1;
      maxGap = Math.max(maxGap, g);
    }

    const weeklyVol = Array.from({ length: 8 }, (_, i) => {
      const ws = new Date(now.getTime() - (7 - i) * 7 * 86400000);
      const we = new Date(ws.getTime() + 7 * 86400000);
      return filtered.filter(e => { const t = new Date(e.dose_time); return t >= ws && t < we; }).length;
    });

    return { streak, totalLogs: filtered.length, supplements, dowCounts, dailyCounts, weeklyVol, morning, afternoon, evening, maxGap };
  }, [entries, period]);

  const generate = async () => {
    if (loading || stats.supplements.length === 0) return;
    setLoading(true); setError(""); setReport("");
    try {
      const res = await fetch("/api/insights", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...stats, period }),
      });
      const data = await res.json();
      setReport(data.report || "");
    } catch { setError("Could not generate. Try again."); }
    setLoading(false);
  };

  useEffect(() => {
    if (entries.length >= 5) generate();
  }, [period, entries.length]);

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

  return (
    <div>
      {/* Tabs + refresh */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {(["week","month","all"] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer",
              background: period === p ? FG : BG2, color: period === p ? BG : MUTED,
              fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.15s",
            }}>
              {p === "week" ? "Week" : p === "month" ? "Month" : "All time"}
            </button>
          ))}
        </div>
        <button onClick={generate} disabled={loading} style={{
          background: "none", border: "none", color: loading ? MUTED : GREEN,
          fontSize: 13, cursor: loading ? "default" : "pointer",
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, padding: 0,
        }}>
          {loading ? "Generating…" : "↺ New report"}
        </button>
      </div>

      {/* Report box */}
      <div style={{
        background: BG, border: "1px solid rgba(152,170,157,0.2)",
        borderRadius: 16, padding: "16px",
        overflowX: "auto",
      }}>
        {loading && !report ? (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <p style={{ fontFamily: "monospace", fontSize: 12, color: GREEN, letterSpacing: 2 }}>
              Analyzing journal data…
            </p>
            <p style={{ fontFamily: "monospace", fontSize: 11, color: MUTED, marginTop: 8, letterSpacing: 1 }}>
              ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁
            </p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <p style={{ fontFamily: "monospace", fontSize: 12, color: MUTED }}>{error}</p>
            <button onClick={generate} style={{
              marginTop: 16, background: "none", border: "1px solid rgba(152,170,157,0.3)",
              borderRadius: 8, padding: "8px 18px", color: GREEN, fontSize: 12,
              cursor: "pointer", fontFamily: "monospace",
            }}>retry</button>
          </div>
        ) : report ? (
          <pre style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 11,
            lineHeight: 1.55,
            color: GREEN,
            margin: 0,
            whiteSpace: "pre",
            overflowX: "auto",
          }}>
            {report}
          </pre>
        ) : null}
      </div>
    </div>
  );
}
