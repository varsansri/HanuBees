import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Attach coordinates to an existing contribution — used when we couldn't pin the
// place ourselves and the contributor agrees to share their present location.
export async function POST(req: NextRequest) {
  const admin = adminClient();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 500 });

  const body = await req.json().catch(() => ({}));
  const id = String(body?.id || "").trim();
  const lat = Number(body?.lat);
  const lng = Number(body?.lng);
  if (!id || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "id, lat, lng required" }, { status: 400 });
  }

  const { error } = await admin.from("contributions").update({ lat, lng }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
