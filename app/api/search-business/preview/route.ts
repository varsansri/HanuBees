import { NextRequest, NextResponse } from "next/server";
import { enrichmentCache } from "../route";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const uuid = url.searchParams.get("uuid");

  if (!uuid) {
    return NextResponse.json(
      { error: "UUID required" },
      { status: 400 }
    );
  }

  const cached = enrichmentCache.get(uuid);
  if (!cached) {
    return NextResponse.json(
      { error: "Enrichment expired — search again" },
      { status: 404 }
    );
  }

  return NextResponse.json(cached.data);
}
