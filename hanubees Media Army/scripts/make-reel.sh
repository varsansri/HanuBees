#!/bin/bash
# Build a Reel/Short MP4 from carousel slides + royalty-free music.
# Usage: make-reel.sh <slidesDir> <audio.mp3> <out.mp4> [secsPerSlide] [audioStart]
set -e
DIR="$1"; AUDIO="$2"; OUT="$3"; DUR="${4:-3.6}"; ASTART="${5:-27}"
SLIDES=("$DIR"/s*.png)
N=${#SLIDES[@]}
TOTAL=$(awk "BEGIN{print $N*$DUR}")
FADE=$(awk "BEGIN{print $TOTAL-1.5}")

INPUTS=(); FILTERS=""; CONCAT=""
for i in "${!SLIDES[@]}"; do
  INPUTS+=(-loop 1 -t "$DUR" -i "${SLIDES[$i]}")
  FILTERS+="[${i}:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0x121212,setsar=1,format=yuv420p[v${i}];"
  CONCAT+="[v${i}]"
done

ffmpeg -y "${INPUTS[@]}" -ss "$ASTART" -i "$AUDIO" \
  -filter_complex "${FILTERS}${CONCAT}concat=n=${N}:v=1:a=0[v];[${N}:a]afade=t=out:st=${FADE}:d=1.5,volume=0.85[a]" \
  -map "[v]" -map "[a]" -t "$TOTAL" -r 30 -c:v libx264 -pix_fmt yuv420p -preset veryfast -c:a aac -b:a 192k -movflags +faststart "$OUT" 2>/dev/null
echo "built $OUT (${N} slides, ${TOTAL}s)"
