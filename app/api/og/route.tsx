import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  let displayName = "Hanubees";
  let username = "";
  let content = "Your health journey, shared.";
  let tags: string[] = [];

  if (id) {
    try {
      const supabase = await createClient();
      const { data: post } = await supabase
        .from("posts")
        .select("content, tags, profiles(display_name, username)")
        .eq("id", id)
        .single();

      if (post) {
        const p = post.profiles as unknown as { display_name: string; username: string };
        displayName = p?.display_name || "Anonymous";
        username = p?.username || "";
        content = post.content || "";
        tags = post.tags || [];
      }
    } catch {}
  }

  const preview = content.length > 220 ? content.slice(0, 220) + "…" : content;
  const initial = displayName[0]?.toUpperCase() || "?";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#121212",
          display: "flex",
          flexDirection: "column",
          padding: "48px 56px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Top yellow accent bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 4, background: "#ffbe00", display: "flex",
        }} />

        {/* Bottom green accent bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: 4, background: "#98aa9d", display: "flex",
        }} />

        {/* Header: logo + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <div style={{
            width: 42, height: 42, background: "#ffbe00",
            borderRadius: 12, display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 900,
          }}>🐝</div>
          <span style={{ color: "#eaeaea", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Hanubees
          </span>
        </div>

        {/* Author row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "#242424",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 700, color: "#eaeaea",
            border: "2px solid rgba(255,190,0,0.3)",
          }}>
            {initial}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#eaeaea", fontSize: 19, fontWeight: 700 }}>
              {displayName}
            </span>
            {username && (
              <span style={{ color: "#a9a9a7", fontSize: 15, marginTop: 2 }}>
                @{username}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
        }}>
          <p style={{
            color: "#eaeaea", fontSize: 26, lineHeight: 1.55,
            fontWeight: 400, margin: 0,
          }}>
            {preview}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              {tags.slice(0, 4).map(t => (
                <span key={t} style={{
                  color: "#98aa9d", fontSize: 17, fontWeight: 600,
                }}>#{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: 32,
          paddingTop: 20,
          borderTop: "1px solid rgba(234,234,234,0.08)",
        }}>
          <span style={{ color: "#a9a9a7", fontSize: 15 }}>hanubees.com</span>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffbe00" }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#98aa9d" }} />
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
