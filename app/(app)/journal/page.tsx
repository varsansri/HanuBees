"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface JournalEntry {
  id: string;
  name: string;
  category: string;
  dose_amount: string;
  dose_unit: string;
  notes: string;
  dose_time: string;
}

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

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setInput(""); setDose(""); setNotes(""); setIdentified(null); setError("");
    await loadEntries();
    setLoading(false);
  };

  const categoryColor: Record<string, string> = {
    supplement: "var(--amber)", medicine: "#3b82f6", drug: "#ef4444", other: "var(--fg3)",
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px" }}>
      <div style={{ paddingTop: 8, marginBottom: 20 }}>
        <h2 className="font-brand" style={{ fontSize: 22, color: "var(--amber)" }}>Journal</h2>
        <p style={{ color: "var(--fg3)", fontSize: 13, marginTop: 2 }}>{today}</p>
      </div>

      {/* Add entry */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: "var(--fg2)", marginBottom: 10 }}>
          Log a medicine, supplement, or drug
        </p>
        <div className="flex gap-2 mb-3">
          <input className="input" placeholder="e.g. vitamin D, metformin, fish oil..."
            value={input} onChange={e => { setInput(e.target.value); setIdentified(null); }}
            style={{ flex: 1 }} />
          <button onClick={identify} disabled={!input.trim() || identifying}
            className="btn-ghost" style={{ whiteSpace: "nowrap", padding: "10px 14px" }}>
            {identifying ? "..." : "Identify"}
          </button>
        </div>

        {identified && (
          <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "10px 14px",
            marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: categoryColor[identified.category] }}>
              {identified.category.toUpperCase()}
            </span>
            <span style={{ fontSize: 14, color: "var(--fg)" }}>{identified.name}</span>
          </div>
        )}

        {identified && (
          <>
            <input className="input" placeholder="Dose (e.g. 500mg, 2 tablets)"
              value={dose} onChange={e => setDose(e.target.value)} style={{ marginBottom: 10 }} />
            <textarea className="input" placeholder="How do you feel? Any notes..."
              value={notes} onChange={e => setNotes(e.target.value)}
              rows={2} style={{ resize: "none", marginBottom: 10 }} />
            {error && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 8 }}>{error}</p>}
            <button className="btn-primary" onClick={logEntry}
              disabled={!dose || loading}>
              {loading ? "Logging..." : "Log Entry"}
            </button>
          </>
        )}
      </div>

      {/* Today's entries */}
      <h3 style={{ fontSize: 14, color: "var(--fg3)", marginBottom: 10,
        fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Recent Logs
      </h3>

      {entries.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 32 }}>
          <p style={{ color: "var(--fg3)", fontSize: 14 }}>No entries yet. Start logging above.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <div key={entry.id} className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: categoryColor[entry.category] || "var(--fg3)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{entry.name}</span>
                  <span style={{ fontSize: 12, color: "var(--fg3)" }}>{entry.dose_amount} {entry.dose_unit}</span>
                </div>
                {entry.notes && <p style={{ fontSize: 12, color: "var(--fg3)", marginTop: 2 }}>{entry.notes}</p>}
              </div>
              <span style={{ fontSize: 11, color: "var(--fg3)", flexShrink: 0 }}>
                {new Date(entry.dose_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
