#!/usr/bin/env node
// TODAY'S BATCH — top-10-wealthiest-company + founder, Q&A carousel (founder-face format).
// Config-driven: each concept = poster (face + logo + hook) + 2 numbered-answer slides.
// All numbers REAL (June 2026 market caps + verified origins). node daily-batch.js
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const W = 1080, H = 1350;
const C = { y: "#ffbe00", g: "#98aa9d", fg: "#ffffff", mut: "#c7c7c5", bg: "#121212" };
const FONT = "Arial, Roboto, sans-serif";
const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function wrap(text, x, y, size, weight, fill, anchor = "start") {
  const max = Math.max(6, Math.floor(900 / (size * 0.58)));
  const lh = Math.round(size * 1.08);
  const words = text.split(" "); const lines = []; let cur = "";
  for (const w of words) { if ((cur + " " + w).trim().length > max) { lines.push(cur.trim()); cur = w; } else cur += " " + w; }
  if (cur.trim()) lines.push(cur.trim());
  const t = lines.map((l, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lh}">${xml(l)}</tspan>`).join("");
  return { svg: `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}">${t}</text>`, height: lines.length * lh };
}

async function poster(cfg) {
  const bg = await sharp(cfg.face).resize(W, H, { fit: "cover", position: "top" }).toBuffer();
  let t = "", y = 832;
  if (!cfg.logo && cfg.wordmark) t += `<text x="70" y="132" font-family="${FONT}" font-size="46" font-weight="800" fill="${C.fg}" paint-order="stroke" stroke="#000" stroke-width="9" stroke-linejoin="round">${cfg.wordmark}</text>`;
  t += wrap(cfg.kicker, 70, y, 33, 800, C.y).svg; y += 66;
  const head = wrap(cfg.headline, 70, y, 72, 800, C.fg); t += head.svg; y += head.height + 22;
  t += wrap(cfg.question, 70, y, 48, 600, C.y).svg;
  const grad = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><defs>
      <linearGradient id="b" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#000" stop-opacity="0.96"/><stop offset="58%" stop-color="#000" stop-opacity="0.82"/><stop offset="100%" stop-color="#000" stop-opacity="0"/></linearGradient></defs>
    <rect x="0" y="${H - 600}" width="${W}" height="600" fill="url(#b)"/>${t}
    <text x="146" y="1285" font-family="${FONT}" font-size="33" font-weight="800" fill="${C.g}">@hanubees</text></svg>`;
  const bee = await sharp(path.join(__dirname, "../assets/brand/bee.png")).resize(76, 76, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const comps = [{ input: Buffer.from(grad), top: 0, left: 0 }];
  if (cfg.logo) { const logo = await sharp(cfg.logo).resize(190, 190, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(); comps.push({ input: logo, top: 58, left: 60 }); }
  comps.push({ input: bee, top: 1232, left: 60 });
  return sharp(bg).composite(comps).png().toBuffer();
}

function explainSVG(kicker, items, footer) {
  const blockH = items.length * 250;
  let y = Math.max(380, Math.round((H - blockH) / 2) + 30);
  let s = wrap(kicker, 70, 200, 36, 800, C.y).svg + `<rect x="70" y="240" width="120" height="7" rx="3" fill="${C.y}"/>`;
  for (const [n, head, body] of items) {
    s += `<text x="70" y="${y + 58}" font-family="${FONT}" font-size="76" font-weight="800" fill="${C.y}">${n}</text>`;
    const hh = wrap(head, 200, y + 30, 46, 800, C.fg); s += hh.svg;
    s += wrap(body, 200, y + 36 + hh.height, 32, 400, C.mut).svg;
    y += 250;
  }
  if (footer) { s += `<rect x="70" y="${H - 210}" width="940" height="2" fill="#2a2a2a"/>`; s += wrap(footer, 70, H - 140, 32, 500, C.g).svg; }
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
}

// ── TODAY'S CONCEPTS (verified numbers) ──────────────────────────────────────
const CONCEPTS = [
  { id: "nvidia", face: "/tmp/founders/huang0.jpg", logo: "/tmp/logo_nvidia.png",
    kicker: "MOST VALUABLE COMPANY ON EARTH", headline: "Nvidia is worth $5.2 TRILLION.",
    question: "How did a chip company beat Apple AND Google?",
    slides: [
      ["HE BET 30 YEARS EARLY", [
        ["1", "He bet on GPUs in 1993.", "Everyone saw 'gaming chips.' Jensen bet they'd one day run everything. Conviction."],
        ["2", "Then AI needed his exact chips.", "~80% of the world's AI runs on Nvidia GPUs. The wave arrived — he was the only one ready."],
      ]],
      ["THE REAL MOVE", [
        ["3", "He sells the shovels.", "OpenAI, Google, Meta — every AI company pays the 'Nvidia tax.' In a gold rush, sell shovels."],
      ], "Pick a hard problem early. Be the only one ready when the wave hits. — Hanubees"],
    ] },
  { id: "meta", face: "/tmp/founders/zuck0.jpg", logo: "/tmp/logo_meta.png",
    kicker: "FROM A HARVARD DORM ROOM", headline: "Meta is worth $1.5 TRILLION.",
    question: "Zuckerberg built it in a dorm in 2004. How?",
    slides: [
      ["HE GAVE IT AWAY FREE", [
        ["1", "Free got him the users.", "Facebook cost $0 → billions joined → THEN he sold their attention to advertisers. Users are the product."],
        ["2", "He bought his rivals.", "Instagram for $1B (2012). WhatsApp for $19B (2014). Can't kill a competitor? Buy it."],
      ]],
      ["THE SCALE", [
        ["3", "~4 billion people use his apps.", "Facebook, Instagram, WhatsApp — nearly half the planet. Attention at a scale nobody else has."],
      ], "Free + scale first. Monetize the attention later. — Hanubees"],
    ] },
  { id: "apple", face: "/tmp/founders/jobs0.jpg", logo: "/tmp/logo_apple.png",
    kicker: "FROM A GARAGE TO $4.5 TRILLION", headline: "Apple is worth $4.5 TRILLION.",
    question: "It started in a garage in 1976. How?",
    slides: [
      ["TWO GUYS, ONE GARAGE", [
        ["1", "Started with ~$1,300.", "Jobs sold his VW van, Wozniak his calculator. That funded the first Apple computers."],
        ["2", "They sold simplicity, not specs.", "While rivals bragged about hardware, Apple sold how it FELT to use. Experience won."],
      ]],
      ["THE MOAT", [
        ["3", "They built a religion.", "People don't buy Apple — they belong to it. Brand loyalty is the deepest moat there is."],
      ], "Sell how it FEELS, not what it does. — Hanubees"],
    ] },
  { id: "amazon", face: "/tmp/wiki_bezos.jpg", logo: "/tmp/logo_amazon.png",
    kicker: "STARTED IN A GARAGE, 1994", headline: "Amazon is worth $2.87 TRILLION.",
    question: "Bezos sold books from a garage. How?",
    slides: [
      ["BOOKS WERE THE TROJAN HORSE", [
        ["1", "He picked books on purpose.", "Easy to ship, huge catalog. A wedge to win your trust — then sell you everything else."],
        ["2", "He made $0 profit on purpose.", "For years he reinvested every dollar into growth instead of profit. Scale first."],
      ]],
      ["THE REAL MONEY", [
        ["3", "He rented out his own plumbing.", "AWS — he sold Amazon's own servers to the world. It now prints most of Amazon's profit."],
      ], "Win a niche, reinvest everything, then sell your infrastructure. — Hanubees"],
    ] },
  { id: "microsoft", face: "/tmp/wiki_gates.jpg", logo: "/tmp/logo_microsoft.png",
    kicker: "THE HARVARD DROPOUT", headline: "Microsoft is worth $3.1 TRILLION.",
    question: "Gates left Harvard to build it. Smart?",
    slides: [
      ["HE SOLD COPIES, NOT MACHINES", [
        ["1", "Software copies for free.", "Write it once, sell infinite copies at near-zero cost. Others sold the box; he sold the brain."],
        ["2", "One deal made him king.", "He licensed DOS to IBM in 1980 — but kept the right to sell it to everyone else. Genius."],
      ]],
      ["THE VISION", [
        ["3", "A computer on every desk.", "He said it when computers were toys — then built the software they'd all run."],
      ], "Own what copies for free. Software beats hardware. — Hanubees"],
    ] },
  { id: "alphabet", face: "/tmp/wiki_page.jpg", logo: "/tmp/logo_google.png",
    kicker: "TWO STANFORD STUDENTS", headline: "Google is worth $4.6 TRILLION.",
    question: "It began as a research project. How?",
    slides: [
      ["10X BETTER, THEN FREE", [
        ["1", "They made search actually work.", "PageRank ranked pages by who links to them — 10x better than every rival overnight."],
        ["2", "Free to you, sold to advertisers.", "Search costs you $0. They sell your intent — $200B+ a year in ads."],
      ]],
      ["THE MOAT", [
        ["3", "They own how you find things.", "~90% of all search runs through Google. It's the front door to the internet."],
      ], "Be 10x better, give it free, sell the attention. — Hanubees"],
    ] },
  { id: "tesla", face: "/tmp/wiki_musk.jpg", logo: "/tmp/logo_tesla.png",
    kicker: "A CAR COMPANY?", headline: "Tesla is worth $1.2 TRILLION.",
    question: "More than Toyota, Ford & GM combined. Why?",
    slides: [
      ["NOT PRICED AS A CARMAKER", [
        ["1", "Wall Street bets on the future.", "It's valued as an AI, energy and robotics company that happens to sell cars today."],
        ["2", "It sells direct — no dealers.", "Owns the whole chain: the cars, the software, the over-the-air updates."],
      ]],
      ["THE REAL BET", [
        ["3", "Autonomy + energy, not cars.", "Robotaxis, batteries, AI — that's the trillion-dollar story investors are paying for."],
      ], "Sell the future you're building, not the product you ship today. — Hanubees"],
    ] },
  { id: "berkshire", face: "/tmp/wiki_buffett.jpg", logo: null, wordmark: "BERKSHIRE HATHAWAY",
    kicker: "A FAILING TEXTILE MILL", headline: "Berkshire is worth $1 TRILLION.",
    question: "Buffett bought a dying mill. How'd it get here?",
    slides: [
      ["HE TURNED IT INTO A MACHINE", [
        ["1", "He used it as a piggy bank.", "Shut the textile business, used the cash to buy great companies outright. Patience over hype."],
        ["2", "Insurance gave him free money.", "Premiums he invests before paying claims — billions of 'float' to compound for decades."],
      ]],
      ["THE DISCIPLINE", [
        ["3", "He never split the stock.", "One Class-A share costs ~$600,000+. Boring, patient, compounded for 60 years."],
      ], "Boring + patient + compounding beats flashy. — Hanubees"],
    ] },

  // ── BATCH 1 (evergreen surprising business facts) ───────────────────────────
  { id: "netflix", face: "/tmp/wiki_netflix.jpg", logo: "/tmp/logo_netflix.png",
    kicker: "THEY LAUGHED AT A $50M OFFER", headline: "Blockbuster could've bought Netflix for $50M.",
    question: "They said no — then went bankrupt. Why?",
    slides: [
      ["NETFLIX SOLVED THE THING EVERYONE HATED", [
        ["1", "No late fees.", "Blockbuster made millions on late fees — the one thing customers despised. Netflix killed them."],
        ["2", "It ate its own business.", "It bet on streaming and cannibalized its own profitable DVD arm before anyone could."],
      ]],
      ["THEN IT BECAME THE STUDIO", [
        ["3", "Own the content, own the customer.", "It stopped renting other people's films and made its own. Now it can't be replaced."],
      ], "Kill your own cash cow before someone else does. — Hanubees"],
    ] },
  { id: "starbucks", face: "/tmp/wiki_starbucks.jpg", logo: "/tmp/logo_starbucks.png",
    kicker: "IT'S NOT ABOUT COFFEE", headline: "Starbucks doesn't really sell coffee.",
    question: "So why is there one on every corner?",
    slides: [
      ["IT SELLS A PLACE TO BE", [
        ["1", "The 'third place.'", "Not home, not work — a place to sit, meet, exist. The coffee is just the ticket in."],
        ["2", "Premium price on a commodity.", "Coffee is cheap. The experience, the cup, the name — that's the markup you happily pay."],
      ]],
      ["IT'S SECRETLY A BANK", [
        ["3", "It holds ~$1B+ of your money.", "Unspent gift-card and app balances — billions sitting interest-free. Genius."],
      ], "Sell the experience around the product, not the product. — Hanubees"],
    ] },
  { id: "nike", face: "/tmp/wiki_nike.jpg", logo: "/tmp/logo_nike.png",
    kicker: "THE LOGO COST $35", headline: "The Nike swoosh cost $35.",
    question: "Now it's one of the most valuable brands alive. How?",
    slides: [
      ["FROM A CAR TRUNK", [
        ["1", "Knight sold shoes from his car.", "He drove to track meets selling running shoes out of the trunk. No store, no ads."],
        ["2", "A student drew the swoosh for $35.", "Carolyn Davidson, 1971. He said he didn't even love it at first."],
      ]],
      ["THE REAL PRODUCT", [
        ["3", "Nike sells belief, not rubber.", "'Just Do It,' the athletes, the story. You're buying who you want to become."],
      ], "A brand is a feeling people pay extra for. — Hanubees"],
    ] },
  { id: "uber", face: "/tmp/wiki_uber.jpg", logo: "/tmp/logo_uber.png",
    kicker: "OWNS ZERO CARS", headline: "Uber owns zero cars.",
    question: "So how did it reshape every city on earth?",
    slides: [
      ["IT OWNS THE SOFTWARE, NOT THE FLEET", [
        ["1", "Drivers bring the cars.", "Uber owns the app and the demand. The most expensive asset — the cars — isn't theirs."],
        ["2", "It solved trust.", "GPS, ratings, cashless pay — suddenly getting in a stranger's car felt safe."],
      ]],
      ["WHY IT KEEPS WINNING", [
        ["3", "Network effects.", "More riders pull more drivers, which pull more riders. The loop defends itself."],
      ], "Own the network, not the assets. — Hanubees"],
    ] },
  { id: "spotify", face: "/tmp/wiki_spotify.jpg", logo: "/tmp/logo_spotify.png",
    kicker: "IT KILLED PIRACY", headline: "Spotify killed music piracy.",
    question: "Not with lawsuits. With what?",
    slides: [
      ["IT BEAT 'FREE'", [
        ["1", "It made legal easier than stealing.", "Instant, every song, no viruses, no downloads. More convenient than piracy itself."],
        ["2", "Free hooks you, premium pays.", "The free tier builds the habit; ads + subscriptions turn it into billions."],
      ]],
      ["THE QUIET POWER", [
        ["3", "It owns discovery.", "Playlists + the algorithm decide what 600M+ people hear next. That's real power."],
      ], "Beat 'free' by being more convenient than free. — Hanubees"],
    ] },
  { id: "ikea", face: "/tmp/wiki_ikea.jpg", logo: "/tmp/logo_ikea.png",
    kicker: "YOU BUILD IT YOURSELF", headline: "IKEA makes YOU build the furniture.",
    question: "And somehow you love it more. Why?",
    slides: [
      ["THE WORK IS THE TRICK", [
        ["1", "Flat-pack = low prices.", "Boxes ship cheap and stack tight — lower costs become lower prices you can't resist."],
        ["2", "The 'IKEA effect.'", "Psychologists proved it: you value what you build with your own hands far more."],
      ]],
      ["THE MAZE", [
        ["3", "You walk past everything.", "The one-way layout forces impulse buys. The $1 meatballs just keep you inside longer."],
      ], "Make the customer part of the work — they value it more. — Hanubees"],
    ] },
  { id: "oracle", face: "/tmp/wiki_oracle.jpg", logo: null, wordmark: "ORACLE",
    kicker: "BORING SOFTWARE, BILLIONS", headline: "Oracle sells 'boring' database software.",
    question: "So how is its founder one of the richest alive?",
    slides: [
      ["IT'S IMPOSSIBLE TO LEAVE", [
        ["1", "Databases run everything.", "Banks, airlines, governments. Once your company runs on Oracle, switching is terrifying."],
        ["2", "Lock-in is the business.", "Licensing, renewals, audits — recurring billions from customers who can't walk away."],
      ]],
      ["THE TARGET", [
        ["3", "He sold to the enterprise.", "Not millions of consumers — a few giant clients on massive, sticky contracts."],
      ], "Boring + mission-critical + hard-to-leave = a money machine. — Hanubees"],
    ] },
  { id: "disney", face: "/tmp/wiki_disney.jpg", logo: null, wordmark: "DISNEY",
    kicker: "FIRED FOR 'LACKING IMAGINATION'", headline: "Walt Disney was fired for 'lacking imagination.'",
    question: "Then he built a forever empire. How?",
    slides: [
      ["HE BET ON A MOUSE", [
        ["1", "He sold experiences, not films.", "Movies were the start — he saw characters people would want to live inside of."],
        ["2", "The flywheel.", "Films → characters → parks → merch → more films. Each part feeds the next, forever."],
      ]],
      ["THE REAL PRODUCT", [
        ["3", "He sold magic to families.", "Not entertainment — emotion, nostalgia, childhood. That never goes out of style."],
      ], "Build a flywheel where every part feeds the others. — Hanubees"],
    ] },

  // ── BATCH 2 ─────────────────────────────────────────────────────────────────
  { id: "whatsapp", face: "/tmp/wiki_whatsapp.jpg", logo: "/tmp/logo_whatsapp.png",
    kicker: "55 EMPLOYEES. $19 BILLION.", headline: "WhatsApp had 55 staff when Facebook paid $19B.",
    question: "For a free messaging app. Why so much?",
    slides: [
      ["IT DID ONE THING PERFECTLY", [
        ["1", "No ads, no games, no clutter.", "Just messaging that always worked. They obsessed over one thing while rivals bloated."],
        ["2", "55 people, 450M+ users.", "Almost no staff served half a billion people. Insane leverage per employee."],
      ]],
      ["WHAT FB ACTUALLY BOUGHT", [
        ["3", "Your contacts, not the app.", "The real asset was the network — everyone you know was already on it."],
      ], "Do ONE thing flawlessly at massive scale. — Hanubees"],
    ] },
  { id: "shopify", face: "/tmp/wiki_shopify.jpg", logo: "/tmp/logo_shopify.png",
    kicker: "IT STARTED AS A SNOWBOARD SHOP", headline: "Shopify began as a snowboard store.",
    question: "Now it powers millions of businesses. How?",
    slides: [
      ["HE BUILT WHAT DIDN'T EXIST", [
        ["1", "He couldn't find good software.", "Tobi wanted to sell snowboards online, hated every tool — so he built his own."],
        ["2", "He sold the shovels.", "He stopped selling boards and sold the store-builder. Every seller pays him rent."],
      ]],
      ["THE BIG BET", [
        ["3", "It arms the rebels vs Amazon.", "Millions of independent stores that don't want to be swallowed by Amazon."],
      ], "If the tool doesn't exist, build it — then sell it to everyone. — Hanubees"],
    ] },
  { id: "spacex", face: "/tmp/wiki_spacex.jpg", logo: "/tmp/logo_spacex.png",
    kicker: "ROCKETS THAT COME BACK", headline: "SpaceX lands its rockets to reuse them.",
    question: "Nobody else does this. Why does it matter?",
    slides: [
      ["IT ATTACKED THE BIGGEST COST", [
        ["1", "Everyone threw rockets away.", "After one flight, gone — like scrapping a jet after one trip. Musk landed and reflew them."],
        ["2", "~10x cheaper launches.", "Reusability slashed the cost of reaching orbit. A moat no rival has caught."],
      ]],
      ["THE PROOF", [
        ["3", "NASA now buys rides from it.", "A private company out-innovated government space programs. Let that sink in."],
      ], "Attack the cost nobody else dares to. — Hanubees"],
    ] },
  { id: "dyson", face: "/tmp/wiki_dyson.jpg", logo: null, wordmark: "DYSON",
    kicker: "5,126 FAILURES FIRST", headline: "James Dyson failed 5,126 times.",
    question: "The 5,127th try built a billion-dollar brand. How?",
    slides: [
      ["HE REFUSED TO QUIT", [
        ["1", "5,127 prototypes over 5 years.", "Broke and in debt, he kept building. Most people quit at try #10."],
        ["2", "No store would sell it.", "So he sold direct — and kept all the margin for himself."],
      ]],
      ["THE PREMIUM", [
        ["3", "He made 'boring' desirable.", "Vacuums, fans, dryers — obsessive design lets him charge 5x the price."],
      ], "The 5,127th try is still a try. Persistence is a strategy. — Hanubees"],
    ] },
  { id: "lego", face: "/tmp/wiki_lego.jpg", logo: null, wordmark: "LEGO",
    kicker: "THE BIGGEST TIRE MAKER ON EARTH", headline: "Lego makes more tires than anyone.",
    question: "A toy company. More tires than Goodyear. How?",
    slides: [
      ["OBSESSIVE CONSISTENCY", [
        ["1", "~300M+ tiny tires a year.", "More wheels than any real tire company — just very, very small ones."],
        ["2", "A 1958 brick still fits today.", "Every brick interlocks across 65 years. That standard never slips."],
      ]],
      ["THE MODEL", [
        ["3", "It sells systems, not toys.", "Endless combinations mean endless buying. One set always needs another."],
      ], "Obsessive consistency builds a moat customers trust. — Hanubees"],
    ] },
  { id: "patagonia", face: "/tmp/wiki_patagonia.jpg", logo: null, wordmark: "PATAGONIA",
    kicker: "HE GAVE THE COMPANY AWAY", headline: "Patagonia's founder gave it all away.",
    question: "He handed over a ~$3B company. Why?",
    slides: [
      ["VALUES OVER PROFIT", [
        ["1", "He donated the whole company.", "In 2022 Chouinard transferred ownership (~$3B) to fight climate change."],
        ["2", "It told you NOT to buy.", "Its famous ad literally said 'Don't Buy This Jacket.' On purpose."],
      ]],
      ["THE TWIST", [
        ["3", "It made people trust — and buy.", "Anti-consumerism became the most powerful brand loyalty money can't buy."],
      ], "Radical values can be your strongest brand. — Hanubees"],
    ] },

  // ── BATCH 3 (from the asset library) ────────────────────────────────────────
  { id: "openai", company: "OpenAI",
    kicker: "FASTEST APP IN HISTORY", headline: "ChatGPT hit 100M users in 2 months.",
    question: "Faster than any app ever. How did OpenAI do it?",
    slides: [
      ["IT BUILT IN THE OPEN", [
        ["1", "It started as a non-profit.", "Founded in 2015 to research AI safely — the profit came later, almost by accident."],
        ["2", "It just let people try it.", "No ads, no waitlist games — it put ChatGPT in front of everyone and let it spread."],
      ]],
      ["THE LESSON", [
        ["3", "Magic sells itself.", "When a product feels like magic the first time, users become the marketing."],
      ], "Build something people HAVE to show their friends. — Hanubees"],
    ] },
  { id: "stripe", company: "Stripe",
    kicker: "SEVEN LINES OF CODE", headline: "Stripe moves billions with 7 lines of code.",
    question: "Two brothers built the internet's checkout. How?",
    slides: [
      ["THEY REMOVED THE PAIN", [
        ["1", "Payments used to take weeks.", "Banks, forms, approvals. The Collison brothers made it 7 lines a developer pastes in."],
        ["2", "They served developers, not bosses.", "Win the engineers and the company follows. Bottom-up beat top-down sales."],
      ]],
      ["THE MOAT", [
        ["3", "They became invisible plumbing.", "You don't see Stripe — but it quietly powers millions of checkouts you use."],
      ], "Make the painful thing effortless and you own it. — Hanubees"],
    ] },
  { id: "snap", company: "Snapchat",
    kicker: "HE SAID NO TO $3 BILLION", headline: "He turned down $3B from Facebook at 23.",
    question: "Everyone called Evan Spiegel insane. Was he?",
    slides: [
      ["HE BET ON A NEW BEHAVIOR", [
        ["1", "Messages that disappear.", "While everyone made posts permanent, he made them vanish — and teens loved it."],
        ["2", "He rejected the $3B.", "At 23, he bet his idea was worth more than Facebook's check. Conviction."],
      ]],
      ["THE PAYOFF", [
        ["3", "He invented the format others copied.", "Stories, filters, AR — features Instagram and everyone else later cloned."],
      ], "Sometimes the boldest move is saying no. — Hanubees"],
    ] },
  { id: "linkedin", company: "LinkedIn",
    kicker: "'BORING' SOLD FOR $26 BILLION", headline: "Microsoft paid $26B for LinkedIn.",
    question: "For a 'boring' work network. Why so much?",
    slides: [
      ["BORING IS A MOAT", [
        ["1", "It owns your professional identity.", "Your résumé, your network, your job history — all in one place you can't leave."],
        ["2", "Every job change updates it for free.", "Users keep their own data fresh because their careers depend on it."],
      ]],
      ["THE VALUE", [
        ["3", "Recruiters pay a fortune.", "Access to the world's professionals is worth billions — and only LinkedIn has it."],
      ], "Own the boring data nobody else has. — Hanubees"],
    ] },
  { id: "salesforce", company: "Salesforce",
    kicker: "IT SOLD 'NO SOFTWARE'", headline: "Salesforce got rich selling 'No Software.'",
    question: "Its logo literally crossed out the word. Why?",
    slides: [
      ["IT KILLED THE OLD WAY", [
        ["1", "Software used to ship on discs.", "Expensive, slow, outdated fast. Benioff rented it over the web instead — pay monthly."],
        ["2", "That model is now everything.", "Every app you 'subscribe' to copied this. He named the category: SaaS."],
      ]],
      ["THE LOCK-IN", [
        ["3", "Your whole company lives in it.", "Once your sales data is inside, leaving means rebuilding everything. You don't."],
      ], "Turn a one-time sale into rent forever. — Hanubees"],
    ] },
  { id: "pinterest", company: "Pinterest",
    kicker: "IT'S NOT SOCIAL MEDIA", headline: "Pinterest isn't social media.",
    question: "No followers, no drama. So what is it?",
    slides: [
      ["IT'S A SEARCH ENGINE", [
        ["1", "People come to PLAN, not scroll.", "Weddings, kitchens, outfits — they're searching for ideas, in a buying mindset."],
        ["2", "No likes, no clout, no toxicity.", "It skipped the social-media arms race entirely. Calmer = stickier."],
      ]],
      ["WHY ADVERTISERS LOVE IT", [
        ["3", "Intent beats attention.", "Someone planning a kitchen is worth more than someone bored. That's the gold."],
      ], "Capture intent, not just attention. — Hanubees"],
    ] },
  { id: "ford", company: "Ford",
    kicker: "HE DOUBLED EVERYONE'S PAY", headline: "Henry Ford doubled wages to $5 a day.",
    question: "His rivals thought he was mad. He got richer. How?",
    slides: [
      ["IT WASN'T CHARITY", [
        ["1", "Turnover was killing him.", "Workers quit constantly. Doubling pay in 1914 made them stay — and get good."],
        ["2", "He created his own customers.", "Now his own workers could afford the cars they built. Demand, manufactured."],
      ]],
      ["THE BIG IDEA", [
        ["3", "The assembly line.", "He didn't invent the car — he invented building it cheap enough for everyone."],
      ], "Pay people well — they become your workforce AND your market. — Hanubees"],
    ] },
  { id: "alibaba", company: "Alibaba",
    kicker: "REJECTED 30 TIMES", headline: "KFC rejected Jack Ma. So did Harvard — 10x.",
    question: "Then he built a $100B+ empire. How?",
    slides: [
      ["HE WAS TURNED DOWN EVERYWHERE", [
        ["1", "24 applied to KFC, 23 got in.", "He was the only reject. Harvard said no ten times. He kept going anyway."],
        ["2", "He connected China to the world.", "Alibaba let tiny factories sell globally — millions of them, all at once."],
      ]],
      ["THE LESSON", [
        ["3", "Rejection isn't a verdict.", "Every no was data, not destiny. Persistence outlasted every gatekeeper."],
      ], "The gatekeepers are often just wrong. — Hanubees"],
    ] },
  { id: "lvmh", company: "LVMH",
    kicker: "THE RICHEST MAN SELLS HANDBAGS", headline: "Bernard Arnault got rich selling luxury.",
    question: "He owns 75+ brands that pretend to be rivals. Why?",
    slides: [
      ["SCARCITY IS THE PRODUCT", [
        ["1", "Louis Vuitton, Dior, Tiffany…", "He owns them all — brands that act like competitors but share one owner."],
        ["2", "They make LESS on purpose.", "Limited supply keeps prices — and desire — sky high. Never discount luxury."],
      ]],
      ["THE EMPIRE", [
        ["3", "He sells status, not stuff.", "A bag's cost is tiny. You're paying for what carrying it says about you."],
      ], "Scarcity + status can beat scale. — Hanubees"],
    ] },
  { id: "tonyhsieh", company: "Zappos",
    kicker: "IT PAID PEOPLE $2,000 TO QUIT", headline: "Zappos offered new hires $2,000 to quit.",
    question: "On day one. On purpose. Why would a company do that?",
    slides: [
      ["IT FILTERED FOR BELIEVERS", [
        ["1", "Take the cash and leave.", "Anyone who'd quit for $2,000 didn't believe in the mission. Good — let them go."],
        ["2", "The ones who stayed were all-in.", "You're left with a team that chose the work over easy money."],
      ]],
      ["THE RESULT", [
        ["3", "Culture became the product.", "Famous service, fierce loyalty — Amazon bought them for ~$1.2B."],
      ], "Filter hard for people who actually believe. — Hanubees"],
    ] },

  // ── BATCH 4 (origin stories + finance) ──────────────────────────────────────
  { id: "airbnb", company: "Airbnb",
    kicker: "OWNS ZERO HOTELS", headline: "Airbnb owns zero hotels.",
    question: "So how is it worth more than most hotel chains?",
    slides: [
      ["THE HOSTS ARE THE HOTEL", [
        ["1", "It owns no property.", "Hosts own the rooms. Airbnb owns the software and the trust layer between strangers."],
        ["2", "Users built the supply for free.", "Millions of hosts created millions of listings — without Airbnb building a single room."],
      ]],
      ["THE REAL PRODUCT", [
        ["3", "It sells trust.", "Reviews, payments, cover — that's what made sleeping in a stranger's home feel safe."],
      ], "Own the network, not the assets. — Hanubees"],
    ] },
  { id: "dropbox", company: "Dropbox",
    kicker: "IT LAUNCHED WITH JUST A VIDEO", headline: "Dropbox launched with a 3-minute video.",
    question: "75,000 signups overnight — before the product existed. How?",
    slides: [
      ["DEMAND BEFORE PRODUCT", [
        ["1", "He filmed what it WOULD do.", "No working app — just a demo video showing the dream. Posted it online."],
        ["2", "The waitlist exploded.", "5,000 → 75,000 overnight. He'd proven people wanted it before building it."],
      ]],
      ["THE LESSON", [
        ["3", "Then he built only that.", "No guessing. He built exactly what 75,000 people had already lined up for."],
      ], "Sell the demand before you build the product. — Hanubees"],
    ] },
  { id: "reddit", company: "Reddit",
    kicker: "IT FAKED ITS FIRST USERS", headline: "Reddit's founders faked its early users.",
    question: "They posted as hundreds of fake accounts. Why?",
    slides: [
      ["THE EMPTY ROOM PROBLEM", [
        ["1", "An empty forum feels dead.", "Nobody posts where nobody is. So they filled it themselves — fake account after fake account."],
        ["2", "It looked alive, so it became alive.", "Real users assumed it was popular, joined in, and the fakes were no longer needed."],
      ]],
      ["THE LESSON", [
        ["3", "Fake it till the network is real.", "Every social product dies in the empty room. They engineered their way past it."],
      ], "Solve the 'empty room' to start a network. — Hanubees"],
    ] },
  { id: "dell", company: "Dell",
    kicker: "BUILT IN A DORM ROOM", headline: "Michael Dell built a PC empire from his dorm.",
    question: "He skipped stores entirely. Why did that win?",
    slides: [
      ["HE CUT THE MIDDLEMAN", [
        ["1", "He sold direct.", "No retail shelf, no markup. Straight from Dell to you — and he kept the difference."],
        ["2", "Build-to-order.", "He only built a machine once it was sold. Zero dead stock sitting in warehouses."],
      ]],
      ["THE MODEL", [
        ["3", "Lower prices, fatter margins.", "Cutting the store let him undercut rivals AND make more per sale. Both at once."],
      ], "Cut the middleman and own the customer. — Hanubees"],
    ] },
  { id: "walmart", company: "Walmart",
    kicker: "THE FRUGAL BILLIONAIRE", headline: "America's richest man drove an old pickup.",
    question: "Sam Walton's empire ran on one boring idea. What?",
    slides: [
      ["ONE OBSESSION", [
        ["1", "Everyday low prices.", "Not flashy sales — relentlessly low, always. He made it a religion."],
        ["2", "He obsessed over costs.", "Every cent he cut from costs, he cut from prices. That pulled in the whole country."],
      ]],
      ["THE DISCIPLINE", [
        ["3", "He stayed humble.", "Richest man in America, still drove a beat-up truck and scouted stores himself."],
      ], "Pick one obsession and out-execute everyone on it. — Hanubees"],
    ] },
  { id: "blackrock", company: "BlackRock",
    kicker: "IT MANAGES ~$10 TRILLION", headline: "BlackRock manages around $10 trillion.",
    question: "More than almost any nation's economy. How?",
    slides: [
      ["IT RUNS THE BORING MONEY", [
        ["1", "Pensions, index funds, savings.", "The unglamorous money of the whole world quietly flows through it."],
        ["2", "Its software runs finance.", "'Aladdin' tracks the risk of a huge slice of global markets. Invisible, essential."],
      ]],
      ["THE LESSON", [
        ["3", "Quiet + indispensable = scale.", "No hype, no logo on a stadium — just the plumbing everyone depends on."],
      ], "Own the boring infrastructure everyone relies on. — Hanubees"],
    ] },
  { id: "zoom", company: "Zoom",
    kicker: "DENIED A VISA 8 TIMES", headline: "Eric Yuan was rejected for a US visa 8 times.",
    question: "He got in on the 9th — then built Zoom. How'd it win?",
    slides: [
      ["HE DID THE BASICS FLAWLESSLY", [
        ["1", "It just worked.", "While rivals lagged, froze and crashed, Zoom's calls were smooth. That was the whole pitch."],
        ["2", "One obsession: ease.", "He measured happiness, not features. Does the call feel effortless? Ship that."],
      ]],
      ["THE LESSON", [
        ["3", "Persistence built it twice.", "8 visa rejections, then years out-executing giants. He never took no as final."],
      ], "Do the basics flawlessly — it beats flash. — Hanubees"],
    ] },
  { id: "x", company: "Twitter",
    kicker: "IT WAS A SIDE PROJECT", headline: "Twitter started as a side project.",
    question: "At a failing podcast company. How'd it take over the world?",
    slides: [
      ["A HACK-DAY IDEA", [
        ["1", "The main company was dying.", "Odeo (podcasts) was losing to Apple. A team side-project became Twitter."],
        ["2", "140 characters forced simplicity.", "Anyone could post anything in seconds. The limit was the feature."],
      ]],
      ["THE LESSON", [
        ["3", "It became the world's pulse.", "Real-time news, jokes, revolutions — all in a box built as an afterthought."],
      ], "Your side project might be the real business. — Hanubees"],
    ] },
  { id: "jpmorgan", company: "JPMorgan",
    kicker: "IT STAYED BORING IN 2008", headline: "JPMorgan survived 2008 by being boring.",
    question: "Wall Street blew up. It got stronger. Why?",
    slides: [
      ["DISCIPLINE WHILE OTHERS GAMBLED", [
        ["1", "It dodged the worst bets.", "When everyone piled into risky subprime, Jamie Dimon largely sat it out."],
        ["2", "A 'fortress balance sheet.'", "It hoarded cash for the storm instead of chasing the last dollar of the boom."],
      ]],
      ["THE PAYOFF", [
        ["3", "It bought the wreckage cheap.", "When rivals collapsed, JPMorgan scooped them up at fire-sale prices."],
      ], "Discipline in the boom wins the bust. — Hanubees"],
    ] },
  { id: "bridgewater", company: "Bridgewater",
    kicker: "EVERY MEETING IS RECORDED", headline: "The biggest hedge fund records every meeting.",
    question: "Ray Dalio calls it 'radical transparency.' Why?",
    slides: [
      ["EGO IS THE ENEMY", [
        ["1", "Anyone can critique anyone.", "Even the boss gets rated openly. No hiding, no politics, no sacred cows."],
        ["2", "Logic over hierarchy.", "Decisions run on data and merit, not who has the biggest title in the room."],
      ]],
      ["THE SYSTEM", [
        ["3", "It's written down.", "The whole culture lives in 'Principles' — brutal honesty, by design."],
      ], "Kill ego with radical transparency. — Hanubees"],
    ] },
  // ── BATCH 5 — 2026-06-10 (restocked subjects) ────────────────────────────────
  { id: "mcdonalds",
    kicker: "A MILKSHAKE MACHINE SALESMAN", headline: "McDonald's serves ~70 million people daily.",
    question: "Ray Kroc wasn't the founder. So how'd he build the empire?",
    slides: [
      ["HE FOUND A PERFECT SYSTEM", [
        ["1", "The McDonald brothers had a gem.", "Their San Bernardino drive-in was fast, cheap and clean. Kroc saw the machine, not the burgers."],
        ["2", "He franchised the system, not the food.", "Every single McDonald's is identical — down to the fry scoop. Consistency at scale was his invention."],
      ]],
      ["THE REAL MONEY IS THE LAND", [
        ["3", "Kroc made money on real estate, not burgers.", "He bought the land under every franchise and rented it back. That's where the billions came from."],
      ], "Own the real estate, sell the food. — Hanubees"],
    ] },
  { id: "virgin",
    kicker: "FROM A STUDENT MAGAZINE", headline: "Virgin spans 400+ companies.",
    question: "How did Richard Branson build an empire of everything?",
    slides: [
      ["HE PICKED THE RIGHT GIANTS TO FIGHT", [
        ["1", "He started a magazine at 16.", "Student magazine → mail-order records → a record label that signed the Sex Pistols. He followed what excited him."],
        ["2", "He took on British Airways with one plane.", "Virgin Atlantic launched with a single 747 leased from Boeing. He bet the whole company on one route."],
      ]],
      ["THE BRAND IS THE BUSINESS", [
        ["3", "The name is worth more than any one business.", "Virgin sells the rebel-underdog feeling. He licenses it to 400+ companies he barely runs."],
      ], "Build the brand, not the business. — Hanubees"],
    ] },
  { id: "harley",
    kicker: "FROM A TINY SHED", headline: "Harley-Davidson survived 120 years.",
    question: "It nearly died 3 times. How'd it keep coming back?",
    slides: [
      ["THEY SURVIVED THE DEPRESSION", [
        ["1", "Motorcycles were luxury in the 1930s.", "Sales collapsed. Harley survived by selling to police fleets — government contracts kept them alive."],
        ["2", "They almost went bankrupt in the 1980s.", "Japanese bikes were cheaper and better. Harley begged the US government for tariff protection."],
      ]],
      ["THE COMEBACK", [
        ["3", "They sold the lifestyle, not the bike.", "HOG (Harley Owners Group) turned customers into a tribe. People don't buy the bike — they buy belonging."],
      ], "Sell belonging, not the product. — Hanubees"],
    ] },
  { id: "nintendo",
    kicker: "A PLAYING CARD COMPANY FROM 1889", headline: "Nintendo is worth ~$70 billion.",
    question: "How did a Kyoto card maker dominate video games?",
    slides: [
      ["THEY DIDN'T START WITH GAMES", [
        ["1", "Playing cards for 80 years.", "Nintendo made hanafuda cards since 1889. They tried love hotels, taxis, instant rice — all failed."],
        ["2", "A toy distributor saved them.", "Hiroshi Yamauchi saw electronics coming and hired a young artist named Shigeru Miyamoto."],
      ]],
      ["ONE GENIUS CALL SAVED EVERYTHING", [
        ["3", "Donkey Kong created the industry.", "Miyamoto's first game was a massive hit. Next came Mario, Zelda, the NES — each redefining what games could be."],
      ], "Hire creative talent and give them freedom. — Hanubees"],
    ] },
  { id: "sony",
    kicker: "FROM A BOMBED-OUT TOKYO SHOP", headline: "Sony invented the Walkman, PlayStation and more.",
    question: "How did two engineers build a cultural empire?",
    slides: [
      ["THEY REBUILT FROM RUBBLE", [
        ["1", "Morita and Ibuka started in 1946.", "A radio repair shop in a bombed department store. Their first product: an electric rice cooker that failed."],
        ["2", "They licensed transistor tech from the West.", "Western Electric invented the transistor but saw no use. Sony bought the rights and made the pocket radio."],
      ]],
      ["THE WALKMAN BET", [
        ["3", "The chairman forced the Walkman through.", "Engineers thought a 'tape player without recording' was stupid. Morita insisted — and changed how the world hears music."],
      ], "Ignore what people say they want. Build what they'll love. — Hanubees"],
    ] },
  { id: "ibm",
    kicker: "BIG BLUE TURNS 114 THIS YEAR", headline: "IBM is worth ~$190 billion.",
    question: "How did a tabulating machine company survive a century?",
    slides: [
      ["IT PUNCHED CARDS BEFORE COMPUTERS", [
        ["1", "IBM started with punch-card tabulators.", "Thomas Watson Sr. sold machines that processed census data — the 'big data' of 1911."],
        ["2", "Watson bet the company on the System/360.", "In 1964, IBM spent $5B (=$40B today) on a single family of compatible computers. It made IBM king for 20 years."],
      ]],
      ["SURVIVAL THROUGH REINVENTION", [
        ["3", "IBM survives by killing its own cash cows.", "Mainframes → PCs → services → cloud → AI. They sell what's next before the old thing dies."],
      ], "Kill your cash cow before the market does. — Hanubees"],
    ] },
  { id: "hp",
    kicker: "THE FIRST SILICON VALLEY COMPANY", headline: "HP started in a one-car garage.",
    question: "That garage is now a California landmark. Why?",
    slides: [
      ["$538 STARTED IT ALL", [
        ["1", "Hewlett and Packard started with $538.", "Their first product: an audio oscillator. Walt Disney bought eight for 'Fantasia.' Their first big customer."],
        ["2", "They invented 'management by walking around.'", "The HP Way — open offices, no locked doors, profit sharing. It became the blueprint for every tech company."],
      ]],
      ["THE GARAGE LEGACY", [
        ["3", "That garage birthed Silicon Valley.", "Stanford → HP → Fairchild → Intel → Apple → Google. One garage started the chain that built modern tech."],
      ], "Culture isn't a perk — it's the strategy. — Hanubees"],
    ] },
  { id: "ebay",
    kicker: "A SIDE PROJECT ABOUT PEZ DISPENSERS", headline: "eBay built the internet economy before Amazon.",
    question: "How did a weekend coding project change shopping?",
    slides: [
      ["ONE PEZ COLLECTOR CHANGED EVERYTHING", [
        ["1", "Pierre Omidyar wrote the code in a weekend.", "1995. His fiancee wanted to trade Pez dispensers online. So he built a simple auction site."],
        ["2", "It grew 100x in a year — with zero ads.", "Word of mouth. People told friends about 'the weird site where you can buy anything.' No marketing budget."],
      ]],
      ["THE COMMUNITY BECAME THE MOAT", [
        ["3", "Feedback scores made strangers trust each other.", "eBay didn't sell anything — it sold trust between people who'd never met. That was the real invention."],
      ], "Build the marketplace. Let users build the value. — Hanubees"],
    ] },
  { id: "paypal",
    kicker: "THE 'MAFIA' THAT CHANGED THE WORLD", headline: "PayPal alumni founded Tesla, YouTube, Yelp and LinkedIn.",
    question: "How did one startup spawn so many giants?",
    slides: [
      ["THEY SURVIVED THE DOT-COM CRASH", [
        ["1", "PayPal launched in the 1999 bubble.", "Palm Pilot payments for pocket money. It survived when most fintech died because people actually used it."],
        ["2", "The merger with X.com brought Elon Musk.", "Peter Thiel's Confinity merged with Elon Musk's X.com. The combined team was insanely talented."],
      ]],
      ["THEY WERE HIRED TOGETHER, FILTERED HARD", [
        ["3", "Extreme talent density.", "They hired only the smartest, most relentless people. That cohort went on to build the next generation of tech."],
      ], "Hire the best people you've ever met. — Hanubees"],
    ] },
  { id: "target",
    kicker: "THE 'CHEAP CHIC' REVOLUTION", headline: "Target built a cult following on $100B+ revenue.",
    question: "How did a discount store become a style icon?",
    slides: [
      ["THEY HIRED DESIGNERS TO SELL CHEAP STUFF", [
        ["1", "Target was Dayton's discount experiment.", "The Dayton family opened a no-frills store in 1962. It was supposed to be just another chain."],
        ["2", "Then they hired Michael Graves and Isaac Mizrahi.", "High-end designers making affordable home goods and clothes. 'Cheap Chic' was born — and nobody could copy it."],
      ]],
      ["THE TWIST", [
        ["3", "Design made people feel smart for saving.", "Target proved cheap doesn't have to look cheap. The pride of finding a good deal became the brand."],
      ], "Make people feel smart, not cheap. — Hanubees"],
    ] },

  // ── BATCH 6 — past 2 decades, emotion + numbers + trending ──────────────────
  { id: "iphone_launch", company: "Apple",
    kicker: "HE LIED ON STAGE — AND CHANGED THE WORLD", headline: "Steve Jobs demo'd a phone that barely worked.",
    question: "The iPhone launch in 2007 was the greatest bluff in tech history. How?",
    slides: [
      ["THE DEMO WAS FAKE", [
        ["1", "The iPhone crashed constantly before launch.", "Engineers scripted a single fixed route through the demo so it wouldn't freeze. One wrong tap = disaster."],
        ["2", "It launched with no App Store, no 3G, no copy-paste.", "Jobs called it '5 years ahead of everything.' Critics laughed. 6 million sold in year 1."],
      ]],
      ["THE AFTERMATH", [
        ["3", "Nokia had 40% of the phone market in 2007.", "By 2013 Nokia sold its phone business to Microsoft. The iPhone killed a 150-year company in 6 years."],
      ], "Ship it before it's perfect. Own the narrative. — Hanubees"],
    ] },
  { id: "wework_collapse", company: "WeWork",
    kicker: "FROM $47 BILLION TO BANKRUPT", headline: "WeWork was valued at $47B in Jan 2019. By Sept 2019 it was almost worthless.",
    question: "How did the world's most hyped startup collapse in 9 months?",
    slides: [
      ["THE FRAUD HIDING IN PLAIN SIGHT", [
        ["1", "Adam Neumann cashed out $700M before IPO.", "He sold stock, leased his OWN buildings back to WeWork, and charged a $5.9M fee for the word 'We.'"],
        ["2", "It lost $219,000 every hour, all day, every day.", "For every $1 it earned, it spent $2. The S-1 filing exposed everything."],
      ]],
      ["THE LESSON", [
        ["3", "SoftBank invested $18.5B. Lost most of it.", "The biggest VC loss in history — caused by one man's ego and one fund's blind FOMO."],
      ], "Revenue hides nothing. Read the S-1. — Hanubees"],
    ] },
  { id: "ftx_collapse", company: "FTX",
    kicker: "HE HAD $26 BILLION. IT WAS ALL STOLEN.", headline: "FTX collapsed in 72 hours. $8 billion of customer money vanished.",
    question: "Sam Bankman-Fried was on magazine covers. How was he actually a fraud?",
    slides: [
      ["THE HOUSE OF CARDS", [
        ["1", "FTX was lending customer deposits to its own hedge fund.", "Alameda Research (SBF's fund) borrowed billions from FTX users — without telling them."],
        ["2", "A single tweet started the run.", "CZ (Binance) tweeted he was selling FTT token. In 72 hours, FTX had a $6B withdrawal crisis."],
      ]],
      ["THE FALL", [
        ["3", "SBF went from $26B net worth to prison in 3 months.", "Sentenced to 25 years. The fastest destruction of personal wealth in history."],
      ], "Trust is earned in years, destroyed in 72 hours. — Hanubees"],
    ] },
  { id: "gamestop", company: "GameStop",
    kicker: "REDDIT USERS BROKE WALL STREET", headline: "GameStop stock went from $5 to $483 in 3 weeks.",
    question: "A dying video game store almost bankrupted hedge funds. How?",
    slides: [
      ["THE SHORT SQUEEZE OF THE CENTURY", [
        ["1", "140% of GameStop's stock was shorted.", "Hedge funds bet it would fail. WallStreetBets on Reddit saw the opportunity."],
        ["2", "Retail traders bought en masse.", "The squeeze forced shorts to buy back at any price — sending the stock from $5 to $483."],
      ]],
      ["THE MOMENT", [
        ["3", "Melvin Capital lost $6.8 billion in January 2021.", "Robinhood then blocked buying. Retail traders felt robbed. Congress investigated."],
      ], "The crowd can move markets. Never underestimate retail. — Hanubees"],
    ] },
  { id: "luna_crash", company: "Luna/Terra",
    kicker: "£40 BILLION EVAPORATED IN 72 HOURS", headline: "Luna crypto went from $80 to $0.0001 in 3 days.",
    question: "Millions of people lost their life savings. What happened?",
    slides: [
      ["THE ALGORITHMIC STABLECOIN TRAP", [
        ["1", "UST was pegged to $1 by an algorithm, not real money.", "When $2B was pulled from the ecosystem, the peg broke. Panic selling cascaded into freefall."],
        ["2", "Do Kwon called critics 'poor.'", "He'd spent years dismissing warnings. When it collapsed, he fled to Serbia. Now facing extradition."],
      ]],
      ["THE DAMAGE", [
        ["3", "$40B wiped out. Suicides reported in Korea.", "Retail investors who put in life savings lost everything in hours. The loudest warning about crypto ever."],
      ], "If you can't explain how it holds its peg, don't invest. — Hanubees"],
    ] },
  { id: "zoom_2020", company: "Zoom",
    kicker: "2,900% GROWTH IN 90 DAYS", headline: "Zoom went from 10M to 300M daily users in 3 months.",
    question: "COVID made one company the default tool for the entire planet. How?",
    slides: [
      ["THE RIGHT PRODUCT AT THE RIGHT MOMENT", [
        ["1", "Zoom was already better than Skype and Google Meet.", "It just worked. No account needed to join. One link. That simplicity won."],
        ["2", "Stock went from $68 to $568 in 10 months.", "From a $19B company to $139B. The fastest enterprise software rise in history."],
      ]],
      ["THE LESSON", [
        ["3", "Zoom fatigue became a word in the dictionary.", "Product-market fit + a global forcing event = a company that defines an era."],
      ], "Be the best product when the world's forced to choose. — Hanubees"],
    ] },
  { id: "threads_launch", company: "Meta",
    kicker: "100 MILLION SIGNUPS IN 5 DAYS", headline: "Threads broke every app launch record in history.",
    question: "Meta launched a Twitter clone. It grew faster than ChatGPT. How?",
    slides: [
      ["THE INSTAGRAM DISTRIBUTION HACK", [
        ["1", "Threads imported your Instagram followers instantly.", "No cold start. No finding friends. Your network was already there on day 1."],
        ["2", "Zuckerberg launched during Twitter's worst week.", "Elon had just imposed rate limits on tweets. Threads launched the same day. Timing is everything."],
      ]],
      ["THE LESSON", [
        ["3", "Distribution beats product on launch day.", "Threads' product was mediocre. Its distribution was 2 billion Instagram users. That's the cheat code."],
      ], "Own the distribution. The product can catch up. — Hanubees"],
    ] },
  { id: "metaverse_loss", company: "Meta",
    kicker: "ZUCKERBERG BURNED $47 BILLION ON A GHOST TOWN", headline: "Meta lost $47B building the Metaverse. Daily users: ~300,000.",
    question: "The biggest bet in tech history failed in public. Why?",
    slides: [
      ["THE VISION NOBODY ASKED FOR", [
        ["1", "Reality Labs lost $13.7B in 2022 alone.", "Zuckerberg renamed the entire company Meta to signal the pivot. Employees hated it."],
        ["2", "The Metaverse had legless avatars.", "The launch demo showed floating torsos. 300K users a day. Discord has 500K concurrent users every hour."],
      ]],
      ["THE LESSON", [
        ["3", "Meta's stock fell 76% in 2022.", "Then he pivoted to AI, cut headcount by 21,000, and stock recovered 300%. Knowing when to abandon a bet = survival."],
      ], "Sunk cost is not strategy. Cut and pivot. — Hanubees"],
    ] },
  { id: "apple_privacy", company: "Apple",
    kicker: "ONE APPLE UPDATE COST META $10 BILLION", headline: "Apple's App Tracking Transparency update destroyed Meta's ad model.",
    question: "A single iOS permission prompt wiped $232B off Meta's market cap. How?",
    slides: [
      ["THE POPUP THAT CHANGED ADVERTISING", [
        ["1", "In 2021, Apple asked users: 'allow tracking?'", "96% of iOS users said NO. Meta lost the ability to target ads on Apple devices overnight."],
        ["2", "Meta lost $10B in revenue in one year.", "Its entire ad model relied on tracking you across apps. Apple killed it with one popup."],
      ]],
      ["THE REAL PLAY", [
        ["3", "Apple's own ad business grew while Meta shrank.", "Apple Search Ads revenue doubled as Meta bled. Apple used privacy as a competitive weapon."],
      ], "Privacy as a moat is the most powerful play in 2024. — Hanubees"],
    ] },
  { id: "sam_altman_fired", company: "OpenAI",
    kicker: "FIRED ON A FRIDAY. BACK AS CEO ON MONDAY.", headline: "OpenAI fired Sam Altman. 700 employees threatened to quit. He was back in 5 days.",
    question: "The most dramatic CEO story in Silicon Valley history. What actually happened?",
    slides: [
      ["THE 4-DAY CHAOS", [
        ["1", "The board fired Altman for 'lack of candor.'", "No warning, no plan. Microsoft (which had invested $13B) heard about it in the news."],
        ["2", "Almost every OpenAI employee signed a letter.", "'Reinstate Sam or we all leave to Microsoft' — 700 of 770 employees signed it."],
      ]],
      ["THE LESSON", [
        ["3", "The board blinked. Altman returned as CEO.", "The employees — not the board — held the real power. Talent > governance structure."],
      ], "The best founders build teams that fight for them. — Hanubees"],
    ] },
  { id: "nvidia_2023", company: "Nvidia",
    kicker: "ONE STOCK GAINED $1 TRILLION IN 12 MONTHS", headline: "Nvidia added more value in 2023 than the entire GDP of the Netherlands.",
    question: "How does one chip company gain $1 trillion in a single year?",
    slides: [
      ["THE AI GOLD RUSH", [
        ["1", "Every AI company needs Nvidia H100 chips.", "ChatGPT runs on them. Gemini runs on them. Claude runs on them. There's a 12-month waitlist."],
        ["2", "Nvidia charges $30,000–$40,000 per chip.", "And sells them by the thousands. Q1 2024 revenue: $26B. Q1 2023: $7B. That's 3.7× in 12 months."],
      ]],
      ["THE MOAT", [
        ["3", "Nvidia has 92% market share in AI chips.", "AMD has the rest. Intel is trying. Neither has CUDA — the software moat that makes switching impossible."],
      ], "Build the infrastructure everyone else depends on. — Hanubees"],
    ] },
  { id: "elon_twitter", company: "X",
    kicker: "HE PAID $44 BILLION FOR A COMPANY WORTH $20 BILLION", headline: "Elon Musk's Twitter takeover is the most chaotic acquisition in history.",
    question: "He fired 75% of staff. Advertisers fled. Value dropped to $12B. What happened?",
    slides: [
      ["THE $44B MISTAKE?", [
        ["1", "Musk tried to back out. Courts forced him to close.", "He'd signed, then claimed bots were too many. A judge said: you signed, you pay."],
        ["2", "He fired 6,500 of 7,500 employees on day 1.", "Then emailed remaining staff: work 80-hour weeks or quit. Half quit anyway."],
      ]],
      ["THE GAMBLE", [
        ["3", "Twitter/X is now worth ~$12B — a $32B loss on paper.", "But Musk is betting on payments, video, and X as a super-app. The story isn't over."],
      ], "Conviction moves fast. Chaos has a cost. — Hanubees"],
    ] },
  { id: "crowdstrike_outage", company: "CrowdStrike",
    kicker: "ONE UPDATE CRASHED 8.5 MILLION COMPUTERS", headline: "CrowdStrike's July 2024 bug caused the largest IT outage in history.",
    question: "Airlines, hospitals, banks — all offline. How does one update do that?",
    slides: [
      ["THE DOMINO EFFECT", [
        ["1", "A faulty sensor config pushed to 8.5M Windows machines.", "Blue Screen of Death. Hospitals delayed surgeries. Airlines cancelled 10,000 flights. Banks went offline."],
        ["2", "$5.4 billion in insured losses in 24 hours.", "Delta alone lost $500M. It took 78 minutes to identify the cause — but days to fix each machine manually."],
      ]],
      ["THE LESSON", [
        ["3", "CrowdStrike stock fell 30% in a week.", "The world runs on software no one sees. One bad line of code affects everyone everywhere. Fragility is invisible until it breaks."],
      ], "The invisible infrastructure is the most critical. — Hanubees"],
    ] },
  { id: "airbnb_ipo", company: "Airbnb",
    kicker: "AIRBNB ALMOST DIED IN 2020. THEN IPO'D AT $100 BILLION.", headline: "Airbnb lost $1B in 8 weeks during COVID. Then doubled its valuation.",
    question: "From near-bankruptcy to the biggest hospitality IPO ever — in 9 months. How?",
    slides: [
      ["THE NEAR-DEATH", [
        ["1", "80% of bookings cancelled in March 2020.", "Revenue went from $1B/quarter to near-zero. They laid off 1,900 employees (25% of staff)."],
        ["2", "They cut marketing to almost zero.", "The insight: people were googling 'Airbnb' not 'vacation rental.' The brand was stronger than the ads."],
      ]],
      ["THE COMEBACK", [
        ["3", "IPO'd at $68. Opened at $146. Closed at $144.", "A $100B valuation for a company that lost $697M that year. Investors bet on the recovery."],
      ], "Brand survives crisis better than ads ever built it. — Hanubees"],
    ] },
  { id: "netflix_squid", company: "Netflix",
    kicker: "A $21 MILLION SHOW MADE $900 MILLION", headline: "Squid Game returned Netflix's investment 42× in 4 weeks.",
    question: "A Korean show nobody expected became the most-watched Netflix show ever. How?",
    slides: [
      ["THE ROI NOBODY SAW COMING", [
        ["1", "Netflix bought Squid Game for $21M all-in.", "Production + acquisition. It was a Korean show with subtitles. The US team almost passed."],
        ["2", "111 million households watched in the first month.", "It added ~4.4M subscribers. At $15/month that's $66M in new MRR from one show."],
      ]],
      ["THE GLOBAL SHIFT", [
        ["3", "Netflix now spends $500M/year on Korean content.", "Non-English content now drives 30% of Netflix viewing. The algorithm found what marketers missed."],
      ], "The algorithm finds hits your instincts miss. Trust the data. — Hanubees"],
    ] },
  { id: "apple_trillion", company: "Apple",
    kicker: "THE FIRST $1 TRILLION COMPANY IN HISTORY", headline: "Apple hit $1 trillion market cap on August 2, 2018.",
    question: "A company started in a garage became worth more than entire stock markets. How?",
    slides: [
      ["THE HARDWARE → SERVICES PIVOT", [
        ["1", "In 2018, iPhone was 62% of Apple's revenue.", "By 2023: Services (App Store, iCloud, Apple TV+) generate $85B/year — growing faster than hardware."],
        ["2", "1 billion active iPhones means 1 billion services customers.", "Apple turned its hardware moat into a recurring revenue machine."],
      ]],
      ["THE NUMBER", [
        ["3", "Apple hit $3 trillion in January 2022.", "Three times the GDP of Saudi Arabia. One company. One ecosystem. One trillion at a time."],
      ], "Hardware gets you in the door. Services keep you forever. — Hanubees"],
    ] },
  { id: "bitcoin_pizza", company: "Bitcoin",
    kicker: "HE SPENT $440 MILLION ON 2 PIZZAS", headline: "On May 22, 2010, Laszlo Hanyecz paid 10,000 BTC for 2 Papa John's pizzas.",
    question: "At Bitcoin's peak, those 2 pizzas cost $440 million. Was it a mistake?",
    slides: [
      ["THE FIRST REAL TRANSACTION", [
        ["1", "Bitcoin was worth $0.0041 in 2010.", "He paid 10,000 BTC when it seemed worthless. His point: prove Bitcoin can buy something real."],
        ["2", "He doesn't regret it.", "His transaction proved Bitcoin had real-world utility. Without it, Bitcoin might've stayed a cypherpunk experiment."],
      ]],
      ["THE LESSON", [
        ["3", "May 22 is now 'Bitcoin Pizza Day' globally.", "The most expensive meal in history made Bitcoin legitimate. You pay the price of innovation."],
      ], "Every technology needs a first believer willing to lose. — Hanubees"],
    ] },
  { id: "instagram_origin", company: "Instagram",
    kicker: "INSTAGRAM ALMOST NEVER HAD PHOTOS", headline: "Instagram started as a location check-in app called Burbn.",
    question: "The $1 billion app was a failed product that pivoted in 2 weeks. How?",
    slides: [
      ["THE PIVOT THAT CHANGED SOCIAL MEDIA", [
        ["1", "Burbn was a check-in app like Foursquare.", "Too complicated. Users mostly used one feature: sharing photos from check-ins."],
        ["2", "Founders stripped everything except photos.", "In 2 weeks they rebuilt the entire app around photos only. Launched October 2010."],
      ]],
      ["THE RESULT", [
        ["3", "1 million users in 2 months. $1B acquisition in 18 months.", "Facebook bought it in 2012 — 13 employees, no revenue, $1 billion. The fastest pivot ROI ever."],
      ], "Find the one thing users actually do. Kill the rest. — Hanubees"],
    ] },
  { id: "tiktok_algorithm", company: "TikTok",
    kicker: "TIKTOK'S ALGORITHM IS WORTH MORE THAN $300 BILLION", headline: "ByteDance won't sell TikTok's algorithm. Even under US government pressure.",
    question: "Why is a recommendation engine the most valuable secret in tech?",
    slides: [
      ["THE MOST POWERFUL FEED EVER BUILT", [
        ["1", "TikTok shows you content from people you don't follow.", "Instagram shows your friends. TikTok shows what you'll watch. That distinction is everything."],
        ["2", "Average session: 95 minutes/day. Instagram: 30 min.", "The algorithm optimises for watch time, not follows. It found a more addictive signal."],
      ]],
      ["THE STANDOFF", [
        ["3", "US tried to force a sale in 2024. TikTok refused.", "ByteDance values the algorithm at more than the platform. The IP is the asset, not the app."],
      ], "The algorithm is the product. Protect it. — Hanubees"],
    ] },
  { id: "uber_near_death", company: "Uber",
    kicker: "UBER'S CEO WAS CAUGHT ON VIDEO ARGUING WITH A DRIVER", headline: "Travis Kalanick was forced to resign in 2017. Uber had $20B in the bank.",
    question: "How does a CEO of the world's most valuable startup get fired?",
    slides: [
      ["THE CULTURE THAT ATE ITSELF", [
        ["1", "A dashcam caught Kalanick berating an Uber driver.", "The driver complained about falling wages. Kalanick said 'some people don't like taking responsibility.'"],
        ["2", "20 Uber employees were fired for sexual harassment.", "An engineer published a blog post about the toxic culture. It went viral. Investors intervened."],
      ]],
      ["THE LESSON", [
        ["3", "5 major investors hand-delivered a letter demanding he resign.", "Culture is not HR's problem — it's the CEO's product. When culture breaks, everything breaks."],
      ], "Culture is your most fragile asset. Guard it. — Hanubees"],
    ] },
  { id: "openai_valuation", company: "OpenAI",
    kicker: "FROM $29 BILLION TO $157 BILLION IN 18 MONTHS", headline: "OpenAI is now worth more than Goldman Sachs.",
    question: "A non-profit AI lab became one of the world's most valuable companies. How?",
    slides: [
      ["THE CHATGPT EFFECT", [
        ["1", "ChatGPT launched November 30, 2022.", "100M users in 2 months. $1B ARR in 12 months. No company had ever grown revenue this fast."],
        ["2", "Microsoft invested $13B for 49% of profits.", "Not equity — profits. The deal structure is unlike anything in VC history."],
      ]],
      ["THE NUMBER", [
        ["3", "GPT-4 API revenue: ~$3B ARR by end of 2024.", "Every startup, every enterprise, every developer is paying OpenAI. The picks-and-shovels play of the AI gold rush."],
      ], "Build the platform everyone else builds on. — Hanubees"],
    ] },
  { id: "shopify_pandemic", company: "Shopify",
    kicker: "COVID MADE SHOPIFY MORE VALUABLE THAN AMAZON CANADA", headline: "Shopify stock grew 500% in 6 months during COVID.",
    question: "A pandemic that killed retail made one e-commerce platform worth $180 billion. How?",
    slides: [
      ["THE FORCED MIGRATION", [
        ["1", "COVID closed physical stores overnight.", "1 million new merchants joined Shopify in 2020. Black Friday 2020: $5.1B in Shopify sales in one day."],
        ["2", "Shopify built a fulfillment network to compete with Amazon.", "$2B investment in warehouses — to give small merchants same-day delivery without Amazon's fees."],
      ]],
      ["THE INSIGHT", [
        ["3", "Shopify powers 10% of US e-commerce.", "It never touches inventory. Never owns a product. Just takes rent from every merchant on the internet."],
      ], "Infrastructure > inventory. Own the rails, not the trains. — Hanubees"],
    ] },
  { id: "robinhood_gamestop", company: "Robinhood",
    kicker: "ROBINHOOD STOPPED RETAIL FROM BUYING. WALL STREET KEPT GOING.", headline: "Robinhood halted GameStop trading. Its own users sued.",
    question: "An app that promised to 'democratize finance' protected the hedge funds instead. How?",
    slides: [
      ["THE BETRAYAL", [
        ["1", "At the peak of the squeeze, Robinhood halted GameStop purchases.", "Only sells allowed. The stock crashed 44% in one day."],
        ["2", "The reason: Robinhood needed $3B in collateral it didn't have.", "It had to call its investors at 3AM. It wasn't a conspiracy — it was under-capitalisation."],
      ]],
      ["THE AFTERMATH", [
        ["3", "Congress held hearings. Class action lawsuits filed.", "Robinhood IPO'd at $38 in July 2021 — fell to $8 within months. Trust, once broken, is the brand."],
      ], "Your brand is what you do under pressure, not what you promise. — Hanubees"],
    ] },
  { id: "microsoft_comeback", company: "Microsoft",
    kicker: "MICROSOFT STOCK GREW 10X IN 8 YEARS", headline: "Satya Nadella turned a dying company into a $3 trillion giant.",
    question: "In 2014 Microsoft was losing. In 2024 it's the world's most valuable company. What changed?",
    slides: [
      ["THE CEO NOBODY EXPECTED", [
        ["1", "Wall Street wanted an outsider. Board picked a 22-year Microsoft veteran.", "Nadella's first move: put Office on iPhone. The old Microsoft would never have done that."],
        ["2", "He killed 'Stack Ranking' — Microsoft's toxic review system.", "Stack ranking forced employees to compete against each other. Killing it unleashed collaboration."],
      ]],
      ["THE PIVOT", [
        ["3", "Azure cloud: $0 in 2010 → $100B run rate in 2024.", "Nadella bet on cloud + AI. OpenAI partnership. GitHub Copilot. The company became the AI platform."],
      ], "The best turnarounds start with culture, not products. — Hanubees"],
    ] },
  { id: "tesla_shorts", company: "Tesla",
    kicker: "SHORT SELLERS LOST $38 BILLION BETTING AGAINST ELON", headline: "Tesla was the most shorted stock in history — and the shorts got crushed.",
    question: "Wall Street was certain Tesla would fail. It became the most valuable car company. How?",
    slides: [
      ["THE BIGGEST SHORT SQUEEZE", [
        ["1", "In 2019, Tesla was burning cash and missing targets.", "Short interest hit $20B. Jim Chanos, Einhorn — the smartest short sellers on earth were all betting against it."],
        ["2", "Q3 2019: Tesla surprised with a profit.", "The stock doubled in 3 months. Short sellers had to buy back at any price. $38B in losses."],
      ]],
      ["THE LESSON", [
        ["3", "Tesla stock went from $18 to $414 in 2020 (pre-split).", "Then lost 75% in 2022. Then recovered. Short-selling a visionary founder is a dangerous trade."],
      ], "Don't bet against a founder who controls the narrative. — Hanubees"],
    ] },
  { id: "netflix_password", company: "Netflix",
    kicker: "NETFLIX KILLED PASSWORD SHARING — AND GAINED 6 MILLION USERS", headline: "Every analyst said it would backfire. Netflix gained 29M subscribers in 6 months.",
    question: "The most controversial product decision of 2023 turned out to be genius. How?",
    slides: [
      ["THE COUNTERINTUITIVE BET", [
        ["1", "100M+ households were sharing passwords illegally.", "Netflix spent years ignoring it. In 2023, it sent an email: 'your account is for your household only.'"],
        ["2", "Twitter exploded with complaints. Analysts predicted churn.", "Instead, freeloaders converted. Paid sharing at $7.99/month became a new revenue stream."],
      ]],
      ["THE RESULT", [
        ["3", "Netflix added 13M subscribers in Q4 2023 alone.", "Record growth. Stock hit all-time high. The 'bad' decision was actually the best decision of the year."],
      ], "Sometimes the obvious move everyone avoids is the right one. — Hanubees"],
    ] },
  { id: "clubhouse_rise", company: "Clubhouse",
    kicker: "VALUED AT $4 BILLION. THEN NOBODY SHOWED UP.", headline: "Clubhouse raised $100M at $4B with barely a product.",
    question: "The hottest app of 2021 was dead by 2022. What killed it?",
    slides: [
      ["THE SCARCITY TRICK", [
        ["1", "Clubhouse was invite-only at launch.", "No invite = you couldn't get in. Elon Musk joined a room. Elon Musk talking = everyone wanted in."],
        ["2", "Twitter Spaces, Facebook Live Audio, Spotify Greenroom.", "Every platform launched a clone within 3 months. The moat was 0."],
      ]],
      ["THE LESSON", [
        ["3", "Daily active users fell 80% in 6 months.", "Exclusivity drove the growth. Ubiquity killed it. When everyone can do what you do — you're done."],
      ], "Scarcity creates desire. Abundance destroys it. — Hanubees"],
    ] },
  { id: "apple_m1", company: "Apple",
    kicker: "APPLE FIRED INTEL WITH A CHIP MADE IN-HOUSE", headline: "Apple's M1 chip was 3.5× faster than the Intel MacBook it replaced.",
    question: "A phone chip designer beat the world's biggest processor company. How?",
    slides: [
      ["THE 15-YEAR PLAN", [
        ["1", "Apple started designing its own chips for iPhone in 2010.", "15 years of learning — A4, A5, all the way to A14 — before building a laptop chip."],
        ["2", "M1 got 2.5× more performance per watt than Intel.", "Same battery, twice the battery life, 3.5× faster CPU. Intel couldn't match it in 3 years."],
      ]],
      ["THE VERTICAL INTEGRATION WIN", [
        ["1", "Apple controls chip + OS + hardware + software.", "No other company does all four. That integration is why M-series chips are untouchable."],
      ], "Control the stack. Control the performance. — Hanubees"],
    ] },
  { id: "google_chrome", company: "Google",
    kicker: "GOOGLE BUILT A BROWSER TO SAVE ITS OWN BUSINESS", headline: "Chrome launched in 2008. Today it has 65% of all browser market share.",
    question: "Google didn't need a browser. So why did it build one?",
    slides: [
      ["THE DEFENSIVE MOVE", [
        ["1", "IE was slowing down Gmail, Maps, and Search.", "A broken browser meant a broken Google product. So Google built the browser itself."],
        ["2", "Chrome was built to make web apps run like desktop apps.", "V8 JavaScript engine made every Google product 10× faster overnight."],
      ]],
      ["THE DOMINANCE", [
        ["3", "Chrome is now the OS of the web.", "65% market share. It shapes every web standard. Every developer builds for Chrome first."],
      ], "When your ecosystem is blocked, build the gate yourself. — Hanubees"],
    ] },
  { id: "facebook_cambridge", company: "Meta",
    kicker: "87 MILLION PEOPLE'S PRIVATE DATA WAS SOLD", headline: "Cambridge Analytica harvested Facebook data to influence elections.",
    question: "The scandal that forced Zuckerberg to Congress — and changed internet privacy forever.",
    slides: [
      ["THE DATA BREACH THAT WASN'T A HACK", [
        ["1", "A quiz app legally harvested data on 87M users.", "Facebook's API allowed developers to pull not just quiz-takers' data, but all their friends' data too."],
        ["2", "That data was sold to Cambridge Analytica.", "Used to micro-target voters in Brexit and the 2016 US election. Zuckerberg said he didn't know."],
      ]],
      ["THE FALLOUT", [
        ["3", "Facebook was fined $5B by the FTC.", "The largest fine in FTC history. GDPR in Europe followed. The internet's relationship with data changed forever."],
      ], "Data you collect is a liability, not just an asset. — Hanubees"],
    ] },
  { id: "amazon_prime_loss", company: "Amazon",
    kicker: "AMAZON PRIME LOST MONEY FOR A DECADE — ON PURPOSE", headline: "Amazon Prime was a financial disaster until it became a $35B business.",
    question: "Jeff Bezos subsidised shipping for years. Why?",
    slides: [
      ["THE FLYWHEEL BET", [
        ["1", "Prime launched in 2005 at $79/year for free 2-day shipping.", "Amazon lost money on shipping every single Prime order for years. CFOs hated it."],
        ["2", "Prime members spend 4× more than non-Prime members.", "The loss on shipping was an acquisition cost for the highest-value customers on the platform."],
      ]],
      ["THE EMPIRE", [
        ["3", "Prime is now $139/year. 200M+ members. $35B in revenue.", "Video, music, pharmacy, groceries — all bundled. What started as a shipping bet became a loyalty empire."],
      ], "Lose money on the door. Win it on the relationship. — Hanubees"],
    ] },
  { id: "roblox_kids", company: "Roblox",
    kicker: "60% OF US KIDS UNDER 16 PLAY ROBLOX MONTHLY", headline: "Roblox has more daily users than Twitter and Snapchat combined.",
    question: "A platform built by kids, for kids — worth $45 billion. How?",
    slides: [
      ["THE USER-GENERATED EMPIRE", [
        ["1", "Roblox doesn't make games. Kids make the games.", "60M+ games on the platform, all built by users aged 13–24. Roblox just provides the engine."],
        ["2", "Developers earned $741M in 2023.", "Kids who built games on Roblox are now multi-millionaires. The platform incentivised creation."],
      ]],
      ["THE LOCK-IN", [
        ["3", "Average user spends 2.5 hours/day on Roblox.", "For context: TikTok = 95 min, YouTube = 70 min. When you own a child's play, you own their lifetime value."],
      ], "Build the playground. Let users fill it. — Hanubees"],
    ] },
  { id: "stripe_private", company: "Stripe",
    kicker: "STRIPE REFUSED TO IPO AT $95 BILLION", headline: "The most valuable private company in Silicon Valley keeps saying no to Wall Street.",
    question: "Patrick Collison could be richer than Zuckerberg. Why does he stay private?",
    slides: [
      ["THE ANTI-IPO THESIS", [
        ["1", "Public markets force quarterly thinking.", "Stripe is building 10-year infrastructure. Quarterly earnings calls would destroy that discipline."],
        ["2", "Stripe raised $6.5B without going public.", "At $95B valuation. Employees get liquidity via secondaries. There's no pressure to IPO."],
      ]],
      ["THE NUMBERS", [
        ["3", "Stripe processes $1 trillion in payments annually.", "More than the GDP of the Netherlands. Built by 2 Irish brothers who cold-emailed their first customers."],
      ], "Don't let Wall Street's timeline replace your own. — Hanubees"],
    ] },
  { id: "youtube_google", company: "YouTube",
    kicker: "GOOGLE BOUGHT YOUTUBE FOR $1.65B — IT'S NOW WORTH $300B", headline: "YouTube was 20 months old when Google paid $1.65B for it.",
    question: "The fastest 180× return in acquisition history. How did Google know?",
    slides: [
      ["THE BET ON BANDWIDTH", [
        ["1", "YouTube was burning $1M/month on bandwidth in 2006.", "It had no revenue model. Just 100M video views per day and a massive hosting bill."],
        ["2", "Google saw the search intent inside video.", "Every 'how to' video is a query. Google owned text search — YouTube gave them video search."],
      ]],
      ["THE EMPIRE", [
        ["3", "YouTube revenue: $30B+/year.", "2 billion users. 500 hours of video uploaded every minute. The $1.65B became a $300B asset."],
      ], "Buy the behaviour, not the revenue. — Hanubees"],
    ] },
  { id: "microsoft_github", company: "Microsoft",
    kicker: "MICROSOFT BOUGHT THE TOOL EVERY DEVELOPER USES", headline: "GitHub acquisition for $7.5B gave Microsoft access to 100 million developers.",
    question: "Developers hated Microsoft. Now they're all inside Microsoft's ecosystem. How?",
    slides: [
      ["THE DEVELOPER PLATFORM PLAY", [
        ["1", "GitHub had 28M developers in 2018. Now 100M.", "Every line of code, every open-source project, every startup — all in Microsoft's database."],
        ["2", "Copilot launched in 2021. $10/month/developer.", "Trained on all that GitHub code. Now generating $1B+ ARR. The acquisition funded the AI product."],
      ]],
      ["THE LESSON", [
        ["3", "Microsoft bought GitHub for $7.5B. Copilot makes it back every 7 years.", "The data inside GitHub was worth more than the platform. Buy the data. Build the product."],
      ], "The data in your acquisition is worth more than the revenue. — Hanubees"],
    ] },
  { id: "amazon_alexa_failure", company: "Amazon",
    kicker: "AMAZON SPENT $20 BILLION ON ALEXA. IT LOSES $10B A YEAR.", headline: "500 million Alexa devices. Still can't make money.",
    question: "Amazon's biggest hardware bet might be its biggest failure. What went wrong?",
    slides: [
      ["THE HARDWARE TRAP", [
        ["1", "Alexa launched in 2014. It was the first smart speaker.", "Amazon won the market. Then Google Home arrived. Apple HomePod arrived. It became commoditised."],
        ["2", "People use Alexa to set timers and play music.", "Not to shop. The dream of voice commerce never arrived. Amazon sold the hardware and got nothing in return."],
      ]],
      ["THE LESSON", [
        ["3", "Amazon wrote down Alexa as a loss-maker in 2022.", "Even Amazon — the most disciplined capital allocator in tech — bets wrong. The difference: they cut fast."],
      ], "Kill it before it kills the balance sheet. — Hanubees"],
    ] },
  { id: "fintech_klarna", company: "Klarna",
    kicker: "KLARNA WENT FROM $46 BILLION TO $6 BILLION — THEN BACK TO $20 BILLION", headline: "The Buy Now Pay Later unicorn's wild 3-year ride.",
    question: "How does a company lose 85% of its value and come back stronger?",
    slides: [
      ["THE BNPL BUBBLE", [
        ["1", "Klarna peaked at $46B in 2021 during the fintech boom.", "Rising interest rates crushed BNPL. Lending to people who can't pay upfront = default risk."],
        ["2", "Klarna raised at $6.7B in 2022 — an 85% haircut.", "The same investors who valued it at $46B repriced it 18 months later. Brutal."],
      ]],
      ["THE RECOVERY", [
        ["3", "Klarna is now profitable. IPO planned at $20B in 2024.", "They cut 700 staff (10%), rebuilt unit economics, added AI. Resilience beat the narrative."],
      ], "A valuation cut isn't death. It's discipline forced on you. — Hanubees"],
    ] },
  { id: "google_stadia", company: "Google",
    kicker: "GOOGLE STADIA: $100M LAUNCH. DEAD IN 3 YEARS.", headline: "Google killed its cloud gaming platform after 3 years and millions of users lost everything.",
    question: "The most expensive gaming failure in history. What went wrong?",
    slides: [
      ["THE GRAVEYARD PROBLEM", [
        ["1", "Stadia launched in 2019 with 22 games at $10/month.", "Cloud gaming worked. The games were thin. The library never grew."],
        ["2", "Google shut down its first-party studios 2 years in.", "The signal: Google wasn't committed. Developers stopped porting games. Users stopped paying."],
      ]],
      ["THE LESSON", [
        ["3", "Google has killed 275+ products.", "Developers know: don't build on Google platforms. The trust deficit costs them billions in partnerships."],
      ], "Reliability is a product feature. Google never shipped it. — Hanubees"],
    ] },
  { id: "softbank_losses", company: "SoftBank",
    kicker: "MASAYOSHI SON LOST $130 BILLION IN 2 YEARS", headline: "SoftBank's Vision Fund 2 lost more money than any fund in history.",
    question: "The man who turned $20M into $60B on Alibaba. How did he lose $130B?",
    slides: [
      ["THE OVER-CORRECTION", [
        ["1", "Vision Fund 1 made 10,000% on Alibaba. So he raised $100B for VF1.", "WeWork. Uber. OYO. Katerra. The bigger the fund, the bigger the mistakes."],
        ["2", "Vision Fund 2 lost $27B in one year (2022).", "Rising rates crushed unprofitable growth companies. Every SoftBank portfolio company was unprofitable."],
      ]],
      ["THE LESSON", [
        ["3", "SoftBank's market cap fell from $100B to $50B.", "Big checks don't guarantee big returns. Masayoshi Son's genius was Alibaba — not the fund."],
      ], "One great bet doesn't make a system. — Hanubees"],
    ] },
  { id: "doordash_ipo_2020", company: "DoorDash",
    kicker: "DOORDASH IPO'D AT A LOSS — STOCK DOUBLED DAY ONE", headline: "DoorDash had never turned a profit. Investors didn't care.",
    question: "It was losing hundreds of millions. Wall Street valued it at $70 billion. Why?",
    slides: [
      ["THE GROWTH INVESTOR THESIS", [
        ["1", "DoorDash had 50% of the US food delivery market.", "More than Uber Eats and Grubhub combined. Market share at scale = eventual pricing power."],
        ["2", "IPO'd at $102. Opened at $182 on day 1.", "One of the biggest first-day pops in 2020. Pure pandemic FOMO."],
      ]],
      ["THE REALITY", [
        ["3", "DoorDash didn't turn a quarterly profit until 2023.", "Three years after IPO. The bet on dominance paid off — eventually. Patience is the price of platform investing."],
      ], "Own the market. Profit can wait. — Hanubees"],
    ] },
  { id: "snapchat_stories", company: "Snapchat",
    kicker: "INSTAGRAM STOLE STORIES AND EVAN SPIEGEL SAID NOTHING", headline: "Instagram cloned Snapchat Stories in 2016. It worked instantly.",
    question: "Feature theft at scale. How did Snap survive and thrive anyway?",
    slides: [
      ["THE COPY THAT HURT", [
        ["1", "Snapchat Stories launched in 2013 — 100M daily users.", "Instagram Stories launched in August 2016 — 250M daily users by April 2017. In 9 months."],
        ["2", "Snapchat's growth flatlined immediately.", "Stock fell. Analysts wrote it off. Zuckerberg had done the same to Twitter with News Feed in 2006."],
      ]],
      ["THE RESILIENCE", [
        ["3", "Snapchat has 422M daily active users in 2024.", "It survived by going deeper on AR and Gen-Z identity. Being copied forced it to be original."],
      ], "Being copied means you were first. Survive long enough to prove it. — Hanubees"],
    ] },
  { id: "coinbase_crypto", company: "Coinbase",
    kicker: "COINBASE IPO'D AT $86 BILLION. NOW WORTH $60 BILLION.", headline: "Crypto's first major Wall Street moment changed finance forever.",
    question: "A crypto exchange went public at a $86B valuation. What does that mean?",
    slides: [
      ["THE LEGITIMACY MOMENT", [
        ["1", "April 14, 2021: Coinbase listed on Nasdaq at $328/share.", "At $86B, it was worth more than Nasdaq itself. Crypto had arrived on Wall Street."],
        ["2", "Revenue: $7.4B in 2021. Then $3B in 2022. Then $6.6B in 2024.", "Coinbase earns more when crypto prices are high. The volatility is the business model."],
      ]],
      ["THE MOAT", [
        ["3", "Coinbase has 110M verified users in 100+ countries.", "The most trusted brand in crypto in the US. Regulatory compliance is the product that competitors can't copy fast."],
      ], "Regulation isn't a moat — being the most trusted player in regulation is. — Hanubees"],
    ] },

  // ── BATCH 7 — trending + viral business moments ──────────────────────────────
  { id: "mr_beast_revenue", company: "MrBeast",
    kicker: "HE MAKES $700 MILLION A YEAR FROM YOUTUBE", headline: "MrBeast is the first YouTuber to out-earn Hollywood studios.",
    question: "A 26-year-old from North Carolina earns more than most movie studios. How?",
    slides: [
      ["THE REINVESTMENT ENGINE", [
        ["1", "MrBeast reinvests 100% of YouTube ad revenue into videos.", "A $3M YouTube cheque funds the next $3M video. The bigger the video, the more views, the more ad revenue."],
        ["2", "MrBeast Burger: 2,000 locations in 18 months.", "Ghost kitchen model — no restaurants, just existing kitchens. $100M revenue in year 1."],
      ]],
      ["THE EMPIRE", [
        ["3", "Feastables chocolate: $100M in year 1.", "285M subscribers. The most-subscribed individual on YouTube. Revenue from brand deals alone: $100M+/year."],
      ], "Reinvest everything into content. Content buys everything else. — Hanubees"],
    ] },
  { id: "andrew_tate_banned", company: "Andrew Tate",
    kicker: "BANNED FROM EVERY PLATFORM — BECAME MORE FAMOUS", headline: "Andrew Tate was deplatformed in 2022. His search traffic tripled.",
    question: "How does getting banned from Twitter, TikTok, Instagram and YouTube make someone more famous?",
    slides: [
      ["THE STREISAND EFFECT", [
        ["1", "TikTok banned him. His fans reposted his content 11.6 billion more times.", "The bans created controversy. Controversy creates search. Search creates new fans."],
        ["2", "He announced his arrest on Twitter — to 4.6M followers.", "Even from jail, the distribution was uninterrupted. Platforms banned him. People didn't."],
      ]],
      ["THE LESSON", [
        ["3", "His Hustlers University had 130,000 paid members at $50/month.", "= $6.5M/month from a course. Platform independence is more valuable than platform presence."],
      ], "Own your audience. Never depend on a platform you don't control. — Hanubees"],
    ] },
  { id: "gpt4_exam", company: "OpenAI",
    kicker: "GPT-4 PASSED THE BAR EXAM IN THE TOP 10%", headline: "An AI scored higher than 90% of human lawyers on the bar exam.",
    question: "The test that takes humans 3 years of law school to pass. GPT-4 passed it in seconds. What does that mean?",
    slides: [
      ["THE BENCHMARK THAT CHANGED EVERYTHING", [
        ["1", "GPT-3 failed the bar exam. GPT-4 scored in the 90th percentile.", "One model iteration. One year apart. The jump shocked even OpenAI researchers."],
        ["2", "GPT-4 also passed the SAT, GRE, LSAT, USMLE Step 1.", "Medical licensing. Graduate admissions. Law school entry. All in the top 10–30% of humans."],
      ]],
      ["THE IMPLICATION", [
        ["3", "Goldman Sachs: 300M jobs could be automated by AI.", "Not replaced overnight — but AI becomes the junior analyst, junior lawyer, junior coder. The entry-level job market changed permanently."],
      ], "The question isn't whether AI takes jobs. It's which jobs, how fast. — Hanubees"],
    ] },
  { id: "india_upi", company: "UPI India",
    kicker: "INDIA BUILT THE WORLD'S LARGEST PAYMENT SYSTEM — FOR FREE", headline: "India processes 13 billion UPI transactions a month. More than Visa and Mastercard combined.",
    question: "A government-built payment network beat Silicon Valley at its own game. How?",
    slides: [
      ["THE PUBLIC INFRASTRUCTURE PLAY", [
        ["1", "UPI launched in 2016. Free for consumers. Free for merchants.", "Zero transaction fee. Visa charges 2%. That 2% gone = billions saved by Indian businesses."],
        ["2", "$2.2 trillion transacted in FY2024.", "PhonePe, GPay, Paytm all run on UPI. The government built the rails; private companies built the apps."],
      ]],
      ["THE GLOBAL LESSON", [
        ["3", "France, Singapore, UAE are adopting UPI.", "India exported its payment infrastructure. A government product beat PayPal, Stripe, and Square on volume."],
      ], "Infrastructure built for inclusion scales bigger than infrastructure built for profit. — Hanubees"],
    ] },
  { id: "chatgpt_plugins", company: "OpenAI",
    kicker: "CHATGPT BECAME AN APP STORE IN ONE NIGHT", headline: "OpenAI launched plugins — 1,000 apps were built in the first week.",
    question: "OpenAI turned an AI chatbot into a platform. Is it the next App Store?",
    slides: [
      ["THE PLATFORM SHIFT", [
        ["1", "March 2023: ChatGPT plugins launched.", "Expedia, Kayak, Klarna, Wolfram Alpha — all plugged into ChatGPT in 30 days."],
        ["2", "GPT Store launched January 2024: 3M custom GPTs in 60 days.", "Users built their own chatbots without code. The App Store analogy became literal."],
      ]],
      ["THE POWER", [
        ["3", "OpenAI takes 0% revenue share from GPTs (for now).", "Apple takes 30%. OpenAI is buying the ecosystem first. The monetisation comes after monopoly."],
      ], "Build the ecosystem before you tax it. — Hanubees"],
    ] },
  { id: "zomato_ipo", company: "Zomato",
    kicker: "INDIA'S FOOD DELIVERY APP IPO'D AT A LOSS — STOCK DOUBLED", headline: "Zomato was losing ₹800 crore a year. Investors valued it at ₹64,365 crore.",
    question: "A loss-making food app became one of India's biggest IPOs. Why?",
    slides: [
      ["THE INDIA INTERNET BET", [
        ["1", "Zomato had 32M monthly orders. India has 1.4 billion people.", "Penetration at <5%. The bull case: India's food delivery is in its Uber-2012 moment."],
        ["2", "IPO subscribed 38× over. Every Indian investor wanted in.", "FOMO + India growth story + zero alternatives for food delivery exposure."],
      ]],
      ["THE REALITY", [
        ["3", "Zomato became profitable in Q2 FY2024.", "Two years after IPO. Then acquired Blinkit (quick commerce). Now a logistics + food company."],
      ], "IPO on the story. Survive on the fundamentals. — Hanubees"],
    ] },
  { id: "deepseek_shock", company: "DeepSeek",
    kicker: "A CHINESE LAB BUILT GPT-4 FOR $6 MILLION", headline: "DeepSeek R1 matched OpenAI's best model at 1/50th the cost.",
    question: "Nvidia lost $600B in market cap in one day. One open-source model did that. How?",
    slides: [
      ["THE EFFICIENCY BREAKTHROUGH", [
        ["1", "OpenAI spent ~$100M training GPT-4. DeepSeek spent $6M.", "Not a tweak — a fundamental rethink of how to train models efficiently."],
        ["2", "Nvidia stock fell 17% the day DeepSeek went viral.", "$600B wiped in one session. If AI needs fewer chips to train, the GPU supercycle thesis breaks."],
      ]],
      ["THE OPEN SOURCE BOMB", [
        ["3", "DeepSeek released the weights for free.", "Anyone can run it. The model that cost $6M to build can now be downloaded by anyone with a laptop."],
      ], "The most dangerous competitor is the one who open-sources your moat. — Hanubees"],
    ] },
  { id: "perplexity_rise", company: "Perplexity",
    kicker: "A STARTUP IS EATING GOOGLE SEARCH", headline: "Perplexity hit $1B ARR with 100 million monthly users — and Google is scared.",
    question: "The 25-year-old search model is being challenged by a 2-year-old startup. How?",
    slides: [
      ["THE ANSWER ENGINE", [
        ["1", "Google gives you 10 links. Perplexity gives you the answer.", "With citations. In 3 seconds. No ads. No scrolling. Just the fact."],
        ["2", "Reached $1B valuation in 12 months.", "Raised from Jeff Bezos, Nvidia, and SoftBank. The anti-Google bet is now the hottest AI company after OpenAI."],
      ]],
      ["THE THREAT", [
        ["3", "Google earns $200B/year from search ads.", "Perplexity's no-ad model is existential if it scales. Google faces its Blockbuster moment — from inside its own category."],
      ], "When your product gets an answer engine, the ad model breaks. — Hanubees"],
    ] },
  { id: "jio_disruption", company: "Reliance Jio",
    kicker: "JIO GAVE FREE DATA AND DESTROYED INDIA'S TELECOM INDUSTRY", headline: "Jio launched in 2016 with free calls and data. 7 rivals went bankrupt.",
    question: "One company entered a market and wiped out the competition in 18 months. How?",
    slides: [
      ["THE PREDATORY PRICING PLAYBOOK", [
        ["1", "Mukesh Ambani spent ₹1.5 lakh crore ($20B) building Jio before launch.", "The network was already built. Free pricing was affordable — because the infra was paid for."],
        ["2", "100 million subscribers in 170 days. The fastest in telecom history.", "Vodafone, Aircel, RCom, Airtel — all bled. Aircel went bankrupt. RCom went bankrupt."],
      ]],
      ["THE EMPIRE", [
        ["3", "Jio now has 450M subscribers. India's #1 telecom.", "It then launched JioFiber, JioTV, JioMart. One network became the distribution layer for everything."],
      ], "Build the infrastructure. Then sell everything on top of it. — Hanubees"],
    ] },
  { id: "spacex_starship", company: "SpaceX",
    kicker: "THE BIGGEST ROCKET IN HISTORY EXPLODED — TWICE. THEN LANDED.", headline: "Starship is taller than the Statue of Liberty and 2× more powerful than Saturn V.",
    question: "It failed publicly 3 times. The 4th test caught the rocket mid-air. How does failure become a strategy?",
    slides: [
      ["FAILING FORWARD AT SCALE", [
        ["1", "Starship exploded on launch pad in April 2023.", "The FAA grounded it. Musk called it a 'learning experience.' Engineers had 900 changes to make."],
        ["2", "Test 4, June 2024: Both boosters caught or landed.", "The mechazilla arm caught a 70m-tall rocket from the sky. Nobody had ever attempted this."],
      ]],
      ["THE AMBITION", [
        ["3", "NASA paid SpaceX $4B to land humans on the Moon using Starship.", "The rocket that keeps exploding is the one NASA is trusting with the next Moon landing."],
      ], "Rapid public failure beats slow private success. — Hanubees"],
    ] },
  { id: "paytm_ipo_crash", company: "Paytm",
    kicker: "INDIA'S BIGGEST EVER IPO CRASHED 40% ON DAY ONE", headline: "Paytm raised ₹18,300 crore. Investors lost ₹7,000 crore the same day.",
    question: "The most anticipated Indian tech IPO was also the worst. What happened?",
    slides: [
      ["THE VALUATION TRAP", [
        ["1", "Paytm IPO'd at ₹2,150/share. Opened at ₹1,564.", "A 27% crash before lunch. By end of day: -40%. The largest first-day loss in Indian IPO history."],
        ["2", "It had never been profitable.", "Losses of ₹1,700 crore/year. No clear path to profit. Investors paid growth-stage valuations for a company with no moat."],
      ]],
      ["THE LESSON", [
        ["3", "RBI then cancelled Paytm Payments Bank's licence in 2024.", "A series of compliance failures. The IPO, the RBI action, the losses — a masterclass in what to avoid."],
      ], "A big IPO is not validation. Revenue and margins are validation. — Hanubees"],
    ] },
  { id: "canva_story", company: "Canva",
    kicker: "SHE PITCHED 100 VCs. 100 SAID NO.", headline: "Melanie Perkins was rejected 100 times before Canva became worth $40 billion.",
    question: "The most-rejected pitch in Australian startup history became one of the most valuable companies on earth.",
    slides: [
      ["THE HUNDRED NOs", [
        ["1", "Melanie started pitching in 2011. Most VCs said design was too niche.", "She was 24. She was Australian (not Silicon Valley). Both worked against her."],
        ["2", "Bill Tai finally invested — but only after she kitesurfed.", "He connected her to the right network at a kitesurfing event. The funding followed."],
      ]],
      ["THE EMPIRE", [
        ["3", "Canva: 170M users, $2.3B revenue, $40B valuation.", "She never moved to Silicon Valley. She never changed her product vision. She just outlasted 100 rejections."],
      ], "The hundred nos filter for founders who actually believe. — Hanubees"],
    ] },
  { id: "byju_collapse", company: "BYJU'S",
    kicker: "INDIA'S MOST VALUABLE STARTUP LOST 99% OF ITS VALUE", headline: "BYJU'S peaked at $22 billion. It's now worth next to nothing.",
    question: "How did the world's most valuable edtech company implode in 2 years?",
    slides: [
      ["THE FRAUD ALLEGATIONS", [
        ["1", "BYJU'S delayed financial audits by 18 months.", "Deloitte resigned as auditor. Three board members quit. ₹9,754 crore ($1.2B) in funds went missing."],
        ["2", "It sold aggressive loans to poor families.", "Salespeople were incentivised to sign children up for courses using loans at 18% interest."],
      ]],
      ["THE COLLAPSE", [
        ["3", "Founder Byju Raveendran was declared a fugitive.", "US lenders won a $533M judgement. The NCLT started insolvency proceedings. India's biggest startup failure."],
      ], "Growth built on aggressive sales and no accountability always ends the same way. — Hanubees"],
    ] },
  { id: "wordle_nyt", company: "New York Times",
    kicker: "A GAME BUILT IN A WEEKEND SOLD FOR $1 MILLION", headline: "Josh Wardle built Wordle for his partner. NYT paid 7 figures for it.",
    question: "The most viral game of 2022 was built as a love letter — not a startup. Why did it work?",
    slides: [
      ["THE ACCIDENTAL PRODUCT", [
        ["1", "Josh built Wordle for his partner who loved word games.", "No monetisation. No app. Just a website. He shared it with family in October 2021."],
        ["2", "By January 2022: 2 million daily players.", "Word-of-mouth + daily ritual + shareable score grid. No ads, no sign-ups. Pure product."],
      ]],
      ["THE LESSON", [
        ["3", "NYT paid 7 figures in January 2022.", "A game built in a weekend, with zero marketing budget, sold to one of the world's biggest media companies."],
      ], "Build what you'd use yourself. Virality follows genuine delight. — Hanubees"],
    ] },
  { id: "india_startup_2024", company: "Indian Startups",
    kicker: "INDIA PRODUCED 100+ UNICORNS IN 5 YEARS", headline: "India went from 7 unicorns in 2018 to 108 by 2024.",
    question: "The world's fastest unicorn factory. What's fuelling it?",
    slides: [
      ["THE INGREDIENTS", [
        ["1", "600M internet users. 65% under 35. Fastest UPI adoption ever.", "India's demographic dividend met cheap smartphones met free Jio data — all at once."],
        ["2", "Indian founders returned from Google, Facebook, Amazon.", "IIT graduates who built Silicon Valley products came home to build for India. The reverse brain drain."],
      ]],
      ["THE NUMBERS", [
        ["3", "Indian startup funding: $8.4B in 2023 despite global slowdown.", "Zepto, Rapido, Meesho, Groww — categories that don't exist at scale anywhere else."],
      ], "Where demographics meet infrastructure meets ambition — unicorns follow. — Hanubees"],
    ] },
  { id: "apple_services_machine", company: "Apple",
    kicker: "APPLE SERVICES EARNS MORE THAN NIKE, STARBUCKS, AND NETFLIX COMBINED", headline: "Apple's Services division alone is worth $1 trillion.",
    question: "The most profitable division of the world's most valuable company sells no hardware. What does it sell?",
    slides: [
      ["THE INVISIBLE EMPIRE", [
        ["1", "App Store, iCloud, Apple Music, TV+, Arcade, Pay.", "85B/year from a billion iPhone users paying monthly. No factories, no supply chain, 70%+ margins."],
        ["2", "Google pays Apple $20B/year just to be default search.", "That single deal is 15% of Apple's entire Services revenue. Pure margin, zero cost."],
      ]],
      ["THE MOAT", [
        ["3", "Once you're in iCloud, switching to Android costs everything.", "Your photos, messages, contacts, subscriptions — all Apple. Services created the ecosystem trap."],
      ], "The hardware gets people in. Services never let them leave. — Hanubees"],
    ] },

];

(async () => {
  const bee = await sharp(path.join(__dirname, "../assets/brand/bee.png")).resize(70, 70, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const only = process.argv[2];
  for (const cfg of CONCEPTS) {
    if (only && cfg.id !== only) continue;
    // pull assets from the LIBRARY by id (unless the concept hard-codes its own paths)
    const lib = path.join(__dirname, "../assets/library", cfg.id);
    if (!cfg.face && fs.existsSync(path.join(lib, "photo.jpg"))) cfg.face = path.join(lib, "photo.jpg");
    if (cfg.logo === undefined) cfg.logo = fs.existsSync(path.join(lib, "logo.png")) ? path.join(lib, "logo.png") : null;
    if (!cfg.logo && !cfg.wordmark) cfg.wordmark = (cfg.company || cfg.id).toUpperCase();
    const dir = path.join(__dirname, `../out/daily/${cfg.id}`); fs.mkdirSync(dir, { recursive: true });
    const wm = cfg.logo ? await sharp(cfg.logo).resize(640, 640, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .composite([{ input: Buffer.from([255, 255, 255, 235]), raw: { width: 1, height: 1, channels: 4 }, tile: true, blend: "dest-out" }]).png().toBuffer() : null;
    await sharp(await poster(cfg)).png().toFile(path.join(dir, "s0.png"));
    for (let j = 0; j < cfg.slides.length; j++) {
      const [k, items, footer] = cfg.slides[j];
      const ec = [];
      if (wm) ec.push({ input: wm, top: 760, left: 500 });
      ec.push({ input: Buffer.from(explainSVG(k, items, footer)), top: 0, left: 0 }, { input: bee, top: 60, left: 940 });
      await sharp({ create: { width: W, height: H, channels: 4, background: C.bg } }).composite(ec).png().toFile(path.join(dir, `s${j + 1}.png`));
    }
    console.log("built", cfg.id, "→", cfg.slides.length + 1, "slides");
  }
})();
