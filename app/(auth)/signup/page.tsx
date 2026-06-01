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
    setLoading(true);
    setError("");

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username.toLowerCase().replace(/\s+/g, "_") }
      }
    });
    if (signupError) { setError(signupError.message); setLoading(false); return; }

    router.push("/feed");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm fade-up">
        <div className="text-center mb-8">
          <h1 className="font-brand text-3xl text-amber mb-2">Hanubees</h1>
          <p style={{ color: "var(--fg2)", fontSize: 15 }}>Join the community</p>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input className="input" type="text" placeholder="Username" value={username}
            onChange={e => setUsername(e.target.value)} required />
          <input className="input" type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Password (min 6 chars)" value={password}
            onChange={e => setPassword(e.target.value)} minLength={6} required />
          {error && <p style={{ color: "var(--red)", fontSize: 13 }}>{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-6" style={{ color: "var(--fg3)", fontSize: 14 }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--amber)" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
