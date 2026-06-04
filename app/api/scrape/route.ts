import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { llmChat, parseJson } from "@/lib/ai/llm";
import { embedMissing } from "@/lib/ai/embed";

export const runtime = "nodejs";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 9000);
}

export async function POST(req: NextRequest) {
  const { url, text } = await req.json().catch(() => ({}));
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: account } = await supabase
    .from("accounts").select("id, name, category").eq("user_id", user.id).maybeSingle();
  if (!account) return NextResponse.json({ error: "no_account" }, { status: 400 });

  // Gather source material: pasted text + (best-effort) page fetch
  let source = (text ?? "").toString();
  const link = (url ?? "").toString().trim() || (source.match(/https?:\/\/[^\s]+/)?.[0] ?? "");
  if (link) {
    try {
      const res = await fetch(link, { headers: HEADERS });
      if (res.ok) source += "\n\n" + htmlToText(await res.text());
    } catch { /* fall back to pasted text only */ }
  }

  source = source.trim();
  if (source.length < 12) {
    return NextResponse.json({ error: "Add a website link or a few words about your business." }, { status: 400 });
  }

  const sys = `Extract structured facts about a business that customers commonly ask about, from the raw text below.
Business name: ${account.name}${account.category ? ` (${account.category})` : ""}

Produce concise, standalone facts (services offered, pricing, hours, location/areas served, contact, policies, what makes them special, FAQs).
Tag each: pricing, hours, services, location, contact, policy, faq, about, other.
Mark visibility "public" (customers can see) unless it's clearly internal.

Raw text:
${source}

Respond with ONLY this JSON (no markdown):
{"entries":[{"content":"...","tag":"...","visibility":"public"}]}`;

  const { text: out, error } = await llmChat(
    [{ role: "system", content: sys }, { role: "user", content: "Extract the facts now." }],
    { maxTokens: 1200, temperature: 0.2 },
  );
  if (error) return NextResponse.json({ error }, { status: 500 });

  const parsed = parseJson<{ entries: any[] }>(out);
  const entries = Array.isArray(parsed?.entries) ? parsed!.entries : [];
  if (!entries.length) return NextResponse.json({ error: "Couldn't extract anything — try adding more detail." }, { status: 200 });

  const rows = entries
    .filter((e) => e?.content)
    .slice(0, 60)
    .map((e) => ({
      account_id: account.id,
      content: String(e.content).slice(0, 2000),
      tag: e.tag ?? "other",
      visibility: e.visibility === "private" ? "private" : "public",
      source: "scrape",
    }));

  const { error: insErr } = await supabase.from("data_entries").insert(rows);
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  await embedMissing(supabase, account.id);
  return NextResponse.json({ stored: rows.length });
}
