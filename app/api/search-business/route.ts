import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

// Temp storage for enriched data (in-memory, 10min TTL)
const enrichmentCache = new Map<
  string,
  { data: any; timestamp: number }
>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of enrichmentCache.entries()) {
    if (now - value.timestamp > 10 * 60 * 1000) {
      enrichmentCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

async function searchGoogleMaps(name: string, city: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    // Fallback mock data for testing
    return {
      hours: "Mon-Sun, 9am-6pm",
      phone: "+61 2 1234 5678",
      address: `123 Main St, ${city}`,
      website: `https://www.${name.toLowerCase().replace(/\s+/g, "")}.com`,
      services: "Photography, videography, events",
      rating: "4.8 (127 reviews)",
    };
  }

  try {
    const searchQuery = encodeURIComponent(`${name} ${city}`);
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery}&key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    const place = data.results[0];
    const details = await getPlaceDetails(place.place_id, apiKey);

    return {
      hours: details.opening_hours?.weekday_text?.join("\n") || "Hours not available",
      phone: details.formatted_phone_number || "Phone not listed",
      address: details.formatted_address || place.formatted_address || "",
      website: details.website || "",
      services: place.types?.join(", ") || "",
      rating: details.rating
        ? `${details.rating} (${details.user_ratings_total} reviews)`
        : "No rating",
    };
  } catch (err) {
    console.error("[GOOGLE_MAPS_ERROR]", err);
    return null;
  }
}

async function getPlaceDetails(placeId: string, apiKey: string) {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=opening_hours,formatted_phone_number,website,formatted_address,rating,user_ratings_total&key=${apiKey}`;
    const res = await fetch(url);
    return await res.json();
  } catch {
    return {};
  }
}

async function scrapeWebsite(url: string) {
  if (!url) return [];

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return [];

    const html = await res.text();

    // Simple extraction: look for common pricing/service patterns
    const richFacts = [];

    // Look for pricing info
    const priceMatch = html.match(
      /\$([\d,]+(?:\.\d{2})?)/g
    );
    if (priceMatch) {
      richFacts.push({
        tag: "pricing",
        content: `Found pricing: ${priceMatch.slice(0, 3).join(", ")}`,
      });
    }

    // Look for "about" text (first 200 chars of main content)
    const aboutMatch = html.match(
      /<p[^>]*>([^<]{50,200})<\/p>/
    );
    if (aboutMatch) {
      richFacts.push({
        tag: "about",
        content: aboutMatch[1].trim(),
      });
    }

    return richFacts;
  } catch (err) {
    console.error("[WEBSITE_SCRAPE_ERROR]", err);
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, city } = await req.json();

    if (!name || !city) {
      return NextResponse.json(
        { error: "Business name and city required" },
        { status: 400 }
      );
    }

    // Search Google Maps
    const mapsData = await searchGoogleMaps(name, city);
    if (!mapsData) {
      return NextResponse.json(
        { error: "Business not found on Google Maps. Try another search." },
        { status: 404 }
      );
    }

    // Scrape website
    const richContext = await scrapeWebsite(mapsData.website);

    // Extract structured LIVE FACTS
    const liveFacts = [
      { type: "services", content: mapsData.services },
    ];

    if (mapsData.phone && mapsData.phone !== "Phone not listed") {
      liveFacts.push({ type: "contact", content: mapsData.phone });
    }

    // Generate UUID for this enrichment
    const enrichId = uuid();

    // Store in cache
    enrichmentCache.set(enrichId, {
      data: {
        uuid: enrichId,
        businessName: name,
        location: city,
        maps: mapsData,
        liveFacts,
        richContext,
      },
      timestamp: Date.now(),
    });

    return NextResponse.json({ uuid: enrichId });
  } catch (err) {
    console.error("[SEARCH_BUSINESS_ERROR]", err);
    return NextResponse.json(
      { error: "Search failed — try again" },
      { status: 500 }
    );
  }
}

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

// Export for preview route
export { enrichmentCache };
