#!/usr/bin/env python3
# SideRays (reactbits) GLSL shader ported to numpy -> renders the animated light-ray
# background to an opaque MP4 (additive rays over brand dark base). Same math as the
# fragment shader; time-independent terms precomputed for speed.
import sys, math, numpy as np, cv2

def hex_rgb(h):
    h = h.lstrip("#")
    return np.array([int(h[0:2],16)/255, int(h[2:4],16)/255, int(h[4:6],16)/255], np.float32)

def render(out_path, W=540, H=960, dur=12.8, fps=30,
           speed=2.5, color1="#EAB308", color2="#96c8ff", intensity=2.0, spread=2.0,
           origin="top-right", tilt=0.0, saturation=1.5, blend=0.75, falloff=1.6, opacity=1.0,
           base_hex="#121212"):
    c1, c2 = hex_rgb(color1), hex_rgb(color2)
    base = hex_rgb(base_hex)
    # flip from origin (top-right -> [0,0])
    flip = {"top-left":(1,0),"bottom-right":(0,1),"bottom-left":(1,1)}.get(origin,(0,0))
    fx, fy = flip
    # pixel grid in GL convention (y up)
    cols = np.arange(W, dtype=np.float32) + 0.5
    rows = np.arange(H, dtype=np.float32)
    Xg, Rg = np.meshgrid(cols, rows)                 # Rg = image row (0 top)
    fragX = (W - Xg) if fx > 0.5 else Xg
    fragY_gl = (H - 1 - Rg) + 0.5                     # GL y (bottom-up)
    fragY = (H - fragY_gl) if fy > 0.5 else fragY_gl
    coordX = fragX
    coordY = H - fragY                                # shader: coord = (x, iRes.y - y)
    rayPos = np.array([W*1.1, -0.5*H], np.float32)
    # tilt rotation (tilt=0 -> identity)
    tr = tilt*math.pi/180.0; cs, sn = math.cos(tr), math.sin(tr)
    relx, rely = coordX - rayPos[0], coordY - rayPos[1]
    tcx = relx*cs - rely*sn + rayPos[0]
    tcy = relx*sn + rely*cs + rayPos[1]
    s2x, s2y = tcx - rayPos[0], tcy - rayPos[1]
    seglen = np.sqrt(s2x*s2x + s2y*s2y) + 1e-6
    nx, ny = s2x/seglen, s2y/seglen
    hs = spread*0.275
    d1 = np.array([math.cos(0.785398+hs), math.sin(0.785398+hs)]); d1/=np.linalg.norm(d1)
    d2 = np.array([math.cos(0.785398-hs), math.sin(0.785398-hs)]); d2/=np.linalg.norm(d2)
    cos1 = nx*d1[0] + ny*d1[1]
    cos2 = nx*d2[0] + ny*d2[1]
    atten = np.clip((W - seglen)/W, 0.5, 1.0)
    # brightness (time-independent)
    lightScreen = np.array([rayPos[0], H - rayPos[1]], np.float32)
    dl = np.sqrt((fragX-lightScreen[0])**2 + (fragY-lightScreen[1])**2)/H
    brightness = (intensity*0.4) / np.power(np.maximum(dl,0.001), falloff)
    sA1,sB1,sA2,sB2 = 36.2214,21.11349,22.3991,18.0234
    sp1, sp2 = speed, speed*0.2
    gray_w = np.array([0.299,0.587,0.114], np.float32)

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    vw = cv2.VideoWriter(out_path, fourcc, fps, (W, H))
    n = int(round(dur*fps))
    for i in range(n):
        t = i/fps
        st1 = np.clip((0.45+0.15*np.sin(cos1*sA1 + t*sp1)) + (0.3+0.2*np.cos(-cos1*sB1 + t*sp1)),0,1)*atten
        st2 = np.clip((0.45+0.15*np.sin(cos2*sA2 + t*sp2)) + (0.3+0.2*np.cos(-cos2*sB2 + t*sp2)),0,1)*atten
        # rays1/2 colored, blended
        col = (c1[None,None,:]*st1[...,None])*(1-blend)*0.9 + (c2[None,None,:]*st2[...,None])*blend*0.9
        col = col*brightness[...,None]
        g = (col*gray_w[None,None,:]).sum(-1, keepdims=True)
        col = g + (col-g)*saturation
        rgb = np.clip(base[None,None,:] + col, 0, 1)         # additive over dark base
        frame = (rgb[...,::-1]*255).astype(np.uint8)          # RGB->BGR
        vw.write(frame)
    vw.release()
    print("rays ->", out_path, f"{W}x{H} {n}f")

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "/tmp/rays_bg.mp4"
    dur = float(sys.argv[2]) if len(sys.argv) > 2 else 12.8
    render(out, dur=dur)
