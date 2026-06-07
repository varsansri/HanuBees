"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const YELLOW = "var(--yellow)", GREEN = "var(--green)", FG = "var(--fg)", MUTED = "var(--fg2)", BG2 = "var(--bg2)", BG3 = "var(--bg3)";

type Biz = { id: string; name: string; category: string | null; city: string | null; phone: string | null; claimed: boolean };

export default function ClaimPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <ClaimInner />
    </Suspense>
  );
}

function ClaimInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const supabase = createClient();

  const [q, setQ] = useState(sp.get("name") || "");
  const [results, setResults] = useState<Biz[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Biz | null>(null);
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // require login
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/login");
    })();
    // eslint-disable-next-line
  }, []);

  const search = async (term: string) => {
    if (!term.trim()) { setResults([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("accounts")
      .select("id, name, category, city, phone, claimed")
      .eq("type", "business")
      .ilike("name", `%${term.trim()}%`)
      .order("claimed", { ascending: true })
      .limit(20);
    setResults((data ?? []) as Biz[]);
    setLoading(false);
  };

  // preselect by ?id, else auto-search ?name
  useEffect(() => {
    const id = sp.get("id");
    if (id) {
      (async () => {
        const { data } = await supabase.from("accounts").select("id, name, category, city, phone, claimed").eq("id", id).maybeSingle();
        if (data) setSelected(data as Biz);
      })();
    } else if (q) {
      search(q);
    }
    // eslint-disable-next-line
  }, []);

  const claim = async () => {
    if (!selected) return;
    setBusy(true); setError("");
    const { data, error: rpcErr } = await supabase.rpc("claim_account", { p_account: selected.id, p_confirm: confirm });
    setBusy(false);
    if (rpcErr) { setError(rpcErr.message); return; }
    if (!data?.ok) { setError(data?.error || "Could not claim"); return; }
    router.push("/chat"); // they now own it — manage by chatting
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--border)",
    background: BG3, color: FG, fontSize: 15, fontFamily: "inherit", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", maxWidth: 560, margin: "0 auto", padding: "28px 18px 100px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: FG, margin: "0 0 6px" }}>Claim your business</h1>
      <p style={{ fontSize: 14, color: MUTED, margin: "0 0 22px", lineHeight: 1.5 }}>
        Find your business, verify it's yours, and your free AI agent is ready to manage — just by chatting.
      </p>

      {!selected ? (
        <>
          <input
            style={inputStyle}
            placeholder="Search your business name…"
            value={q}
            onChange={(e) => { setQ(e.target.value); }}
            onKeyDown={(e) => { if (e.key === "Enter") search(q); }}
          />
          <button onClick={() => search(q)} style={{
            marginTop: 10, background: YELLOW, color: "#121212", border: "none", borderRadius: 10,
            padding: "11px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}>Search</button>

          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            {loading ? <p style={{ color: MUTED }}>Searching…</p> :
              results.map((b) => (
                <button key={b.id} disabled={b.claimed} onClick={() => { setSelected(b); setError(""); setConfirm(""); }} style={{
                  textAlign: "left", background: BG2, border: "1px solid var(--border)", borderRadius: 12,
                  padding: 13, cursor: b.claimed ? "default" : "pointer", fontFamily: "inherit", opacity: b.claimed ? 0.5 : 1,
                }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: FG, margin: 0 }}>{b.name}</p>
                  <p style={{ fontSize: 12.5, color: MUTED, margin: "2px 0 0" }}>
                    {[b.category, b.city].filter(Boolean).join(" · ")}{b.claimed ? " · already claimed" : ""}
                  </p>
                </button>
              ))}
          </div>
        </>
      ) : (
        <div style={{ background: BG2, borderRadius: 16, padding: 18 }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: FG, margin: 0 }}>{selected.name}</p>
          <p style={{ fontSize: 13, color: MUTED, margin: "3px 0 16px" }}>{[selected.category, selected.city].filter(Boolean).join(" · ")}</p>

          {selected.phone ? (
            <>
              <label style={{ fontSize: 13, color: FG, fontWeight: 600 }}>Verify it's yours — enter the business phone</label>
              <input style={{ ...inputStyle, marginTop: 7 }} placeholder="Phone number on your listing" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </>
          ) : (
            <p style={{ fontSize: 13, color: MUTED }}>No phone on file — you can claim and add your details after.</p>
          )}

          {error && <p style={{ color: GREEN, fontSize: 13, marginTop: 10 }}>{error}</p>}

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={claim} disabled={busy} style={{
              flex: 1, background: YELLOW, color: "#121212", border: "none", borderRadius: 10,
              padding: "12px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}>{busy ? "Claiming…" : "Claim this business"}</button>
            <button onClick={() => { setSelected(null); setError(""); }} style={{
              background: "transparent", color: MUTED, border: "1px solid var(--border)",
              borderRadius: 10, padding: "12px 16px", fontSize: 14, cursor: "pointer", fontFamily: "inherit",
            }}>Back</button>
          </div>
        </div>
      )}
    </div>
  );
}
