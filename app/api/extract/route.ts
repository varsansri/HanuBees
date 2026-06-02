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
  const avatarUrl = html.match(/channelThumbnailWithLinkRenderer[^}]{0,300}"url":"(https:\/\/yt[^"]+)"/)?.[1]
    ?? html.match(/"avatar":\{"thumbnails":\[\{"url":"(https:\/\/yt[^"]+)"/)?.[1]
    ?? "";

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

  return { title, description, channelName, avatarUrl, transcript, platform: "youtube" };
}

// ── Instagram ────────────────────────────────────────────────────────────────
async function fetchInstagram(url: string) {
  const res = await fetch(url, { headers: HEADERS });
  const html = await res.text();

  const isBlocked = html.includes("Log in to Instagram") || html.includes("login_required") || html.includes("LoginAndSignupPage");

  const ogTitle       = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] ?? "";
  const ogDescription = html.match(/<meta property="og:description" content="([^"]+)"/)?.[1] ?? "";

  const usernameFromUrl = url.match(/instagram\.com\/([^/?]+)\//)?.[1];
  const skipWords = ["p", "reel", "tv", "stories", "explore"];
  const urlUsername = usernameFromUrl && !skipWords.includes(usernameFromUrl) ? usernameFromUrl : "";
  const titleUsername = ogTitle.match(/^(.+?)\s+(?:on Instagram|•)/i)?.[1] ?? "";
  const channelName = urlUsername || titleUsername || "Instagram";

  const caption = ogDescription.replace(/^.+?:\s*"?/, "").replace(/"$/, "").trim();

  return {
    title: ogTitle || `Instagram post by ${channelName}`,
    description: caption,
    channelName,
    transcript: caption,
    platform: "instagram",
    isBlocked,
    avatarUrl: "",
  };
}

// ── Cerebras ──────────────────────────────────────────────────────────────────
async function geminiCall(prompt: string, maxTokens = 600): Promise<{ text: string; error?: string }> {
  const res = await fetch(
    `https://api.cerebras.ai/v1/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.CEREBRAS_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-oss-120b",
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.2,
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) return { text: "", error: data?.message ?? `Cerebras HTTP ${res.status}` };
  const text = data.choices?.[0]?.message?.content?.trim() ?? "";
  return { text };
}

async function generateSummaryAndPoints(title: string, content: string, channelName: string, platform: string) {
  const source = (content || title).slice(0, 8000);

  const prompt = `You are summarizing a ${platform} video for a knowledge base card.

Creator: ${channelName}
Title: ${title}
Transcript/Content: ${source}

Return ONLY valid JSON in this exact format, nothing else:
{
  "summary": "3-4 sentence plain text summary covering what this is about, the main argument, and the key takeaway",
  "points": ["concise insight 1", "concise insight 2", "concise insight 3", "concise insight 4", "concise insight 5"]
}`;

  const { text, error } = await geminiCall(prompt, 800);

  try {
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
    return {
      summary: parsed.summary || "",
      keyPoints: Array.isArray(parsed.points) ? parsed.points : [],
      geminiError: error,
    };
  } catch {
    return { summary: "", keyPoints: [], geminiError: error || "JSON parse failed. Raw: " + text.slice(0, 200) };
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
      if (meta.isBlocked || !meta.transcript) {
        return NextResponse.json({ error: "Instagram blocked this request. Only public posts with captions work — try a different public reel." }, { status: 400 });
      }
    }

    const content = meta.transcript || meta.description;
    if (!content) {
      return NextResponse.json({ error: "Could not get any content from this link" }, { status: 400 });
    }

    const { summary, keyPoints, geminiError } = await generateSummaryAndPoints(meta.title, content, meta.channelName, meta.platform);

    if (!summary) {
      return NextResponse.json({ error: "AI failed: " + (geminiError || "empty response") }, { status: 500 });
    }

    return NextResponse.json({
      url,
      title: meta.title,
      channelName: meta.channelName,
      platform: meta.platform,
      avatarUrl: meta.avatarUrl ?? "",
      transcript: content,
      keyPoints,
      summary,
    });

  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Extraction failed" }, { status: 500 });
  }
}
