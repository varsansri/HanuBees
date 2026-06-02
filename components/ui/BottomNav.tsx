"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const GREEN = "#98aa9d";
const MUTED = "#a9a9a7";
const YELLOW = "#ffbe00";

const tabs = [
  {
    href: "/feed",
    icon: (active: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24"
        fill={active ? GREEN : "none"}
        stroke={active ? GREEN : MUTED}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: "/search",
    icon: (active: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
        stroke={active ? GREEN : MUTED}
        strokeWidth={active ? "2.2" : "1.8"} strokeLinecap="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    href: "/post/new",
    icon: (_active: boolean) => (
      <div style={{
        width: 46, height: 46, borderRadius: 14,
        background: YELLOW,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 4px 16px rgba(255,190,0,0.35)`,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="#121212" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>
    ),
  },
  {
    href: "/knowledge",
    icon: (active: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
        stroke={active ? GREEN : MUTED}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    href: "/profile",
    icon: (active: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24"
        fill={active ? GREEN : "none"}
        stroke={active ? GREEN : MUTED}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const active = pathname === tab.href ||
          (tab.href !== "/" && pathname.startsWith(tab.href) && tab.href !== "/post/new");
        return (
          <Link key={tab.href} href={tab.href} style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 56, height: 48, textDecoration: "none",
          }}>
            {tab.icon(active)}
          </Link>
        );
      })}
    </nav>
  );
}
