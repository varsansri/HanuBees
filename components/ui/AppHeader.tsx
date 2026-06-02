"use client";

import Link from "next/link";
import BeeCollectButton from "@/components/BeeCollectButton";

const MUTED = "#a9a9a7";

interface AppHeaderProps {
  left?:  React.ReactNode;
  right?: React.ReactNode;
}

export default function AppHeader({ left, right }: AppHeaderProps) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 40,
      background: "rgba(18,18,18,0.97)", backdropFilter: "blur(24px)",
      borderBottom: "1px solid rgba(255,190,0,0.18)",
      boxShadow: "0 1px 0 rgba(255,190,0,0.08), 0 4px 24px rgba(255,190,0,0.04)",
      display: "grid", gridTemplateColumns: "1fr auto 1fr",
      alignItems: "center", padding: "8px 16px",
    }}>
      {/* Left slot */}
      <div style={{ display: "flex", alignItems: "center" }}>
        {left ?? <div />}
      </div>

      {/* Center — bee (always clickable to collect) */}
      <BeeCollectButton />

      {/* Right slot */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
        {right ?? (
          <Link href="/search" style={{ color: MUTED, display: "flex", padding: 4 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}
