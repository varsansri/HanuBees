"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const YELLOW = "var(--yellow)";
const GREEN  = "var(--green)";
const MUTED  = "var(--fg2)";

export default function ResetPasswordPage() {
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [done, setDone]           = useState(false);
  const [ready, setReady]         = useState(false);
  const router   = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Supabase sets session from URL hash automatically on this page
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); return; }
    setDone(true);
    setTimeout(() => router.push("/login"), 2500);
  };

  if (done) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", background: "var(--bg)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(152,170,157,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--fg)", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 8 }}>Password updated</h2>
          <p style={{ color: MUTED, fontSize: 14 }}>Redirecting you to login…</p>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", background: "var(--bg)" }}>
        <p style={{ color: MUTED, fontSize: 14 }}>Verifying reset link…</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px", background: "var(--bg)",
    }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <img src="/bee.png" alt="Hanubees" style={{ width: 80, height: "auto", margin: "0 auto 20px", display: "block" }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--fg)", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 8 }}>
            Set new password
          </h2>
          <p style={{ color: MUTED, fontSize: 14 }}>Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input className="input" type="password" placeholder="New password" value={password}
            onChange={e => setPassword(e.target.value)} minLength={6} required autoFocus />
          <input className="input" type="password" placeholder="Confirm new password" value={confirm}
            onChange={e => setConfirm(e.target.value)} minLength={6} required />
          {error && <p style={{ color: GREEN, fontSize: 13 }}>{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, color: MUTED, fontSize: 14 }}>
          <Link href="/login" style={{ color: YELLOW, fontWeight: 600, textDecoration: "none" }}>
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
