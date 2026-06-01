"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    router.push("/feed");
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "24px",
      background: "var(--bg)",
    }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <img src="/logo.png" alt="Hanubees" style={{ width: 120, height: 120, margin: "0 auto 8px", display: "block", borderRadius: 24 }} />
          <p style={{ color: "var(--fg2)", fontSize: 14, marginTop: 4 }}>
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
          {error && <p style={{ color: "var(--red)", fontSize: 13 }}>{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, color: "var(--fg2)", fontSize: 14 }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--fg)", fontWeight: 600, textDecoration: "none" }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
