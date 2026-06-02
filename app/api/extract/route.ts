import { NextRequest, NextResponse } from "next/server";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

function detectPlatform(url: string): "youtube" | "instagram" | "unknown" {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("instagram.com") || url.includes("instagr.am")) return "instagram";
  return "unknown";
}

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0];
    return null;
  } catch { return null; }
}

// ── YouTube ─────────────────────────────────────────────────────────────────
async function fetchYouTube(videoId: string) {
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, { headers: HEADERS });
  const html = await res.text();

  const title = html.match(/<meta name="title" content="([^"]+)"/)?.[1]
    ?? html.match(/<title>([^<]+)<\/title>/)?.[1]?.replace(" - YouTube", "") ?? "";
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1] ?? "";
  const channelName = html.match(/"ownerChannelName":"([^"]+)"/)?.[1]
    ?? html.match(/"author":"([^"]+)"/)?.[1] ?? "";

  let transcript = "";
  try {
    const playerMatch = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/);
    if (playerMatch) {
      const playerData = JSON.parse(playerMatch[1]);
      const captions = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      if (captions?.length > 0) {
        const captionRes = await fetch(captions[0].baseUrl + "&fmt=json3");
        if (captionRes.ok) {
          const captionData = await captionRes.json();
          transcript = (captionData?.events ?? [])
            .filter((e: any) => e.segs)
            .map((e: any) => e.segs.map((s: any) => s.utf8 ?? "").join(""))
            .join(" ").replace(/\s+/g, " ").trim().slice(0, 10000);
        }
      }
    }
  } catch {}

  return { title, description, channelName, transcript, platform: "youtube" };
}

// ── Instagram ────────────────────────────────────────────────────────────────
async function fetchInstagram(url: string) {
  const res = await fetch(url, { headers: HEADERS });
  const html = await res.text();

  const ogTitle       = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] ?? "";
  const ogDescription = html.match(/<meta property="og:description" content="([^"]+)"/)?.[1] ?? "";

  // Video URL from og:video tags
  const videoUrl = html.match(/<meta property="og:video:secure_url" content="([^"]+)"/)?.[1]
    ?? html.match(/<meta property="og:video" content="([^"]+)"/)?.[1] ?? "";

  // Creator name
  const usernameFromUrl = url.match(/instagram\.com\/([^/?]+)\//)?.[1];
  const skipWords = ["p", "reel", "tv", "stories", "explore"];
  const urlUsername = usernameFromUrl && !skipWords.includes(usernameFromUrl) ? usernameFromUrl : "";
  const titleUsername = ogTitle.match(/^(.+?)\s+(?:on Instagram|•)/i)?.[1] ?? "";
  const channelName = urlUsername || titleUsername || "Instagram Creator";

  const isBlocked = html.includes("Log in to Instagram") || html.includes("login_required");

  let transcript = "";

  // Try to download video and transcribe with Gemini
  if (videoUrl && !isBlocked) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const videoRes = await fetch(videoUrl, {
        headers: { ...HEADERS, "Range": "bytes=0-15728639" }, // max 15MB
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (videoRes.ok || videoRes.status === 206) {
        const buffer = await videoRes.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const mimeType = videoRes.headers.get("content-type")?.split(";")[0] || "video/mp4";

        // Send to Gemini for transcription
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: "Transcribe all spoken words in this video exactly as said. Return only the transcription, no intro text." },
                  { inline_data: { mime_type: mimeType, data: base64 } },
                ],
              }],
              generationConfig: { maxOutputTokens: 2048 },
            }),
          }
        );
        const geminiData = await geminiRes.json();
        const transcribed = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
        if (transcribed) transcript = transcribed;
      }
    } catch {}
  }

  // Fall back to caption text if transcription failed
  const caption = ogDescription.replace(/^.+?:\s*"?/, "").replace(/"$/, "").trim();

  return {
    title: ogTitle,
    description: caption,
    channelName,
    transcript: transcript || caption,
    platform: "instagram",
    isBlocked,
    usedTranscript: !!transcript,
  };
}

// ── Gemini key points ────────────────────────────────────────────────────────
async function extractKeyPoints(title: string, content: string, channelName: string, platform: string): Promise<string[]> {
  const source = content.slice(0, 6000) || title;
  const prompt = `Extract 6-10 key insights from this ${platform} content. Specific and concise. Return ONLY a JSON array of strings, no other text.

Creator: ${channelName}
Title: ${title}
Content: ${source}

Output: ["insight 1", "insight 2", ...]`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 600, temperature: 0.2 },
        }),
      }
    );
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "[]";
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [title];
  } catch {
    return [title || "Content saved"];
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url?.trim()) return NextResponse.json({ error: "No URL provided" }, { status: 400 });

  const platform = detectPlatform(url);
  if (platform === "unknown") {
    return NextResponse.json({ error: "Paste a YouTube or Instagram link" }, { status: 400 });
  }

  try {
    let meta: any;

    if (platform === "youtube") {
      const videoId = extractYouTubeId(url);
      if (!videoId) return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
      meta = await fetchYouTube(videoId);
    } else {
      meta = await fetchInstagram(url);
      if (meta.isBlocked && !meta.transcript) {
        return NextResponse.json({ error: "This Instagram post requires login. Try a public reel." }, { status: 400 });
      }
    }

    const content = meta.transcript || meta.description;
    const keyPoints = await extractKeyPoints(meta.title, content, meta.channelName, meta.platform);

    return NextResponse.json({
      url,
      title: meta.title,
      channelName: meta.channelName,
      platform: meta.platform,
      keyPoints,
      hasTranscript: !!meta.transcript,
    });

  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Extraction failed" }, { status: 500 });
  }
}
