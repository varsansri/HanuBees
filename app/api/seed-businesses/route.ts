import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuid } from "uuid";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUSINESSES = [
  {
    name: "Rosa Photography",
    category: "Wedding Photography",
    city: "Sydney",
    phone: "+61 2 9555 1234",
    hours: "Mon-Fri 10am-6pm, Sat 10am-4pm, closed Sunday",
    website: "https://rosaphotography.com.au",
    services: "Wedding photography, engagement shoots, family portraits",
    pricing: "Full day wedding: $2500, Half day: $1500, Engagement: $500",
    about: "15+ years specializing in candid wedding photography. Featured in Vogue Australia and local bridal magazines.",
    portfolio: "500+ weddings, specializes in natural light and emotional moments",
  },
  {
    name: "Gourmet Catering Co",
    category: "Catering",
    city: "Melbourne",
    phone: "+61 3 9876 5432",
    hours: "Mon-Fri 9am-7pm, Sat 10am-6pm, closed Sunday",
    website: "https://gourmetcatering.com.au",
    services: "Corporate catering, wedding events, private functions",
    pricing: "From $25pp for corporate, $45pp for weddings, custom quotes available",
    about: "Award-winning caterer serving Melbourne for 20 years. Specializes in Mediterranean and modern Australian cuisine.",
    portfolio: "500+ events catered, includes corporate launches and high-profile weddings",
  },
  {
    name: "The Grand Venue",
    category: "Event Venue",
    city: "Brisbane",
    phone: "+61 7 3211 9876",
    hours: "Daily 10am-6pm",
    website: "https://thegrandvenue.com.au",
    services: "Wedding venue, corporate events, parties, exhibitions",
    pricing: "Venue hire: $3000-8000 depending on time/day. Capacity 50-500 guests.",
    about: "Stunning heritage venue with grand ballroom and outdoor gardens. Perfect for weddings and corporate events.",
    portfolio: "150+ events hosted, average 4.8 star rating",
  },
  {
    name: "Elite Events Planning",
    category: "Event Planning",
    city: "Perth",
    phone: "+61 8 9876 1234",
    hours: "Mon-Fri 9am-5:30pm, Sat 10am-2pm, closed Sunday",
    website: "https://eliteventsplanning.com.au",
    services: "Wedding planning, corporate events, birthday parties, anniversaries",
    pricing: "Wedding planning: $2000-5000, full coordination available",
    about: "Expert wedding and event planners with 12+ years experience. Stress-free planning from start to finish.",
    portfolio: "200+ events planned, known for attention to detail",
  },
  {
    name: "Bloom Florals & Decor",
    category: "Flowers & Decor",
    city: "Adelaide",
    phone: "+61 8 8234 5678",
    hours: "Mon-Fri 9am-5pm, Sat 9am-3pm, closed Sunday",
    website: "https://bloomflorals.com.au",
    services: "Wedding flowers, event decoration, corporate arrangements",
    pricing: "Bridal bouquet: $150-400, full wedding florals from $1500",
    about: "Award-winning floral designer. Specializes in romantic and modern arrangements using fresh seasonal flowers.",
    portfolio: "250+ weddings decorated, uses only premium flowers",
  },
  {
    name: "DJ Premier Sounds",
    category: "DJ & Entertainment",
    city: "Sydney",
    phone: "+61 2 9234 5678",
    hours: "Flexible hours, bookings taken Mon-Fri 10am-8pm",
    website: "https://djpremier.com.au",
    services: "Wedding DJ, corporate events, birthday parties, nightclub DJ",
    pricing: "Wedding DJ: $1500-2500, corporate events from $1000",
    about: "Professional DJ with 15+ years experience. High-energy sets for all age groups and music tastes.",
    portfolio: "400+ events, average 4.9 star rating",
  },
  {
    name: "Makeup Artistry by Maya",
    category: "Makeup & Styling",
    city: "Melbourne",
    phone: "+61 3 9876 1111",
    hours: "Mon-Sat 9am-6pm, closed Sunday",
    website: "https://mayamakeup.com.au",
    services: "Bridal makeup, bridesmaid makeup, special occasions, beauty coaching",
    pricing: "Bridal makeup: $150, on-location surcharge: $50, group bookings available",
    about: "Expert makeup artist specializing in bridal looks. Uses high-quality, long-lasting products.",
    portfolio: "300+ brides made up, portfolio of stunning transformations",
  },
  {
    name: "Luxe Limousines",
    category: "Transportation",
    city: "Brisbane",
    phone: "+61 7 3456 7890",
    hours: "24/7 booking available",
    website: "https://luxelimos.com.au",
    services: "Wedding transport, airport transfers, corporate events, special occasions",
    pricing: "Wedding packages from $600, hourly rates $150-200",
    about: "Fleet of luxury vehicles driven by professional chauffeurs. Perfect for weddings and corporate events.",
    portfolio: "500+ weddings, pristine safety record",
  },
  {
    name: "Sweet Confections Cake Design",
    category: "Wedding Cakes",
    city: "Perth",
    phone: "+61 8 9234 5678",
    hours: "Mon-Fri 9am-5pm, Sat 10am-3pm, closed Sunday",
    website: "https://sweetconfections.com.au",
    services: "Wedding cakes, custom desserts, cupcakes, macarons",
    pricing: "Custom wedding cake from $400, pricing based on size and design",
    about: "Artisan cake designer creating stunning custom cakes for special occasions since 2010.",
    portfolio: "250+ custom cakes created, all handmade to order",
  },
  {
    name: "Glow Beauty Studio",
    category: "Beauty & Wellness",
    city: "Adelaide",
    phone: "+61 8 8345 6789",
    hours: "Mon-Fri 10am-8pm, Sat-Sun 10am-6pm",
    website: "https://glowbeautystudio.com.au",
    services: "Facials, massages, body treatments, beauty packages",
    pricing: "Facials $80-150, massage packages $120-200 per hour",
    about: "Luxury beauty and wellness studio specializing in relaxation and rejuvenation treatments.",
    portfolio: "1000+ happy clients, 4.8 star rating",
  },
  {
    name: "Sophisticated Hair Design",
    category: "Hair Salon",
    city: "Sydney",
    phone: "+61 2 9567 1234",
    hours: "Mon-Fri 9am-6pm, Sat 9am-5pm, closed Sunday",
    website: "https://sophhairstudio.com.au",
    services: "Haircuts, color, styling, bridal hair",
    pricing: "Cuts $45-85, color from $80, bridal styling $120",
    about: "Award-winning salon with expert stylists specializing in all hair types and styles.",
    portfolio: "1500+ clients, known for precision cuts and vibrant color",
  },
];

// Generate 50 businesses by duplicating and varying base data
function generateBusinesses(count: number) {
  const businesses = [];
  const cities = [
    "Sydney",
    "Melbourne",
    "Brisbane",
    "Perth",
    "Adelaide",
    "Gold Coast",
    "Canberra",
    "Hobart",
  ];
  const categories = [
    "Photography",
    "Catering",
    "Venues",
    "Planning",
    "Florals",
    "DJ",
    "Makeup",
    "Transport",
    "Cakes",
    "Salon",
  ];

  for (let i = 0; i < count; i++) {
    const base = BUSINESSES[i % BUSINESSES.length];
    const city = cities[i % cities.length];
    const suffix = Math.floor(i / BUSINESSES.length) > 0 ? ` ${i + 1}` : "";

    businesses.push({
      ...base,
      name: base.name + suffix,
      city,
      phone: base.phone
        .replace(/\d{4}$/, String(1000 + i).slice(-4))
        .replace(/\d{3}$/, String(100 + (i % 1000)).slice(-3)),
    });
  }

  return businesses;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function POST(req: NextRequest) {
  // Basic auth: check for seed key
  const seedKey = req.headers.get("x-seed-key");
  if (seedKey !== process.env.SEED_KEY) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { count = 50 } = await req.json();

    if (count > 100) {
      return NextResponse.json(
        { error: "Max 100 businesses at a time" },
        { status: 400 }
      );
    }

    const businesses = generateBusinesses(count);
    const created = [];

    for (const business of businesses) {
      // Create anonymous user
      const { data: authData } =
        await supabase.auth.signUpAnonymously();

      if (!authData.user) continue;

      const userId = authData.user.id;
      const slug = slugify(business.name);
      const beeName = business.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 12);

      // Create account
      const { data: account } = await supabase
        .from("accounts")
        .insert({
          user_id: userId,
          type: "business",
          name: business.name,
          slug,
          bee_name: beeName,
          category: business.category,
          city: business.city,
          phone: business.phone,
          website: business.website,
          bio: business.about.slice(0, 160),
        })
        .select()
        .maybeSingle();

      if (!account) continue;

      // Store LIVE FACTS
      const liveFacts = [
        {
          account_id: account.id,
          content: business.hours,
          is_live_fact: true,
          info_type: "hours",
          effective_date: new Date()
            .toISOString()
            .split("T")[0],
          visibility: "public",
        },
        {
          account_id: account.id,
          content: business.phone,
          is_live_fact: true,
          info_type: "contact",
          effective_date: new Date()
            .toISOString()
            .split("T")[0],
          visibility: "public",
        },
        {
          account_id: account.id,
          content: business.services,
          is_live_fact: true,
          info_type: "services",
          effective_date: new Date()
            .toISOString()
            .split("T")[0],
          visibility: "public",
        },
        {
          account_id: account.id,
          content: business.pricing,
          is_live_fact: true,
          info_type: "pricing",
          effective_date: new Date()
            .toISOString()
            .split("T")[0],
          visibility: "public",
        },
      ];

      await supabase.from("data_entries").insert(liveFacts);

      // Store RICH CONTEXT
      const richContext = [
        {
          account_id: account.id,
          content: business.about,
          tag: "about",
          is_live_fact: false,
          visibility: "public",
        },
        {
          account_id: account.id,
          content: business.portfolio,
          tag: "portfolio",
          is_live_fact: false,
          visibility: "public",
        },
      ];

      await supabase.from("data_entries").insert(richContext);

      created.push({
        id: account.id,
        name: business.name,
        bee_name: beeName,
        slug,
      });
    }

    return NextResponse.json({
      created: created.length,
      businesses: created,
    });
  } catch (err) {
    console.error("[SEED_ERROR]", err);
    return NextResponse.json(
      { error: "Seeding failed" },
      { status: 500 }
    );
  }
}
