// LLM chat with provider fallback.
// Primary: OpenAI (set OPENAI_API_KEY) — prepaid, one key for chat + embeddings.
//   Model default gpt-4o-mini (override via OPENAI_MODEL).
// Fallback: Cerebras free tier (gpt-oss-120b → llama-3.3-70b).
// Keys are Vercel env vars — never hardcode or paste in chat.

export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const CEREBRAS_URL = "https://api.cerebras.ai/v1/chat/completions";
const CEREBRAS_MODELS = ["gpt-oss-120b", "llama-3.3-70b"];

async function callChat(
  url: string, key: string, model: string, messages: ChatMsg[],
  maxTokens: number, temperature: number,
): Promise<{ ok: boolean; text: string; retry: boolean; error: string }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }),
    });
    if (res.status === 429 || res.status >= 500) {
      return { ok: false, text: "", retry: true, error: `busy (HTTP ${res.status})` };
    }
    const data = await res.json();
    if (!res.ok) return { ok: false, text: "", retry: false, error: data?.error?.message ?? data?.message ?? `HTTP ${res.status}` };
    const text = data.choices?.[0]?.message?.content?.trim() ?? "";
    return { ok: !!text, text, retry: false, error: text ? "" : "empty response" };
  } catch (e: any) {
    return { ok: false, text: "", retry: true, error: e?.message ?? "request failed" };
  }
}

export async function llmChat(
  messages: ChatMsg[],
  opts: { maxTokens?: number; temperature?: number } = {},
): Promise<{ text: string; error?: string }> {
  const maxTokens = opts.maxTokens ?? 700;
  const temperature = opts.temperature ?? 0.3;
  let lastErr = "No LLM provider configured";

  // 1) OpenAI (preferred when configured)
  const oaKey = process.env.OPENAI_API_KEY;
  if (oaKey) {
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    for (let attempt = 0; attempt < 2; attempt++) {
      const r = await callChat(OPENAI_URL, oaKey, model, messages, maxTokens, temperature);
      if (r.ok) return { text: r.text };
      lastErr = r.error;
      if (!r.retry) break;
      await sleep(500 * (attempt + 1));
    }
  }

  // 2) Cerebras free fallback
  const cbKey = process.env.CEREBRAS_API_KEY;
  if (cbKey) {
    for (const model of CEREBRAS_MODELS) {
      for (let attempt = 0; attempt < 2; attempt++) {
        const r = await callChat(CEREBRAS_URL, cbKey, model, messages, maxTokens, temperature);
        if (r.ok) return { text: r.text };
        lastErr = r.error;
        if (!r.retry) break;
        await sleep(400 * (attempt + 1));
      }
    }
  }

  return { text: "", error: lastErr };
}

/** Best-effort JSON extraction from a model reply (handles ```json fences). */
export function parseJson<T>(text: string): T | null {
  try {
    return JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim()) as T;
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]) as T; } catch { /* noop */ } }
    return null;
  }
}
