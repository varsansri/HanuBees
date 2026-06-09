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
];

(async () => {
  const bee = await sharp(path.join(__dirname, "../assets/brand/bee.png")).resize(70, 70, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const only = process.argv[2];
  for (const cfg of CONCEPTS) {
    if (only && cfg.id !== only) continue;
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
