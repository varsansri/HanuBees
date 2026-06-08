"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/train", label: "Train" },
  { href: "/conversations", label: "Conversations" },
  { href: "/catalog", label: "Catalog" },
  { href: "/profile", label: "Profile" },
];

export default function Nav({ name }: { name: string }) {
  const path = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const logout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  return (
    <nav style={{ width: 240, minWidth: 240, borderRight: "1px solid var(--border)", padding: "20px 14px", display: "flex", flexDirection: "column", gap: 4, height: "100vh", position: "sticky", top: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px 18px" }}>
        <img src="https://www.hanubees.com/bee.png" alt="" style={{ width: 30 }} />
        <span style={{ fontWeight: 800, fontSize: 16 }}>Business</span>
      </div>
      {LINKS.map((l) => {
        const active = path === l.href || path.startsWith(l.href + "/");
        return (
          <Link key={l.href} href={l.href} style={{
            padding: "11px 14px", borderRadius: 10, fontSize: 15, fontWeight: 600,
            color: active ? "#121212" : "var(--fg)", background: active ? "var(--yellow)" : "transparent",
          }}>{l.label}</Link>
        );
      })}
      <div style={{ marginTop: "auto", padding: "8px" }}>
        <div style={{ fontSize: 13, color: "var(--fg2)", marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
        <button onClick={logout} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 12px", color: "var(--fg2)", fontSize: 13, cursor: "pointer", fontFamily: "inherit", width: "100%" }}>Sign out</button>
      </div>
    </nav>
  );
}
