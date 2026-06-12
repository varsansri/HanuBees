"use strict";
// The 10 posts (authored by Claude as the content+truth engine — DURABLE,
// verifiable facts only; no volatile 2026 figures). Hooks follow the PDF
// DIFFERENCE templates. 6 post NOW (2 per Threads account), 4 scheduled.
// Each post: which Threads account, when, 3 content slides (+ fixed agency s4).

const K2 = { account: "hanubees",     key: "ZERNIO_API_KEY_2" };
const K3 = { account: "hanubees.ai",  key: "ZERNIO_API_KEY_3" };
const K4 = { account: "hanubees.biz", key: "ZERNIO_API_KEY_4" };

module.exports = [
  // ---------- POST NOW (6) ----------
  { slug: "nvidia", person: "Jensen Huang", logoQuery: "Nvidia logo", ...K2, when: "now",
    caption: "Why NVIDIA wins isn't the chip — it's the software. (built by hanubees)",
    slides: [
      { role: "hook",   topic: "NVIDIA", kicker: "TOP 10 · BIGGEST COMPANIES", code: "DIFFERENCE / 01", tag: "TECH · DIFFERENCE", headline: "Here's the difference between NVIDIA, AMD & Intel." },
      { role: "number", topic: "CUDA",   kicker: "THE LOCK-IN",                code: "DIFFERENCE / 02", tag: "SINCE 2006",        headline: "Rivals match the chip. None match CUDA — NVIDIA's software lock-in since 2006." },
      { role: "answer", topic: "MOAT",   kicker: "WHY IT WINS",               code: "DIFFERENCE / 03", tag: "THE REAL DIFFERENCE", headline: "It's not the silicon. It's the software developers can't leave." },
    ] },

  { slug: "tesla", person: "Elon Musk", logoQuery: "Tesla Motors logo", ...K2, when: "now",
    caption: "Tesla broke the rules every other carmaker still follows. (by hanubees)",
    slides: [
      { role: "hook",   topic: "TESLA", kicker: "TOP 10 · BIGGEST COMPANIES", code: "DIFFERENCE / 01", tag: "AUTO · DIFFERENCE", headline: "Here's the difference between Tesla and every other carmaker." },
      { role: "number", topic: "0",     kicker: "DEALERSHIPS",               code: "DIFFERENCE / 02", tag: "SELLS DIRECT",     headline: "Zero dealerships. Tesla sells straight to you — no middleman." },
      { role: "answer", topic: "OTA",   kicker: "WHY IT WINS",               code: "DIFFERENCE / 03", tag: "THE REAL DIFFERENCE", headline: "Your car gets better overnight — over-the-air software updates." },
    ] },

  { slug: "apple", person: "Tim Cook", logoQuery: "Apple logo black", ...K3, when: "now",
    caption: "Apple's real business isn't the iPhone anymore. (by hanubees)",
    slides: [
      { role: "hook",   topic: "APPLE", kicker: "TOP 10 · BIGGEST COMPANIES", code: "DIFFERENCE / 01", tag: "TECH · DIFFERENCE", headline: "Here's the difference between Apple and the rest of Big Tech." },
      { role: "number", topic: "$3T",   kicker: "MARKET VALUE",              code: "DIFFERENCE / 02", tag: "FIRST EVER (2022)", headline: "Apple was the first company on Earth to hit a $3 trillion value." },
      { role: "answer", topic: "SERVICES", kicker: "WHY IT WINS",           code: "DIFFERENCE / 03", tag: "THE REAL DIFFERENCE", headline: "The growth engine now is Services — not new hardware." },
    ] },

  { slug: "amazon", person: "Jeff Bezos", logoQuery: "Amazon logo", ...K3, when: "now",
    caption: "Amazon makes its money where you'd never guess. (by hanubees)",
    slides: [
      { role: "hook",   topic: "AMAZON", kicker: "TOP 10 · BIGGEST COMPANIES", code: "DIFFERENCE / 01", tag: "TECH · DIFFERENCE", headline: "Here's the difference between Amazon and a normal retailer." },
      { role: "number", topic: "AWS",    kicker: "THE PROFIT ENGINE",        code: "DIFFERENCE / 02", tag: "NOT THE STORE",     headline: "Most of Amazon's profit comes from AWS cloud — not the shop." },
      { role: "answer", topic: "CLOUD",  kicker: "WHY IT WINS",              code: "DIFFERENCE / 03", tag: "THE REAL DIFFERENCE", headline: "Retail wins customers. Cloud pays the bills." },
    ] },

  { slug: "microsoft", person: "Bill Gates", logoQuery: "Microsoft logo", ...K4, when: "now",
    caption: "Microsoft outlived everyone who copied it. (by hanubees)",
    slides: [
      { role: "hook",   topic: "MICROSOFT", kicker: "TOP 10 · BIGGEST COMPANIES", code: "DIFFERENCE / 01", tag: "TECH · DIFFERENCE", headline: "Here's the difference between Microsoft and the rivals it outlived." },
      { role: "number", topic: "1975",      kicker: "STILL STANDING",           code: "DIFFERENCE / 02", tag: "FOUNDED 1975",      headline: "Founded in 1975 — older than almost every competitor still around." },
      { role: "answer", topic: "REINVENT",  kicker: "WHY IT WINS",              code: "DIFFERENCE / 03", tag: "THE REAL DIFFERENCE", headline: "It survived by reinventing itself: DOS → Windows → Office → Cloud." },
    ] },

  { slug: "meta", person: "Mark Zuckerberg", logoQuery: "Meta Platforms Inc logo", ...K4, when: "now",
    caption: "Meta is an ad company wearing a social-media costume. (by hanubees)",
    slides: [
      { role: "hook",   topic: "META", kicker: "TOP 10 · BIGGEST COMPANIES", code: "DIFFERENCE / 01", tag: "TECH · DIFFERENCE", headline: "Here's the difference between Meta and what people think it is." },
      { role: "number", topic: "~98%", kicker: "REVENUE MIX",                code: "DIFFERENCE / 02", tag: "ALL ADS",          headline: "Almost all of Meta's money — roughly 98% — comes from ads." },
      { role: "answer", topic: "ADS",  kicker: "WHY IT WINS",                code: "DIFFERENCE / 03", tag: "THE REAL DIFFERENCE", headline: "The apps are free because YOU are the product being sold." },
    ] },

  // ---------- SCHEDULED (4) ----------
  { slug: "berkshire", person: "Warren Buffett", logoQuery: "Berkshire Hathaway logo", ...K2, when: "sched", schedMins: 90,
    caption: "The most expensive share on Earth — on purpose. (by hanubees)",
    slides: [
      { role: "hook",   topic: "BERKSHIRE", kicker: "TOP 10 · WEALTHIEST", code: "DIFFERENCE / 01", tag: "MONEY · DIFFERENCE", headline: "Here's the difference between Berkshire and every other stock." },
      { role: "number", topic: "6-FIG",     kicker: "ONE SHARE",          code: "DIFFERENCE / 02", tag: "NEVER SPLIT",        headline: "One Class-A share costs six figures — Buffett never split it." },
      { role: "answer", topic: "PATIENCE",  kicker: "WHY IT WINS",        code: "DIFFERENCE / 03", tag: "THE REAL DIFFERENCE", headline: "The edge isn't picking stocks. It's holding them for decades." },
    ] },

  { slug: "google", person: "Sundar Pichai", logoQuery: "Google 2015 logo", ...K3, when: "sched", schedMins: 150,
    caption: "Google builds a hundred things. One pays for them all. (by hanubees)",
    slides: [
      { role: "hook",   topic: "GOOGLE", kicker: "TOP 10 · BIGGEST COMPANIES", code: "DIFFERENCE / 01", tag: "TECH · DIFFERENCE", headline: "Here's the difference between Google's products and its profits." },
      { role: "number", topic: "~80%",   kicker: "REVENUE MIX",              code: "DIFFERENCE / 02", tag: "SEARCH ADS",        headline: "Around 80% of Google's revenue is just advertising." },
      { role: "answer", topic: "SEARCH", kicker: "WHY IT WINS",              code: "DIFFERENCE / 03", tag: "THE REAL DIFFERENCE", headline: "Everything else is a hobby funded by the search ad machine." },
    ] },

  { slug: "lvmh", person: "Bernard Arnault", logoQuery: "LVMH logo", ...K4, when: "sched", schedMins: 210,
    caption: "You already own a Bernard Arnault brand — probably several. (by hanubees)",
    slides: [
      { role: "hook",   topic: "LVMH", kicker: "TOP 10 · WEALTHIEST", code: "DIFFERENCE / 01", tag: "LUXURY · DIFFERENCE", headline: "Here's the difference between LVMH and a single fashion brand." },
      { role: "number", topic: "75+",  kicker: "MAISONS",            code: "DIFFERENCE / 02", tag: "ONE OWNER",          headline: "75+ houses — Louis Vuitton, Dior, Tiffany — under one roof." },
      { role: "answer", topic: "EMPIRE", kicker: "WHY IT WINS",      code: "DIFFERENCE / 03", tag: "THE REAL DIFFERENCE", headline: "It doesn't sell one brand. It owns the whole luxury aisle." },
    ] },

  { slug: "oracle", person: "Larry Ellison", logoQuery: "Oracle logo", ...K2, when: "sched", schedMins: 270,
    caption: "The database that quietly runs the world. (by hanubees)",
    slides: [
      { role: "hook",   topic: "ORACLE", kicker: "TOP 10 · WEALTHIEST", code: "DIFFERENCE / 01", tag: "TECH · DIFFERENCE", headline: "Here's the difference between Oracle and the consumer tech giants." },
      { role: "number", topic: "1979",   kicker: "THE DATABASE",       code: "DIFFERENCE / 02", tag: "DECADES OF LOCK-IN", headline: "Since 1979 its database has run banks, airlines & governments." },
      { role: "answer", topic: "B2B",    kicker: "WHY IT WINS",        code: "DIFFERENCE / 03", tag: "THE REAL DIFFERENCE", headline: "No ads, no hype — just systems companies can't rip out." },
    ] },
];
