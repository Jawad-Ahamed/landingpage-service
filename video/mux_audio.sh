#!/usr/bin/env bash
# Adds the soundtrack to the built walkthrough (no picture re-render).
#   bash mux_audio.sh                 licensed track (audio/music/…, "Corporate Motivational" by BlueTreeAudio,
#                                     the version without the piano melody), edited to the picture, with the
#                                     sound design + UI foley from audio/score.mjs on top (retuned to the track's key)
#   MUSIC=generated bash mux_audio.sh the original generated score instead (music + sfx from audio/score.mjs)
#   MUSIC=other.wav IN1=… IN2=… TRANSPOSE=… bash mux_audio.sh   another track (see the edit notes below)
# Reads  build/metawurks-usecases-1080p-silent.mp4 (made by build_video.sh)
# Writes build/metawurks-usecases-1080p.mp4 (AAC 192k) and ../assets/metawurks-usecases.mp4 (AAC 128k)
#
# The music edit (Corporate Motivational: 125 BPM, 1.92 s bars, a 4-bar G–D–G/F#–C loop, phrases start on
# bars 1, 5, 9… at 1.92 s, outro from ~142 s, ends ~151 s):
#   part 1  video 0 → 32.0 (the mid card)  = track IN1 → IN1+32.0   (IN1 0.64: a phrase starts exactly on the mid card)
#   part 2  video 32.0 → end               = track IN2 → …          (IN2 101.76 = 36 bars later, also a phrase start, so
#                                                                    the outro arrives with the "1:1 call" scene and
#                                                                    winds down under the end card)
# The two parts meet on a downbeat with a 30 ms crossfade, under the mid card's hit.
set -euo pipefail
cd "$(dirname "$0")"
SILENT=build/metawurks-usecases-1080p-silent.mp4
TOTAL=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SILENT")
MUSIC="${MUSIC:-audio/music/corporate-motivational-no-piano.wav}"
SPLICE=32.0

lufs() { ffmpeg -hide_banner -i "$1" -af ebur128 -f null - 2>&1 | awk '/Integrated loudness/{f=1} f&&/I:/{print $2; exit}'; }

if [ "$MUSIC" = "generated" ]; then
  node audio/score.mjs
  cp build/score.wav build/mix.wav
else
  IN1="${IN1:-0.64}"; IN2="${IN2:-101.76}"
  TRANSPOSE="${TRANSPOSE:-2}" node audio/score.mjs      # sfx.wav retuned to the track's key (F -> G)
  read A1 B1 A2 B2 FO < <(python3 -c "
x=.015; t=$TOTAL; s=$SPLICE
print($IN1, round($IN1+s+x,4), round($IN2-x,4), round($IN2+(t-s)+x,4), round(t-1.3,3))")
  ffmpeg -v error -y -i "$MUSIC" -filter_complex \
    "[0:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit[x][y];[x]atrim=$A1:$B1,asetpts=N/SR/TB[p1];[y]atrim=$A2:$B2,asetpts=N/SR/TB[p2];[p1][p2]acrossfade=d=0.03:c1=tri:c2=tri,atrim=0:$TOTAL,afade=t=in:d=0.25,afade=t=out:st=$FO:d=1.3[m]" \
    -map "[m]" -c:a pcm_s16le build/music_edit.wav
  # balance: music at -20 LUFS, sound design + foley 5.5 LU under it (the same balance as the generated score);
  # linear gains (no dynamic loudnorm) so nothing pumps
  GM=$(python3 -c "print(-20-($(lufs build/music_edit.wav)))"); GS=$(python3 -c "print(-25.5-($(lufs build/sfx.wav)))")
  ffmpeg -v error -y -i build/music_edit.wav -i build/sfx.wav -filter_complex \
    "[0:a]volume=${GM}dB[m];[1:a]volume=${GS}dB[s];[m][s]amix=inputs=2:normalize=0[a]" -map "[a]" -c:a pcm_f32le build/mix.wav
fi
# master to web loudness: -16 LUFS integrated, -1.5 dBTP
ffmpeg -v error -y -i build/mix.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 build/mix_norm.wav

ffmpeg -v error -y -i "$SILENT" -i build/mix_norm.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart build/metawurks-usecases-1080p.mp4
ffmpeg -v error -y -i build/metawurks-usecases-1080p.mp4 -vf "scale=1600:900:flags=lanczos" \
  -c:v libx264 -preset slow -crf 27 -profile:v high -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart ../assets/metawurks-usecases.mp4
ls -lh build/metawurks-usecases-1080p.mp4 ../assets/metawurks-usecases.mp4
