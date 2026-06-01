"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/feed");
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "24px",
      background: "var(--bg)",
    }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <img src="/bee.png" alt="Hanubees" style={{ width: 140, height: "auto", margin: "0 auto 8px", display: "block" }} />
          <p style={{ color: "var(--fg2)", fontSize: 14, marginTop: 4 }}>
            Your health journey, shared.
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input className="input" type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} required />
          {error && <p style={{ color: "var(--red)", fontSize: 13 }}>{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? "Signing in..." : "Log in"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, color: "var(--fg2)", fontSize: 14 }}>
          Don't have an account?{" "}
          <Link href="/signup" style={{ color: "var(--fg)", fontWeight: 600, textDecoration: "none" }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
