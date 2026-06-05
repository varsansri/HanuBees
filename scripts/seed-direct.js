#!/usr/bin/env node

// Direct database seeding - no server needed
// Usage: node scripts/seed-direct.js

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
    about: "15+ years specializing in candid wedding photography. Featured in Vogue Australia.",
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
    pricing: "From $25pp for corporate, $45pp for weddings",
    about: "Award-winning caterer serving Melbourne for 20 years.",
    portfolio: "500+ events catered",
  },
  {
    name: "The Grand Venue",
    category: "Event Venue",
    city: "Brisbane",
    phone: "+61 7 3211 9876",
    hours: "Daily 10am-6pm",
    website: "https://thegrandvenue.com.au",
    services: "Wedding venue, corporate events, parties",
    pricing: "Venue hire: $3000-8000, capacity 50-500 guests",
    about: "Stunning heritage venue with grand ballroom and gardens.",
    portfolio: "150+ events hosted, 4.8 star rating",
  },
  {
    name: "Elite Events Planning",
    category: "Event Planning",
    city: "Perth",
    phone: "+61 8 9876 1234",
    hours: "Mon-Fri 9am-5:30pm, Sat 10am-2pm",
    website: "https://eliteventsplanning.com.au",
    services: "Wedding planning, corporate events, parties",
    pricing: "Wedding planning: $2000-5000",
    about: "Expert wedding planners with 12+ years experience.",
    portfolio: "200+ events planned",
  },
  {
    name: "Bloom Florals & Decor",
    category: "Flowers & Decor",
    city: "Adelaide",
    phone: "+61 8 8234 5678",
    hours: "Mon-Fri 9am-5pm, Sat 9am-3pm",
    website: "https://bloomflorals.com.au",
    services: "Wedding flowers, event decoration, arrangements",
    pricing: "Bridal bouquet: $150-400, weddings from $1500",
    about: "Award-winning floral designer with fresh seasonal flowers.",
    portfolio: "250+ weddings decorated",
  },
  {
    name: "DJ Premier Sounds",
    category: "DJ & Entertainment",
    city: "Sydney",
    phone: "+61 2 9234 5678",
    hours: "Flexible, bookings Mon-Fri 10am-8pm",
    website: "https://djpremier.com.au",
    services: "Wedding DJ, corporate events, parties",
    pricing: "Wedding DJ: $1500-2500, corporate from $1000",
    about: "Professional DJ with 15+ years experience.",
    portfolio: "400+ events, 4.9 star rating",
  },
  {
    name: "Makeup Artistry by Maya",
    category: "Makeup & Styling",
    city: "Melbourne",
    phone: "+61 3 9876 1111",
    hours: "Mon-Sat 9am-6pm",
    website: "https://mayamakeup.com.au",
    services: "Bridal makeup, bridesmaid, special occasions",
    pricing: "Bridal makeup: $150, on-location: $50",
    about: "Expert makeup artist specializing in bridal looks.",
    portfolio: "300+ brides, stunning transformations",
  },
  {
    name: "Luxe Limousines",
    category: "Transportation",
    city: "Brisbane",
    phone: "+61 7 3456 7890",
    hours: "24/7 available",
    website: "https://luxelimos.com.au",
    services: "Wedding transport, airport transfers, events",
    pricing: "Wedding packages from $600, hourly $150-200",
    about: "Fleet of luxury vehicles with professional chauffeurs.",
    portfolio: "500+ weddings",
  },
  {
    name: "Sweet Confections Cake Design",
    category: "Wedding Cakes",
    city: "Perth",
    phone: "+61 8 9234 5678",
    hours: "Mon-Fri 9am-5pm, Sat 10am-3pm",
    website: "https://sweetconfections.com.au",
    services: "Wedding cakes, custom desserts, cupcakes",
    pricing: "Custom cake from $400+",
    about: "Artisan cake designer creating custom cakes since 2010.",
    portfolio: "250+ custom cakes",
  },
  {
    name: "Glow Beauty Studio",
    category: "Beauty & Wellness",
    city: "Adelaide",
    phone: "+61 8 8345 6789",
    hours: "Mon-Fri 10am-8pm, Sat-Sun 10am-6pm",
    website: "https://glowbeautystudio.com.au",
    services: "Facials, massages, body treatments",
    pricing: "Facials $80-150, massage $120-200 per hour",
    about: "Luxury beauty studio for relaxation and rejuvenation.",
    portfolio: "1000+ happy clients, 4.8 star",
  },
];

const CITIES = [
  "Sydney",
  "Melbourne",
  "Brisbane",
  "Perth",
  "Adelaide",
  "Gold Coast",
  "Canberra",
  "Hobart",
];

function slugify(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function generateBusinesses(count) {
  const businesses = [];
  for (let i = 0; i < count; i++) {
    const base = BUSINESSES[i % BUSINESSES.length];
    const city = CITIES[i % CITIES.length];
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

async function seed() {
  console.log("🐝 Seeding 50 businesses...");

  const businesses = generateBusinesses(50);
  let created = 0;

  for (const business of businesses) {
    try {
      // Create anonymous user
      const { data: authData, error: authErr } =
        await supabase.auth.signUpAnonymously();

      if (authErr || !authData.user) {
        console.error(
          `❌ Auth failed for ${business.name}:`,
          authErr?.message
        );
        continue;
      }

      const userId = authData.user.id;
      const slug = slugify(business.name);
      const beeName = business.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 12);

      // Create account
      const { data: account, error: accErr } = await supabase
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

      if (accErr || !account) {
        console.error(
          `❌ Account creation failed for ${business.name}:`,
          accErr?.message
        );
        continue;
      }

      // Store LIVE FACTS
      const liveFacts = [
        {
          account_id: account.id,
          content: business.hours,
          is_live_fact: true,
          info_type: "hours",
          effective_date: new Date().toISOString().split("T")[0],
          visibility: "public",
        },
        {
          account_id: account.id,
          content: business.phone,
          is_live_fact: true,
          info_type: "contact",
          effective_date: new Date().toISOString().split("T")[0],
          visibility: "public",
        },
        {
          account_id: account.id,
          content: business.services,
          is_live_fact: true,
          info_type: "services",
          effective_date: new Date().toISOString().split("T")[0],
          visibility: "public",
        },
        {
          account_id: account.id,
          content: business.pricing,
          is_live_fact: true,
          info_type: "pricing",
          effective_date: new Date().toISOString().split("T")[0],
          visibility: "public",
        },
      ];

      const { error: liveErr } = await supabase
        .from("data_entries")
        .insert(liveFacts);

      if (liveErr) {
        console.error(
          `⚠️  LIVE FACTS failed for ${business.name}:`,
          liveErr.message
        );
      }

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

      const { error: richErr } = await supabase
        .from("data_entries")
        .insert(richContext);

      if (richErr) {
        console.error(
          `⚠️  RICH CONTEXT failed for ${business.name}:`,
          richErr.message
        );
      }

      console.log(`✅ ${business.name} (@${beeName})`);
      created++;
    } catch (err) {
      console.error(`❌ Error with ${business.name}:`, err.message);
    }
  }

  console.log(`\n🎉 Created ${created} businesses!`);
  process.exit(created > 0 ? 0 : 1);
}

seed();
