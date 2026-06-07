"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const YELLOW = "var(--yellow)";
const GREEN = "var(--green)";
const FG = "var(--fg)";
const MUTED = "var(--fg2)";
const BG2 = "var(--bg2)";
const BG3 = "var(--bg3)";

export default function BusinessSearchPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async () => {
    if (!name.trim() || !city.trim()) {
      setError("Enter business name and city");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/search-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), city: city.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
      // Redirect to preview with enriched data
      router.push(`/business-search/preview?id=${data.uuid}`);
    } catch {
      setError("Search failed — try again");
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) search();
  };

  return (
    <div style={{ minHeight: "100vh", maxWidth: 540, margin: "0 auto", padding: "40px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <Link href="/" style={{ color: YELLOW, textDecoration: "none", fontSize: 13, fontWeight: 600, marginBottom: 20, display: "inline-block" }}>
          ← Back
        </Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: FG, margin: "20px 0 8px" }}>
          Find your business
        </h1>
        <p style={{ fontSize: 15, color: MUTED, margin: 0, lineHeight: 1.5 }}>
          Search Google Maps. We'll gather your hours, services, pricing, and more — then create your AI receptionist with all that info pre-loaded.
        </p>
      </div>

      {/* Search form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: FG, marginBottom: 6 }}>
            Business name
          </label>
          <input
            type="text"
            placeholder="e.g., Rosa Photography"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: `1px solid var(--border)`,
              background: BG3,
              color: FG,
              fontSize: 15,
              fontFamily: "inherit",
              outline: "none",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: FG, marginBottom: 6 }}>
            City / Location
          </label>
          <input
            type="text"
            placeholder="e.g., Sydney, Australia"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: `1px solid var(--border)`,
              background: BG3,
              color: FG,
              fontSize: 15,
              fontFamily: "inherit",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: "rgba(152,170,157,0.15)",
          border: `1px solid ${GREEN}`,
          borderRadius: 12,
          padding: "12px 14px",
          color: GREEN,
          fontSize: 13,
          marginBottom: 20,
        }}>
          {error}
        </div>
      )}

      {/* Search button */}
      <button
        onClick={search}
        disabled={loading || !name.trim() || !city.trim()}
        style={{
          width: "100%",
          padding: "14px 18px",
          borderRadius: 12,
          border: "none",
          background: (name.trim() && city.trim() && !loading) ? YELLOW : "var(--fg3)",
          color: "#121212",
          fontSize: 15,
          fontWeight: 700,
          cursor: (name.trim() && city.trim() && !loading) ? "pointer" : "default",
          fontFamily: "inherit",
        }}
      >
        {loading ? "Searching…" : "Search & enrich"}
      </button>

      {/* Info */}
      <p style={{ fontSize: 12, color: MUTED, marginTop: 20, textAlign: "center", lineHeight: 1.5 }}>
        We search Google Maps for your business, scrape your website, extract key info, and prepare your account. Takes ~10 seconds.
      </p>
    </div>
  );
}
