# Seeding 50 Businesses

Two options to seed 50 businesses into your Hanubees database:

## Option 1: Via API Endpoint (Recommended)

Requires: Dev server running

```bash
# Start dev server
npm run dev

# In another terminal, run seed via API
curl -X POST http://localhost:3000/api/seed-businesses \
  -H "Content-Type: application/json" \
  -H "x-seed-key: hanubees-seed-secret-key-2024" \
  -d '{"count": 50}'
```

Response:
```json
{
  "created": 50,
  "businesses": [
    { "name": "Rosa Photography", "bee_name": "rosa", "slug": "rosa-photography" },
    ...
  ]
}
```

Then visit: http://localhost:3000/@rosa to see a business!

## Option 2: Direct Database Seeding

Requires: Supabase credentials in environment

```bash
# Pull env vars from Vercel
vercel env pull

# Run seed script
node scripts/seed-direct.js
```

Output:
```
🐝 Seeding 50 businesses...
✅ Rosa Photography (@rosa)
✅ Gourmet Catering Co (@gourmetcatering2)
...
🎉 Created 50 businesses!
```

## After Seeding

Visit any business:
- http://hanubees.com/@rosa
- http://hanubees.com/@gourmetcatering
- http://hanubees.com/@dj
- etc.

Each has pre-populated:
- Hours, phone, address
- Services & pricing
- About & portfolio
- Rating & reviews

Agent is ready to chat instantly with all info loaded!
