"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const FG     = "#eaeaea";
const MUTED  = "#a9a9a7";
const BG2    = "#1a1a1a";
const BG3    = "#242424";

const VERTICALS = [
  { v: "services",   label: "Service" },
  { v: "secondhand", label: "Secondhand" },
  { v: "realestate", label: "Real estate (sale)" },
  { v: "rental",     label: "Rental" },
  { v: "transport",  label: "Goods transport" },
  { v: "b2b",        label: "B2B / raw materials" },
  { v: "product",    label: "Product" },
];

type Listing = {
  id: string; vertical: string; title: string; description: string | null;
  price: number | null; area: string | null; status: string;
};

export default function ListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [vertical, setVertical] = useState("services");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");

  const load = async () => {
    const res = await fetch("/api/listings");
    if (res.status === 401) { router.push("/login"); return; }
    const data = await res.json();
    setListings(data.listings || []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const create = async () => {
    if (!title.trim()) return;
    const res = await fetch("/api/listings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vertical, title, price, area, description }),
    });
    if (res.ok) {
      setTitle(""); setPrice(""); setArea(""); setDescription(""); setShowForm(false);
      await load();
    }
  };

  const toggleSold = async (l: Listing) => {
    const status = l.status === "active" ? "sold" : "active";
    setListings((p) => p.map((x) => x.id === l.id ? { ...x, status } : x));
    await fetch("/api/listings", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: l.id, status }),
    });
  };

  const remove = async (id: string) => {
    setListings((p) => p.filter((x) => x.id !== id));
    await fetch(`/api/listings?id=${id}`, { method: "DELETE" });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    border: "1px solid rgba(234,234,234,0.12)", background: BG3, color: FG,
    fontSize: 14, fontFamily: "inherit", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
        <span style={{ fontWeight: 700, fontSize: 17, color: FG }}>My Listings</span>
        <button onClick={() => setShowForm((s) => !s)} style={{
          background: showForm ? "transparent" : YELLOW, color: showForm ? MUTED : "#121212",
          border: showForm ? "1px solid rgba(234,234,234,0.15)" : "none",
          borderRadius: 9, padding: "6px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
        }}>{showForm ? "Cancel" : "+ New listing"}</button>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "8px 12px 110px" }}>
        {showForm && (
          <div style={{ background: BG2, borderRadius: 16, padding: 14, marginBottom: 16, display: "flex", flexDirection: "column", gap: 9 }}>
            <select value={vertical} onChange={(e) => setVertical(e.target.value)} style={inputStyle}>
              {VERTICALS.map((x) => <option key={x.v} value={x.v}>{x.label}</option>)}
            </select>
            <input style={inputStyle} placeholder="Title (e.g. 2BHK flat for rent)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div style={{ display: "flex", gap: 9 }}>
              <input style={inputStyle} type="number" placeholder="Price ₹ (optional)" value={price} onChange={(e) => setPrice(e.target.value)} />
              <input style={inputStyle} placeholder="Area / locality" value={area} onChange={(e) => setArea(e.target.value)} />
            </div>
            <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} placeholder="Details — describe it like you'd tell a buyer" value={description} onChange={(e) => setDescription(e.target.value)} />
            <button onClick={create} disabled={!title.trim()} style={{
              background: title.trim() ? YELLOW : "#3a3a38", color: "#121212", border: "none",
              borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 700,
              cursor: title.trim() ? "pointer" : "default", fontFamily: "inherit",
            }}>Add listing</button>
          </div>
        )}

        {loading ? (
          <p style={{ color: MUTED, textAlign: "center", marginTop: 30 }}>Loading…</p>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 50, color: MUTED }}>
            <p style={{ fontSize: 15, color: FG, fontWeight: 600 }}>No listings yet</p>
            <p style={{ fontSize: 13.5, marginTop: 6 }}>Add items, properties, or services — your agent will surface them when people search.</p>
          </div>
        ) : (
          listings.map((l) => (
            <div key={l.id} style={{ background: BG2, borderRadius: 14, padding: 14, marginBottom: 10, opacity: l.status === "active" ? 1 : 0.55 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 10.5, color: GREEN, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>{l.vertical}</span>
                    {l.status !== "active" && <span style={{ fontSize: 10.5, color: MUTED, textTransform: "uppercase" }}>· {l.status}</span>}
                  </div>
                  <p style={{ fontSize: 15, color: FG, fontWeight: 600, margin: "3px 0 0" }}>{l.title}</p>
                  <p style={{ fontSize: 12.5, color: MUTED, margin: "2px 0 0" }}>
                    {[l.price != null && `₹${l.price}`, l.area].filter(Boolean).join(" · ")}
                  </p>
                  {l.description && <p style={{ fontSize: 13, color: FG, margin: "6px 0 0", lineHeight: 1.45 }}>{l.description}</p>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button onClick={() => toggleSold(l)} style={{
                  background: BG3, border: "1px solid rgba(234,234,234,0.1)", color: FG,
                  borderRadius: 8, padding: "6px 12px", fontSize: 12.5, cursor: "pointer", fontFamily: "inherit",
                }}>{l.status === "active" ? "Mark sold/paused" : "Reactivate"}</button>
                <button onClick={() => remove(l.id)} style={{
                  background: "none", border: "1px solid rgba(234,234,234,0.1)", color: MUTED,
                  borderRadius: 8, padding: "6px 12px", fontSize: 12.5, cursor: "pointer", fontFamily: "inherit",
                }}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
