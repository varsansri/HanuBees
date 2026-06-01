"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const MUTED  = "#a9a9a7";
const BG     = "#121212";
const BG2    = "#1a1a1a";
const BG3    = "#242424";
const FG     = "#eaeaea";

// ── Icons ─────────────────────────────────────────────────────────────────────

const Icon = {
  Pill: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M10.5 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v7"/>
      <circle cx="17" cy="17" r="5"/><path d="M14 17h6"/>
    </svg>
  ),
  Flame: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  ),
  Droplet: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  ),
  Moon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  Activity: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Scale: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 3v1m0 16v1M3 12h1m16 0h1M5.6 5.6l.7.7m11.4-.7-.7.7M5.6 18.4l.7-.7m11.4.7-.7-.7"/>
      <circle cx="12" cy="12" r="4"/>
    </svg>
  ),
  Target: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  Plus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Streak: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Close: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface JournalEntry {
  id: string; name: string; category: string;
  dose_amount: string; dose_unit: string; dose_time: string;
}
interface CalorieLog {
  id: string; food_name: string; calories: number; logged_at: string;
}
interface Goal {
  id: string; title: string; type: string;
  target_value: number; unit: string; icon: string; color: string;
}
interface GoalLog {
  id: string; goal_id: string; value: number; logged_at: string;
}

const GOAL_TYPES = [
  { type: "water",    label: "Water",    unit: "ml",  icon: "droplet",  defaultTarget: 2000, IconC: Icon.Droplet  },
  { type: "sleep",    label: "Sleep",    unit: "hrs", icon: "moon",     defaultTarget: 8,    IconC: Icon.Moon     },
  { type: "exercise", label: "Exercise", unit: "min", icon: "activity", defaultTarget: 30,   IconC: Icon.Activity },
  { type: "weight",   label: "Weight",   unit: "kg",  icon: "scale",    defaultTarget: 70,   IconC: Icon.Scale    },
  { type: "custom",   label: "Custom",   unit: "",    icon: "target",   defaultTarget: 1,    IconC: Icon.Target   },
];

function iconForType(type: string) {
  const map: Record<string, React.ReactNode> = {
    pill:     <Icon.Pill />,
    flame:    <Icon.Flame />,
    droplet:  <Icon.Droplet />,
    moon:     <Icon.Moon />,
    activity: <Icon.Activity />,
    scale:    <Icon.Scale />,
    target:   <Icon.Target />,
  };
  return map[type] || <Icon.Target />;
}

// ── Progress bar ───────────────────────────────────────────────────────────────

function ProgressBar({ value, max, color = GREEN }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ width: "100%", height: 6, background: BG3, borderRadius: 3, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.4s ease" }} />
    </div>
  );
}

// ── Log entry bottom sheet ──────────────────────────────────────────────────────

function LogSheet({
  goal, onClose, onLogged,
}: { goal: Goal; onClose: () => void; onLogged: () => void }) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const save = async () => {
    if (!value || isNaN(Number(value))) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("goal_logs").insert({
      goal_id: goal.id, user_id: user.id, value: Number(value),
      logged_at: new Date().toISOString(),
    });
    setSaving(false);
    onLogged();
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: BG2, borderRadius: "22px 22px 0 0", border: "1px solid rgba(234,234,234,0.08)", borderBottom: "none", padding: "12px 20px 48px", animation: "slideUp 0.2s ease" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: BG3, margin: "0 auto 20px" }} />
        <p style={{ fontSize: 16, fontWeight: 700, color: FG, marginBottom: 6 }}>Log {goal.title}</p>
        <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>Target: {goal.target_value} {goal.unit}</p>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
          <input
            type="number" placeholder={`Enter ${goal.unit}`}
            value={value} onChange={e => setValue(e.target.value)}
            autoFocus
            style={{ flex: 1, background: BG3, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 12, padding: "13px 16px", color: FG, fontSize: 16, outline: "none", fontFamily: "'Space Grotesk', sans-serif" }}
          />
          <span style={{ color: MUTED, fontSize: 14, fontWeight: 600 }}>{goal.unit}</span>
        </div>
        <button onClick={save} disabled={saving || !value} style={{ width: "100%", background: GREEN, border: "none", borderRadius: 12, padding: "13px", color: BG, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", opacity: !value ? 0.4 : 1 }}>
          {saving ? "Saving…" : "Log"}
        </button>
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </div>
  );
}

// ── Calorie add sheet ──────────────────────────────────────────────────────────

function CalorieSheet({ onClose, onLogged }: { onClose: () => void; onLogged: () => void }) {
  const [food, setFood]     = useState("");
  const [kcal, setKcal]     = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const save = async () => {
    if (!food.trim() || !kcal) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("calorie_logs").insert({ user_id: user.id, food_name: food.trim(), calories: Number(kcal), logged_at: new Date().toISOString() });
    setSaving(false);
    onLogged();
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: BG2, borderRadius: "22px 22px 0 0", border: "1px solid rgba(234,234,234,0.08)", borderBottom: "none", padding: "12px 20px 48px", animation: "slideUp 0.2s ease" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: BG3, margin: "0 auto 20px" }} />
        <p style={{ fontSize: 16, fontWeight: 700, color: FG, marginBottom: 20 }}>Log Food</p>
        <input placeholder="Food name" value={food} onChange={e => setFood(e.target.value)}
          style={{ width: "100%", background: BG3, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 12, padding: "13px 16px", color: FG, fontSize: 15, outline: "none", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 10, boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
          <input type="number" placeholder="Calories" value={kcal} onChange={e => setKcal(e.target.value)}
            style={{ flex: 1, background: BG3, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 12, padding: "13px 16px", color: FG, fontSize: 15, outline: "none", fontFamily: "'Space Grotesk', sans-serif" }} />
          <span style={{ color: MUTED, fontSize: 14, fontWeight: 600 }}>kcal</span>
        </div>
        <button onClick={save} disabled={saving || !food.trim() || !kcal} style={{ width: "100%", background: YELLOW, border: "none", borderRadius: 12, padding: "13px", color: BG, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", opacity: (!food.trim() || !kcal) ? 0.4 : 1 }}>
          {saving ? "Saving…" : "Add"}
        </button>
      </div>
    </div>
  );
}

// ── Create Goal sheet ──────────────────────────────────────────────────────────

function CreateGoalSheet({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [step, setStep]     = useState<"pick"|"config">("pick");
  const [picked, setPicked] = useState<typeof GOAL_TYPES[0] | null>(null);
  const [title, setTitle]   = useState("");
  const [target, setTarget] = useState("");
  const [unit, setUnit]     = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const pick = (gt: typeof GOAL_TYPES[0]) => {
    setPicked(gt);
    setTitle(gt.label);
    setTarget(String(gt.defaultTarget));
    setUnit(gt.unit);
    setStep("config");
  };

  const save = async () => {
    if (!title.trim() || !target) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("goals").insert({
      user_id: user.id, title: title.trim(), type: picked?.type || "custom",
      target_value: Number(target), unit: unit.trim(),
      icon: picked?.icon || "target", color: GREEN,
    });
    setSaving(false);
    onCreated();
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: BG2, borderRadius: "22px 22px 0 0", border: "1px solid rgba(234,234,234,0.08)", borderBottom: "none", padding: "12px 20px 48px", animation: "slideUp 0.2s ease" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: BG3, margin: "0 auto 20px" }} />

        {step === "pick" && (
          <>
            <p style={{ fontSize: 16, fontWeight: 700, color: FG, marginBottom: 4 }}>What do you want to track?</p>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>Choose a goal type to get started</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {GOAL_TYPES.map(gt => (
                <button key={gt.type} onClick={() => pick(gt)} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  background: BG3, border: "1px solid rgba(234,234,234,0.06)",
                  borderRadius: 14, padding: "14px 16px", cursor: "pointer",
                  textAlign: "left",
                }}>
                  <span style={{ color: GREEN }}><gt.IconC /></span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: FG, fontFamily: "'Space Grotesk', sans-serif" }}>{gt.label}</p>
                    <p style={{ fontSize: 12, color: MUTED, marginTop: 2, fontFamily: "'Space Grotesk', sans-serif" }}>
                      {gt.type === "custom" ? "Define your own metric" : `Default target: ${gt.defaultTarget} ${gt.unit}`}
                    </p>
                  </div>
                  <span style={{ color: MUTED }}><Icon.ChevronRight /></span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === "config" && (
          <>
            <button onClick={() => setStep("pick")} style={{ background: "none", border: "none", color: MUTED, fontSize: 13, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 16, padding: 0 }}>← Back</button>
            <p style={{ fontSize: 16, fontWeight: 700, color: FG, marginBottom: 20 }}>Configure your goal</p>
            <input placeholder="Goal name" value={title} onChange={e => setTitle(e.target.value)}
              style={{ width: "100%", background: BG3, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 12, padding: "13px 16px", color: FG, fontSize: 15, outline: "none", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 10, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <input type="number" placeholder="Daily target" value={target} onChange={e => setTarget(e.target.value)}
                style={{ flex: 2, background: BG3, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 12, padding: "13px 16px", color: FG, fontSize: 15, outline: "none", fontFamily: "'Space Grotesk', sans-serif" }} />
              <input placeholder="Unit" value={unit} onChange={e => setUnit(e.target.value)}
                style={{ flex: 1, background: BG3, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 12, padding: "13px 16px", color: FG, fontSize: 15, outline: "none", fontFamily: "'Space Grotesk', sans-serif" }} />
            </div>
            <button onClick={save} disabled={saving || !title.trim() || !target} style={{ width: "100%", background: GREEN, border: "none", borderRadius: 12, padding: "13px", color: BG, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", opacity: (!title.trim() || !target) ? 0.4 : 1 }}>
              {saving ? "Creating…" : "Create Goal"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function GoalsPage() {
  const [journalEntries, setJournalEntries]   = useState<JournalEntry[]>([]);
  const [todayEntries, setTodayEntries]       = useState<JournalEntry[]>([]);
  const [calorieLogs, setCalorieLogs]         = useState<CalorieLog[]>([]);
  const [calorieGoal, setCalorieGoal]         = useState(2000);
  const [goals, setGoals]                     = useState<Goal[]>([]);
  const [goalLogs, setGoalLogs]               = useState<GoalLog[]>([]);
  const [streak, setStreak]                   = useState(0);
  const [weekCount, setWeekCount]             = useState(0);
  const [topSupplement, setTopSupplement]     = useState("");
  const [logTarget, setLogTarget]             = useState<Goal | null>(null);
  const [showCalSheet, setShowCalSheet]       = useState(false);
  const [showCreateGoal, setShowCreateGoal]   = useState(false);
  const [editCalGoal, setEditCalGoal]         = useState(false);
  const [calGoalInput, setCalGoalInput]       = useState("2000");
  const [loading, setLoading]                 = useState(true);
  const supabase = createClient();
  const router   = useRouter();

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const today     = new Date(); today.setHours(0,0,0,0);
    const todayISO  = today.toISOString();
    const weekAgo   = new Date(Date.now() - 7 * 86400000).toISOString();

    const [
      { data: allEntries },
      { data: todayJ },
      { data: calToday },
      { data: goalsData },
      { data: logsToday },
    ] = await Promise.all([
      supabase.from("journal_entries").select("*").eq("user_id", user.id).order("dose_time", { ascending: false }),
      supabase.from("journal_entries").select("*").eq("user_id", user.id).gte("dose_time", todayISO),
      supabase.from("calorie_logs").select("*").eq("user_id", user.id).gte("logged_at", todayISO),
      supabase.from("goals").select("*").eq("user_id", user.id).order("created_at"),
      supabase.from("goal_logs").select("*").eq("user_id", user.id).gte("logged_at", todayISO),
    ]);

    // Streak
    const days = new Set((allEntries || []).map(e => e.dose_time.slice(0, 10)));
    let s = 0;
    const d = new Date();
    while (days.has(d.toISOString().slice(0, 10))) { s++; d.setDate(d.getDate() - 1); }
    setStreak(s);

    // Week count
    const week = (allEntries || []).filter(e => e.dose_time >= weekAgo);
    setWeekCount(week.length);

    // Top supplement
    const counts: Record<string, number> = {};
    (allEntries || []).filter(e => e.category === "supplement").forEach(e => {
      counts[e.name] = (counts[e.name] || 0) + 1;
    });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    setTopSupplement(top ? top[0] : "—");

    setJournalEntries(allEntries || []);
    setTodayEntries(todayJ || []);
    setCalorieLogs(calToday || []);
    setGoals(goalsData || []);
    setGoalLogs(logsToday || []);
    setLoading(false);
  };

  const reload = () => { setLoading(true); load(); };

  const todayCalories  = calorieLogs.reduce((s, l) => s + l.calories, 0);
  const goalsOnTrack   = goals.filter(g => {
    const logged = goalLogs.filter(l => l.goal_id === g.id).reduce((s, l) => s + l.value, 0);
    return logged >= g.target_value;
  }).length;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
      <p style={{ color: MUTED }}>Loading…</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>

      {/* Header */}
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" }}>
        <Link href="/journal" style={{ color: MUTED, display: "flex", textDecoration: "none", alignItems: "center", gap: 6, fontSize: 14 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Journal
        </Link>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: YELLOW, fontFamily: "'Space Grotesk', sans-serif" }}>Goals & Insights</h2>
        <button onClick={() => setShowCreateGoal(true)} style={{ background: "none", border: "none", color: GREEN, cursor: "pointer", display: "flex", alignItems: "center" }}>
          <Icon.Plus />
        </button>
      </div>

      <div style={{ padding: "16px" }}>

        {/* ── Insight Strip ── */}
        <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
          Insights
        </p>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, marginBottom: 20, scrollbarWidth: "none" }}>
          {[
            { label: "Day Streak",   value: streak,      icon: <Icon.Streak />,   color: YELLOW },
            { label: "This Week",    value: weekCount,   icon: <Icon.Pill />,     color: GREEN  },
            { label: "Goals Today",  value: `${goalsOnTrack}/${goals.length}`, icon: <Icon.Check />, color: GREEN },
          ].map(item => (
            <div key={item.label} style={{
              flexShrink: 0, background: BG2,
              border: "1px solid rgba(234,234,234,0.08)",
              borderRadius: 16, padding: "14px 18px", minWidth: 110,
            }}>
              <span style={{ color: item.color }}>{item.icon}</span>
              <p style={{ fontSize: 24, fontWeight: 800, color: FG, margin: "8px 0 4px", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}>
                {item.value}
              </p>
              <p style={{ fontSize: 11, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {item.label}
              </p>
            </div>
          ))}
          {topSupplement !== "—" && (
            <div style={{ flexShrink: 0, background: BG2, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 16, padding: "14px 18px", minWidth: 130 }}>
              <span style={{ color: YELLOW }}><Icon.Pill /></span>
              <p style={{ fontSize: 15, fontWeight: 800, color: FG, margin: "8px 0 4px", fontFamily: "'Space Grotesk', sans-serif" }}>{topSupplement}</p>
              <p style={{ fontSize: 11, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Top Supplement</p>
            </div>
          )}
        </div>

        {/* Section label */}
        <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
          Default Trackers
        </p>

        {/* ── Supplement Tracker Card ── */}
        <div style={{ background: BG2, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 18, padding: "18px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,190,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: YELLOW }}>
                <Icon.Pill />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: FG }}>Supplements</p>
                <p style={{ fontSize: 12, color: MUTED, marginTop: 1 }}>Today&apos;s log</p>
              </div>
            </div>
            <Link href="/journal" style={{ fontSize: 13, color: GREEN, fontWeight: 600, textDecoration: "none" }}>+ Log</Link>
          </div>

          {todayEntries.filter(e => e.category === "supplement").length === 0 ? (
            <p style={{ fontSize: 14, color: MUTED, textAlign: "center", padding: "16px 0" }}>No supplements logged today</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {todayEntries.filter(e => e.category === "supplement").map(e => (
                <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: BG3, borderRadius: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: FG }}>{e.name}</span>
                  </div>
                  <span style={{ fontSize: 13, color: MUTED }}>{e.dose_amount} {e.dose_unit}</span>
                </div>
              ))}
            </div>
          )}

          {weekCount > 0 && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(234,234,234,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: MUTED }}>Weekly activity</span>
                <span style={{ fontSize: 12, color: FG, fontWeight: 600 }}>{weekCount} logs</span>
              </div>
              <ProgressBar value={weekCount} max={21} />
            </div>
          )}
        </div>

        {/* ── Calories Tracker Card ── */}
        <div style={{ background: BG2, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 18, padding: "18px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(152,170,157,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: GREEN }}>
                <Icon.Flame />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: FG }}>Calories</p>
                {editCalGoal ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <input type="number" value={calGoalInput} onChange={e => setCalGoalInput(e.target.value)}
                      style={{ width: 70, background: BG3, border: "none", borderRadius: 6, padding: "4px 8px", color: FG, fontSize: 12, outline: "none", fontFamily: "'Space Grotesk', sans-serif" }} />
                    <button onClick={() => { setCalorieGoal(Number(calGoalInput)); setEditCalGoal(false); }}
                      style={{ background: GREEN, border: "none", borderRadius: 6, padding: "4px 8px", color: BG, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Save</button>
                  </div>
                ) : (
                  <button onClick={() => setEditCalGoal(true)} style={{ background: "none", border: "none", color: MUTED, fontSize: 12, cursor: "pointer", padding: 0, fontFamily: "'Space Grotesk', sans-serif", marginTop: 2 }}>
                    Goal: {calorieGoal} kcal · edit
                  </button>
                )}
              </div>
            </div>
            <button onClick={() => setShowCalSheet(true)} style={{ fontSize: 13, color: GREEN, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif" }}>+ Add</button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: FG, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}>
              {todayCalories.toLocaleString()}
            </span>
            <span style={{ fontSize: 14, color: MUTED }}>/ {calorieGoal.toLocaleString()} kcal</span>
          </div>
          <ProgressBar value={todayCalories} max={calorieGoal} color={todayCalories > calorieGoal ? YELLOW : GREEN} />

          {calorieLogs.length > 0 && (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
              {calorieLogs.slice(-4).reverse().map(l => (
                <div key={l.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: BG3, borderRadius: 10 }}>
                  <span style={{ fontSize: 14, color: FG, fontWeight: 500 }}>{l.food_name}</span>
                  <span style={{ fontSize: 13, color: MUTED }}>{l.calories} kcal</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Custom Goals ── */}
        {goals.length > 0 && (
          <>
            <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
              My Goals
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {goals.map(goal => {
                const todayLogged = goalLogs.filter(l => l.goal_id === goal.id).reduce((s, l) => s + l.value, 0);
                const done = todayLogged >= goal.target_value;
                return (
                  <div key={goal.id} style={{ background: BG2, border: `1px solid ${done ? "rgba(152,170,157,0.25)" : "rgba(234,234,234,0.08)"}`, borderRadius: 18, padding: "16px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: done ? "rgba(152,170,157,0.15)" : BG3, display: "flex", alignItems: "center", justifyContent: "center", color: done ? GREEN : MUTED }}>
                          {iconForType(goal.icon)}
                        </div>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 700, color: FG }}>{goal.title}</p>
                          <p style={{ fontSize: 12, color: MUTED, marginTop: 1 }}>{todayLogged} / {goal.target_value} {goal.unit}</p>
                        </div>
                      </div>
                      {done ? (
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(152,170,157,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: GREEN }}>
                          <Icon.Check />
                        </div>
                      ) : (
                        <button onClick={() => setLogTarget(goal)} style={{ background: GREEN, border: "none", borderRadius: 10, padding: "7px 14px", color: BG, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif" }}>
                          Log
                        </button>
                      )}
                    </div>
                    <ProgressBar value={todayLogged} max={goal.target_value} />
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Create Goal Card ── */}
        <button onClick={() => setShowCreateGoal(true)} style={{
          width: "100%", background: "none",
          border: "1.5px dashed rgba(234,234,234,0.15)",
          borderRadius: 18, padding: "24px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          cursor: "pointer",
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: BG3, display: "flex", alignItems: "center", justifyContent: "center", color: MUTED }}>
            <Icon.Plus />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}>Create Goal</p>
          <p style={{ fontSize: 13, color: BG3.replace(BG3, "#555553"), fontFamily: "'Space Grotesk', sans-serif" }}>Track anything that matters to you</p>
        </button>
      </div>

      {/* Sheets */}
      {logTarget    && <LogSheet goal={logTarget} onClose={() => setLogTarget(null)} onLogged={reload} />}
      {showCalSheet && <CalorieSheet onClose={() => setShowCalSheet(false)} onLogged={reload} />}
      {showCreateGoal && <CreateGoalSheet onClose={() => setShowCreateGoal(false)} onCreated={reload} />}
    </div>
  );
}
