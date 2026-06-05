"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useBee } from "@/components/bee/BeeProvider";
import { analytics } from "@/lib/analytics";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const FG     = "#eaeaea";
const MUTED  = "#a9a9a7";
const BG2    = "#1a1a1a";
const BG3    = "#242424";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "We charge $2000 for a full-day wedding shoot",
  "Open Tue–Sun, 9am to 6pm",
  "Any new orders today?",
];

export default function ChatPage() {
  const router = useRouter();
  const { setMode, subscribe } = useBee();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef   = useRef<HTMLDivElement>(null);
  const sendRef  = useRef<(t: string) => void>(() => {});

  // Handle auto-login from enriched account creation
  useEffect(() => {
    const token = sessionStorage.getItem("auto_auth_token");
    if (token) {
      sessionStorage.removeItem("auto_auth_token");
      setToast("✓ Account created! Your agent is ready.");
      setTimeout(() => setToast(""), 3000);
    }
  }, []);

  // Bee ball: centered (hero) when empty, parked (mini) once chatting
  useEffect(() => { setMode(messages.length ? "mini" : "hero"); }, [messages.length, setMode]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    analytics.chatMessageSent(content.split(/\s+/).length);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "owner", messages: next }),
      });
      const data = await res.json();
      if (data.error === "no_account") { router.push("/onboarding"); return; }
      if (data.error) {
        setMessages((m) => [...m, { role: "assistant", content: "The agent is busy for a second — try that again." }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
        if (data.stored && Array.isArray(data.stored)) {
          setToast(`Saved ${data.stored.length} to your agent`);
          data.stored.forEach((fact: any) => {
            analytics.factStored(fact.info_type || "unknown", fact.is_live_fact);
          });
        }
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error — try again." }]);
    } finally {
      setLoading(false);
    }
  };
  sendRef.current = send;

  // Bee ball delivers voice / quick input here
  useEffect(() => subscribe((t) => sendRef.current(t)), [subscribe]);

  // Voice/quick input captured while on another page
  useEffect(() => {
    const pending = sessionStorage.getItem("bee_pending");
    if (pending) { sessionStorage.removeItem("bee_pending"); sendRef.current(pending); }
    const focus = () => inputRef.current?.focus();
    window.addEventListener("bee:focus", focus);
    return () => window.removeEventListener("bee:focus", focus);
  }, []);

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2500); return () => clearTimeout(t); }, [toast]);

  const empty = messages.length === 0;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Messages */}
      <div style={{ flex: 1, padding: "16px 16px 140px", maxWidth: 720, width: "100%", margin: "0 auto" }}>
        {empty ? (
          <div style={{ textAlign: "center", paddingTop: "46vh" }}>
            {/* space held for the hero bee ball; prompt sits below it */}
            <h1 style={{ fontSize: 20, fontWeight: 700, color: FG, marginTop: 70 }}>Talk to your agent</h1>
            <p style={{ color: MUTED, fontSize: 14, marginTop: 6 }}>
              Tell it about your business, or ask what&apos;s happening.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 22, alignItems: "center" }}>
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} style={{
                  background: BG2, border: "1px solid rgba(234,234,234,0.08)", color: FG,
                  borderRadius: 12, padding: "11px 16px", fontSize: 13.5, cursor: "pointer",
                  maxWidth: 420, fontFamily: "inherit",
                }}>{s}</button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
              <div style={{
                maxWidth: "82%", padding: "11px 15px", borderRadius: 16, fontSize: 15, lineHeight: 1.5,
                whiteSpace: "pre-wrap", wordBreak: "break-word",
                background: m.role === "user" ? BG3 : BG2,
                color: FG,
                border: m.role === "user" ? "none" : "1px solid rgba(152,170,157,0.18)",
                borderBottomRightRadius: m.role === "user" ? 4 : 16,
                borderBottomLeftRadius: m.role === "user" ? 16 : 4,
              }}>{m.content}</div>
            </div>
          ))
        )}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
            <div style={{ padding: "11px 15px", borderRadius: 16, background: BG2, border: "1px solid rgba(152,170,157,0.18)" }}>
              <span style={{ display: "inline-flex", gap: 4 }}>
                {[0, 1, 2].map((d) => (
                  <span key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN, animation: `dot 1s ${d * 0.15}s infinite` }} />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {toast && (
        <div style={{
          position: "fixed", bottom: 150, left: "50%", transform: "translateX(-50%)", zIndex: 60,
          background: BG2, border: `1px solid rgba(152,170,157,0.3)`, color: GREEN,
          borderRadius: 12, padding: "9px 16px", fontSize: 13, fontWeight: 600,
        }}>{toast}</div>
      )}

      {/* Input bar */}
      <div style={{
        position: "fixed", bottom: 78, left: 0, right: 0, zIndex: 55,
        padding: "8px 12px", background: "rgba(18,18,18,0.9)", backdropFilter: "blur(16px)",
      }}>
        <div style={{
          maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "flex-end", gap: 8,
          background: BG3, borderRadius: 18, padding: "6px 6px 6px 14px",
          border: "1px solid rgba(234,234,234,0.08)",
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Message your agent…"
            rows={1}
            style={{
              flex: 1, background: "none", border: "none", outline: "none", resize: "none",
              color: FG, fontSize: 15, fontFamily: "inherit", maxHeight: 120, padding: "7px 0",
            }}
          />
          <button onClick={() => send(input)} disabled={!input.trim() || loading} aria-label="Send" style={{
            width: 38, height: 38, borderRadius: 12, border: "none", flexShrink: 0,
            background: input.trim() && !loading ? YELLOW : "#3a3a38",
            cursor: input.trim() && !loading ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#121212" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`@keyframes dot { 0%,60%,100%{opacity:0.3;transform:translateY(0)} 30%{opacity:1;transform:translateY(-3px)} }`}</style>
    </div>
  );
}
