import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { embedText } from "@/lib/ai/embed";

export const runtime = "nodejs";
export const maxDuration = 300;

// One-off backfill: embed every data_entry that has no embedding yet.
// Runs in production (where the OpenAI/Gemini key lives). Protect with x-seed-key.
// Run BEFORE re-enabling RLS (anon writes must be open), or set a service-role key.
export async function POST(req: NextRequest) {
  if (req.headers.get("x-seed-key") !== process.env.SEED_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Pull a batch of un-embedded rows
  const { data: rows, error } = await db
    .from("data_entries")
    .select("id, content")
    .is("embedding", null)
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!rows?.length) {
    return NextResponse.json({ done: true, embedded: 0, remaining: 0 });
  }

  let embedded = 0;
  for (let i = 0; i < rows.length; i += 8) {
    const batch = rows.slice(i, i + 8);
    await Promise.all(
      batch.map(async (r: { id: string; content: string }) => {
        const v = await embedText(r.content);
        if (v) {
          const { error: upErr } = await db
            .from("data_entries")
            .update({ embedding: v })
            .eq("id", r.id);
          if (!upErr) embedded++;
        }
      })
    );
  }

  // Report whether another pass is needed
  const { count } = await db
    .from("data_entries")
    .select("*", { count: "exact", head: true })
    .is("embedding", null);

  return NextResponse.json({
    done: (count || 0) === 0,
    embedded,
    remaining: count || 0,
  });
}
