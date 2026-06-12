import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM = `You are a nutrition expert specialised in INDIAN food. You receive one photo of a meal and estimate its nutrition.

Indian food is your speciality. Correctly recognise dishes like idli, dosa, vada, poha, upma, sambar, rasam, chutney (coconut/tomato/mint), dal (tadka/fry), sabzi/curry, paneer dishes, roti/chapati/nana/paratha, rice (plain/jeera/biryani/pulao), curd/raita, pickle, papad, sweets (gulab jamun, halwa, kheer), and South-Indian thalis. Account for typical Indian cooking: ghee/oil tempering, coconut, cream in gravies, sugar in sweets.

Rules:
- Identify EACH distinct item on the plate separately with a realistic portion (e.g. "2 idli", "1 katori sambar", "1 tbsp coconut chutney").
- Estimate calories and macros per item using standard Indian portion sizes (katori, piece, tbsp).
- Sum items into a total. Numbers must be internally consistent (sum of items ≈ total).
- If the photo is not food, return confidence "low", empty items, zero totals, and say so in notes.
- Be realistic, not optimistic. Indian gravies and tiffin items carry oil/ghee.

Respond with ONLY valid JSON, no markdown, in exactly this shape:
{
  "dish": "short name of the overall meal",
  "cuisine": "e.g. South Indian, North Indian, Indian",
  "confidence": "high" | "medium" | "low",
  "items": [
    { "name": "string", "quantity": "string", "calories": number, "protein_g": number, "carbs_g": number, "fiber_g": number, "fat_g": number }
  ],
  "total": { "calories": number, "protein_g": number, "carbs_g": number, "fiber_g": number, "fat_g": number },
  "notes": "one short helpful line (portion/oil caveat or a tip)"
}`;

const USER_TEXT =
  "Analyse this meal photo. Identify every Indian dish/item, estimate portions, and return the JSON nutrition breakdown.";

export async function POST(req: NextRequest) {
  let image: string;
  try {
    const body = await req.json();
    image = body.image;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!image || typeof image !== "string" || !image.startsWith("data:image")) {
    return NextResponse.json({ error: "Please attach a food photo." }, { status: 400 });
  }

  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const geminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)?.trim();

  try {
    if (openaiKey) {
      const data = await viaOpenAI(image, openaiKey);
      return NextResponse.json(normalize(data));
    }
    if (geminiKey) {
      const data = await viaGemini(image, geminiKey);
      return NextResponse.json(normalize(data));
    }
    return NextResponse.json(
      { error: "AI vision is not configured yet. Add an OPENAI_API_KEY (or GEMINI_API_KEY) in the environment." },
      { status: 503 },
    );
  } catch (err) {
    console.error("analyze error", err);
    const msg = err instanceof Error ? err.message : "Analysis failed.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

async function viaOpenAI(image: string, key: string) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: USER_TEXT },
            { type: "image_url", image_url: { url: image, detail: "high" } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI ${res.status}: ${t.slice(0, 160)}`);
  }
  const json = await res.json();
  const content = json.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(content);
}

async function viaGemini(image: string, key: string) {
  const [, meta, b64] = image.match(/^data:(image\/[^;]+);base64,(.*)$/) || [];
  if (!b64) throw new Error("Bad image data.");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [
          {
            role: "user",
            parts: [
              { text: USER_TEXT },
              { inline_data: { mime_type: meta, data: b64 } },
            ],
          },
        ],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
      }),
    },
  );
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Gemini ${res.status}: ${t.slice(0, 160)}`);
  }
  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  return JSON.parse(text);
}

// Defensive: coerce shape + numbers so the UI never crashes.
function normalize(d: any) {
  const num = (v: any) => (typeof v === "number" && isFinite(v) ? v : Number(v) || 0);
  const items = Array.isArray(d?.items)
    ? d.items.map((it: any) => ({
        name: String(it?.name ?? "Item"),
        quantity: String(it?.quantity ?? ""),
        calories: num(it?.calories),
        protein_g: num(it?.protein_g),
        carbs_g: num(it?.carbs_g),
        fiber_g: num(it?.fiber_g),
        fat_g: num(it?.fat_g),
      }))
    : [];

  const sum = (k: string) => items.reduce((a: number, it: any) => a + num(it[k]), 0);
  const total = d?.total ?? {};
  const conf = ["high", "medium", "low"].includes(d?.confidence) ? d.confidence : "medium";

  return {
    dish: String(d?.dish ?? "Your meal"),
    cuisine: String(d?.cuisine ?? "Indian"),
    confidence: conf,
    items,
    total: {
      calories: num(total.calories) || sum("calories"),
      protein_g: num(total.protein_g) || sum("protein_g"),
      carbs_g: num(total.carbs_g) || sum("carbs_g"),
      fiber_g: num(total.fiber_g) || sum("fiber_g"),
      fat_g: num(total.fat_g) || sum("fat_g"),
    },
    notes: String(d?.notes ?? ""),
  };
}
