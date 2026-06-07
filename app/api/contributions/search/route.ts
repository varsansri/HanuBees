import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Search people's contributions (the consumer-knowledge layer). Public read.
// Token-based ILIKE across the useful fields so "PG in Saibaba Colony" matches
// a contribution about "Amirtha Pg" in "Saibaba Colony". Fresh items only.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "8"), 20);
  if (!q) return NextResponse.json({ count: 0, contributions: [] });

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const stop = new Set(["the", "in", "at", "for", "and", "any", "near", "is", "are", "a", "an", "of", "to", "me", "do", "you", "there", "have"]);
  const tokens = q.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2 && !stop.has(t)).slice(0, 6);
  const terms = tokens.length ? tokens : [q.toLowerCase()];

  const fields = ["place_name", "title", "content", "area", "category", "city"];
  const orExpr = terms
    .flatMap((t) => fields.map((f) => `${f}.ilike.%${t}%`))
    .join(",");

  const { data } = await db
    .from("contributions")
    .select("id, kind, title, content, place_name, city, area, price, rating, lat, lng, valid_until, created_at")
    .eq("status", "active")
    .or(orExpr)
    .order("created_at", { ascending: false })
    .limit(limit * 3);

  const now = Date.now();
  const fresh = (data || [])
    .filter((c) => !c.valid_until || new Date(c.valid_until).getTime() > now)
    .slice(0, limit);

  return NextResponse.json({ count: fresh.length, contributions: fresh });
}
