"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import posthog from "posthog-js";

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
  const [recording, setRecording] = useState(false);
  const [liveText, setLiveText] = useState("");
  const recognitionRef = useRef<any>(null);
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
    posthog.capture("journal_entry_logged", { category: identified.category });
    (window as any).umami?.track("journal_entry_logged", { category: identified.category });
    setInput(""); setDose(""); setNotes(""); setIdentified(null); setError("");
    await loadEntries();
    setLoading(false);
  };

  const startMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setError("Voice not supported on this browser"); return; }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    let finalTranscript = input;
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) { finalTranscript += (finalTranscript ? " " : "") + t.trim(); setInput(finalTranscript); setIdentified(null); }
        else interim = t;
      }
      setLiveText(interim);
    };
    rec.onerror = () => { setRecording(false); setLiveText(""); };
    rec.onend = () => { if (recognitionRef.current) rec.start(); };
    recognitionRef.current = rec;
    rec.start();
    setRecording(true);
  };

  const stopMic = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setRecording(false);
    setLiveText("");
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
          <div style={{ display: "flex", gap: 8, marginBottom: recording ? 8 : 12 }}>
            <input className="input" placeholder="e.g. vitamin D, metformin, fish oil…"
              value={input} onChange={e => { setInput(e.target.value); setIdentified(null); }}
              style={{ flex: 1 }} />
            <button onClick={recording ? stopMic : startMic} style={{
              background: recording ? "rgba(152,170,157,0.15)" : "rgba(255,190,0,0.1)",
              border: `1px solid ${recording ? GREEN : "rgba(255,190,0,0.3)"}`,
              borderRadius: 10, padding: "10px 12px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, position: "relative",
            }}>
              {recording ? (
                <>
                  <span style={{
                    position: "absolute", inset: 0, borderRadius: 10,
                    border: `2px solid ${GREEN}`, animation: "micPulse 1.2s ease-in-out infinite",
                    opacity: 0.6,
                  }} />
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={GREEN} stroke={GREEN} strokeWidth="1.5" strokeLinecap="round">
                    <rect x="9" y="9" width="6" height="6" rx="1"/>
                  </svg>
                </>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={YELLOW} strokeWidth="1.8" strokeLinecap="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              )}
            </button>
            <button onClick={identify} disabled={!input.trim() || identifying}
              className="btn-ghost" style={{ whiteSpace: "nowrap", padding: "10px 14px" }}>
              {identifying ? "…" : "Identify"}
            </button>
          </div>

          {recording && (
            <div style={{
              background: "rgba(152,170,157,0.08)", border: `1px solid rgba(152,170,157,0.2)`,
              borderRadius: 10, padding: "10px 14px", marginBottom: 12,
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%", background: GREEN,
                flexShrink: 0, marginTop: 4, animation: "micPulse 1s ease-in-out infinite",
                display: "inline-block",
              }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: GREEN, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                  Recording — tap stop when done
                </p>
                <p style={{ fontSize: 14, color: liveText ? "var(--fg)" : MUTED, lineHeight: 1.55, minHeight: 20 }}>
                  {liveText || (input ? "Listening…" : "Say the supplement, medicine or how you feel…")}
                </p>
              </div>
            </div>
          )}
          <style>{`@keyframes micPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.15)} }`}</style>

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
