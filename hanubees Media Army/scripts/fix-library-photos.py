#!/usr/bin/env python3
"""Fix duplicate/wrong library photos by scraping correct founder/company images.
For each concept in daily-batch.js without a correct photo, uses Scrapling to
fetch the right founder/company image from Wikipedia or web search.
"""
import json, os, sys, re, time, subprocess, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIB = ROOT / "assets" / "library"
SCRIPT = ROOT / "scripts"

from scrapling.fetchers import Fetcher
fetcher = Fetcher()

# Read daily-batch.js to extract all concepts
with open(SCRIPT / "daily-batch.js") as f:
    content = f.read()

# Parse concept blocks: { id: "...", ... }
concepts = []
for m in re.finditer(r'^\s*\{\s*id:\s*"([^"]+)"(.*?)^\s*\},?\s*$', content, re.MULTILINE | re.DOTALL):
    cid = m.group(1)
    block = m.group(2)
    company = None
    founder = None
    cm = re.search(r'company:\s*"([^"]+)"', block)
    if cm:
        company = cm.group(1)
    fm = re.search(r'kicker:\s*"([^"]+)"', block)
    if fm:
        founder = fm.group(1)
    concepts.append({"id": cid, "company": company, "founder": founder})


def wiki_search(term):
    """Search Wikipedia for a company/founder and get lead image."""
    api = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={term}&srlimit=3&format=json"
    try:
        r = fetcher.get(api, headers={"User-Agent": "HanubeesBot/1.0"})
        j = r.json()
        for result in j.get("query", {}).get("search", []):
            title = result.get("title", "")
            if not title:
                continue
            # Get page image
            pi = fetcher.get(
                f"https://en.wikipedia.org/w/api.php?action=query&titles={title}&prop=pageimages&piprop=thumbnail&pithumbsize=900&format=json",
                headers={"User-Agent": "HanubeesBot/1.0"})
            pj = pi.json()
            for p in pj.get("query", {}).get("pages", {}).values():
                url = (p.get("thumbnail") or {}).get("source")
                if url:
                    img = fetcher.get(url, headers={"User-Agent": "Mozilla/5.0"})
                    if len(img.body) > 5000:
                        return img.body, title
    except:
        pass
    return None, None


def main():
    dup_size = 116443
    fixed = 0
    # Find entries with wrong photos
    for c in concepts:
        cid = c["id"]
        photo = LIB / cid / "photo.jpg"
        if not photo.exists() or photo.stat().st_size == dup_size:
            company = c.get("company") or cid
            terms = [company, company.split()[0] if company.split() else company]
            print(f"{cid}: searching '{terms[0]}'... ", end="", flush=True)
            found = False
            for term in terms:
                data, title = wiki_search(term)
                if data:
                    tf = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
                    tf.write(data)
                    tf.close()
                    try:
                        r = subprocess.run(
                            ["node", "-e", f"""
                                const sharp = require('sharp');
                                sharp('{tf.name}').metadata().then(m => {{
                                    if ((m.width||0) >= 400)
                                        sharp('{tf.name}').jpeg({{quality: 90}}).toFile('{str(photo)}').then(() => console.log('OK'));
                                    else console.log('TOO_SMALL');
                                }}).catch(e => console.log('ERR'));
                            """],
                            capture_output=True, text=True, cwd=str(ROOT))
                        if "OK" in r.stdout:
                            print(f"✓ {title} ({os.path.getsize(str(photo))} bytes)")
                            fixed += 1
                            found = True
                            break
                        else:
                            print(f"✗ too small from {title}, ", end="")
                    finally:
                        os.unlink(tf.name)
                else:
                    print(f"✗ no image via '{term}', ", end="")
            if not found:
                print("✗ FAILED")
            time.sleep(0.5)

    print(f"\nFixed {fixed}/{len([c for c in concepts if (LIB/c['id']/'photo.jpg').exists() and (LIB/c['id']/'photo.jpg').stat().st_size <= dup_size])} entries")


if __name__ == "__main__":
    main()
