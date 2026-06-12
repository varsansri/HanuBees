#!/usr/bin/env python3
# Circle-crop helpers for template-tipo v2.
#  - person_circle: detect face (Haar), crop a square centered on the face
#    (shifted down for shoulders), mask into a circle -> transparent PNG.
#  - logo_circle: trim a transparent logo to its bbox, center it on a circular
#    badge so it's clearly visible behind the person.
import os, sys, cv2, numpy as np
from PIL import Image, ImageDraw

CASCADE = cv2.CascadeClassifier(os.path.join(os.path.dirname(cv2.__file__), "data", "haarcascade_frontalface_default.xml"))
ROOT = os.path.join(os.path.dirname(__file__), "..")

def _largest_face(img_bgr):
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    faces = CASCADE.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=6, minSize=(60, 60))
    if len(faces) == 0:
        return None
    return max(faces, key=lambda f: f[2] * f[3])

def circle_mask(img_rgba):
    s = img_rgba.size[0]
    mask = Image.new("L", (s, s), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, s, s), fill=255)
    out = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    out.paste(img_rgba, (0, 0), mask)
    return out

def person_circle(in_path, out_path, size=1000):
    pil = Image.open(in_path).convert("RGB")
    img = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
    h, w = img.shape[:2]
    fb = _largest_face(img)
    if fb is not None:
        x, y, fw, fh = fb
        cx = x + fw / 2.0
        cy = y + fh / 2.0 + fh * 0.18          # nudge down to keep chin + shoulders
        crop = fw * 3.1                          # head + shoulders in frame
        used = "face"
    else:
        cx, cy, crop = w / 2.0, h * 0.40, min(w, h) * 0.92
        used = "fallback"
    pad = int(crop)
    padded = cv2.copyMakeBorder(img, pad, pad, pad, pad, cv2.BORDER_REPLICATE)
    cxp, cyp = cx + pad, cy + pad
    half = crop / 2.0
    sq = padded[int(cyp - half):int(cyp + half), int(cxp - half):int(cxp + half)]
    sq = cv2.cvtColor(sq, cv2.COLOR_BGR2RGB)
    bubble = Image.fromarray(sq).resize((size, size)).convert("RGBA")
    circle_mask(bubble).save(out_path)
    print(f"person[{used}] -> {os.path.basename(out_path)} (face={fb})")

def logo_circle(in_path, out_path, size=1000, bg=(245, 245, 245, 255), fill_ratio=0.6):
    logo = Image.open(in_path).convert("RGBA")
    bbox = logo.getbbox()
    if bbox:
        logo = logo.crop(bbox)
    lw, lh = logo.size
    scale = (size * fill_ratio) / max(lw, lh)
    logo = logo.resize((max(1, int(lw * scale)), max(1, int(lh * scale))))
    badge = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(badge).ellipse((0, 0, size, size), fill=bg)
    lx = (size - logo.size[0]) // 2
    ly = (size - logo.size[1]) // 2
    badge.paste(logo, (lx, ly), logo)
    badge.save(out_path)
    print(f"logo -> {os.path.basename(out_path)} (logo bbox {lw}x{lh})")

if __name__ == "__main__":
    out = os.path.join(ROOT, "assets/prepared")
    os.makedirs(out, exist_ok=True)
    N = os.path.join(ROOT, "assets/scraped/nvidia")
    # 3 DIFFERENT person photos (all last 4 yrs) -> one per content slide
    person_circle(os.path.join(N, "jensen_2024.jpg"),  os.path.join(out, "person_s1.png"))
    person_circle(os.path.join(N, "jensen_2023a.jpg"), os.path.join(out, "person_s2.png"))
    person_circle(os.path.join(N, "jensen_2023b.jpg"), os.path.join(out, "person_s3.png"))
    # logo badge (white coin so the real NVIDIA logo reads clearly behind the person)
    logo_circle(os.path.join(N, "nvidia_logo_raster.png"), os.path.join(out, "logo_badge.png"))
