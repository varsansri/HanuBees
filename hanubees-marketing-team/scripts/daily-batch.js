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
