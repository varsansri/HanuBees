"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const FG     = "#eaeaea";
const MUTED  = "#a9a9a7";
const BG2    = "#1a1a1a";
const BG3    = "#242424";

type Account = {
  id: string; name: string; slug: string; bee_name: string; category: string | null; city: string | null;
  bio: string | null; logo_url: string | null; phone: string | null; email: string | null;
  website: string | null; instagram: string | null; rating: number; review_count: number; follower_count: number;
};
type Entry = { id: string; content: string; tag: string | null; visibility: string };

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [acc, setAcc] = useState<Account | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [tab, setTab] = useState<"public" | "private">("public");
  const [section, setSection] = useState<"live" | "context">("live");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Account>>({});
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const [liveType, setLiveType] = useState<"pricing" | "hours" | "services" | "contact" | "policy">("pricing");
  const [menuOpen, setMenuOpen] = useState(false);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { data: account } = await supabase.from("accounts").select("*").eq("user_id", user.id).maybeSingle();
    if (!account) { router.push("/onboarding"); return; }
    setAcc(account as Account);
    setForm(account);
    const { data: es } = await supabase.from("data_entries").select("id, content, tag, visibility").eq("account_id", account.id).order("created_at", { ascending: false });
    setEntries((es ?? []) as Entry[]);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const saveProfile = async () => {
    if (!acc) return;
    const patch = {
      bio: form.bio ?? null, phone: form.phone ?? null, email: form.email ?? null,
      website: form.website ?? null, instagram: form.instagram ?? null,
      city: form.city ?? null, category: form.category ?? null, logo_url: form.logo_url ?? null,
    };
    await supabase.from("accounts").update(patch).eq("id", acc.id);
    setAcc({ ...acc, ...patch } as Account);
    setEditing(false);
  };

  const toggleVis = async (e: Entry) => {
    const v = e.visibility === "public" ? "private" : "public";
    setEntries((prev) => prev.map((x) => x.id === e.id ? { ...x, visibility: v } : x));
    await supabase.from("data_entries").update({ visibility: v }).eq("id", e.id);
  };
  const remove = async (e: Entry) => {
    setEntries((prev) => prev.filter((x) => x.id !== e.id));
    await supabase.from("data_entries").delete().eq("id", e.id);
  };
  const addEntry = async () => {
    if (!acc || !newText.trim()) return;
    const isLive = section === "live";
    const row = {
      account_id: acc.id,
      content: newText.trim(),
      visibility: "public",
      source: "manual",
      tag: isLive ? liveType : "other",
      is_live_fact: isLive,
      info_type: isLive ? liveType : null,
      effective_date: isLive ? new Date().toISOString().split('T')[0] : null,
    };
    const { data } = await supabase.from("data_entries").insert(row).select("id, content, tag, visibility").maybeSingle();
    if (data) setEntries((prev) => [data as Entry, ...prev]);
    setNewText(""); setAdding(false);
    fetch("/api/embed", { method: "POST" }).catch(() => {});
  };
  const logout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  if (loading || !acc) return <div style={{ minHeight: "100vh" }} />;

  const shown = entries.filter((e) => e.visibility === tab);

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="page-header" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", padding: "12px 16px" }}>
        <span />
        <span style={{ fontWeight: 700, fontSize: 17, color: FG }}>Profile</span>
        <button onClick={() => setMenuOpen((o) => !o)} aria-label="Menu" style={{ justifySelf: "end", background: "none", border: "none", color: FG, cursor: "pointer", display: "flex" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        </button>
      </div>

      {menuOpen && (
        <div style={{ position: "fixed", top: 54, right: 12, zIndex: 80, background: BG2, border: "1px solid rgba(234,234,234,0.1)", borderRadius: 12, overflow: "hidden", minWidth: 180 }}>
          <Link href={`/${acc.slug}`} style={menuItem}>View public page</Link>
          <button onClick={() => { setEditing(true); setMenuOpen(false); }} style={{ ...menuItem, width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Edit profile</button>
          <button onClick={logout} style={{ ...menuItem, width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", color: GREEN, fontFamily: "inherit" }}>Log out</button>
        </div>
      )}

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 14px 110px" }}>
        {/* Identity card */}
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
          <div className="avatar" style={{ width: 64, height: 64, fontSize: 26 }}>
            {acc.logo_url ? <img src={acc.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : acc.name[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: FG, margin: 0 }}>{acc.name}</h1>
            <p style={{ fontSize: 12, color: GREEN, fontWeight: 600, margin: "2px 0 0" }}>@{acc.bee_name}.bee</p>
            <p style={{ fontSize: 13, color: MUTED, margin: "3px 0 0" }}>{[acc.category, acc.city].filter(Boolean).join(" · ") || "Set your category"}</p>
          </div>
        </div>

        {/* Trust row */}
        <div style={{ display: "flex", gap: 18, marginBottom: 14 }}>
          <Trust value={acc.rating ? acc.rating.toFixed(1) : "—"} label="Rating" />
          <Trust value={acc.review_count} label="Reviews" />
          <Trust value={acc.follower_count} label="Followers" />
        </div>

        <Link href={`/${acc.slug}`} className="btn-outline" style={{ display: "block", textAlign: "center", textDecoration: "none", marginBottom: 8 }}>
          Chat with your AI — hanubees.com/{acc.bee_name}.bee
        </Link>

        {acc.bio && <p style={{ fontSize: 14, color: FG, lineHeight: 1.5, margin: "12px 2px" }}>{acc.bio}</p>}

        {/* What the platform shows */}
        <div style={{ background: BG2, borderRadius: 14, padding: 14, margin: "12px 0 20px", border: "1px solid rgba(234,234,234,0.06)" }}>
          <p style={{ fontSize: 12.5, color: MUTED, margin: 0, lineHeight: 1.5 }}>
            Your agent answers customers using your <b style={{ color: GREEN }}>public</b> info. <b style={{ color: YELLOW }}>Private</b> info is used for context but never shown to customers.
          </p>
        </div>

        {/* Business Info vs Content tabs */}
        <div style={{ display: "flex", marginBottom: 14, borderBottom: "1px solid rgba(234,234,234,0.08)" }}>
          {(["live", "context"] as const).map((s) => (
            <button key={s} onClick={() => setSection(s)} className={section === s ? "tab tab-active" : "tab"} style={{ textTransform: "capitalize" }}>
              {s === "live" ? "Business Info" : "Content"}
            </button>
          ))}
        </div>

        {/* Conditional: LIVE FACTS or RICH CONTEXT */}
        {section === "live" ? (
          <>
            {/* LIVE FACTS UI — structured entry */}
            <div style={{ marginBottom: 20, background: BG2, border: "1px solid rgba(152,170,157,0.2)", borderRadius: 14, padding: 14 }}>
              <p style={{ fontSize: 12.5, color: MUTED, margin: 0, lineHeight: 1.5 }}>
                <b>Business Info</b> — pricing, hours, services, contact, policy. These are always current and used first when customers ask questions.
              </p>
            </div>

            {adding ? (
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Type</label>
                <select value={liveType} onChange={(e) => setLiveType(e.target.value as any)} style={{ ...inputStyle, marginBottom: 12 }}>
                  <option value="pricing">Pricing</option>
                  <option value="hours">Hours</option>
                  <option value="services">Services</option>
                  <option value="contact">Contact</option>
                  <option value="policy">Policy</option>
                </select>
                <label style={labelStyle}>Details</label>
                <textarea value={newText} onChange={(e) => setNewText(e.target.value)} placeholder={`Add ${liveType}…`} autoFocus
                  style={{ width: "100%", minHeight: 80, background: BG3, color: FG, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 12, padding: 12, fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical" }} />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button className="btn-primary" style={{ width: "auto", padding: "9px 18px" }} onClick={() => addEntry()}>Save</button>
                  <button className="btn-ghost" onClick={() => { setAdding(false); setNewText(""); }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button className="btn-ghost" style={{ marginBottom: 14 }} onClick={() => setAdding(true)}>+ Add business info</button>
            )}

            {/* Display LIVE FACTS by type */}
            {["pricing", "hours", "services", "contact", "policy"].map((type) => {
              const items = entries.filter((e) => e.tag === type);
              return (
                <div key={type} style={{ marginBottom: 18 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: FG, margin: "0 0 10px", textTransform: "capitalize" }}>{type}</h3>
                  {items.length === 0 ? (
                    <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>Not set</p>
                  ) : (
                    items.map((e) => (
                      <div key={e.id} style={{ background: BG3, border: "1px solid rgba(234,234,234,0.07)", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
                        <p style={{ fontSize: 13.5, color: FG, margin: 0, lineHeight: 1.4 }}>{e.content}</p>
                        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                          <button onClick={() => remove(e)} style={{ ...linkBtn, fontSize: 12 }}>Delete</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </>
        ) : (
          <>
            {/* RICH CONTEXT UI */}
            {adding ? (
              <div style={{ marginBottom: 14 }}>
                <textarea value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Add content (about, portfolio, faq, offers)…" autoFocus
                  style={{ width: "100%", minHeight: 70, background: BG3, color: FG, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 12, padding: 12, fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical" }} />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button className="btn-primary" style={{ width: "auto", padding: "9px 18px" }} onClick={addEntry}>Save</button>
                  <button className="btn-ghost" onClick={() => { setAdding(false); setNewText(""); }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button className="btn-ghost" style={{ marginBottom: 14 }} onClick={() => setAdding(true)}>+ Add content</button>
            )}

            {entries.length === 0 ? (
              <p style={{ color: MUTED, fontSize: 13.5, textAlign: "center", padding: "20px 0" }}>No content yet.</p>
            ) : (
              entries.map((e) => (
                <div key={e.id} style={{ background: BG2, border: "1px solid rgba(234,234,234,0.07)", borderRadius: 12, padding: "12px 14px", marginBottom: 9 }}>
                  <p style={{ fontSize: 14, color: FG, margin: 0, lineHeight: 1.45 }}>{e.content}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 9 }}>
                    {e.tag && <span style={{ fontSize: 11, color: GREEN, background: "rgba(152,170,157,0.12)", padding: "2px 8px", borderRadius: 6 }}>{e.tag}</span>}
                    <button onClick={() => remove(e)} style={{ ...linkBtn, color: MUTED }}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Edit profile sheet */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end" }} onClick={() => setEditing(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#121212", borderTopLeftRadius: 20, borderTopRightRadius: 20, width: "100%", maxWidth: 720, margin: "0 auto", padding: 20, maxHeight: "85vh", overflowY: "auto", borderTop: "1px solid rgba(255,190,0,0.2)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: FG, marginTop: 0 }}>Edit profile</h2>
            {([["bio", "Bio"], ["city", "City"], ["category", "Category"], ["logo_url", "Logo image URL"], ["phone", "Phone"], ["email", "Email"], ["website", "Website"], ["instagram", "Instagram"]] as const).map(([k, label]) => (
              <div key={k} style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, color: MUTED, marginBottom: 6, fontWeight: 600 }}>{label}</label>
                {k === "bio"
                  ? <textarea className="input" value={(form[k] as string) ?? ""} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} style={{ minHeight: 70, resize: "vertical" }} />
                  : <input className="input" value={(form[k] as string) ?? ""} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} />}
              </div>
            ))}
            <button className="btn-primary" style={{ marginTop: 8 }} onClick={saveProfile}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}

const menuItem: React.CSSProperties = { display: "block", padding: "12px 16px", fontSize: 14, color: FG, textDecoration: "none", borderBottom: "1px solid rgba(234,234,234,0.06)" };
const linkBtn: React.CSSProperties = { background: "none", border: "none", color: GREEN, fontSize: 12.5, cursor: "pointer", padding: 0, fontFamily: "inherit", fontWeight: 600 };
const inputStyle: React.CSSProperties = { width: "100%", background: BG3, color: FG, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 12, padding: 12, fontSize: 14, fontFamily: "inherit", outline: "none" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, color: MUTED, marginBottom: 8, fontWeight: 600 };
function Trust({ value, label }: { value: string | number; label: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: 18, fontWeight: 700, color: FG, margin: 0 }}>{value}</p>
      <p style={{ fontSize: 12, color: MUTED, margin: "2px 0 0" }}>{label}</p>
    </div>
  );
}
