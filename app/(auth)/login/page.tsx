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
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/feed");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm fade-up">
        <div className="text-center mb-8">
          <h1 className="font-brand text-3xl text-amber mb-2">Hanubees</h1>
          <p style={{ color: "var(--fg2)", fontSize: 15 }}>Welcome back</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input className="input" type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} required />
          {error && <p style={{ color: "var(--red)", fontSize: 13 }}>{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-6" style={{ color: "var(--fg3)", fontSize: 14 }}>
          No account?{" "}
          <Link href="/signup" style={{ color: "var(--amber)" }}>Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
