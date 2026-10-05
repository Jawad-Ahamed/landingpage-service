#!/usr/bin/env bash
# Builds the website walkthrough: intro card + footage (part A) + mid card + footage (part B) + end card,
# joined with short crossfades. Run `node render_cards.mjs` first (it writes build/frames/<card>/).
#
#   bash build_video.sh [source.mp4]
# Source defaults to the 1080p master in ~/Downloads (falls back to the 1600px web copy).
# Outputs:
#   build/metawurks-usecases-1080p.mp4   high-quality master with the soundtrack
#   ../assets/metawurks-usecases.mp4     web copy used by the site (1600x900, AAC 128k)
#   ../assets/metawurks-poster.jpg       poster frame (logo + tagline from the intro)
#
# Timeline (seconds). If you change a card length or a cut, update these AND the chapter data-t
# values in index.html (they're listed at the bottom of this file).
set -euo pipefail
cd "$(dirname "$0")"

SRC="${1:-$HOME/Downloads/Metawurks_usecases.mp4}"
[ -f "$SRC" ] || SRC="../assets/metawurks-usecases.mp4"

INTRO=4.4; MID=3.0; END=5.0          # card lengths (match data-duration in cards/*.html)
CUT_A=28.3                            # part A = source 0 → 28.3 (ends as the "Ask" scene blurs out)
CUT_B=28.6                            # part B = source 28.6 → end (sidebar, then the agent runs)
X1=0.3; X2=0.4; X3=0.25; X4=0.6       # crossfades: intro→A, A→mid, mid→B, B→end

mkdir -p build/seg
enc=(-c:v libx264 -preset slow -crf 14 -pix_fmt yuv420p -r 30 -an)
for c in intro mid end; do
  ffmpeg -v error -y -framerate 30 -i "build/frames/$c/%04d.png" "${enc[@]}" "build/seg/$c.mp4"
done
SCALE="scale=1920:1080:flags=lanczos,fps=30,format=yuv420p,setsar=1"
ffmpeg -v error -y -i "$SRC" -t "$CUT_A" -vf "$SCALE" "${enc[@]}" build/seg/a.mp4
ffmpeg -v error -y -ss "$CUT_B" -i "$SRC" -vf "$SCALE" "${enc[@]}" build/seg/b.mp4

dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
LA=$(dur build/seg/a.mp4); LB=$(dur build/seg/b.mp4)
read O1 O2 O3 O4 TOTAL < <(python3 -c "
i,m,e,la,lb=$INTRO,$MID,$END,$LA,$LB; x1,x2,x3,x4=$X1,$X2,$X3,$X4
o1=i-x1; t=o1+la
o2=t-x2; t=o2+m
o3=t-x3; t=o3+lb
o4=t-x4; t=o4+e
print(round(o1,3),round(o2,3),round(o3,3),round(o4,3),round(t,3))")

ffmpeg -v error -y -i build/seg/intro.mp4 -i build/seg/a.mp4 -i build/seg/mid.mp4 -i build/seg/b.mp4 -i build/seg/end.mp4 \
  -filter_complex "[0][1]xfade=transition=fade:duration=$X1:offset=$O1[v1];[v1][2]xfade=transition=fade:duration=$X2:offset=$O2[v2];[v2][3]xfade=transition=fade:duration=$X3:offset=$O3[v3];[v3][4]xfade=transition=fade:duration=$X4:offset=$O4,format=yuv420p[v]" \
  -map "[v]" -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -movflags +faststart build/metawurks-usecases-1080p-silent.mp4

# poster, then the soundtrack (mux_audio.sh also writes the web copy)
ffmpeg -v error -y -ss 2.9 -i build/metawurks-usecases-1080p-silent.mp4 -frames:v 1 -vf "scale=1600:900" -q:v 3 ../assets/metawurks-poster.jpg
bash mux_audio.sh

echo "parts: intro 0–$INTRO · A from $O1 · mid at $O2 · B from $O3 · end at $O4 · total ${TOTAL}s"
echo "source time t maps to: t + $O1 in part A (t < $CUT_A); t + $(python3 -c "print(round($O3-$CUT_B,3))") in part B (t ≥ $CUT_B)"

# Chapter chips in index.html (data-t, seconds in the built video):
#   Meet MetaWurks 0 · Sound familiar? = O1 · Privacy-first 10+O1 · Connect 14.5+O1 · Ask 20+O1
#   Tax prep = O2 (the mid card) · Case files 40+B · Prior auth 50+B · Dashboard 59.5+B · Judgment 63+B · 1:1 call 66+B
#   where B = O3 − CUT_B
