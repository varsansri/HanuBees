"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const YELLOW = "var(--yellow)";
const GREEN  = "var(--green)";
const FG     = "var(--fg)";
const MUTED  = "var(--fg2)";
const BG2    = "var(--bg2)";
const BG3    = "var(--bg3)";
const PURPLE = "#b794f6";

const COLORS = [
  { name: "Yellow", hex: "var(--yellow)" },
  { name: "Red",    hex: "#e0574d" },
  { name: "Green",  hex: "var(--green)" },
  { name: "Purple", hex: "#b794f6" },
  { name: "Blue",   hex: "#6aa3f0" },
];
const FOLDERS = ["primary", "general", "spam"] as const;

type Notif = {
  id: string; source: string | null; source_slug: string | null;
  body: string; color: string; folder: string; read: boolean; created_at: string;
};
type Watcher = {
  id: string; label: string; kind: string; color: string;
  params: { query?: string; category?: string; discountAtLeast?: number; priceUnder?: number };
};

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [folder, setFolder] = useState<typeof FOLDERS[number]>("primary");
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [watchers, setWatchers] = useState<Watcher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [anon, setAnon] = useState(false);

  // new-watcher form
  const [label, setLabel] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [discount, setDiscount] = useState("");
  const [priceUnder, setPriceUnder] = useState("");
  const [color, setColor] = useState(COLORS[0].hex);

  const loadNotifs = async (f = folder) => {
    const res = await fetch(`/api/notifications?folder=${f}`);
    if (res.status === 401) { setAnon(true); setLoading(false); return; }
    const data = await res.json();
    setNotifs(data.notifications || []);
    setUnread(data.unread || {});
  };
  const loadWatchers = async () => {
    const res = await fetch("/api/watchers");
    const data = await res.json();
    setWatchers(data.watchers || []);
  };

  // On open: run watchers, then load.
  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetch("/api/notifications/refresh", { method: "POST" });
      await Promise.all([loadNotifs("primary"), loadWatchers()]);
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await fetch("/api/notifications/refresh", { method: "POST" });
    await loadNotifs();
    setRefreshing(false);
  };

  const switchFolder = async (f: typeof FOLDERS[number]) => {
    setFolder(f);
    await loadNotifs(f);
  };

  const markRead = async (n: Notif) => {
    if (n.read) return;
    setNotifs((p) => p.map((x) => x.id === n.id ? { ...x, read: true } : x));
    await fetch("/api/notifications", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: n.id, read: true }),
    });
  };

  const createWatcher = async () => {
    if (!label.trim()) return;
    const res = await fetch("/api/watchers", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, query, category, discountAtLeast: discount, priceUnder, color }),
    });
    if (res.ok) {
      setLabel(""); setQuery(""); setCategory(""); setDiscount(""); setPriceUnder("");
      setShowForm(false);
      await loadWatchers();
      await refresh(); // immediately surface matches
    }
  };

  const deleteWatcher = async (id: string) => {
    setWatchers((p) => p.filter((w) => w.id !== id));
    await fetch(`/api/watchers?id=${id}`, { method: "DELETE" });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    border: "1px solid var(--border)", background: BG3, color: FG,
    fontSize: 14, fontFamily: "inherit", outline: "none",
  };

  if (anon) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: FG }}>Alerts</p>
        <p style={{ fontSize: 14, color: MUTED, margin: "8px 0 18px", maxWidth: 320 }}>
          Sign in to save alerts — e.g. get notified when a business posts a 20%+ offer near you.
        </p>
        <Link href="/claim" style={{ background: YELLOW, color: "#121212", borderRadius: 10, padding: "11px 20px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Header */}
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
        <span style={{ fontWeight: 700, fontSize: 17, color: FG }}>Alerts</span>
        <button onClick={refresh} disabled={refreshing} style={{
          background: "none", border: "none", color: YELLOW, fontSize: 13, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit",
        }}>{refreshing ? "Checking…" : "Refresh"}</button>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "8px 12px 110px" }}>
        {/* Watchers strip */}
        <div style={{ background: BG2, borderRadius: 16, padding: 14, marginBottom: 16, border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: watchers.length || showForm ? 10 : 0 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: FG }}>What I'm watching</span>
            <button onClick={() => setShowForm((s) => !s)} style={{
              background: showForm ? "transparent" : YELLOW, color: showForm ? MUTED : "#121212",
              border: showForm ? "1px solid var(--border)" : "none",
              borderRadius: 9, padding: "6px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}>{showForm ? "Cancel" : "+ New watcher"}</button>
          </div>

          {/* Active watchers */}
          {watchers.map((w) => (
            <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: "1px solid var(--border)" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: w.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13.5, color: FG, margin: 0 }}>{w.label}</p>
                <p style={{ fontSize: 11.5, color: MUTED, margin: "2px 0 0" }}>
                  {[
                    w.params.query && `“${w.params.query}”`,
                    w.params.category,
                    w.params.discountAtLeast != null && `≥${w.params.discountAtLeast}% off`,
                    w.params.priceUnder != null && `under ₹${w.params.priceUnder}`,
                  ].filter(Boolean).join(" · ") || "any new offer"}
                </p>
              </div>
              <button onClick={() => deleteWatcher(w.id)} aria-label="Delete" style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
          ))}

          {/* New watcher form */}
          {showForm && (
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 10, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
              <input style={inputStyle} placeholder="Name this alert (e.g. Big wedding offers)" value={label} onChange={(e) => setLabel(e.target.value)} />
              <input style={inputStyle} placeholder="Keyword (optional, e.g. wedding)" value={query} onChange={(e) => setQuery(e.target.value)} />
              <input style={inputStyle} placeholder="Category (optional, e.g. Photography)" value={category} onChange={(e) => setCategory(e.target.value)} />
              <div style={{ display: "flex", gap: 9 }}>
                <input style={inputStyle} type="number" placeholder="Min discount %" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                <input style={inputStyle} type="number" placeholder="Price under ₹" value={priceUnder} onChange={(e) => setPriceUnder(e.target.value)} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12.5, color: MUTED }}>Color:</span>
                {COLORS.map((c) => (
                  <button key={c.hex} onClick={() => setColor(c.hex)} aria-label={c.name} style={{
                    width: 22, height: 22, borderRadius: "50%", background: c.hex, cursor: "pointer",
                    border: color === c.hex ? "2px solid #fff" : "2px solid transparent",
                  }} />
                ))}
              </div>
              <button onClick={createWatcher} disabled={!label.trim()} style={{
                background: label.trim() ? YELLOW : "var(--fg3)", color: "#121212", border: "none",
                borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 700,
                cursor: label.trim() ? "pointer" : "default", fontFamily: "inherit", marginTop: 2,
              }}>Create watcher</button>
            </div>
          )}
        </div>

        {/* Folder tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {FOLDERS.map((f) => (
            <button key={f} onClick={() => switchFolder(f)} style={{
              flex: 1, padding: "9px 0", borderRadius: 10, fontFamily: "inherit", cursor: "pointer",
              border: "1px solid var(--border)", fontSize: 13, fontWeight: 600,
              textTransform: "capitalize",
              background: folder === f ? BG3 : "transparent",
              color: folder === f ? FG : MUTED,
            }}>
              {f}{unread[f] ? ` (${unread[f]})` : ""}
            </button>
          ))}
        </div>

        {/* Notifications */}
        {loading ? (
          <p style={{ color: MUTED, textAlign: "center", marginTop: 30 }}>Loading…</p>
        ) : notifs.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 50, color: MUTED }}>
            <p style={{ fontSize: 15, color: FG, fontWeight: 600 }}>Nothing here yet</p>
            <p style={{ fontSize: 13.5, marginTop: 6 }}>Add a watcher above — matching offers from businesses will appear here.</p>
          </div>
        ) : (
          notifs.map((n) => (
            <div key={n.id} onClick={() => markRead(n)} style={{
              display: "flex", gap: 11, padding: "12px 6px", cursor: "pointer",
              borderBottom: "1px solid var(--border)", opacity: n.read ? 0.6 : 1,
            }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: n.color, flexShrink: 0, marginTop: 5 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, color: FG, margin: 0, lineHeight: 1.45, fontWeight: n.read ? 400 : 500 }}>{n.body}</p>
                <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                  {n.source_slug && (
                    <Link href={`/${n.source_slug}`} onClick={(e) => e.stopPropagation()} style={{ fontSize: 12.5, color: PURPLE, fontWeight: 600, textDecoration: "none" }}>
                      {n.source}
                    </Link>
                  )}
                  <span style={{ fontSize: 11.5, color: MUTED }}>{timeAgo(n.created_at)} ago</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
