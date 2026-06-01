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
        username    = p?.username || "";
        content     = post.content || "";
        tags        = post.tags || [];
      }
    } catch {}
  }

  const preview = content.length > 240 ? content.slice(0, 240) + "…" : content;
  const initial  = displayName[0]?.toUpperCase() || "?";

  // Load real bee logo from public folder
  const logoUrl = new URL("/bee.png", request.url).href;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#121212",
          display: "flex",
          flexDirection: "column",
          padding: "44px 56px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Yellow top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: "#ffbe00", display: "flex" }} />
        {/* Green bottom bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 5, background: "#98aa9d", display: "flex" }} />

        {/* Top row: wordmark left, logo right */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 44 }}>
          <span style={{ color: "#eaeaea", fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em" }}>
            Hanubees
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt="Hanubees" width={64} height={64} style={{ objectFit: "contain" }} />
        </div>

        {/* Author row — bolder, tighter */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "#242424",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 900, color: "#eaeaea",
            border: "2.5px solid rgba(255,190,0,0.35)",
          }}>
            {initial}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ color: "#eaeaea", fontSize: 21, fontWeight: 900, letterSpacing: "-0.02em" }}>
              {displayName}
            </span>
            {username && (
              <span style={{ color: "#a9a9a7", fontSize: 15, fontWeight: 600 }}>
                @{username}
              </span>
            )}
          </div>
        </div>

        {/* Content — bold, tight line-height */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p style={{
            color: "#eaeaea",
            fontSize: 28,
            lineHeight: 1.4,
            fontWeight: 700,
            margin: 0,
            letterSpacing: "-0.01em",
          }}>
            {preview}
          </p>

          {tags.length > 0 && (
            <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
              {tags.slice(0, 4).map(t => (
                <span key={t} style={{
                  color: "#98aa9d", fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em",
                }}>#{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: 28, paddingTop: 18,
          borderTop: "1px solid rgba(234,234,234,0.1)",
        }}>
          <span style={{ color: "#a9a9a7", fontSize: 15, fontWeight: 700 }}>hanubees.com</span>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#ffbe00" }} />
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#98aa9d" }} />
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
