import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { enrichmentCache } from "../search-business/route";
import { analytics } from "@/lib/analytics";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function uniqueSlug(base: string) {
  let slug = base || "business";
  for (let i = 0; i < 6; i++) {
    const { data } = await supabase
      .from("accounts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    slug = `${base}-${Math.random().toString(36).slice(2, 5)}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function POST(req: NextRequest) {
  try {
    const { uuid } = await req.json();

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

    const enrichedData = cached.data;

    // Create anonymous user (no email/password needed)
    const { data: authData, error: authError } =
      await supabase.auth.signUpAnonymously();

    if (authError || !authData.user) {
      console.error("[AUTH_ERROR]", authError);
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // Generate bee name from business name
    const baseBee = enrichedData.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 10) || "bee";
    let beeName = baseBee;

    // Check if bee name is taken
    for (let i = 0; i < 5; i++) {
      const { data: existing } = await supabase
        .from("accounts")
        .select("id")
        .eq("bee_name", beeName)
        .maybeSingle();
      if (!existing) break;
      beeName = `${baseBee}${Math.random().toString(36).slice(2, 4)}`;
    }

    // Create account
    const slug = await uniqueSlug(
      slugify(enrichedData.businessName)
    );

    const { data: account, error: accError } = await supabase
      .from("accounts")
      .insert({
        user_id: userId,
        type: "business",
        name: enrichedData.businessName,
        slug,
        bee_name: beeName,
        category: enrichedData.maps.services || null,
        city: enrichedData.location,
        phone: enrichedData.maps.phone,
        website: enrichedData.maps.website,
        bio: enrichedData.richContext
          .find((r: any) => r.tag === "about")
          ?.content?.slice(0, 160),
      })
      .select()
      .maybeSingle();

    if (accError || !account) {
      console.error("[ACCOUNT_ERROR]", accError);
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      );
    }

    // Store LIVE FACTS (structured)
    const liveFacts = enrichedData.liveFacts.map((fact: any) => ({
      account_id: account.id,
      content: fact.content,
      is_live_fact: true,
      info_type: fact.type,
      effective_date: new Date().toISOString().split("T")[0],
      visibility: "public" as const,
    }));

    if (liveFacts.length > 0) {
      const { error: liveErr } = await supabase
        .from("data_entries")
        .insert(liveFacts);
      if (liveErr) {
        console.error("[LIVE_FACTS_ERROR]", liveErr);
      }
    }

    // Store RICH CONTEXT (semantic)
    const richContext = enrichedData.richContext.map(
      (item: any) => ({
        account_id: account.id,
        content: item.content,
        tag: item.tag,
        is_live_fact: false,
        visibility: "public" as const,
      })
    );

    if (richContext.length > 0) {
      const { error: richErr } = await supabase
        .from("data_entries")
        .insert(richContext);
      if (richErr) {
        console.error("[RICH_CONTEXT_ERROR]", richErr);
      }
    }

    // Generate session token for auto-login
    const { data: session, error: sessionErr } =
      await supabase.auth.getSession();

    // Clean up cache
    enrichmentCache.delete(uuid);

    // Track event
    analytics.onboardingCompleted("business");

    return NextResponse.json({
      token: session?.session?.access_token || "",
      accountId: account.id,
      beeName,
    });
  } catch (err) {
    console.error("[CREATE_ACCOUNT_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
