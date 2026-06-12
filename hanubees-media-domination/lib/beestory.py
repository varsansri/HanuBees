#!/usr/bin/env python3
# Bee narrative overlay (top layer of the reel). A honeybee flies out of the folder,
# hovers/wobbles "reading" each post; a 2nd bee joins from the left on slide 2 (they
# face each other), a 3rd on slide 3, and on slide 4 all merge into the big bee — one
# by one. Emotion conveyed only by hover + wobble + facing. Renders transparent frames.
import sys, json, os, math
from PIL import Image

spec = json.load(open(sys.argv[1]))
outdir = sys.argv[2]
os.makedirs(outdir, exist_ok=True)

W, H, fps = spec["W"], spec["H"], spec["fps"]
intro = spec["introSec"]; sec = spec["secPerSlide"]; total = spec["dur"]
beeSize = spec["beeSize"]; bigC = spec["bigBeeCenter"]
WOB = spec["wobbleAmp"]; TILT = spec["tiltAmp"]
s1, s2, s3, s4 = intro, intro+sec, intro+2*sec, intro+3*sec
end = total

beeImg = Image.open(spec["beePng"]).convert("RGBA")

# keyframes: (t, x, y, scale, alpha, face[+1 right,-1 left])
BX, BY = bigC
bees = [
  # BEE 1 — emerges from folder, reads slide 1, leads
  [(s1-0.6, W/2, H*0.46, 0.5, 0, 1), (s1-0.25, W/2, H*0.40, 0.75, 1, 1),
   (s1+0.35, 660, 1520, 0.95, 1, 1), (s2-0.2, 440, 1500, 0.95, 1, -1),
   (s2+0.6, 600, 1460, 0.9, 1, -1), (s3+0.4, 600, 1440, 0.85, 1, -1),
   (s4+0.3, 560, 1430, 0.85, 1, 1), (s4+1.0, BX, BY, 0.02, 1, 1), (end, BX, BY, 0.0, 0, 1)],
  # BEE 2 — flies in from the LEFT on slide 2, meets bee1 (they face each other)
  [(s2-0.01, -90, 1485, 0.9, 0, 1), (s2, -70, 1485, 0.9, 1, 1),
   (s2+0.7, 470, 1485, 0.9, 1, 1), (s3+0.4, 480, 1445, 0.85, 1, 1),
   (s4+1.0, 560, 1430, 0.85, 1, 1), (s4+1.7, BX, BY, 0.02, 1, 1), (end, BX, BY, 0.0, 0, 1)],
  # BEE 3 — joins from the RIGHT on slide 3
  [(s3-0.01, W+90, 1465, 0.9, 0, -1), (s3, W+70, 1465, 0.9, 1, -1),
   (s3+0.7, 700, 1445, 0.85, 1, -1), (s4+1.0, 600, 1435, 0.82, 1, -1),
   (s4+1.7, 560, 1430, 0.8, 1, -1), (s4+2.4, BX, BY, 0.02, 1, -1), (end, BX, BY, 0.0, 0, -1)],
]
phases = [0.0, 2.1, 4.3]

def interp(kf, t):
    if t <= kf[0][0]: return kf[0][1], kf[0][2], kf[0][3], kf[0][4], kf[0][5]
    if t >= kf[-1][0]: return kf[-1][1:]
    for i in range(len(kf)-1):
        a, b = kf[i], kf[i+1]
        if a[0] <= t <= b[0]:
            f = 0 if b[0]==a[0] else (t-a[0])/(b[0]-a[0])
            x = a[1]+(b[1]-a[1])*f; y = a[2]+(b[2]-a[2])*f
            sc = a[3]+(b[3]-a[3])*f; al = a[4]+(b[4]-a[4])*f
            face = a[5] if f < 0.5 else b[5]
            return x, y, sc, al, face
    return kf[-1][1:]

N = int(round(total*fps))
for fr in range(N):
    t = fr/fps
    img = Image.new("RGBA", (W, H), (0,0,0,0))
    for bi, kf in enumerate(bees):
        x, y, sc, al, face = interp(kf, t)
        if al <= 0.01 or sc <= 0.02:
            continue
        ph = phases[bi]
        wob_x = WOB*0.6*math.sin(t*6.0 + ph)
        wob_y = WOB*math.sin(t*4.5 + ph*1.3)
        tilt = TILT*math.sin(t*5.5 + ph)
        bsz = max(10, int(beeSize*sc))
        b = beeImg.resize((bsz, bsz), Image.LANCZOS)
        if face < 0:
            b = b.transpose(Image.FLIP_LEFT_RIGHT)
        b = b.rotate(tilt, expand=True, resample=Image.BICUBIC)
        if al < 1.0:
            b.putalpha(b.split()[3].point(lambda v: int(v*al)))
        px = int(x + wob_x - b.width/2); py = int(y + wob_y - b.height/2)
        img.alpha_composite(b, (px, py))
    img.save(os.path.join(outdir, f"{fr:04d}.png"))
print("bee frames:", N, "->", outdir)
