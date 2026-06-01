"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const MUTED  = "#a9a9a7";

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState("");
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://hanubees.com/reset-password",
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setSent(true);
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px", background: "#121212",
    }}>
      <div style={{ width: "100%", maxWidth: 360 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <img src="/bee.png" alt="Hanubees" style={{ width: 80, height: "auto", margin: "0 auto 20px", display: "block" }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#eaeaea", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 8 }}>
            {sent ? "Email sent" : "Forgot password?"}
          </h2>
          <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.6 }}>
            {sent
              ? <>Check <span style={{ color: "#eaeaea", fontWeight: 600 }}>{email}</span><br />for a password reset link.</>
              : "Enter your email and we'll send you a reset link."
            }
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input className="input" type="email" placeholder="Email" value={email}
              onChange={e => setEmail(e.target.value)} required autoFocus />
            {error && <p style={{ color: GREEN, fontSize: 13 }}>{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        ) : (
          <button onClick={() => { setSent(false); setEmail(""); }} style={{
            width: "100%", background: "#1a1a1a",
            border: "1px solid rgba(234,234,234,0.08)",
            borderRadius: 12, padding: "13px",
            color: MUTED, fontSize: 14, fontWeight: 600,
            cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif",
          }}>
            Resend to a different email
          </button>
        )}

        <p style={{ textAlign: "center", marginTop: 24, color: MUTED, fontSize: 14 }}>
          <Link href="/login" style={{ color: YELLOW, fontWeight: 600, textDecoration: "none" }}>
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
