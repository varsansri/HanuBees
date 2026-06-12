#!/usr/bin/env python3
# Folder-open intro (reactbits Folder) ported to frames. The folder opens and,
# instead of papers, small BEE pngs pop out + rotate to their spots; a wordmark
# fades in. Transparent frames -> overlaid over the rays bg in make-video.
import sys, json, math, os
from PIL import Image, ImageDraw, ImageFont

spec = json.load(open(sys.argv[1]))
outdir = sys.argv[2]
os.makedirs(outdir, exist_ok=True)

W, H, fps, dur = spec["W"], spec["H"], spec["fps"], spec["dur"]
fw, fh = spec["fw"], spec["fh"]
cx, cy = W // 2, int(H * 0.46)
beeSize = spec["beeSize"]
fontFile = spec["fontFile"]
wordmark = spec["wordmark"]

def hexrgb(h):
    h = h.lstrip("#"); return (int(h[0:2],16), int(h[2:4],16), int(h[4:6],16))
def darken(rgb, p): return tuple(max(0, int(c*(1-p))) for c in rgb)
FRONT = hexrgb(spec["folderColor"])
BACK = darken(FRONT, 0.18)
TAB = BACK
FG = (234,234,234)

bee = Image.open(spec["beePng"]).convert("RGBA")
bee.thumbnail((beeSize, beeSize), Image.LANCZOS)

ease = lambda x: 1 - (1-x)**3                          # easeOutCubic
top = cy - fh//2
# 3 bee targets (offset from folder top-center) + rotation, like the 3 papers
targets = [(-0.78*fw, -0.75*fh, -15), (0.30*fw, -0.78*fh, 15), (-0.05*fw, -1.05*fh, 5)]

N = int(round(dur*fps))
for f in range(N):
    t = f/fps
    img = Image.new("RGBA", (W, H), (0,0,0,0))
    d = ImageDraw.Draw(img)
    ent = max(0, min(1, t/0.2))                        # folder appears fast
    op = ease(max(0, min(1, (t-0.2)/0.7)))             # open quickly
    if ent <= 0:
        img.save(os.path.join(outdir, f"{f:04d}.png")); continue
    a = int(255*ent)
    # folder back (rounded) + tab  (bees come from the story layer, not here)
    d.rounded_rectangle([cx-fw//2, top, cx+fw//2, cy+fh//2], radius=18, fill=BACK+(a,))
    d.rounded_rectangle([cx-fw//2, top-16, cx-fw//2+90, top+6], radius=8, fill=TAB+(a,))
    # folder front (folds: scaleY 1->0.6 + skew), on top
    foldH = fh*(1 - 0.4*op)
    skew = math.tan(math.radians(15*op))*foldH
    ty0 = (cy+fh//2) - foldH
    quad = [(cx-fw//2+skew, ty0), (cx+fw//2+skew, ty0), (cx+fw//2, cy+fh//2), (cx-fw//2, cy+fh//2)]
    d.polygon(quad, fill=FRONT+(a,))
    # wordmark fades in
    wm = max(0, min(1, (t-1.3)/0.5))
    if wordmark and wm > 0:
        try: font = ImageFont.truetype(fontFile, 46)
        except: font = ImageFont.load_default()
        tw = d.textlength(wordmark, font=font)
        d.text((cx - tw/2, cy+fh//2+60), wordmark, font=font, fill=FG+(int(255*wm),))
    img.save(os.path.join(outdir, f"{f:04d}.png"))
print("intro frames:", N, "->", outdir)
