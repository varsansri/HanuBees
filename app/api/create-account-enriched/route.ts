import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// PARKED ("demo now, real later").
// Self-serve auto-signup needs a real account-ownership model. The previous
// implementation relied on supabase anonymous auth (signUpAnonymously), which is
// not enabled on this project, so it never worked. Until we wire the real claim
// flow, this endpoint returns 501 instead of silently failing.
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      error:
        "Auto account creation isn't enabled yet. Please sign up at /signup for now.",
    },
    { status: 501 }
  );
}
