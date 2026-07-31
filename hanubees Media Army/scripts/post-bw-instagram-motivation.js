require("./_env");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Digit-safe env loader for ZERNIO keys
(function loadEnv() {
  try {
    const envPath = path.join(__dirname, "../../../.env.local");
    if (fs.existsSync(envPath)) {
      for (const l of fs.readFileSync(envPath, "utf8").split("\n")) {
        const m = l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
      }
    }
  } catch {}
})();

const ZB = "https://api.zernio.com/v1";

const MOTIVATION_QUOTE = "Silently build what cannot be shaken.";

function xmlEscape(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function wrapText(text, maxCharsPerLine) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxCharsPerLine) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current += " " + word;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

async function createBWCard(quoteText) {
  const width = 1080;
  const height = 1350; // 4:5 vertical portrait aspect ratio for Instagram

  const wrapped = wrapText(quoteText, 18);
  const fontSize = 72;
  const lineHeight = 100;
  const totalTextHeight = wrapped.length * lineHeight;
  const startY = Math.round((height - totalTextHeight) / 2);

  const tspanLines = wrapped.map((line, idx) => {
    return `<tspan x="108" y="${startY + idx * lineHeight}">${xmlEscape(line)}</tspan>`;
  }).join("");

  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <!-- Deep Pure Black Background -->
    <rect width="${width}" height="${height}" fill="#050505"/>

    <!-- Subtle Minimalist White Top/Bottom Accent Borders -->
    <rect x="108" y="120" width="864" height="2" fill="#333333"/>
    <rect x="108" y="1230" width="864" height="2" fill="#333333"/>

    <!-- Quotation Mark Accent -->
    <text x="108" y="${startY - 60}" font-family="sans-serif" font-size="120" font-weight="900" fill="#333333">“</text>

    <!-- Main Motivational Text in Pure High-Contrast White -->
    <text font-family="sans-serif" font-size="${fontSize}" font-weight="800" fill="#FFFFFF" letter-spacing="-1">${tspanLines}</text>

    <!-- Footer Branding -->
    <text x="108" y="1190" font-family="sans-serif" font-size="28" font-weight="600" fill="#888888" letter-spacing="4">BILLIONAIRE MOTIVATION</text>
  </svg>`;

  return await sharp(Buffer.from(svg)).png().toBuffer();
}

async function uploadMedia(key, imageBuffer) {
  const presignRes = await fetch(`${ZB}/media/presign`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ filename: "motivation_bw.png", contentType: "image/png" }),
  });
  const presignData = await presignRes.json();
  if (!presignData.uploadUrl || !presignData.publicUrl) {
    throw new Error(`Presign failed: ${JSON.stringify(presignData)}`);
  }

  const uploadRes = await fetch(presignData.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/png" },
    body: imageBuffer,
  });

  if (!uploadRes.ok) {
    throw new Error(`Upload to storage failed with status ${uploadRes.status}`);
  }

  return presignData.publicUrl;
}

async function run() {
  console.log("=== Generating Black & White Motivation Card ===");
  console.log(`Quote: "${MOTIVATION_QUOTE}"`);

  const cardBuf = await createBWCard(MOTIVATION_QUOTE);
  fs.writeFileSync("/tmp/bw_motivation.png", cardBuf);
  console.log(`Card created successfully (${cardBuf.length} bytes).`);

  const keys = [
    process.env.ZERNIO_API_KEY,
    process.env.ZERNIO_API_KEY_3,
    process.env.ZERNIO_API_KEY_4,
  ].filter(Boolean);

  console.log(`\n=== Uploading & Posting to Instagram accounts across ${keys.length} Zernio Keys ===`);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      const accsRes = await fetch(`${ZB}/accounts`, {
        headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
      });
      const accsData = await accsRes.json();
      const igAccounts = (accsData.accounts || []).filter(a => a.platform === "instagram");

      if (!igAccounts.length) {
        console.log(`Key #${i + 1}: No Instagram account found.`);
        continue;
      }

      const publicUrl = await uploadMedia(key, cardBuf);
      console.log(`Media uploaded to Zernio CDN: ${publicUrl}`);

      for (const ig of igAccounts) {
        console.log(`Posting to Instagram account: @${ig.username || ig.name || ig._id}...`);
        const caption = `${MOTIVATION_QUOTE}\n\n#motivation #mindset #success #billionairemotivation #discipline`;
        
        const postRes = await fetch(`${ZB}/posts`, {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            content: caption,
            mediaItems: [{ url: publicUrl, type: "image" }],
            platforms: [{ platform: "instagram", accountId: ig._id }],
            publishNow: true,
          }),
        });

        const resText = await postRes.text();
        if (postRes.ok) {
          console.log(`SUCCESS: Posted to Instagram @${ig.username || ig.name || ig._id}!`);
        } else {
          console.log(`FAILED Instagram @${ig.username || ig.name || ig._id}: ${resText.slice(0, 200)}`);
        }
      }
    } catch (err) {
      console.error(`ERROR processing key #${i + 1}:`, err.message);
    }
  }
}

run();
