"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/feed", label: "Feed", icon: "⬡" },
  { href: "/search", label: "Search", icon: "⌕" },
  { href: "/post/new", label: "Post", icon: "✦" },
  { href: "/profile", label: "Profile", icon: "◎" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href) && tab.href !== "/" ;
        return (
          <Link key={tab.href} href={tab.href}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, textDecoration: "none",
              color: active ? "var(--amber)" : "var(--fg3)",
              fontSize: 10, fontFamily: "'Inter', sans-serif", fontWeight: 500,
              letterSpacing: "0.05em", transition: "color 0.2s",
            }}>
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
