#!/usr/bin/env python3
# P5 PREP (generalized) — for a subject slug:
#  - face-detect every scraped photo, circle-crop centered on the face,
#    pick 3 DISTINCT frontal faces (avg-hash) -> person_s1..s3.png
#  - build logo badge with coin color auto-picked by logo luminance.
import os, sys, glob, cv2, numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.join(os.path.dirname(__file__), "..")
_CDIR = os.path.join(os.path.dirname(cv2.__file__), "data")
CASCADE = cv2.CascadeClassifier(os.path.join(_CDIR, "haarcascade_frontalface_default.xml"))
EYES = cv2.CascadeClassifier(os.path.join(_CDIR, "haarcascade_eye_tree_eyeglasses.xml"))  # works through glasses
MIN_FACE = 70
SKIN_MIN_RATIO = 0.30   # face box must be >=30% skin-tone (rejects rockets/textures)
COIN_LIGHT = (245, 245, 245, 255)
COIN_DARK = (26, 26, 26, 255)
LUMA_THRESHOLD = 110

def skin_ratio(img_bgr, box):
    x, y, w, h = box
    roi = img_bgr[y:y + h, x:x + w]
    if roi.size == 0:
        return 0.0
    ycrcb = cv2.cvtColor(roi, cv2.COLOR_BGR2YCrCb)
    cr, cb = ycrcb[..., 1], ycrcb[..., 2]
    mask = (cr >= 133) & (cr <= 173) & (cb >= 77) & (cb <= 127)
    return float(mask.mean())

def best_face(img_bgr):
    # Detect faces, keep skin-valid ones (rejects rockets/textures), and return the
    # best with an eye flag. Eyes-detected (clear frontal) is preferred over occluded.
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    faces = CASCADE.detectMultiScale(gray, 1.1, 7, minSize=(MIN_FACE, MIN_FACE))
    valid = []
    for (x, y, w, h) in faces:
        if skin_ratio(img_bgr, (x, y, w, h)) < SKIN_MIN_RATIO:
            continue
        roi = gray[y:y + int(h * 0.6), x:x + w]
        has_eyes = len(EYES.detectMultiScale(roi, 1.1, 4, minSize=(int(w * 0.1), int(w * 0.1)))) >= 1
        valid.append(((x, y, w, h), has_eyes, w * h))
    if not valid:
        return None
    # IDENTITY SAFETY: a photo with 2+ prominent faces is ambiguous (couple/group)
    # -> we can't be sure which one is the subject, so reject it entirely.
    big = max(v[2] for v in valid)
    prominent = [v for v in valid if v[2] >= 0.45 * big]
    if len(prominent) >= 2:
        return None
    valid.sort(key=lambda v: (v[1], v[2]), reverse=True)
    return valid[0]

def circle_mask(img):
    s = img.size[0]
    m = Image.new("L", (s, s), 0)
    ImageDraw.Draw(m).ellipse((0, 0, s, s), fill=255)
    out = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    out.paste(img, (0, 0), m)
    return out

def make_person_circle(in_path, size=1000):
    pil = Image.open(in_path).convert("RGB")
    img = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
    h, w = img.shape[:2]
    bf = best_face(img)
    if bf is None:
        return None
    (x, y, fw, fh), has_eyes, area = bf
    cx, cy, crop = x + fw / 2.0, y + fh / 2.0 + fh * 0.18, fw * 3.1
    pad = int(crop)
    padded = cv2.copyMakeBorder(img, pad, pad, pad, pad, cv2.BORDER_REPLICATE)
    cxp, cyp, half = cx + pad, cy + pad, crop / 2.0
    sq = padded[int(cyp - half):int(cyp + half), int(cxp - half):int(cxp + half)]
    sq = cv2.cvtColor(sq, cv2.COLOR_BGR2RGB)
    circ = circle_mask(Image.fromarray(sq).resize((size, size)).convert("RGBA"))
    return circ, has_eyes, area

def ahash(pil_img):
    g = pil_img.convert("L").resize((8, 8))
    px = list(g.getdata()); mean = sum(px) / len(px)
    return [1 if p >= mean else 0 for p in px]

def sim(a, b):
    return sum(1 for i in range(len(a)) if a[i] == b[i]) / len(a)

def logo_badge(in_path, out_path, size=1000, fill_ratio=0.6):
    logo = Image.open(in_path).convert("RGBA")
    bbox = logo.getbbox()
    if bbox:
        logo = logo.crop(bbox)
    # mean luminance of visible pixels -> pick coin color for contrast
    arr = np.array(logo)
    vis = arr[..., 3] > 30
    if vis.sum() > 0:
        rgb = arr[..., :3][vis].astype(float)
        luma = (0.299 * rgb[:, 0] + 0.587 * rgb[:, 1] + 0.114 * rgb[:, 2]).mean()
    else:
        luma = 0
    coin = COIN_LIGHT if luma < LUMA_THRESHOLD else COIN_DARK
    lw, lh = logo.size
    scale = (size * fill_ratio) / max(lw, lh)
    logo = logo.resize((max(1, int(lw * scale)), max(1, int(lh * scale))))
    badge = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(badge).ellipse((0, 0, size, size), fill=coin)
    badge.paste(logo, ((size - logo.size[0]) // 2, (size - logo.size[1]) // 2), logo)
    badge.save(out_path)
    return luma, ("light" if coin == COIN_LIGHT else "dark")

def prep_subject(slug):
    src = os.path.join(ROOT, "assets/scraped", slug)
    out = os.path.join(ROOT, "assets/prepared", slug)
    os.makedirs(out, exist_ok=True)
    photos = sorted(glob.glob(os.path.join(src, "photos", "*.jpg")))
    # score every candidate, then pick the best 3 DISTINCT (eye-verified first, larger faces).
    cands = []
    for p in photos:
        r = make_person_circle(p)
        if r is None:
            continue
        circ, has_eyes, area = r
        cands.append((1 if has_eyes else 0, area, circ))
    cands.sort(key=lambda c: (c[0], c[1]), reverse=True)
    chosen, hashes = [], []
    for has_eyes, area, circ in cands:
        if len(chosen) >= 3:
            break
        h = ahash(circ)
        if any(sim(h, hh) > 0.92 for hh in hashes):   # skip near-duplicate
            continue
        hashes.append(h)
        idx = len(chosen) + 1
        dest = os.path.join(out, f"person_s{idx}.png")
        circ.save(dest)
        chosen.append(dest)
    luma, coin = logo_badge(os.path.join(src, "logo.png"), os.path.join(out, "logo_badge.png"))
    print(f"{slug}: {len(chosen)} faces, coin={coin}(luma={luma:.0f})")
    return len(chosen) >= 3

if __name__ == "__main__":
    ok = prep_subject(sys.argv[1])
    sys.exit(0 if ok else 2)
