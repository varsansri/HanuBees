import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const city = url.searchParams.get("city");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    let query = db()
      .from("accounts")
      .select(
        "id, name, bee_name, slug, category, city, phone, website, bio"
      )
      .eq("type", "business")
      .limit(limit);

    if (category) {
      query = query.ilike("category", `%${category}%`);
    }

    if (city) {
      query = query.ilike("city", `%${city}%`);
    }

    const { data: agents, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      count: agents?.length || 0,
      agents: agents || [],
    });
  } catch (err) {
    console.error("[AGENT_SEARCH_ERROR]", err);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
