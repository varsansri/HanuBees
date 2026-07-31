#!/usr/bin/env python3
"""Scrapling-based media scraper — adaptive founder photos + logos.
Replaces/extends build-library.js. Uses Scrapling for HTTP fetching with
connection reuse, adaptive parsing, and multi-source fallback.

Usage:
  python scripts/scrapling-scraper.py                  # scrape all subjects
  python scripts/scrapling-scraper.py --force           # re-scrape existing
  python scripts/scrapling-scraper.py --id nvidia       # single subject
  python scripts/scrapling-scraper.py --id zoom stripe  # multiple
"""
import json, os, sys, re, time, subprocess, tempfile
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent
LIB = ROOT / "assets" / "library"
FORCE = "--force" in sys.argv
IDS = []
capture = False
for a in sys.argv:
    if a == "--id":
        capture = True
    elif capture and not a.startswith("-"):
        IDS.append(a)
    else:
        capture = False

from scrapling.fetchers import Fetcher
from scrapling.parser import Selector

fetcher = Fetcher()


def load_subjects():
    r = subprocess.run(
        ["node", "-e", "const s = require('./subjects.js'); console.log(JSON.stringify(s))"],
        capture_output=True, text=True, cwd=str(ROOT / "scripts"))
    if r.returncode:
        raise RuntimeError(f"failed to load subjects: {r.stderr}")
    data = json.loads(r.stdout)
    if IDS:
        data = [s for s in data if s["id"] in IDS]
        if not data:
            raise ValueError(f"subjects {IDS} not found")
    return data


def try_wikipedia(subject):
    wiki = subject.get("wiki", "")
    if not wiki:
        return None
    api = f"https://en.wikipedia.org/w/api.php?action=query&titles={wiki}&prop=pageimages&piprop=thumbnail&pithumbsize=900&format=json"
    try:
        r = fetcher.get(api, headers={"User-Agent": "HanubeesBot/1.0"})
        j = r.json()
        for p in j.get("query", {}).get("pages", {}).values():
            url = (p.get("thumbnail") or {}).get("source")
            if url:
                img = fetcher.get(url, headers={"User-Agent": "Mozilla/5.0"})
                if len(img.body) > 5000:
                    return img.body
    except:
        pass
    return None


def try_wikidata(subject):
    wiki = subject.get("wiki", "")
    if not wiki:
        return None
    try:
        r = fetcher.get(
            f"https://en.wikipedia.org/w/api.php?action=query&titles={wiki}&prop=pageprops&ppprop=wikibase_item&format=json",
            headers={"User-Agent": "HanubeesBot/1.0"})
        j = r.json()
        qid = None
        for p in j.get("query", {}).get("pages", {}).values():
            qid = (p.get("pageprops") or {}).get("wikibase_item")
            if qid:
                break
        if not qid:
            return None
        r2 = fetcher.get(f"https://www.wikidata.org/wiki/Special:EntityData/{qid}.json",
                         headers={"User-Agent": "HanubeesBot/1.0"})
        ent = r2.json()
        p18 = ent.get("entities", {}).get(qid, {}).get("claims", {}).get("P18", [])
        if not p18:
            return None
        fname = (p18[0].get("mainsnak") or {}).get("datavalue", {}).get("value")
        if not fname:
            return None
        img = fetcher.get(f"https://commons.wikimedia.org/wiki/Special:FilePath/{fname}?width=900",
                          headers={"User-Agent": "Mozilla/5.0"})
        if len(img.body) > 5000:
            return img.body
    except:
        pass
    return None


def try_pinterest(subject):
    founder = subject.get("founder", "")
    company = subject.get("company", subject["id"])
    query = f"{founder} {company}".strip()
    if not query:
        return None
    url = f"https://www.pinterest.com/search/pins/?q={quote(query)}"
    try:
        r = fetcher.get(url, headers={"User-Agent": "Mozilla/5.0"})
        sel = Selector(r.text)
        for img in sel.css("img"):
            src = img.attrib.get("data-src") or img.attrib.get("src", "")
            if "pinimg" in src and src.startswith("http"):
                try:
                    img_r = fetcher.get(src, headers={"User-Agent": "Mozilla/5.0"})
                    if len(img_r.body) > 5000:
                        return img_r.body
                except:
                    continue
    except:
        pass
    return None


def try_free_image(subject):
    """Fallback: try Unsplash or Wikimedia Commons direct search."""
    query = subject.get("founder", subject["id"])
    sources = [
        f"https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch={query}&srlimit=3&format=json",
    ]
    for src in sources:
        try:
            r = fetcher.get(src, headers={"User-Agent": "HanubeesBot/1.0"})
            # For Commons: try to extract image from search results
            j = r.json()
            for result in j.get("query", {}).get("search", []):
                title = result.get("title", "")
                if title and ("File:" in title or "Image:" in title):
                    fname = title.replace("File:", "").replace("Image:", "")
                    url = f"https://commons.wikimedia.org/wiki/Special:FilePath/{fname}?width=900"
                    img = fetcher.get(url, headers={"User-Agent": "Mozilla/5.0"})
                    if len(img.body) > 5000:
                        return img.body
        except:
            continue
    return None


def get_photo(subject, dest):
    if dest.exists() and not FORCE:
        return True
    for fn in [try_wikipedia, try_wikidata, try_pinterest, try_free_image]:
        data = fn(subject)
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
                                sharp('{tf.name}').jpeg({{quality: 90}}).toFile('{dest}').then(() => console.log('OK'));
                            else console.log('TOO_SMALL');
                        }}).catch(e => console.log('ERR'));
                    """],
                    capture_output=True, text=True, cwd=str(ROOT))
                if "OK" in r.stdout:
                    return True
            finally:
                os.unlink(tf.name)
        time.sleep(0.5)
    return False


def try_simple_icons(subject):
    slug = subject.get("logo")
    if not slug:
        return None
    color = subject.get("color", "ffffff")
    try:
        r = fetcher.get(f"https://cdn.simpleicons.org/{slug}/{color}",
                        headers={"User-Agent": "Mozilla/5.0"})
        svg = r.text
        if svg and len(svg) > 120 and "<svg" in svg:
            return svg.encode()
    except:
        pass
    return None


def try_pinterest_logo(subject):
    company = subject.get("company", subject["id"])
    query = f"{company} logo".replace("  ", " ").strip()
    if not query:
        return None
    url = f"https://www.pinterest.com/search/pins/?q={quote(query)}"
    try:
        r = fetcher.get(url, headers={"User-Agent": "Mozilla/5.0"})
        sel = Selector(r.text)
        for img in sel.css("img"):
            src = img.attrib.get("data-src") or img.attrib.get("src", "")
            if "pinimg" in src and src.startswith("http"):
                try:
                    img_r = fetcher.get(src, headers={"User-Agent": "Mozilla/5.0"})
                    if len(img_r.body) > 5000:
                        return img_r.body
                except:
                    continue
    except:
        pass
    return None


def try_clearbit(subject):
    name = subject.get("company", subject["id"]).lower()
    domain = re.sub(r"[^a-z0-9]", "", name.split()[0]) if name.split() else name
    if not domain:
        return None
    for url in [f"https://logo.clearbit.com/{domain}.com",
                f"https://logo.clearbit.com/www.{domain}.com",
                f"https://{domain}.com/favicon.ico",
                f"https://www.{domain}.com/favicon.ico"]:
        try:
            r = fetcher.get(url, headers={"User-Agent": "Mozilla/5.0"})
            if r.status == 200 and len(r.body) > 200:
                return r.body
        except:
            continue
    return None


def get_logo(subject, dest):
    if dest.exists() and not FORCE:
        return True
    for attempt, fn in enumerate([try_simple_icons, try_pinterest_logo, try_clearbit]):
        data = fn(subject)
        if data:
            suffix = ".svg" if attempt == 0 else ".png"
            tf = tempfile.NamedTemporaryFile(suffix=suffix, delete=False)
            tf.write(data if isinstance(data, bytes) else data.encode())
            tf.close()
            try:
                r = subprocess.run(
                    ["node", "-e", f"""
                        const sharp = require('sharp');
                        sharp('{tf.name}').resize(280, 280, {{fit:'contain', background:{{r:0,g:0,b:0,alpha:0}}}})
                            .png().toFile('{dest}').then(() => console.log('OK'))
                            .catch(e => console.log('ERR'));
                    """],
                    capture_output=True, text=True, cwd=str(ROOT))
                if "OK" in r.stdout:
                    return True
            finally:
                os.unlink(tf.name)
        time.sleep(0.3)
    return False


def main():
    subjects = load_subjects()
    print(f"\nScrapling Media Scraper — {len(subjects)} subjects\n")
    full = wordmark = unusable = 0
    manifest = []
    for s in subjects:
        sid = s["id"]
        d = LIB / sid
        d.mkdir(parents=True, exist_ok=True)
        has_photo = get_photo(s, d / "photo.jpg")
        has_logo = get_logo(s, d / "logo.png")
        if not has_photo:
            mode = "unusable"
            unusable += 1
        elif has_logo:
            mode = "founder+logo"
            full += 1
        else:
            mode = "founder+wordmark"
            wordmark += 1
        manifest.append({"id": sid, "company": s.get("company", ""),
                         "founder": s.get("founder", ""), "mode": mode,
                         "hasLogo": has_logo,
                         "wordmark": s.get("company", sid).upper()})
        print(f"  {sid:<16} {mode}")
        time.sleep(0.3)

    LIB.mkdir(parents=True, exist_ok=True)
    with open(LIB / "manifest.json", "w") as f:
        json.dump(manifest, f, indent=2)

    usable = [m for m in manifest if m["mode"] != "unusable"]
    print(f"\n=== LIBRARY: {len(usable)}/{len(subjects)} usable — "
          f"{full} founder+logo, {wordmark} founder+wordmark, {unusable} unusable ===")


if __name__ == "__main__":
    main()
