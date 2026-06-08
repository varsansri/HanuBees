"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const sendCode = async () => {
    if (!email.trim()) return;
    setBusy(true); setError("");
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false } });
    setBusy(false);
    if (error) { setError(error.message); return; }
    setStep("code");
  };

  const verify = async () => {
    setBusy(true); setError("");
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    setBusy(false);
    if (error) { setError(error.message); return; }
    router.push("/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img src="https://www.hanubees.com/bee.png" alt="" style={{ width: 64, margin: "0 auto 14px", display: "block" }} />
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Hanubees Business</h1>
          <p style={{ color: "var(--fg2)", fontSize: 14, marginTop: 6 }}>
            {step === "email" ? "Sign in to manage your AI" : `Enter the code sent to ${email}`}
          </p>
        </div>

        {step === "email" ? (
          <>
            <input className="input" type="email" placeholder="Your email" value={email}
              onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendCode()} autoFocus />
            <button className="btn" style={{ width: "100%", marginTop: 12 }} disabled={busy} onClick={sendCode}>
              {busy ? "Sending…" : "Send code"}
            </button>
          </>
        ) : (
          <>
            <input className="input" inputMode="numeric" placeholder="6–8 digit code" value={code}
              onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && verify()} autoFocus />
            <button className="btn" style={{ width: "100%", marginTop: 12 }} disabled={busy} onClick={verify}>
              {busy ? "Verifying…" : "Verify & sign in"}
            </button>
            <button onClick={() => setStep("email")} style={{ width: "100%", marginTop: 10, background: "none", border: "none", color: "var(--fg2)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>← use a different email</button>
          </>
        )}
        {error && <p style={{ color: "var(--green)", fontSize: 13, marginTop: 12 }}>{error}</p>}
      </div>
    </div>
  );
}
