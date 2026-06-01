"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/feed",
    icon: (active: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill={active ? "white" : "none"}
        stroke={active ? "white" : "#666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: "/search",
    icon: (active: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
        stroke={active ? "white" : "#666"} strokeWidth={active ? "2.5" : "2"} strokeLinecap="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    href: "/post/new",
    icon: (_active: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
  {
    href: "/profile",
    icon: (active: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill={active ? "white" : "none"}
        stroke={active ? "white" : "#666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        const active = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href) && tab.href !== "/post/new");
        return (
          <Link key={tab.href} href={tab.href}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 56, height: 44, textDecoration: "none",
              opacity: tab.href === "/post/new" ? 1 : active ? 1 : 0.9,
            }}>
            {tab.icon(active)}
          </Link>
        );
      })}
    </nav>
  );
}
