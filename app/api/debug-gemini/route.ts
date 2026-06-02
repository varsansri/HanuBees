import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
  );
  const data = await res.json();
  const names = (data.models || []).map((m: any) => m.name);
  return NextResponse.json({ status: res.status, models: names, error: data.error });
}
