import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Businesses with coordinates for the map (public read).
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const city = url.searchParams.get("city") || "Coimbatore";
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await db
    .from("accounts")
    .select("name, slug, bee_name, category, phone, lat, lng, location")
    .eq("type", "business")
    .ilike("city", `%${city}%`)
    .not("lat", "is", null)
    .limit(2000);
  return NextResponse.json({ city, count: data?.length || 0, businesses: data || [] });
}
