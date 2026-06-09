// SUBJECT LIBRARY — the raw material pool for the Hanubees Marketing Team engine.
// Each = a recognizable company + founder. build-library.js pre-fetches photo + logo
// and records which are usable, so daily batches pull from a ready shelf (no per-session
// sourcing gamble). logo:null = no Simple Icons logo → use a text wordmark.
// wiki = Wikipedia page title (for the founder portrait via pageimages API).
module.exports = [
  // ── Big Tech ──
  { id: "apple", company: "Apple", founder: "Steve Jobs", wiki: "Steve_Jobs", logo: "apple", color: "ffffff" },
  { id: "microsoft", company: "Microsoft", founder: "Bill Gates", wiki: "Bill_Gates", logo: null },
  { id: "nvidia", company: "Nvidia", founder: "Jensen Huang", wiki: "Jensen_Huang", logo: "nvidia", color: "76B900" },
  { id: "amazon", company: "Amazon", founder: "Jeff Bezos", wiki: "Jeff_Bezos", logo: null },
  { id: "google", company: "Google", founder: "Larry Page", wiki: "Larry_Page", logo: "google", color: "4285F4" },
  { id: "meta", company: "Meta", founder: "Mark Zuckerberg", wiki: "Mark_Zuckerberg", logo: "meta", color: "0467DF" },
  { id: "tesla", company: "Tesla", founder: "Elon Musk", wiki: "Elon_Musk", logo: "tesla", color: "E31937" },
  { id: "spacex", company: "SpaceX", founder: "Elon Musk", wiki: "Elon_Musk", logo: "spacex", color: "ffffff" },
  // ── Software / internet ──
  { id: "netflix", company: "Netflix", founder: "Reed Hastings", wiki: "Reed_Hastings", logo: "netflix", color: "E50914" },
  { id: "spotify", company: "Spotify", founder: "Daniel Ek", wiki: "Daniel_Ek", logo: "spotify", color: "1DB954" },
  { id: "uber", company: "Uber", founder: "Travis Kalanick", wiki: "Travis_Kalanick", logo: "uber", color: "ffffff" },
  { id: "airbnb", company: "Airbnb", founder: "Brian Chesky", wiki: "Brian_Chesky", logo: "airbnb", color: "FF5A5F" },
  { id: "shopify", company: "Shopify", founder: "Tobias Lütke", wiki: "Tobias_Lütke", logo: "shopify", color: "7AB55C" },
  { id: "whatsapp", company: "WhatsApp", founder: "Jan Koum", wiki: "Jan_Koum", logo: "whatsapp", color: "25D366" },
  { id: "oracle", company: "Oracle", founder: "Larry Ellison", wiki: "Larry_Ellison", logo: null },
  { id: "salesforce", company: "Salesforce", founder: "Marc Benioff", wiki: "Marc_Benioff", logo: "salesforce", color: "00A1E0" },
  { id: "dell", company: "Dell", founder: "Michael Dell", wiki: "Michael_Dell", logo: "dell", color: "007DB8" },
  { id: "linkedin", company: "LinkedIn", founder: "Reid Hoffman", wiki: "Reid_Hoffman", logo: "linkedin", color: "0A66C2" },
  { id: "x", company: "X (Twitter)", founder: "Jack Dorsey", wiki: "Jack_Dorsey", logo: "x", color: "ffffff" },
  { id: "snap", company: "Snapchat", founder: "Evan Spiegel", wiki: "Evan_Spiegel", logo: "snapchat", color: "FFFC00" },
  { id: "pinterest", company: "Pinterest", founder: "Ben Silbermann", wiki: "Ben_Silbermann", logo: "pinterest", color: "BD081C" },
  { id: "zoom", company: "Zoom", founder: "Eric Yuan", wiki: "Eric_Yuan", logo: "zoom", color: "0B5CFF" },
  { id: "coinbase", company: "Coinbase", founder: "Brian Armstrong", wiki: "Brian_Armstrong", logo: "coinbase", color: "0052FF" },
  { id: "stripe", company: "Stripe", founder: "Patrick Collison", wiki: "Patrick_Collison", logo: "stripe", color: "635BFF" },
  { id: "dropbox", company: "Dropbox", founder: "Drew Houston", wiki: "Drew_Houston", logo: "dropbox", color: "0061FF" },
  { id: "reddit", company: "Reddit", founder: "Steve Huffman", wiki: "Steve_Huffman", logo: "reddit", color: "FF4500" },
  { id: "tiktok", company: "TikTok", founder: "Zhang Yiming", wiki: "Zhang_Yiming", logo: "tiktok", color: "ffffff" },
  { id: "alibaba", company: "Alibaba", founder: "Jack Ma", wiki: "Jack_Ma", logo: "alibabadotcom", color: "FF6A00" },
  // ── Consumer / classic business ──
  { id: "nike", company: "Nike", founder: "Phil Knight", wiki: "Phil_Knight", logo: "nike", color: "ffffff" },
  { id: "starbucks", company: "Starbucks", founder: "Howard Schultz", wiki: "Howard_Schultz", logo: "starbucks", color: "00704A" },
  { id: "mcdonalds", company: "McDonald's", founder: "Ray Kroc", wiki: "Ray_Kroc", logo: "mcdonalds", color: "FBC817" },
  { id: "disney", company: "Disney", founder: "Walt Disney", wiki: "Walt_Disney", logo: null },
  { id: "walmart", company: "Walmart", founder: "Sam Walton", wiki: "Sam_Walton", logo: null },
  { id: "ikea", company: "IKEA", founder: "Ingvar Kamprad", wiki: "Ingvar_Kamprad", logo: "ikea", color: "FBD914" },
  { id: "dyson", company: "Dyson", founder: "James Dyson", wiki: "James_Dyson", logo: null },
  { id: "lego", company: "LEGO", founder: "Ole Kirk Christiansen", wiki: "Ole_Kirk_Christiansen", logo: null },
  { id: "patagonia", company: "Patagonia", founder: "Yvon Chouinard", wiki: "Yvon_Chouinard", logo: null },
  { id: "virgin", company: "Virgin", founder: "Richard Branson", wiki: "Richard_Branson", logo: null },
  { id: "ford", company: "Ford", founder: "Henry Ford", wiki: "Henry_Ford", logo: "ford", color: "ffffff" },
  { id: "tonyhsieh", company: "Zappos", founder: "Tony Hsieh", wiki: "Tony_Hsieh", logo: null },
  { id: "harley", company: "Harley-Davidson", founder: "William Harley", wiki: "William_S._Harley", logo: "harley-davidson", color: "ffffff" },
  // ── Finance / investors ──
  { id: "berkshire", company: "Berkshire Hathaway", founder: "Warren Buffett", wiki: "Warren_Buffett", logo: null },
  { id: "jpmorgan", company: "JPMorgan", founder: "Jamie Dimon", wiki: "Jamie_Dimon", logo: null },
  { id: "blackrock", company: "BlackRock", founder: "Larry Fink", wiki: "Larry_Fink", logo: null },
  { id: "bridgewater", company: "Bridgewater", founder: "Ray Dalio", wiki: "Ray_Dalio", logo: null },
  { id: "softbank", company: "SoftBank", founder: "Masayoshi Son", wiki: "Masayoshi_Son", logo: null },
  // ── Modern founders ──
  { id: "openai", company: "OpenAI", founder: "Sam Altman", wiki: "Sam_Altman", logo: "openai", color: "ffffff" },
  { id: "palantir", company: "Palantir", founder: "Peter Thiel", wiki: "Peter_Thiel", logo: "palantir", color: "ffffff" },
  { id: "lvmh", company: "LVMH", founder: "Bernard Arnault", wiki: "Bernard_Arnault", logo: null },
  { id: "bytedance", company: "ByteDance", founder: "Zhang Yiming", wiki: "Zhang_Yiming", logo: null },
];
