"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getChats, type ChatEntry } from "@/lib/consumer/store";

const YELLOW = "var(--yellow)", GREEN = "var(--green)", FG = "var(--fg)", MUTED = "var(--fg2)", BG2 = "var(--bg2)", BG3 = "var(--bg3)";

type Agent = { id: string; name: string; slug: string; bee_name: string; category: string | null; city: string | null; bio: string | null };
const CITIES = ["Los Angeles", "Melbourne", "Coimbatore", "Chennai"];

export default function Hub() {
  const [tab, setTab] = useState<"chats" | "explore">("chats");
  const [chats, setChats] = useState<ChatEntry[]>([]);
  const [hanuLast, setHanuLast] = useState<string>("Hi 👋 I'm Hanubees — tap to find any local business.");
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [results, setResults] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const all = getChats();
    const hanu = all.find((c) => c.slug === "hanubees");
    if (hanu?.last) setHanuLast(hanu.last);
    setChats(all.filter((c) => c.slug !== "hanubees"));
  }, []);

  const search = async () => {
    setLoading(true); setSearched(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (city) params.set("city", city);
      params.set("limit", "20");
      const res = await fetch(`/api/agents/search?${params.toString()}`);
      const data = await res.json();
      setResults(data.agents || []);
    } catch { setResults([]); } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", minHeight: "100vh", paddingBottom: 40 }}>
      {/* header + tabs */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 8px" }}>
          <img src="/bee.png" alt="" style={{ width: 28, height: 28 }} />
          <span style={{ fontSize: 19, fontWeight: 800, color: FG }}>Hanubees</span>
        </div>
        <div style={{ display: "flex", gap: 4, padding: "0 12px" }}>
          {(["chats", "explore"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: "10px 0 12px", fontSize: 15, fontWeight: 700, color: tab === t ? FG : MUTED, borderBottom: tab === t ? `2px solid ${YELLOW}` : "2px solid transparent" }}>
              {t === "chats" ? "Chats" : "Explore"}
            </button>
          ))}
        </div>
      </div>

      {/* CHATS */}
      {tab === "chats" && (
        <div style={{ padding: "8px 0" }}>
          {/* Pinned: the Hanubees guide — always here, greets everyone */}
          <Link href="/c/hanubees" style={{ display: "flex", gap: 13, alignItems: "center", padding: "12px 16px", textDecoration: "none", borderBottom: "1px solid var(--border)", background: "rgba(255,190,0,0.06)" }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: BG2, border: `1.5px solid ${YELLOW}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <img src="/bee.png" alt="" style={{ width: 30, height: 30 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: FG }}>Hanubees <span style={{ fontSize: 11, fontWeight: 700, color: "#121212", background: YELLOW, borderRadius: 6, padding: "1px 6px", marginLeft: 4, verticalAlign: "middle" }}>GUIDE</span></div>
              <div style={{ fontSize: 13, color: MUTED, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>{hanuLast}</div>
            </div>
          </Link>

          {chats.length === 0 ? (
            <div style={{ textAlign: "center", padding: "44px 24px", color: MUTED }}>
              <p style={{ fontSize: 14, color: MUTED }}>Your business chats will appear here.</p>
              <button onClick={() => setTab("explore")} style={{ marginTop: 14, background: YELLOW, color: "#121212", border: "none", borderRadius: 12, padding: "11px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Explore businesses</button>
            </div>
          ) : (
            chats.map((c) => (
              <Link key={c.slug} href={`/c/${c.slug}`} style={{ display: "flex", gap: 13, alignItems: "center", padding: "12px 16px", textDecoration: "none", borderBottom: "1px solid var(--border)" }}>
                <div className="avatar" style={{ width: 50, height: 50, fontSize: 20, flexShrink: 0 }}>
                  {c.logo_url ? <img src={c.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : c.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 700, color: FG, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                  <div style={{ fontSize: 13, color: MUTED, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>{c.last || [c.category, c.city].filter(Boolean).join(" · ")}</div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* EXPLORE */}
      {tab === "explore" && (
        <div style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", gap: 8, background: BG3, borderRadius: 14, padding: "6px 6px 6px 14px", border: "1px solid var(--border)" }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") search(); }} placeholder="What do you need? e.g. dog grooming, dentist…" style={{ flex: 1, background: "none", border: "none", outline: "none", color: FG, fontSize: 15, fontFamily: "inherit", padding: "8px 0" }} />
            <button onClick={search} style={{ background: YELLOW, color: "#121212", border: "none", borderRadius: 10, padding: "0 16px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Search</button>
          </div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", marginTop: 10, paddingBottom: 2 }}>
            {CITIES.map((c) => (
              <button key={c} onClick={() => setCity(city === c ? "" : c)} style={{ flexShrink: 0, background: city === c ? YELLOW : BG2, color: city === c ? "#121212" : MUTED, border: "1px solid var(--border)", borderRadius: 16, padding: "6px 13px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{c}</button>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            {loading && <p style={{ color: MUTED, fontSize: 14, textAlign: "center", padding: 30 }}>Searching…</p>}
            {!loading && searched && results.length === 0 && <p style={{ color: MUTED, fontSize: 14, textAlign: "center", padding: 30 }}>No matches. Try a different word or city.</p>}
            {!loading && !searched && <p style={{ color: MUTED, fontSize: 13.5, textAlign: "center", padding: 30 }}>Search by what you need, or pick a city.</p>}
            {results.map((a) => (
              <Link key={a.id} href={`/c/${a.slug}`} style={{ display: "block", textDecoration: "none", background: BG2, border: "1px solid var(--border)", borderRadius: 14, padding: "13px 15px", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="avatar" style={{ width: 44, height: 44, fontSize: 18, flexShrink: 0 }}>{a.name[0].toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: FG, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                    <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>{[a.category, a.city].filter(Boolean).join(" · ")}</div>
                  </div>
                  <span style={{ color: GREEN, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>Chat →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
