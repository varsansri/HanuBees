#!/usr/bin/env python3
# BlurText (reactbits/motion) ported to frames. Per word: blur 10->5->0,
# opacity 0->0.5->1, y -50->5->0 (direction=top), staggered by `delay`.
# Renders a full-reel transparent overlay matching the slide headline layout.
import sys, json, os, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

spec = json.load(open(sys.argv[1]))
outdir = sys.argv[2]
os.makedirs(outdir, exist_ok=True)

W, H, fps = spec["W"], spec["H"], spec["fps"]
font_file = spec["fontFile"]
fillhex = spec["fill"].lstrip("#")
FILL = (int(fillhex[0:2],16), int(fillhex[2:4],16), int(fillhex[4:6],16))
yOff = spec["yOffset"]
delay = spec.get("delay", 0.2)
stepDur = spec.get("stepDuration", 0.35)
times = [0.0, 0.5, 1.0]
KF = {"blur":[10.0,5.0,0.0], "op":[0.0,0.5,1.0], "y":[-50.0,5.0,0.0]}
totalDur = stepDur * (len(times)-1)
slideDur = spec["slideDur"]
N = int(round(spec["dur"]*fps))

def lerp_kf(arr, p):
    for i in range(len(times)-1):
        if p <= times[i+1]:
            t0,t1 = times[i],times[i+1]
            f = 0 if t1==t0 else (p-t0)/(t1-t0)
            return arr[i] + (arr[i+1]-arr[i])*f
    return arr[-1]

# precompute word boxes per slide
fonts = {}
def getfont(sz):
    if sz not in fonts: fonts[sz] = ImageFont.truetype(font_file, sz)
    return fonts[sz]

slides = []
for s in spec["slides"]:
    f = getfont(s["size"]); asc, desc = f.getmetrics()
    space = f.getlength(" ")
    words = []
    gi = 0
    for li, line in enumerate(s["lines"]):
        cx = s["x"]
        baseY = s["firstY"] + li*s["lh"]
        for w in line.split(" "):
            wl = f.getlength(w)
            words.append({"w": w, "x": cx, "baseY": baseY, "gi": gi, "size": s["size"]})
            cx += wl + space; gi += 1
    slides.append({"start": s["start"], "asc": asc, "words": words})

pad = 18
for fr in range(N):
    t = fr/fps
    img = Image.new("RGBA", (W, H), (0,0,0,0))
    for s in slides:
        lt = t - s["start"]
        if lt < 0 or lt >= slideDur:
            continue
        f_asc = s["asc"]
        for wd in s["words"]:
            ws = wd["gi"]*delay
            p = (lt - ws)/totalDur
            if p <= 0:        # not started -> invisible
                continue
            p = min(p, 1.0)
            blur = lerp_kf(KF["blur"], p); op = lerp_kf(KF["op"], p); dy = lerp_kf(KF["y"], p)
            font = getfont(wd["size"])
            wl = int(math.ceil(font.getlength(wd["w"]))) + 2*pad
            wh = wd["size"] + 2*pad
            tile = Image.new("RGBA", (wl, wh), (0,0,0,0))
            d = ImageDraw.Draw(tile)
            d.text((pad, pad), wd["w"], font=font, fill=FILL+(255,), anchor="la")
            if blur > 0.4:
                tile = tile.filter(ImageFilter.GaussianBlur(blur))
            if op < 1.0:
                a = tile.split()[3].point(lambda v: int(v*op))
                tile.putalpha(a)
            left = int(wd["x"] - pad)
            top = int(wd["baseY"] - f_asc + dy + yOff - pad)
            img.alpha_composite(tile, (left, top))
    img.save(os.path.join(outdir, f"{fr:04d}.png"))
print("blurtext frames:", N, "->", outdir)
