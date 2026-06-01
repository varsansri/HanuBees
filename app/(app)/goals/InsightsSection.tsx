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

const BLOCKS = "▁▂▃▄▅▆▇█";
function toSparkValues(vals: number[]): number[] { return vals; }
function toSpark(vals: number[]): string {
  const max = Math.max(...vals, 1);
  return vals.map(v => v === 0 ? "░" : BLOCKS[Math.min(7, Math.floor((v / max) * 8))]).join("");
}

// Smart line renderer — detects content type and styles accordingly
function ReportLine({ line }: { line: string }) {
  if (!line.trim()) return <div style={{ height: 10 }} />;

  if (/^━+$/.test(line.trim()))
    return <div style={{ height: 1, background: "rgba(234,234,234,0.08)", margin: "6px 0" }} />;

  const hasBar   = line.includes("▓") || line.includes("░");
  const hasSpark = /[▁▂▃▄▅▆▇█]/.test(line);

  if (hasBar || hasSpark)
    return <p style={{ fontFamily: "monospace", fontSize: 13, color: GREEN, letterSpacing: 1, lineHeight: 1.9, margin: 0 }}>{line}</p>;

  const isAllCaps = line.trim().length > 2 && line.trim() === line.trim().toUpperCase() && /[A-Z·]/.test(line);
  if (isAllCaps && !line.trim().startsWith("·"))
    return <p style={{ fontSize: 11, fontWeight: 700, color: YELLOW, letterSpacing: "0.1em", textTransform: "uppercase", margin: "6px 0 2px" }}>{line}</p>;

  if (line.trim().startsWith("·"))
    return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, margin: "3px 0" }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: YELLOW, flexShrink: 0, marginTop: 7 }} />
        <p style={{ fontSize: 13, color: FG, lineHeight: 1.65, margin: 0 }}>{line.replace(/^·\s*/, "")}</p>
      </div>
    );

  // Contains a number like "84/100" or "14 days" → highlight numbers
  return <p style={{ fontSize: 14, color: FG, lineHeight: 1.75, margin: 0 }}>{line}</p>;
}

export default function InsightsSection({ entries }: { entries: JournalEntry[] }) {
  const [period, setPeriod]     = useState<Period>("month");
  const [report, setReport]     = useState<string>("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [generated, setGenerated] = useState(false);

  const stats = useMemo(() => {
    const now = new Date();
    const daySet  = new Set(entries.map(e => e.dose_time.slice(0, 10)));
    const dayCount: Record<string, number> = {};
    entries.forEach(e => { const k = e.dose_time.slice(0, 10); dayCount[k] = (dayCount[k] || 0) + 1; });

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

    const periodDays  = period === "week" ? 7 : period === "month" ? 30
      : entries.length > 0 ? Math.max(1, Math.ceil((now.getTime() - new Date(entries[entries.length - 1].dose_time).getTime()) / 86400000) + 1) : 1;
    const periodStart = period === "all" ? new Date(0) : new Date(now.getTime() - periodDays * 86400000);
    const filtered    = entries.filter(e => new Date(e.dose_time) >= periodStart);

    const prevStart = new Date(periodStart.getTime() - periodDays * 86400000);
    const prev      = entries.filter(e => new Date(e.dose_time) >= prevStart && new Date(e.dose_time) < periodStart);
    const prevSupDays: Record<string, Set<string>> = {};
    prev.forEach(e => { if (!prevSupDays[e.name]) prevSupDays[e.name] = new Set(); prevSupDays[e.name].add(e.dose_time.slice(0, 10)); });

    const supDays: Record<string, Set<string>> = {};
    filtered.forEach(e => { if (!supDays[e.name]) supDays[e.name] = new Set(); supDays[e.name].add(e.dose_time.slice(0, 10)); });
    const halfStart = new Date(now.getTime() - (periodDays / 2) * 86400000);

    const supplements = Object.entries(supDays).map(([name, days]) => {
      const pct    = Math.min(100, Math.round((days.size / periodDays) * 100));
      const prev2  = prevSupDays[name] ? Math.min(100, Math.round((prevSupDays[name].size / periodDays) * 100)) : null;
      const recent = filtered.filter(e => e.name === name && new Date(e.dose_time) >= halfStart).length;
      const older  = filtered.filter(e => e.name === name && new Date(e.dose_time) < halfStart).length;
      const trend: "up"|"flat"|"down" = recent > older * 1.2 ? "up" : recent < older * 0.8 ? "down" : "flat";
      let supStreak = 0;
      const ssd = new Date();
      while (days.has(ssd.toISOString().slice(0, 10))) { supStreak++; ssd.setDate(ssd.getDate() - 1); }
      const sparkValues = Array.from({ length: 14 }, (_, i) => {
        const d2 = new Date(now.getTime() - (13 - i) * 86400000).toISOString().slice(0, 10);
        return filtered.filter(e => e.name === name && e.dose_time.startsWith(d2)).length;
      });
      return { name, pct, days: days.size, trend, supStreak, prevPct: prev2, sparkValues };
    }).sort((a, b) => b.pct - a.pct).slice(0, 8);

    const avgConsist  = supplements.length ? supplements.reduce((s, c) => s + c.pct, 0) / supplements.length : 0;
    const daysLogged  = new Set(filtered.map(e => e.dose_time.slice(0, 10))).size;
    const healthScore = Math.round(
      Math.min(streak / 30, 1) * 25 + (avgConsist / 100) * 40 +
      Math.min(Object.keys(supDays).length / 5, 1) * 15 +
      (daysLogged / Math.max(periodDays, 1)) * 20
    );

    const dowCounts = [0,0,0,0,0,0,0];
    filtered.forEach(e => { dowCounts[(new Date(e.dose_time).getDay() + 6) % 7]++; });

    const weeklyVol = Array.from({ length: 8 }, (_, i) => {
      const ws = new Date(now.getTime() - (7 - i) * 7 * 86400000);
      const we = new Date(ws.getTime() + 7 * 86400000);
      return filtered.filter(e => { const t = new Date(e.dose_time); return t >= ws && t < we; }).length;
    });

    const hours     = filtered.map(e => new Date(e.dose_time).getHours());
    const morning   = hours.filter(h => h >= 5  && h < 12).length;
    const afternoon = hours.filter(h => h >= 12 && h < 18).length;
    const evening   = hours.filter(h => h >= 18 || h < 5).length;

    const sortedDays = [...daySet].sort();
    let maxGap = 0;
    for (let i = 1; i < sortedDays.length; i++) {
      const g = Math.round((new Date(sortedDays[i]).getTime() - new Date(sortedDays[i-1]).getTime()) / 86400000) - 1;
      maxGap = Math.max(maxGap, g);
    }

    return { streak, maxStreak, healthScore, totalLogs: filtered.length,
      supplementCount: Object.keys(supDays).length, supplements, daysLogged, periodDays,
      dowCounts, weeklyVol, morning, afternoon, evening, maxGap };
  }, [entries, period]);

  const generate = async () => {
    if (loading) return;
    setLoading(true); setError(""); setReport("");
    try {
      const res = await fetch("/api/insights", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...stats, period }),
      });
      const data = await res.json();
      setReport(data.report || "");
      setGenerated(true);
    } catch { setError("Could not generate. Try again."); }
    setLoading(false);
  };

  // Auto-generate on mount and period change
  useEffect(() => {
    if (entries.length >= 5) { setGenerated(false); generate(); }
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

      {/* Period tabs + regenerate */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {(["week","month","all"] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer",
              background: period === p ? FG : BG2, color: period === p ? BG : MUTED,
              fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.15s",
            }}>
              {p === "week" ? "Week" : p === "month" ? "Month" : "All time"}
            </button>
          ))}
        </div>
        <button onClick={generate} disabled={loading} style={{
          background: "none", border: "none", color: MUTED, fontSize: 12,
          cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, padding: 0,
        }}>
          {loading ? "Generating…" : "↺ New report"}
        </button>
      </div>

      {/* Report card */}
      <div style={{ background: BG2, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 18, padding: "20px" }}>
        {loading && !report ? (
          <div style={{ padding: "32px 0", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: MUTED }}>Analyzing your journal…</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 12 }}>{error}</p>
            <button onClick={generate} style={{
              background: "none", border: "1px solid rgba(234,234,234,0.12)", borderRadius: 10,
              padding: "10px 20px", color: FG, fontSize: 13, cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
            }}>Try again</button>
          </div>
        ) : (
          <div>
            {report.split("\n").map((line, i) => (
              <ReportLine key={i} line={line} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
