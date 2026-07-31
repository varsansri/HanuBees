const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const LIB = '/root/hanubees/hanubees Media Army/assets/library';
const DUP = 116443;

function getJSON(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'HanubeesBot/1.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function fetchImage(name) {
  // Search Wikipedia for the term
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=1&format=json&srsearch=${encodeURIComponent(name)}`;
  const sj = await getJSON(searchUrl);
  const results = sj?.query?.search;
  if (!results || !results.length) return null;
  const title = results[0].title;

  // Get page image
  const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&piprop=thumbnail&pithumbsize=900&format=json`;
  const ij = await getJSON(imgUrl);
  const pages = ij?.query?.pages;
  if (!pages) return null;
  for (const p of Object.values(pages)) {
    const src = p?.thumbnail?.source;
    if (src) return { url: src, title };
  }
  return null;
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });
}

(async () => {
  const content = fs.readFileSync('/root/hanubees/hanubees Media Army/scripts/daily-batch.js', 'utf-8');
  
  // Find entries with wrong photos
  const dirs = fs.readdirSync(LIB);
  const wrong = [];
  for (const d of dirs) {
    const p = path.join(LIB, d, 'photo.jpg');
    if (fs.existsSync(p) && fs.statSync(p).size === DUP) wrong.push(d);
  }
  
  // Extract company names from concepts
  const companyMap = {};
  for (const w of wrong) {
    const m = content.match(new RegExp('\\{ id:\\s*"' + w + '"[^}]*?company:\\s*"([^"]+)"'));
    companyMap[w] = m ? m[1] : w.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  console.log(`Need to fix ${wrong.length} entries`);

  let fixed = 0;
  for (const w of wrong) {
    const company = companyMap[w];
    process.stdout.write(`  ${w.padEnd(30)} -> "${company}" ... `);
    
    const terms = [company, company.split(/\s+/)[0]];
    let ok = false;
    for (const term of terms) {
      if (!term) continue;
      try {
        const result = await fetchImage(term);
        if (result) {
          const dest = path.join(LIB, w, 'photo.jpg');
          await download(result.url, dest);
          const sz = fs.statSync(dest).size;
          if (sz > 5000) {
            console.log(`OK ${result.title} (${sz} bytes)`);
            fixed++;
            ok = true;
            break;
          }
        }
      } catch(e) {
        // continue
      }
    }
    if (!ok) console.log('FAILED');
  }

  console.log(`\nFixed: ${fixed}/${wrong.length}`);
})();
