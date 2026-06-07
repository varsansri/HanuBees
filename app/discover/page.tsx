"use client";

import { useState } from "react";
import Link from "next/link";

const YELLOW = "var(--yellow)";
const GREEN = "var(--green)";
const FG = "var(--fg)";
const MUTED = "var(--fg2)";
const BG2 = "var(--bg2)";
const BG3 = "var(--bg3)";

type AgentResponse = {
  name: string;
  category: string;
  response: string;
  relevance: string;
};

type QueryResult = {
  question: string;
  answer: string;
  agents: AgentResponse[];
  agentCount: number;
  category: string;
  city: string;
};

export default function DiscoverPage() {
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("photography");
  const [city, setCity] = useState("Coimbatore");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState("");

  const categories = [
    "photography",
    "catering",
    "venue",
    "flowers",
    "dj",
    "makeup",
    "cake",
    "transport",
    "salon",
  ];

  const cities = [
    "Coimbatore",
    "Chennai",
    "Bangalore",
    "Hyderabad",
    "Mumbai",
  ];

  const query = async () => {
    if (!question.trim()) {
      setError("Please ask a question");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/consumer-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          category,
          city,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Query failed");
        setLoading(false);
        return;
      }

      setResult(data);
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) query();
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <img
            src="/bee.png"
            alt="Hanubees"
            style={{ width: 30, height: 30 }}
          />
          <span style={{ fontWeight: 700, fontSize: 19, color: FG }}>
            Hanubees
          </span>
        </div>
        <Link
          href="/"
          style={{ color: YELLOW, textDecoration: "none", fontSize: 13 }}
        >
          Back
        </Link>
      </header>

      {/* Main */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: FG,
            margin: "0 0 8px",
            lineHeight: 1.1,
          }}
        >
          Discover & Compare Services
        </h1>
        <p style={{ fontSize: 15, color: MUTED, margin: "0 0 30px" }}>
          Ask any question. AI agents from top businesses in {city} will answer.
        </p>

        {/* Filters */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: MUTED,
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              Service Type
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: `1px solid var(--border)`,
                background: BG3,
                color: FG,
                fontSize: 13,
                fontFamily: "inherit",
              }}
            >
              <option value="">All services</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: MUTED,
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              City
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: `1px solid var(--border)`,
                background: BG3,
                color: FG,
                fontSize: 13,
                fontFamily: "inherit",
              }}
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div style={{ display: "flex", gap: 8, marginBottom: 30 }}>
          <input
            type="text"
            placeholder="e.g., How much for a full day wedding?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: 8,
              border: `1px solid var(--border)`,
              background: BG3,
              color: FG,
              fontSize: 15,
              fontFamily: "inherit",
              outline: "none",
            }}
          />
          <button
            onClick={query}
            disabled={loading || !question.trim()}
            style={{
              padding: "12px 24px",
              borderRadius: 8,
              border: "none",
              background:
                question.trim() && !loading ? YELLOW : "var(--fg3)",
              color: "#121212",
              fontSize: 14,
              fontWeight: 700,
              cursor:
                question.trim() && !loading
                  ? "pointer"
                  : "default",
              fontFamily: "inherit",
            }}
          >
            {loading ? "Asking…" : "Ask"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "rgba(152,170,157,0.15)",
              border: `1px solid ${GREEN}`,
              borderRadius: 8,
              padding: "12px 14px",
              color: GREEN,
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ animation: "fadeIn 0.3s" }}>
            {/* Summary */}
            <div
              style={{
                background: BG2,
                border: `1px solid rgba(255,190,0,0.14)`,
                borderRadius: 12,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    background: GREEN,
                    color: "#121212",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {result.agentCount} AGENTS REPLIED
                </span>
              </div>
              <p style={{ fontSize: 15, color: FG, lineHeight: 1.6, margin: 0 }}>
                {result.answer}
              </p>
            </div>

            {/* Individual agents */}
            {result.agents.length > 0 && (
              <div>
                <h2
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: FG,
                    marginBottom: 12,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Individual Responses
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {result.agents.map((agent, i) => (
                    <div
                      key={i}
                      style={{
                        background: BG3,
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        padding: 16,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                          marginBottom: 8,
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: FG,
                              margin: 0,
                            }}
                          >
                            {agent.name}
                          </p>
                          <p
                            style={{
                              fontSize: 12,
                              color: MUTED,
                              margin: "2px 0 0",
                            }}
                          >
                            {agent.category}
                          </p>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            color: GREEN,
                            fontWeight: 600,
                          }}
                        >
                          {agent.relevance} match
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: 13.5,
                          color: FG,
                          lineHeight: 1.5,
                          margin: 0,
                        }}
                      >
                        {agent.response}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hints */}
        {!result && (
          <div
            style={{
              background: "rgba(152,170,157,0.08)",
              border: `1px solid rgba(152,170,157,0.2)`,
              borderRadius: 12,
              padding: 20,
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 14, color: FG, fontWeight: 600, margin: 0 }}>
              Try asking:
            </p>
            <p style={{ fontSize: 13, color: MUTED, margin: "8px 0 0" }}>
              "How much for a wedding?" • "Do you offer discounts?" • "What's
              your experience?"
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
