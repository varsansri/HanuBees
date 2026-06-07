import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Active, located, still-fresh contributions for the map (public read).
// Perishable items past their valid_until are excluded so the map stays current.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const city = url.searchParams.get("city");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "1000"), 1000);

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  let q = db
    .from("contributions")
    .select("id, kind, title, content, place_name, city, area, price, lat, lng, valid_until, created_at")
    .eq("status", "active")
    .not("lat", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (city) q = q.ilike("city", `%${city}%`);

  const { data } = await q;
  const now = Date.now();
  const fresh = (data || []).filter((c) => !c.valid_until || new Date(c.valid_until).getTime() > now);
  return NextResponse.json({ count: fresh.length, contributions: fresh });
}
