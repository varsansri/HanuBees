// Registry that powers programmatic SEO pages (/[city]/[category]).
// City + category slugs map to DB queries; controllable + SEO-clean, independent
// of messy raw category labels in the data.

export type City = { slug: string; name: string; country: string };
export type Category = { slug: string; title: string; singular: string; terms: string[] };

export const CITIES: City[] = [
  { slug: "coimbatore", name: "Coimbatore", country: "India" },
  { slug: "chennai", name: "Chennai", country: "India" },
  { slug: "los-angeles", name: "Los Angeles", country: "USA" },
  { slug: "melbourne", name: "Melbourne", country: "Australia" },
];

export const CATEGORIES: Category[] = [
  { slug: "hospitals", title: "Hospitals", singular: "hospital", terms: ["hospital"] },
  { slug: "eye-hospitals", title: "Eye Hospitals", singular: "eye hospital", terms: ["eye"] },
  { slug: "dental-clinics", title: "Dental Clinics", singular: "dental clinic", terms: ["dental", "dentist"] },
  { slug: "clinics", title: "Clinics", singular: "clinic", terms: ["clinic", "polyclinic"] },
  { slug: "pharmacies", title: "Pharmacies", singular: "pharmacy", terms: ["pharmacy", "medical", "medicals"] },
  { slug: "doctors", title: "Doctors", singular: "doctor", terms: ["doctor", "clinic"] },
  { slug: "restaurants", title: "Restaurants", singular: "restaurant", terms: ["restaurant"] },
  { slug: "cafes", title: "Cafés", singular: "café", terms: ["cafe", "coffee"] },
  { slug: "hotels", title: "Hotels", singular: "hotel", terms: ["hotel"] },
  { slug: "gyms", title: "Gyms & Fitness", singular: "gym", terms: ["gym", "fitness"] },
  { slug: "salons", title: "Salons & Beauty", singular: "salon", terms: ["salon", "beauty", "hairdresser"] },
  { slug: "schools", title: "Schools", singular: "school", terms: ["school"] },
  { slug: "colleges", title: "Colleges", singular: "college", terms: ["college"] },
  { slug: "supermarkets", title: "Supermarkets", singular: "supermarket", terms: ["supermarket", "grocery"] },
  { slug: "car-repair", title: "Car Repair", singular: "car repair", terms: ["car repair", "garage", "automobile"] },
  { slug: "electronics", title: "Electronics Stores", singular: "electronics store", terms: ["electronics"] },
  { slug: "clothing", title: "Clothing Stores", singular: "clothing store", terms: ["clothes", "clothing", "fashion", "textile"] },
  { slug: "lawyers", title: "Lawyers", singular: "lawyer", terms: ["lawyer", "advocate", "legal"] },
];

export const getCity = (slug: string) => CITIES.find((c) => c.slug === slug.toLowerCase());
export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug.toLowerCase());

// Build a Supabase .or() filter string matching category OR name for each term.
export function termFilter(cat: Category): string {
  const ors: string[] = [];
  for (const t of cat.terms) ors.push(`category.ilike.%${t}%`, `name.ilike.%${t}%`);
  return ors.join(",");
}
