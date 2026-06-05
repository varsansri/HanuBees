import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { llmChat, parseJson, type ChatMsg } from "@/lib/ai/llm";

export const runtime = "nodejs";

const VERTICALS = ["services", "secondhand", "realestate", "rental", "b2b", "transport", "product"];

// Voice/AI listing: owner speaks or types a free description; the LLM turns it into
// one or more structured listings and saves them. ("Just record it" — no forms.)
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { data: account } = await supabase
    .from("accounts").select("id, city").eq("user_id", user.id).maybeSingle();
  if (!account) return NextResponse.json({ error: "no_account" }, { status: 200 });

  const text = String((await req.json().catch(() => ({})))?.text || "").trim();
  if (!text) return NextResponse.json({ error: "Say or type what you're listing" }, { status: 400 });

  const sys = `You turn a business owner's free description (often voice) into structured listings.
A message may describe ONE or SEVERAL items/properties/services. Extract each as a listing.
vertical must be exactly one of: services, secondhand, realestate, rental, b2b, transport, product.
- realestate = property for SALE; rental = anything rented (homes, gear, vehicles by time).
- secondhand = used goods for sale; services = a service/skill offered; transport = moving goods.
price = a number in rupees if stated, else null. area = locality if stated, else null.
title = short (max ~8 words). description = the useful details, cleaned up.
Never invent prices or facts that weren't said.

Respond with ONLY JSON (no markdown):
{"listings":[{"vertical":"...","title":"...","price":<number|null>,"area":<string|null>,"description":"..."}],"note":"one short line on what you captured or what's missing"}`;

  const msgs: ChatMsg[] = [{ role: "system", content: sys }, { role: "user", content: text }];
  const { text: out, error } = await llmChat(msgs, { maxTokens: 700, temperature: 0.2 });
  if (error) return NextResponse.json({ error }, { status: 500 });

  const parsed = parseJson<{ listings?: any[]; note?: string }>(out);
  const items = Array.isArray(parsed?.listings) ? parsed!.listings : [];
  const rows = items
    .filter((l) => l?.title)
    .map((l) => ({
      account_id: account.id,
      vertical: VERTICALS.includes(l.vertical) ? l.vertical : "product",
      title: String(l.title).slice(0, 140),
      description: l.description ? String(l.description).slice(0, 1000) : null,
      price: l.price == null || l.price === "" ? null : Number(l.price),
      area: l.area ? String(l.area).slice(0, 80) : (account.city ? null : null),
    }));

  if (!rows.length) {
    return NextResponse.json({ created: 0, note: parsed?.note || "I couldn't find a clear item to list — try naming the item, price, and area." });
  }

  const { data: inserted, error: insErr } = await supabase
    .from("listings").insert(rows).select();
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  return NextResponse.json({
    created: inserted?.length || 0,
    listings: inserted || [],
    note: parsed?.note || `Added ${inserted?.length || 0} listing(s).`,
  });
}
