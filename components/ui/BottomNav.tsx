"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const GREEN = "#98aa9d";
const MUTED = "#a9a9a7";

const tabs = [
  {
    href: "/chat",
    label: "Chat",
    icon: (active: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24"
        fill={active ? GREEN : "none"}
        stroke={active ? GREEN : MUTED}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
    ),
  },
  {
    href: "/messages",
    label: "Messages",
    icon: (active: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24"
        fill="none"
        stroke={active ? GREEN : MUTED}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16v12H5.2L4 17.2V4z"/>
      </svg>
    ),
  },
  {
    href: "/notifications",
    label: "Alerts",
    icon: (active: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24"
        fill={active ? GREEN : "none"}
        stroke={active ? GREEN : MUTED}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
      </svg>
    ),
  },
  {
    href: "/map",
    label: "Map",
    icon: (active: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24"
        fill="none"
        stroke={active ? GREEN : MUTED}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3 4 5v16l5-2 6 2 5-2V3l-5 2-6-2z"/>
        <path d="M9 3v16M15 5v16"/>
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
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
        const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link key={tab.href} href={tab.href} aria-label={tab.label} style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 64, height: 48, textDecoration: "none",
          }}>
            {tab.icon(active)}
          </Link>
        );
      })}
    </nav>
  );
}
