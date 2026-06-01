"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const MUTED  = "#a9a9a7";

interface JournalEntry {
  id: string;
  name: string;
  category: string;
  dose_amount: string;
  dose_unit: string;
  notes: string;
  dose_time: string;
}

const categoryColor: Record<string, string> = {
  supplement: YELLOW, medicine: GREEN, drug: GREEN, other: MUTED,
};

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [input, setInput] = useState("");
  const [dose, setDose] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [identified, setIdentified] = useState<{ name: string; category: string } | null>(null);
  const [error, setError] = useState("");
  const supabase = createClient();

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("dose_time", { ascending: false })
      .limit(50);
    if (data) setEntries(data);
  };

  const identify = async () => {
    if (!input.trim()) return;
    setIdentifying(true);
    try {
      const res = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      setIdentified(data);
    } catch {
      setIdentified({ name: input, category: "supplement" });
    }
    setIdentifying(false);
  };

  const logEntry = async () => {
    if (!identified) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [amount, ...unitParts] = dose.split(" ");
    const { error: insertError } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      name: identified.name,
      category: identified.category,
      raw_input: input,
      dose_amount: amount || dose,
      dose_unit: unitParts.join(" ") || "dose",
      notes,
      dose_time: new Date().toISOString(),
    });
    if (insertError) { setError(insertError.message); setLoading(false); return; }
    setInput(""); setDose(""); setNotes(""); setIdentified(null); setError("");
    await loadEntries();
    setLoading(false);
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>

      {/* Header — yellow top */}
      <div className="page-header" style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: YELLOW, fontFamily: "'Space Grotesk', sans-serif" }}>
              Journal
            </h2>
            <span style={{ color: MUTED, fontSize: 13 }}>{today}</span>
          </div>
          <Link href="/goals" style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(152,170,157,0.12)",
            border: "1px solid rgba(152,170,157,0.25)",
            borderRadius: 10, padding: "7px 14px",
            color: GREEN, textDecoration: "none",
            fontSize: 13, fontWeight: 700,
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
            </svg>
            Goals
          </Link>
        </div>
      </div>

      <div style={{ padding: "16px" }}>

        {/* Add entry card */}
        <div style={{
          background: "var(--bg2)", border: "1px solid var(--border)",
          borderRadius: 16, padding: 16, marginBottom: 20,
        }}>
          <p style={{ fontSize: 13, color: MUTED, marginBottom: 12, fontWeight: 500 }}>
            Log a medicine, supplement, or drug
          </p>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input className="input" placeholder="e.g. vitamin D, metformin, fish oil…"
              value={input} onChange={e => { setInput(e.target.value); setIdentified(null); }}
              style={{ flex: 1 }} />
            <button onClick={identify} disabled={!input.trim() || identifying}
              className="btn-ghost" style={{ whiteSpace: "nowrap", padding: "10px 14px" }}>
              {identifying ? "…" : "Identify"}
            </button>
          </div>

          {identified && (
            <div style={{
              background: "var(--bg3)", borderRadius: 10, padding: "10px 14px",
              marginBottom: 12, display: "flex", alignItems: "center", gap: 10,
              border: `1px solid rgba(152,170,157,0.2)`,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: categoryColor[identified.category] || MUTED,
              }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: categoryColor[identified.category] || MUTED,
                textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {identified.category}
              </span>
              <span style={{ fontSize: 14, color: "var(--fg)" }}>{identified.name}</span>
            </div>
          )}

          {identified && (
            <>
              <input className="input" placeholder="Dose (e.g. 500mg, 2 tablets)"
                value={dose} onChange={e => setDose(e.target.value)}
                style={{ marginBottom: 10 }} />
              <textarea className="input" placeholder="How do you feel? Any notes…"
                value={notes} onChange={e => setNotes(e.target.value)}
                rows={2} style={{ resize: "none", marginBottom: 10 }} />
              {error && <p style={{ color: GREEN, fontSize: 13, marginBottom: 8 }}>{error}</p>}
              <button className="btn-primary" onClick={logEntry} disabled={!dose || loading}>
                {loading ? "Logging…" : "Log Entry"}
              </button>
            </>
          )}
        </div>

        {/* Section label */}
        <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, marginBottom: 12,
          letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Recent Logs
        </p>

        {entries.length === 0 ? (
          <div style={{
            background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: 16, padding: 40, textAlign: "center",
          }}>
            <p style={{ color: MUTED, fontSize: 14 }}>No entries yet. Start logging above.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {entries.map(entry => (
              <div key={entry.id} style={{
                background: "var(--bg2)", border: "1px solid var(--border)",
                borderRadius: 14, padding: "12px 16px",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                  background: categoryColor[entry.category] || MUTED,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: "var(--fg)" }}>{entry.name}</span>
                    <span style={{ fontSize: 12, color: MUTED }}>{entry.dose_amount} {entry.dose_unit}</span>
                  </div>
                  {entry.notes && (
                    <p style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>{entry.notes}</p>
                  )}
                </div>
                <span style={{ fontSize: 11, color: MUTED, flexShrink: 0 }}>
                  {new Date(entry.dose_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
