"use client";

import { useEffect } from "react";
import { useContribute } from "./ContributeProvider";
import ContributeBox from "./ContributeBox";

const FG = "var(--fg)", MUTED = "var(--fg2)";

// In-place bottom sheet — opening the "+" feels like staying on the same page,
// not navigating to a separate one.
export default function ContributeSheet() {
  const { isOpen, close } = useContribute();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div
      onClick={close}
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
    >
      <div
        className="sheet-up"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", background: "var(--bg)", borderRadius: "20px 20px 0 0", border: "1px solid var(--border)", borderBottom: "none", paddingBottom: 24 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 6px", position: "sticky", top: 0, background: "var(--bg)" }}>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <span style={{ width: 40, height: 4, borderRadius: 4, background: "var(--border)" }} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px 2px" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: FG, margin: 0 }}>Share something</h2>
          <button onClick={close} aria-label="Close" style={{ background: "none", border: "none", color: MUTED, fontSize: 26, lineHeight: 1, cursor: "pointer", fontFamily: "inherit", padding: "0 4px" }}>×</button>
        </div>
        <ContributeBox onDone={close} />
      </div>
    </div>
  );
}
