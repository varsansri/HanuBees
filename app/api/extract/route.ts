import { NextRequest, NextResponse } from "next/server";

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0];
    return null;
  } catch { return null; }
}

async function fetchYouTubeMeta(videoId: string) {
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
  });
  const html = await res.text();

  const title = html.match(/<meta name="title" content="([^"]+)"/)?.[1]
    ?? html.match(/<title>([^<]+)<\/title>/)?.[1]?.replace(" - YouTube", "") ?? "";
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1] ?? "";
  const channelName = html.match(/"ownerChannelName":"([^"]+)"/)?.[1]
    ?? html.match(/"author":"([^"]+)"/)?.[1] ?? "";
  const channelImage = html.match(/"authorThumbnail":\{"thumbnails":\[\{"url":"([^"]+)"/)?.[1] ?? "";

  let transcript = "";
  try {
    const playerMatch = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/);
    if (playerMatch) {
      const playerData = JSON.parse(playerMatch[1]);
      const captions = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      if (captions?.length > 0) {
        const captionUrl = captions[0].baseUrl + "&fmt=json3";
        const captionRes = await fetch(captionUrl);
        if (captionRes.ok) {
          const captionData = await captionRes.json();
          transcript = (captionData?.events ?? [])
            .filter((e: any) => e.segs)
            .map((e: any) => e.segs.map((s: any) => s.utf8 ?? "").join(""))
            .join(" ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 10000);
        }
      }
    }
  } catch {}

  return { title, description, channelName, channelImage, transcript };
}

async function extractKeyPoints(title: string, description: string, channelName: string, transcript: string): Promise<string[]> {
  const source = transcript || description;
  const prompt = `Extract 6-10 key insights from this YouTube content. Be specific and concise. Return ONLY a JSON array of strings, no other text.

Title: ${title}
Channel: ${channelName}
${transcript ? "Transcript" : "Description"}: ${source.slice(0, 6000)}

Output format: ["insight 1", "insight 2", ...]`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    const clean = text.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed) ? parsed : [title];
  } catch {
    return title ? [title] : ["Content saved"];
  }
}

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url?.trim()) return NextResponse.json({ error: "No URL" }, { status: 400 });

  const videoId = extractVideoId(url);
  if (!videoId) return NextResponse.json({ error: "Not a valid YouTube URL. Paste a youtube.com or youtu.be link." }, { status: 400 });

  try {
    const { title, description, channelName, channelImage, transcript } = await fetchYouTubeMeta(videoId);
    const keyPoints = await extractKeyPoints(title, description, channelName, transcript);

    return NextResponse.json({
      url,
      title,
      channelName,
      channelImage,
      platform: "youtube",
      keyPoints,
      hasTranscript: !!transcript,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Extraction failed" }, { status: 500 });
  }
}
