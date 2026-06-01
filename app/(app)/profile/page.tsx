"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Profile {
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  created_at: string;
}

interface Post {
  id: string;
  content: string;
  post_type: string;
  value_up: number;
  value_down: number;
  likes: number;
  created_at: string;
}

interface JournalEntry {
  id: string;
  name: string;
  category: string;
  dose_amount: string;
  dose_unit: string;
  notes: string;
  dose_time: string;
}

const typeColors: Record<string, string> = {
  story: "#22c55e", question: "#3b82f6", tip: "var(--amber)", journal_highlight: "#a855f7",
};
const categoryColor: Record<string, string> = {
  supplement: "var(--amber)", medicine: "#3b82f6", drug: "#ef4444", other: "var(--fg3)",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [tab, setTab] = useState<"posts" | "journal">("posts");
  const [loading, setLoading] = useState(true);

  // Journal form state
  const [input, setInput] = useState("");
  const [dose, setDose] = useState("");
  const [notes, setNotes] = useState("");
  const [identifying, setIdentifying] = useState(false);
  const [logging, setLogging] = useState(false);
  const [identified, setIdentified] = useState<{ name: string; category: string } | null>(null);
  const [logError, setLogError] = useState("");

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const [{ data: profile }, { data: posts }, { data: journal }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("posts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("journal_entries").select("*").eq("user_id", user.id).order("dose_time", { ascending: false }).limit(50),
    ]);

    setProfile(profile);
    setPosts(posts || []);
    setEntries(journal || []);
    setLoading(false);
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
    setLogging(true);
    setLogError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [amount, ...unitParts] = dose.split(" ");
    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      name: identified.name,
      category: identified.category,
      raw_input: input,
      dose_amount: amount || dose,
      dose_unit: unitParts.join(" ") || "dose",
      notes,
      dose_time: new Date().toISOString(),
    });

    if (error) { setLogError(error.message); setLogging(false); return; }

    setInput(""); setDose(""); setNotes(""); setIdentified(null);
    const { data } = await supabase.from("journal_entries").select("*")
      .eq("user_id", user.id).order("dose_time", { ascending: false }).limit(50);
    setEntries(data || []);
    setLogging(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
      <p style={{ color: "var(--fg3)" }}>Loading...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px" }}>
      <div style={{ paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 className="font-brand" style={{ fontSize: 22, color: "var(--amber)" }}>Profile</h2>
        <button onClick={signOut} className="btn-ghost" style={{ fontSize: 13, padding: "8px 16px" }}>Sign Out</button>
      </div>

      {/* Profile card */}
      <div className="card" style={{ marginBottom: 16, textAlign: "center", padding: 24 }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", background: "var(--bg3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, color: "var(--amber)", fontWeight: 700, margin: "0 auto 10px",
        }}>
          {profile?.display_name?.[0]?.toUpperCase() || "?"}
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700 }}>{profile?.display_name}</h3>
        <p style={{ color: "var(--fg3)", fontSize: 13, marginTop: 2 }}>@{profile?.username}</p>

        <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 16 }}>
          {[["Posts", posts.length], ["Journal", entries.length]].map(([label, value]) => (
            <div key={label as string} style={{ textAlign: "center" }}>
              <div className="font-brand" style={{ fontSize: 20, color: "var(--amber)" }}>{value}</div>
              <div style={{ fontSize: 11, color: "var(--fg3)", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["posts", "journal"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              flex: 1, padding: "10px", borderRadius: 12, border: "none", cursor: "pointer",
              background: tab === t ? "rgba(245,166,35,0.12)" : "var(--bg2)",
              color: tab === t ? "var(--amber)" : "var(--fg3)",
              fontWeight: 600, fontSize: 14, textTransform: "capitalize",
              borderBottom: tab === t ? "2px solid var(--amber)" : "2px solid transparent",
              transition: "all 0.2s",
            }}>
            {t === "posts" ? `Posts (${posts.length})` : `Journal (${entries.length})`}
          </button>
        ))}
      </div>

      {/* Posts tab */}
      {tab === "posts" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {posts.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 32 }}>
              <p style={{ color: "var(--fg3)", fontSize: 14 }}>No posts yet.</p>
            </div>
          ) : posts.map(post => (
            <div key={post.id} className="card" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{
                  fontSize: 10, fontWeight: 600, textTransform: "uppercase",
                  color: typeColors[post.post_type] || "var(--fg3)",
                  background: "var(--bg3)", padding: "2px 8px", borderRadius: 100,
                }}>{post.post_type}</span>
                <span style={{ fontSize: 11, color: "var(--fg3)", marginLeft: "auto" }}>
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
              <p style={{ fontSize: 14, color: "var(--fg)", lineHeight: 1.5 }}>
                {post.content.length > 120 ? post.content.slice(0, 120) + "..." : post.content}
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                <span style={{ fontSize: 12, color: "var(--fg3)" }}>▲ {post.value_up - post.value_down}</span>
                <span style={{ fontSize: 12, color: "var(--fg3)" }}>♥ {post.likes}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Journal tab */}
      {tab === "journal" && (
        <div>
          {/* Add entry */}
          <div className="card" style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: "var(--fg2)", marginBottom: 10 }}>Log medicine, supplement or drug</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input className="input" placeholder="e.g. vitamin D, metformin, fish oil..."
                value={input} onChange={e => { setInput(e.target.value); setIdentified(null); }}
                style={{ flex: 1 }} />
              <button onClick={identify} disabled={!input.trim() || identifying}
                className="btn-ghost" style={{ whiteSpace: "nowrap", padding: "10px 14px" }}>
                {identifying ? "..." : "Identify"}
              </button>
            </div>

            {identified && (
              <>
                <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "10px 14px",
                  marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: categoryColor[identified.category] }}>
                    {identified.category.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 14 }}>{identified.name}</span>
                </div>
                <input className="input" placeholder="Dose (e.g. 500mg, 2 tablets)"
                  value={dose} onChange={e => setDose(e.target.value)} style={{ marginBottom: 10 }} />
                <textarea className="input" placeholder="How do you feel? Notes..."
                  value={notes} onChange={e => setNotes(e.target.value)}
                  rows={2} style={{ resize: "none", marginBottom: 10 }} />
                {logError && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 8 }}>{logError}</p>}
                <button className="btn-primary" onClick={logEntry} disabled={!dose || logging}>
                  {logging ? "Logging..." : "Log Entry"}
                </button>
              </>
            )}
          </div>

          {/* Entries list */}
          {entries.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 32 }}>
              <p style={{ color: "var(--fg3)", fontSize: 14 }}>No entries yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {entries.map(entry => (
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
      )}
    </div>
  );
}
