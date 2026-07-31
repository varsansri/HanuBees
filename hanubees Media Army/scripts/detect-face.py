#!/usr/bin/env python3
"""Face detection + smart crop for founder photos.
Detects faces with OpenCV Haar cascade, crops to a centered close-up.

Usage:
  python scripts/detect-face.py --input /tmp/founders/bezos0.jpg --output /tmp/founders/bezos0-cropped.jpg
  python scripts/detect-face.py --dir /tmp/founders    # batch process all
  python scripts/detect-face.py --dir /tmp/founders --overwrite
"""
import cv2, sys, os, argparse
from pathlib import Path

# Load Haar cascade for face detection
CASCADE = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
face_cascade = cv2.CascadeClassifier(CASCADE)
if face_cascade.empty():
    raise RuntimeError("Failed to load Haar cascade")

EXTRA_CASCADES = [
    cv2.data.haarcascades + "haarcascade_frontalface_alt.xml",
    cv2.data.haarcascades + "haarcascade_frontalface_alt2.xml",
    cv2.data.haarcascades + "haarcascade_profileface.xml",
]
extra_cascades = []
for c in EXTRA_CASCADES:
    cc = cv2.CascadeClassifier(c)
    if not cc.empty():
        extra_cascades.append(cc)


def detect_faces(img_path):
    img = cv2.imread(str(img_path))
    if img is None:
        return None, None, f"cannot read {img_path}"
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = img.shape[:2]
    # Try primary cascade with different parameters
    all_faces = []
    for scale in [1.05, 1.1, 1.15]:
        for min_n in [3, 4, 5]:
            faces = face_cascade.detectMultiScale(gray, scaleFactor=scale, minNeighbors=min_n, minSize=(60, 60))
            for (x, y, fw, fh) in faces:
                all_faces.append((x, y, fw, fh, scale))
    # Try extra cascades
    for cascade in extra_cascades:
        faces = cascade.detectMultiScale(gray, 1.1, 4, minSize=(60, 60))
        for (x, y, fw, fh) in faces:
            all_faces.append((x, y, fw, fh, 0))
    if not all_faces:
        return None, img, "no face detected"
    # Pick largest face (highest area)
    largest = max(all_faces, key=lambda f: f[2] * f[3])
    x, y, fw, fh = largest[:4]
    # Expand crop to include shoulders, centered on face
    cx, cy = x + fw // 2, y + fh // 2
    crop_size = max(fw, fh) * 2
    crop_size = max(crop_size, min(w, h) * 0.6)
    crop_size = int(crop_size)
    x1 = max(0, cx - crop_size // 2)
    y1 = max(0, cy - int(crop_size * 0.45))  # bias up for forehead
    x2 = min(w, x1 + crop_size)
    y2 = min(h, y1 + crop_size)
    # Adjust if we hit edges
    if x2 - x1 < crop_size:
        x1 = max(0, x2 - crop_size)
    if y2 - y1 < crop_size:
        y1 = max(0, y2 - crop_size)
    cropped = img[y1:y2, x1:x2]
    return (x, y, fw, fh), cropped, "ok"


def main():
    parser = argparse.ArgumentParser(description="Face detect + smart crop for founder photos")
    parser.add_argument("--input", help="Single input image path")
    parser.add_argument("--output", help="Single output image path (default: input with -cropped suffix)")
    parser.add_argument("--dir", help="Batch process all images in directory")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite originals with cropped versions")
    args = parser.parse_args()

    if args.dir:
        d = Path(args.dir)
        files = list(d.glob("*.jpg")) + list(d.glob("*.jpeg")) + list(d.glob("*.png"))
        print(f"Processing {len(files)} images in {d}...")
        ok = fail = 0
        for f in sorted(files):
            box, cropped, msg = detect_faces(f)
            if box is None:
                print(f"  ✗ {f.name}: {msg}")
                fail += 1
                continue
            if args.overwrite:
                out = f
            else:
                out = f.parent / f"{f.stem}-cropped{f.suffix}"
            cv2.imwrite(str(out), cropped)
            print(f"  ✓ {f.name}: face at ({box[0]},{box[1]} {box[2]}x{box[3]}) → {out.name}")
            ok += 1
        print(f"\nDone: {ok} ok, {fail} failed")

    elif args.input:
        inp = Path(args.input)
        if not inp.exists():
            print(f"Error: {inp} not found")
            sys.exit(1)
        out = Path(args.output) if args.output else inp.parent / f"{inp.stem}-cropped{inp.suffix}"
        box, cropped, msg = detect_faces(inp)
        if box is None:
            print(f"Error: {msg}")
            sys.exit(1)
        cv2.imwrite(str(out), cropped)
        print(f"Face at ({box[0]},{box[1]} {box[2]}x{box[3]}) → {out}")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
