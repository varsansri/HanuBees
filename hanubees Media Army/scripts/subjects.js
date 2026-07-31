require("./_env");
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
  // ── Semiconductors / networking ──
  { id: "intel", company: "Intel", founder: "Gordon Moore", wiki: "Gordon_Moore", logo: "intel", color: "0071C5" },
  { id: "amd", company: "AMD", founder: "Jerry Sanders", wiki: "Jerry_Sanders_(businessman)", logo: "amd", color: "ED1C24" },
  { id: "tsmc", company: "TSMC", founder: "Morris Chang", wiki: "Morris_Chang", logo: null },
  { id: "asml", company: "ASML", founder: "Peter Wennink", wiki: "Peter_Wennink", logo: "asml", color: "ffffff" },
  { id: "cisco", company: "Cisco", founder: "Sandy Lerner", wiki: "Sandy_Lerner", logo: "cisco", color: "1BA0D7" },
  { id: "qualcomm", company: "Qualcomm", founder: "Irwin Jacobs", wiki: "Irwin_M._Jacobs", logo: "qualcomm", color: "3253DC" },
  { id: "broadcom", company: "Broadcom", founder: "Hock Tan", wiki: "Hock_E._Tan", logo: "broadcom", color: "CC092F" },
  { id: "arm", company: "ARM Holdings", founder: "Robin Saxby", wiki: "Robin_Saxby", logo: "arm", color: "0091BD" },
  // ── Enterprise SaaS ──
  { id: "servicenow", company: "ServiceNow", founder: "Fred Luddy", wiki: "Fred_Luddy", logo: "servicenow", color: "62D84E" },
  { id: "snowflake", company: "Snowflake", founder: "Benoit Dageville", wiki: "Benoit_Dageville", logo: "snowflake", color: "29B5E8" },
  { id: "datadog", company: "Datadog", founder: "Olivier Pomel", wiki: "Olivier_Pomel", logo: "datadog", color: "632CA6" },
  { id: "cloudflare", company: "Cloudflare", founder: "Matthew Prince", wiki: "Matthew_Prince", logo: "cloudflare", color: "F38020" },
  { id: "twilio", company: "Twilio", founder: "Jeff Lawson", wiki: "Jeff_Lawson", logo: "twilio", color: "F22F46" },
  { id: "square", company: "Square (Block)", founder: "Jack Dorsey", wiki: "Jack_Dorsey", logo: "square", color: "3A2C2C" },
  // ── Consumer brands ──
  { id: "cocacola", company: "Coca-Cola", founder: "Asa Candler", wiki: "Asa_Griggs_Candler", logo: "cocacola", color: "ED1B24" },
  // ── Automotive ──
  { id: "toyota", company: "Toyota", founder: "Kiichiro Toyoda", wiki: "Kiichiro_Toyoda", logo: "toyota", color: "EB0A1E" },
  { id: "honda", company: "Honda", founder: "Soichiro Honda", wiki: "Soichiro_Honda", logo: "honda", color: "E40521" },
  { id: "ferrari", company: "Ferrari", founder: "Enzo Ferrari", wiki: "Enzo_Ferrari", logo: "ferrari", color: "FF2800" },
  { id: "mercedes", company: "Mercedes-Benz", founder: "Karl Benz", wiki: "Karl_Benz", logo: "mercedes", color: "242424" },
  { id: "bmw", company: "BMW", founder: "Franz Josef Popp", wiki: "Franz_Josef_Popp", logo: "bmw", color: "0066B1" },
  // ── Luxury ──
  { id: "rolex", company: "Rolex", founder: "Hans Wilsdorf", wiki: "Hans_Wilsdorf", logo: "rolex", color: "A37E2C" },
  { id: "louisvuitton", company: "Louis Vuitton", founder: "Louis Vuitton", wiki: "Louis_Vuitton_(designer)", logo: "louisvuitton", color: "FFFFFF" },
  { id: "hermes", company: "Hermes", founder: "Thierry Hermes", wiki: "Thierry_Hermès", logo: "hermes", color: "F37021" },
  { id: "chanel", company: "Chanel", founder: "Coco Chanel", wiki: "Coco_Chanel", logo: null },
  { id: "gucci", company: "Gucci", founder: "Guccio Gucci", wiki: "Guccio_Gucci", logo: "gucci", color: "000000" },
  { id: "adidas", company: "Adidas", founder: "Adi Dassler", wiki: "Adolf_Dassler", logo: "adidas", color: "000000" },
  // ── Retail / finance ──
  { id: "costco", company: "Costco", founder: "Jim Sinegal", wiki: "James_Sinegal", logo: "costco", color: "E31837" },
  { id: "visa", company: "Visa", founder: "Dee Hock", wiki: "Dee_Hock", logo: "visa", color: "1A1F71" },
  { id: "mastercard", company: "Mastercard", founder: "Mastercard founders", wiki: "Mastercard", logo: "mastercard", color: "EB001B" },
  { id: "goldmansachs", company: "Goldman Sachs", founder: "Marcus Goldman", wiki: "Marcus_Goldman", logo: null },
  { id: "morganstanley", company: "Morgan Stanley", founder: "J.P. Morgan", wiki: "J._P._Morgan", logo: null },
  { id: "citadel", company: "Citadel", founder: "Ken Griffin", wiki: "Kenneth_C._Griffin", logo: null },
  // ── Crypto / Asia tech ──
  { id: "binance", company: "Binance", founder: "Changpeng Zhao", wiki: "Changpeng_Zhao", logo: "binance", color: "F0B90B" },
  { id: "tencent", company: "Tencent", founder: "Pony Ma", wiki: "Ma_Huateng", logo: "tencentqq", color: "EB1923" },
  { id: "xiaomi", company: "Xiaomi", founder: "Lei Jun", wiki: "Lei_Jun", logo: "xiaomi", color: "FF6900" },
  // ── AI / platforms ──
  { id: "anthropic", company: "Anthropic", founder: "Dario Amodei", wiki: "Dario_Amodei", logo: "anthropic", color: "191919" },
  { id: "midjourney", company: "Midjourney", founder: "David Holz", wiki: "David_Holz", logo: null },
  { id: "telegram", company: "Telegram", founder: "Pavel Durov", wiki: "Pavel_Durov", logo: "telegram", color: "26A5E4" },
  // ── Gaming ──
  { id: "epicgames", company: "Epic Games", founder: "Tim Sweeney", wiki: "Tim_Sweeney_(game_developer)", logo: "epicgames", color: "313131" },
  { id: "riotgames", company: "Riot Games", founder: "Brandon Beck", wiki: "Brandon_Beck", logo: "riotgames", color: "D32936" },
  { id: "unity", company: "Unity Technologies", founder: "David Helgason", wiki: "David_Helgason", logo: "unity", color: "FFFFFF" },
  { id: "roblox", company: "Roblox", founder: "David Baszucki", wiki: "David_Baszucki", logo: "roblox", color: "000000" },
  // ── Creator economy ──
  { id: "onlyfans_founder", company: "OnlyFans", founder: "Tim Stokely", wiki: "Tim_Stokely", logo: "onlyfans", color: "008CCF" },
  { id: "cameo_founder", company: "Cameo", founder: "Steven Galanis", wiki: "Steven_Galanis", logo: null },
  { id: "patreon_founder", company: "Patreon", founder: "Jack Conte", wiki: "Jack_Conte", logo: "patreon", color: "000000" },
  { id: "substack_founder", company: "Substack", founder: "Chris Best", wiki: "Chris_Best", logo: "substack", color: "FF6719" },
  // ── Music / fashion ──
  { id: "beats", company: "Beats by Dre", founder: "Dr. Dre", wiki: "Dr._Dre", logo: "beats", color: "ED1C24" },
  { id: "yeezy", company: "Yeezy", founder: "Kanye West", wiki: "Kanye_West", logo: null },
];
