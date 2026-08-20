export type Product = {
  id: string;
  badge?: string;
  rating: number;
  brand: string;
  title: string;
  price: number;
  mrp: number;
  art: string;
  garment: "tee" | "jeans" | "jacket" | "shirt" | "hoodie" | "pants";
};

export const discount = (p: Product) => Math.round(((p.mrp - p.price) / p.mrp) * 100);

export const inr = (n: number) => n.toLocaleString("en-IN");

export const bestsellers: Product[] = [
  {
    id: "bs-1",
    badge: "OVERSIZED FIT",
    rating: 4.4,
    brand: "HanuBees®",
    title: "Men's Caramel Orange Framed Graphic Oversized T-shirt",
    price: 749,
    mrp: 1799,
    art: "linear-gradient(155deg,#e8813a,#c85f22)",
    garment: "tee",
  },
  {
    id: "bs-2",
    badge: "OVERSIZED FIT",
    rating: 4.8,
    brand: "HanuBees X Arcade",
    title: "Men's Black Across The Neon Line Oversized T-shirt",
    price: 799,
    mrp: 1299,
    art: "linear-gradient(155deg,#3a3550,#171420)",
    garment: "tee",
  },
  {
    id: "bs-3",
    badge: undefined,
    rating: 4.7,
    brand: "HanuBees®",
    title: "Men's Black The Other Side Graphic T-shirt",
    price: 499,
    mrp: 1099,
    art: "linear-gradient(155deg,#2c2c2c,#0f0f0f)",
    garment: "tee",
  },
  {
    id: "bs-4",
    badge: "STRAIGHT FIT",
    rating: 4.5,
    brand: "HanuBees®",
    title: "Men's Beige Straight Fit Jeans",
    price: 1699,
    mrp: 2999,
    art: "linear-gradient(155deg,#ded3c0,#b9a98f)",
    garment: "jeans",
  },
  {
    id: "bs-5",
    badge: "SUPER BAGGY FIT",
    rating: 4.5,
    brand: "HanuBees®",
    title: "Men's Blue Washed Super Baggy Jeans",
    price: 1499,
    mrp: 2999,
    art: "linear-gradient(155deg,#8fadd0,#5c7ea8)",
    garment: "jeans",
  },
  {
    id: "bs-6",
    badge: "RELAXED FIT",
    rating: 4.6,
    brand: "HanuBees®",
    title: "Men's Olive Utility Cargo Trousers",
    price: 1199,
    mrp: 2199,
    art: "linear-gradient(155deg,#7d7f56,#4f5134)",
    garment: "pants",
  },
  {
    id: "bs-7",
    badge: "OVERSIZED FIT",
    rating: 4.3,
    brand: "HanuBees®",
    title: "Men's Pink Sunset Club Half Sleeve Shirt",
    price: 899,
    mrp: 1699,
    art: "linear-gradient(155deg,#f0b6bd,#d4818e)",
    garment: "shirt",
  },
  {
    id: "bs-8",
    badge: undefined,
    rating: 4.6,
    brand: "HanuBees®",
    title: "Men's Blue Colourblock Windcheater",
    price: 1899,
    mrp: 3499,
    art: "linear-gradient(155deg,#5b8ede,#2f5aa8)",
    garment: "jacket",
  },
];

export const newArrivals: Product[] = [
  {
    id: "na-1",
    badge: "NEW",
    rating: 4.2,
    brand: "HanuBees®",
    title: "Men's Pink Cuban Collar Casual Shirt",
    price: 999,
    mrp: 1999,
    art: "linear-gradient(155deg,#f4a7b3,#dd7d90)",
    garment: "shirt",
  },
  {
    id: "na-2",
    badge: "NEW",
    rating: 4.4,
    brand: "HanuBees®",
    title: "Men's Light Blue Loose Fit Jeans",
    price: 1399,
    mrp: 2799,
    art: "linear-gradient(155deg,#a9c7e8,#7096c4)",
    garment: "jeans",
  },
  {
    id: "na-3",
    badge: "NEW",
    rating: 4.5,
    brand: "HanuBees®",
    title: "Men's Deep Olive Pleated Trousers",
    price: 1299,
    mrp: 2499,
    art: "linear-gradient(155deg,#6e7350,#454a2e)",
    garment: "pants",
  },
  {
    id: "na-4",
    badge: "NEW",
    rating: 4.7,
    brand: "HanuBees®",
    title: "Men's Navy Game Week Graphic T-shirt",
    price: 599,
    mrp: 1299,
    art: "linear-gradient(155deg,#2b3a5c,#16223a)",
    garment: "tee",
  },
  {
    id: "na-5",
    badge: "NEW",
    rating: 4.3,
    brand: "HanuBees®",
    title: "Men's Moss Green Wide Leg Trousers",
    price: 1249,
    mrp: 2399,
    art: "linear-gradient(155deg,#767c53,#4a5030)",
    garment: "pants",
  },
  {
    id: "na-6",
    badge: "NEW",
    rating: 4.6,
    brand: "HanuBees®",
    title: "Men's Ecru Oversized Hoodie",
    price: 1599,
    mrp: 2999,
    art: "linear-gradient(155deg,#e5ded0,#c2b7a2)",
    garment: "hoodie",
  },
];

export type HeroSlide = {
  id: string;
  kicker?: string;
  title: string;
  price?: string;
  strip?: string;
  sub?: string;
  sky: string;
  wall: string;
  accent: string;
  prop: "stairs" | "arch";
};

export const heroSlides: HeroSlide[] = [
  {
    id: "shirts",
    kicker: "SHIRTS",
    title: "START AT",
    price: "₹999",
    strip: "",
    sky: "#57b8d8",
    wall: "#f0b8a0",
    accent: "#f5c518",
    prop: "stairs",
  },
  {
    id: "denims",
    kicker: "",
    title: "DENIMS",
    price: "",
    strip: "USE CODE: DENIM100 & GET FLAT ₹100 OFF",
    sky: "#4d6bd8",
    wall: "#e8c9ac",
    accent: "#e5a5a5",
    prop: "arch",
  },
  {
    id: "windcheaters",
    kicker: "",
    title: "WINDCHEATERS",
    price: "",
    strip: "",
    sub: "Your Go-To For Windy Days",
    sky: "#2f4f8f",
    wall: "#f2a5a0",
    accent: "#f5c518",
    prop: "arch",
  },
];

export const dropSlides = [
  {
    id: "campus",
    script: "Back To",
    scriptTwo: "Campus",
    right: "New Styles for",
    rightBold: "New Semester",
    from: "#b9a8e8",
    to: "#8fb6e8",
  },
  {
    id: "monsoon",
    script: "Monsoon",
    scriptTwo: "Ready",
    right: "Water Repellent",
    rightBold: "Everyday Layers",
    from: "#8fbfd6",
    to: "#6f92c4",
  },
  {
    id: "courtside",
    script: "Courtside",
    scriptTwo: "Classics",
    right: "Retro Fits for",
    rightBold: "Match Days",
    from: "#e8a98f",
    to: "#d8788f",
  },
];

export const trendingCategories = [
  { label: "T-shirts", art: "linear-gradient(160deg,#c94b3b,#8f2b20)", garment: "tee" as const },
  { label: "Trackpants", art: "linear-gradient(160deg,#6e7350,#3f4429)", garment: "pants" as const },
  { label: "Polos", art: "linear-gradient(160deg,#2f2f2f,#101010)", garment: "shirt" as const },
  { label: "Sneakers", art: "linear-gradient(160deg,#7fa0c4,#4d6f96)", garment: "jacket" as const },
  { label: "Accessories", art: "linear-gradient(160deg,#e6ded0,#bdb19c)", garment: "hoodie" as const },
  { label: "Winterwear", art: "linear-gradient(160deg,#bcd4e8,#8faec9)", garment: "hoodie" as const },
];

export const topNav = ["MEN", "WOMEN", "ACCESSORIES"];

export const categoryNav = [
  "CLEARANCE",
  "ACCESSORIES",
  "CUSTOMIZATION",
  "PLUS SIZE",
  "PARTY ANIMAL",
  "NEW ARRIVALS",
  "TOPWEAR",
  "BOTTOMWEAR",
  "WINTERWEAR",
];

export const utilityLeft = ["Offers", "Fanbook", "Download App", "Find a store near me"];
export const utilityRight = ["Contact Us", "Track Order"];
