#!/usr/bin/env node
// Appends every user prompt to requested.txt. Wired as a UserPromptSubmit hook.
// Stays active until the user says "stop requested text" (then remove the hook).
const fs = require("fs");
const path = require("path");
const OUT = path.join(__dirname, "..", "requested.txt");
let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let prompt = "";
  try { prompt = (JSON.parse(raw).prompt || "").trim(); } catch { prompt = raw.trim(); }
  if (!prompt) process.exit(0);
  // ignore unrelated prompts? No — founder asked to capture EVERY request until "stop".
  const stamp = new Date().toISOString();
  const block = `\n---\n[${stamp}]\n${prompt}\n`;
  try { fs.appendFileSync(OUT, block); } catch {}
  process.exit(0);
});
