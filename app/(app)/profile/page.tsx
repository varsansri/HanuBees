"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const MUTED  = "#a9a9a7";

interface Profile {
  username: string; display_name: string; bio: string;
  avatar_url: string; created_at: string;
}
interface Post {
  id: string; content: string; post_type: string;
  value_up: number; value_down: number; likes: number; created_at: string;
}
interface JournalEntry {
  id: string; name: string; category: string;
  dose_amount: string; dose_unit: string; notes: string; dose_time: string;
}

const categoryColor: Record<string, string> = {
  supplement: YELLOW, medicine: GREEN, drug: GREEN, other: MUTED,
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [tab, setTab] = useState<"posts"|"journal">("posts");
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [dose, setDose] = useState("");
  const [notes, setNotes] = useState("");
  const [identifying, setIdentifying] = useState(false);
  const [logging, setLogging] = useState(false);
  const [identified, setIdentified] = useState<{ name: string; category: string }|null>(null);
  const [logError, setLogError] = useState("");
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const [{ data: p }, { data: ps }, { data: j }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("posts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("journal_entries").select("*").eq("user_id", user.id).order("dose_time", { ascending: false }).limit(50),
    ]);
    setProfile(p); setPosts(ps || []); setEntries(j || []); setLoading(false);
  };

  const identify = async () => {
    if (!input.trim()) return;
    setIdentifying(true);
    try {
      const res = await fetch("/api/identify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      setIdentified(await res.json());
    } catch { setIdentified({ name: input, category: "supplement" }); }
    setIdentifying(false);
  };

  const logEntry = async () => {
    if (!identified) return;
    setLogging(true); setLogError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [amount, ...unitParts] = dose.split(" ");
    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id, name: identified.name, category: identified.category,
      raw_input: input, dose_amount: amount || dose,
      dose_unit: unitParts.join(" ") || "dose", notes,
      dose_time: new Date().toISOString(),
    });
    if (error) { setLogError(error.message); setLogging(false); return; }
    setInput(""); setDose(""); setNotes(""); setIdentified(null);
    const { data } = await supabase.from("journal_entries").select("*")
      .eq("user_id", user.id).order("dose_time", { ascending: false }).limit(50);
    setEntries(data || []);
    setLogging(false);
  };

  const signOut = async () => { await supabase.auth.signOut(); router.push("/login"); };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
      <p style={{ color: MUTED }}>Loading…</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>

      {/* Header — yellow top */}
      <div className="page-header" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px",
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: YELLOW, fontFamily: "'Space Grotesk', sans-serif" }}>
          Profile
        </h2>
        <button onClick={signOut} style={{
          background: "none", border: "1px solid var(--border)", color: MUTED,
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13,
          padding: "7px 16px", borderRadius: 10, cursor: "pointer",
        }}>Sign out</button>
      </div>

      <div style={{ padding: "16px" }}>

        {/* Profile card */}
        <div style={{
          background: "var(--bg2)", border: "1px solid var(--border)",
          borderRadius: 20, padding: "24px 20px", marginBottom: 16, textAlign: "center",
        }}>
          <div style={{
            width: 68, height: 68, borderRadius: "50%", background: "var(--bg3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, color: YELLOW, fontWeight: 700, margin: "0 auto 12px",
            border: `2px solid rgba(255,190,0,0.25)`,
          }}>
            {profile?.display_name?.[0]?.toUpperCase() || "?"}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--fg)" }}>
            {profile?.display_name}
          </h3>
          <p style={{ color: MUTED, fontSize: 13, marginTop: 3 }}>@{profile?.username}</p>

          <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 20 }}>
            {[["Posts", posts.length], ["Journal", entries.length]].map(([label, value]) => (
              <div key={label as string} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: YELLOW,
                  fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 3,
                  fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs — yellow active */}
        <div style={{
          display: "flex", gap: 8, marginBottom: 16,
          background: "var(--bg2)", borderRadius: 14, padding: 4,
          border: "1px solid var(--border)",
        }}>
          {(["posts", "journal"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer",
              background: tab === t ? YELLOW : "transparent",
              color: tab === t ? "#121212" : MUTED,
              fontWeight: 700, fontSize: 14, textTransform: "capitalize",
              fontFamily: "'Space Grotesk', sans-serif",
              transition: "all 0.2s", letterSpacing: "0.01em",
            }}>
              {t === "posts" ? `Posts (${posts.length})` : `Journal (${entries.length})`}
            </button>
          ))}
        </div>

        {/* Posts tab */}
        {tab === "posts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {posts.length === 0 ? (
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
                borderRadius: 16, padding: 40, textAlign: "center" }}>
                <p style={{ color: MUTED, fontSize: 14 }}>No posts yet.</p>
              </div>
            ) : posts.map(post => (
              <div key={post.id} style={{
                background: "var(--bg2)", border: "1px solid var(--border)",
                borderRadius: 14, padding: "14px 16px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                    color: YELLOW, background: "rgba(255,190,0,0.1)",
                    padding: "3px 8px", borderRadius: 100,
                  }}>{post.post_type}</span>
                  <span style={{ fontSize: 11, color: MUTED, marginLeft: "auto" }}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: "var(--fg)", lineHeight: 1.55 }}>
                  {post.content.length > 120 ? post.content.slice(0, 120) + "…" : post.content}
                </p>
                <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
                  <span style={{ fontSize: 12, color: GREEN }}>▲ {post.value_up - post.value_down}</span>
                  <span style={{ fontSize: 12, color: MUTED }}>♥ {post.likes}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Journal tab */}
        {tab === "journal" && (
          <div>
            <div style={{
              background: "var(--bg2)", border: "1px solid var(--border)",
              borderRadius: 16, padding: 16, marginBottom: 16,
            }}>
              <p style={{ fontSize: 13, color: MUTED, marginBottom: 12, fontWeight: 500 }}>
                Log medicine, supplement or drug
              </p>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input className="input" placeholder="e.g. vitamin D, metformin…"
                  value={input} onChange={e => { setInput(e.target.value); setIdentified(null); }}
                  style={{ flex: 1 }} />
                <button onClick={identify} disabled={!input.trim() || identifying}
                  className="btn-ghost" style={{ whiteSpace: "nowrap", padding: "10px 14px" }}>
                  {identifying ? "…" : "Identify"}
                </button>
              </div>

              {identified && (
                <>
                  <div style={{
                    background: "var(--bg3)", borderRadius: 10, padding: "10px 14px",
                    marginBottom: 10, display: "flex", alignItems: "center", gap: 10,
                    border: `1px solid rgba(152,170,157,0.2)`,
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%",
                      background: categoryColor[identified.category] || MUTED, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 700,
                      color: categoryColor[identified.category] || MUTED,
                      textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {identified.category}
                    </span>
                    <span style={{ fontSize: 14, color: "var(--fg)" }}>{identified.name}</span>
                  </div>
                  <input className="input" placeholder="Dose (e.g. 500mg)"
                    value={dose} onChange={e => setDose(e.target.value)} style={{ marginBottom: 10 }} />
                  <textarea className="input" placeholder="Notes…"
                    value={notes} onChange={e => setNotes(e.target.value)}
                    rows={2} style={{ resize: "none", marginBottom: 10 }} />
                  {logError && <p style={{ color: GREEN, fontSize: 13, marginBottom: 8 }}>{logError}</p>}
                  <button className="btn-primary" onClick={logEntry} disabled={!dose || logging}>
                    {logging ? "Logging…" : "Log Entry"}
                  </button>
                </>
              )}
            </div>

            {entries.length === 0 ? (
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
                borderRadius: 16, padding: 40, textAlign: "center" }}>
                <p style={{ color: MUTED, fontSize: 14 }}>No entries yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {entries.map(entry => (
                  <div key={entry.id} style={{
                    background: "var(--bg2)", border: "1px solid var(--border)",
                    borderRadius: 14, padding: "12px 16px",
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%",
                      background: categoryColor[entry.category] || MUTED, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: "var(--fg)" }}>{entry.name}</span>
                        <span style={{ fontSize: 12, color: MUTED }}>{entry.dose_amount} {entry.dose_unit}</span>
                      </div>
                      {entry.notes && <p style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>{entry.notes}</p>}
                    </div>
                    <span style={{ fontSize: 11, color: MUTED, flexShrink: 0 }}>
                      {new Date(entry.dose_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
