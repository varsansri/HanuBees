import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Businesses with coordinates for the map (public read). Optional ?category= filter.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const city = url.searchParams.get("city") || "Coimbatore";
  const category = url.searchParams.get("category");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "2000"), 2000);

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  let q = db
    .from("accounts")
    .select("name, slug, bee_name, category, phone, lat, lng, location")
    .eq("type", "business")
    .ilike("city", `%${city}%`)
    .not("lat", "is", null)
    .limit(limit);

  if (category) {
    const c = category.trim();
    q = q.or(`category.ilike.%${c}%,name.ilike.%${c}%`);
  }

  const { data } = await q;
  return NextResponse.json({ city, category: category || null, count: data?.length || 0, businesses: data || [] });
}
