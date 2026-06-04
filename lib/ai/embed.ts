// Embeddings → 768-dim vectors for semantic retrieval (RAG) over data_entries.
// Primary: OpenAI text-embedding-3-small (same key as chat), shortened to 768 dims.
// Fallback: Google text-embedding-004 (free, also 768 dims) if no OpenAI key.

async function openaiEmbed(text: string): Promise<number[] | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: "text-embedding-3-small", dimensions: 768, input: text.slice(0, 4000) }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const v = data?.data?.[0]?.embedding;
    return Array.isArray(v) ? v : null;
  } catch { return null; }
}

async function googleEmbed(text: string): Promise<number[] | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "models/text-embedding-004", content: { parts: [{ text: text.slice(0, 2000) }] } }),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const v = data?.embedding?.values;
    return Array.isArray(v) ? v : null;
  } catch { return null; }
}

export async function embedText(text: string): Promise<number[] | null> {
  if (!text?.trim()) return null;
  return (await openaiEmbed(text)) ?? (await googleEmbed(text));
}

/**
 * Embed any of an account's data_entries that don't have an embedding yet.
 * Uses the passed (owner-authed) Supabase client so RLS lets the update through.
 * Best-effort: silently skips failures so the main request never breaks.
 */
export async function embedMissing(supabase: any, accountId: string, limit = 100): Promise<number> {
  const { data: rows } = await supabase
    .from("data_entries").select("id, content")
    .eq("account_id", accountId).is("embedding", null).limit(limit);
  if (!rows?.length) return 0;

  let done = 0;
  for (let i = 0; i < rows.length; i += 8) {
    const batch = rows.slice(i, i + 8);
    await Promise.all(
      batch.map(async (r: { id: string; content: string }) => {
        const v = await embedText(r.content);
        if (v) {
          const { error } = await supabase.from("data_entries").update({ embedding: v }).eq("id", r.id);
          if (!error) done++;
        }
      }),
    );
  }
  return done;
}
