"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import posthog from "posthog-js";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const MUTED  = "#a9a9a7";

export default function SignupPage() {
  const [step, setStep]         = useState<"form"|"otp">("form");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [otp, setOtp]           = useState(["","","","","","","",""]);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs               = useRef<(HTMLInputElement|null)[]>([]);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { username: username.toLowerCase().replace(/\s+/g, "_") } },
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setLoading(false);
    setStep("otp");
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 7) inputRefs.current[i+1]?.focus();
    if (next.every(d => d)) verifyOtp(next.join(""));
  };

  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputRefs.current[i-1]?.focus();
    }
  };

  const verifyOtp = async (code: string) => {
    setLoading(true); setError("");
    const { error } = await supabase.auth.verifyOtp({
      email, token: code, type: "signup",
    });
    if (error) {
      setError("Invalid code. Try again.");
      setOtp(["","","","","","","",""]);
      inputRefs.current[0]?.focus();
      setLoading(false);
      return;
    }
    posthog.capture("user_signed_up");
    (window as any).umami?.track("signup");
    router.refresh();
    router.push("/chat");
  };

  const resend = async () => {
    setResending(true); setError("");
    await supabase.auth.resend({ type: "signup", email });
    setResending(false);
    setOtp(["","","","","","","",""]);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  // ── OTP step ──────────────────────────────────────────────────
  if (step === "otp") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "24px", background: "#121212",
      }}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <img src="/bee.png" alt="Hanubees" style={{ width: 80, height: "auto", margin: "0 auto 20px", display: "block" }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#eaeaea", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 8 }}>
              Check your email
            </h2>
            <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.6 }}>
              We sent a 6-digit code to<br />
              <span style={{ color: "#eaeaea", fontWeight: 600 }}>{email}</span>
            </p>
          </div>

          {/* OTP boxes */}
          <div style={{ display: "flex", gap: 7, justifyContent: "center", marginBottom: 24 }}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text" inputMode="numeric" maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKey(i, e)}
                style={{
                  width: 38, height: 52, textAlign: "center",
                  fontSize: 22, fontWeight: 700,
                  background: "#1a1a1a",
                  border: `2px solid ${digit ? GREEN : "rgba(234,234,234,0.1)"}`,
                  borderRadius: 12, color: "#eaeaea", outline: "none",
                  fontFamily: "'Space Grotesk', sans-serif",
                  transition: "border-color 0.15s",
                }}
              />
            ))}
          </div>

          {loading && (
            <p style={{ textAlign: "center", color: MUTED, fontSize: 14, marginBottom: 16 }}>Verifying…</p>
          )}
          {error && (
            <p style={{ textAlign: "center", color: GREEN, fontSize: 13, marginBottom: 16 }}>{error}</p>
          )}

          <button onClick={resend} disabled={resending} style={{
            width: "100%", background: "none", border: "none",
            color: resending ? MUTED : GREEN,
            fontSize: 14, fontWeight: 600, cursor: "pointer",
            fontFamily: "'Space Grotesk', sans-serif", marginBottom: 20,
          }}>
            {resending ? "Sending…" : "Resend code"}
          </button>

          <button onClick={() => { setStep("form"); setOtp(["","","","","",""]); setError(""); }} style={{
            width: "100%", background: "none", border: "none",
            color: MUTED, fontSize: 14, cursor: "pointer",
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            ← Change email
          </button>
        </div>
      </div>
    );
  }

  // ── Form step ─────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px", background: "#121212",
    }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <img src="/bee.png" alt="Hanubees" style={{ width: 140, height: "auto", margin: "0 auto 8px", display: "block" }} />
          <p style={{ color: "#a9a9a7", fontSize: 14, marginTop: 8, fontWeight: 500 }}>
            Join the health community
          </p>
        </div>

        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input className="input" type="text" placeholder="Username" value={username}
            onChange={e => setUsername(e.target.value)} required />
          <input className="input" type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Password (min 6 chars)" value={password}
            onChange={e => setPassword(e.target.value)} minLength={6} required />
          {error && <p style={{ color: GREEN, fontSize: 13 }}>{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, color: MUTED, fontSize: 14 }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: YELLOW, fontWeight: 600, textDecoration: "none" }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
