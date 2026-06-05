"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const YELLOW = "#ffbe00";
const GREEN = "#98aa9d";
const FG = "#eaeaea";
const MUTED = "#a9a9a7";
const BG = "#121212";
const BG2 = "#1a1a1a";
const BG3 = "#242424";

type EnrichedData = {
  uuid: string;
  businessName: string;
  location: string;
  maps: {
    hours?: string;
    phone?: string;
    address?: string;
    rating?: string;
    website?: string;
    services?: string;
  };
  liveFacts: Array<{ type: string; content: string }>;
  richContext: Array<{ tag: string; content: string }>;
};

export default function PreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uuid = searchParams.get("id");

  const [data, setData] = useState<EnrichedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!uuid) {
      setError("No search result found");
      setLoading(false);
      return;
    }
    fetchPreview();
  }, [uuid]);

  const fetchPreview = async () => {
    try {
      const res = await fetch(`/api/search-business/preview?uuid=${uuid}`);
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result);
      }
    } catch {
      setError("Failed to load preview");
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async () => {
    if (!data) return;
    setCreating(true);
    try {
      const res = await fetch("/api/create-account-enriched", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid: data.uuid }),
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
        setCreating(false);
      } else {
        // Auto-login and redirect
        sessionStorage.setItem("auto_auth_token", result.token);
        router.push("/chat");
      }
    } catch {
      setError("Failed to create account");
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: MUTED }}>Loading…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: "100vh", maxWidth: 540, margin: "0 auto", padding: "40px 20px" }}>
        <Link href="/business-search" style={{ color: YELLOW, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
          ← Back to search
        </Link>
        <div style={{ marginTop: 20, padding: "16px 14px", background: "rgba(152,170,157,0.15)", border: `1px solid ${GREEN}`, borderRadius: 12, color: GREEN }}>
          {error || "No data found"}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", maxWidth: 640, margin: "0 auto", padding: "20px 16px 100px" }}>
      {/* Header */}
      <Link href="/business-search" style={{ color: YELLOW, textDecoration: "none", fontSize: 13, fontWeight: 600, display: "inline-block", marginBottom: 20 }}>
        ← Back
      </Link>

      {/* Business card */}
      <div style={{ background: BG2, border: `1px solid rgba(255,190,0,0.14)`, borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: FG, margin: "0 0 6px" }}>
          {data.businessName}
        </h1>
        <p style={{ fontSize: 13, color: MUTED, margin: "0 0 14px" }}>
          {data.location}
        </p>
        {data.maps.rating && (
          <p style={{ fontSize: 13, color: YELLOW, fontWeight: 600, margin: 0 }}>
            ★ {data.maps.rating}
          </p>
        )}
      </div>

      {/* Info sections */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: FG, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Business Info
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.maps.phone && (
            <div style={{ background: BG3, padding: "12px 14px", borderRadius: 12, borderLeft: `3px solid ${YELLOW}` }}>
              <p style={{ fontSize: 11, color: MUTED, margin: "0 0 3px", fontWeight: 600 }}>PHONE</p>
              <p style={{ fontSize: 14, color: FG, margin: 0 }}>{data.maps.phone}</p>
            </div>
          )}
          {data.maps.hours && (
            <div style={{ background: BG3, padding: "12px 14px", borderRadius: 12, borderLeft: `3px solid ${YELLOW}` }}>
              <p style={{ fontSize: 11, color: MUTED, margin: "0 0 3px", fontWeight: 600 }}>HOURS</p>
              <p style={{ fontSize: 14, color: FG, margin: 0, whiteSpace: "pre-wrap" }}>{data.maps.hours}</p>
            </div>
          )}
          {data.maps.address && (
            <div style={{ background: BG3, padding: "12px 14px", borderRadius: 12, borderLeft: `3px solid ${YELLOW}` }}>
              <p style={{ fontSize: 11, color: MUTED, margin: "0 0 3px", fontWeight: 600 }}>ADDRESS</p>
              <p style={{ fontSize: 14, color: FG, margin: 0 }}>{data.maps.address}</p>
            </div>
          )}
          {data.maps.website && (
            <div style={{ background: BG3, padding: "12px 14px", borderRadius: 12, borderLeft: `3px solid ${YELLOW}` }}>
              <p style={{ fontSize: 11, color: MUTED, margin: "0 0 3px", fontWeight: 600 }}>WEBSITE</p>
              <a href={data.maps.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: GREEN, margin: 0, textDecoration: "none" }}>
                {data.maps.website}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Live facts */}
      {data.liveFacts.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: FG, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Services & Pricing
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.liveFacts.map((fact, i) => (
              <div key={i} style={{ background: BG3, padding: "12px 14px", borderRadius: 12 }}>
                <p style={{ fontSize: 11, color: MUTED, margin: "0 0 3px", fontWeight: 600, textTransform: "uppercase" }}>
                  {fact.type}
                </p>
                <p style={{ fontSize: 13, color: FG, margin: 0, lineHeight: 1.5 }}>{fact.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rich context */}
      {data.richContext.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: FG, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
            About & Portfolio
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.richContext.map((item, i) => (
              <div key={i} style={{ background: BG3, padding: "12px 14px", borderRadius: 12 }}>
                <p style={{ fontSize: 11, color: GREEN, margin: "0 0 3px", fontWeight: 600, textTransform: "uppercase" }}>
                  {item.tag}
                </p>
                <p style={{ fontSize: 13, color: FG, margin: 0, lineHeight: 1.5 }}>{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create button */}
      <button
        onClick={createAccount}
        disabled={creating}
        style={{
          position: "fixed",
          bottom: 20,
          left: 16,
          right: 16,
          maxWidth: "calc(640px - 32px)",
          margin: "0 auto",
          padding: "16px 20px",
          borderRadius: 12,
          border: "none",
          background: YELLOW,
          color: BG,
          fontSize: 16,
          fontWeight: 700,
          cursor: creating ? "default" : "pointer",
          fontFamily: "inherit",
        }}
      >
        {creating ? "Creating account…" : "Create account"}
      </button>
    </div>
  );
}
