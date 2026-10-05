// Original score + sound design for the walkthrough, timed to the built edit (see build_video.sh).
// Pure JS synthesis (no samples, royalty-free). Writes 48 kHz stereo WAVs to ../build/:
//   music.wav  the bed (warm pad, felt keys, sub bass, soft drums)  -> replace with a licensed track via MUSIC=… if wanted
//   sfx.wav    swells, soft hits, whooshes and UI foley timed to the cards and the footage
//   score.wav  music + sfx
// Usage: node audio/score.mjs
//
// Sound (v3, modelled on the Combinely "Coco at work" film): ~100 BPM, warm and unhurried. Most of the
// energy sits in a round sub bass and soft major-7th/9th chords; almost nothing above 3 kHz. No saw
// waves, no bright hats, no noise crashes. UI sounds are short, rounded and pitched in key, so a
// click or a tick reads as "work getting done" instead of a beep.
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'build');
const SR = 48000;

// ---- edit timeline (seconds in the built video; keep in sync with build_video.sh) ----
const T = { footA: 4.1, mid: 32.0, footB: 34.75, end: 75.55, total: 80.55 };
// source-footage time -> built-video time (part A shifts by the intro, part B also by the mid card)
const CUT_A = 28.3, CUT_B = 28.6, SHIFT_A = 4.1, SHIFT_B = 6.15;
const src = t => (t < CUT_B ? t + SHIFT_A : t + SHIFT_B);
// ~103 BPM. 12 bars between footage start and the mid card, so the mid card lands on a downbeat
// and the end card's title lands near bar 31.
const BAR = (T.mid - T.footA) / 12, BEAT = BAR / 4, S16 = BEAT / 4;
const barAt = b => T.footA + b * BAR;
const N = Math.ceil(SR * T.total);

const mus = [new Float32Array(N), new Float32Array(N)];
const sfx = [new Float32Array(N), new Float32Array(N)];
const ui = [new Float32Array(N), new Float32Array(N)];    // UI foley: clicks, typing, pops, ticks
const rev = [new Float32Array(N), new Float32Array(N)];   // reverb send (shared)

// ---------- helpers ----------
let seed = 0x9E3779B9;
const noise = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return ((seed >>> 0) / 4294967296) * 2 - 1; };
// TRANSPOSE (semitones) retunes everything pitched (swells, marimba, UI ticks) to match a licensed track: +2 = G major
const TRANSPOSE = Number(process.env.TRANSPOSE || 0);
const mtof = n => 440 * Math.pow(2, (n + TRANSPOSE - 69) / 12);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function put(buf, i, l, r) { if (i >= 0 && i < N) { buf[0][i] += l; buf[1][i] += r; } }
const TAU = 2 * Math.PI;

class Biquad {      // RBJ cookbook; call set*() then process()
  constructor() { this.x1 = this.x2 = this.y1 = this.y2 = 0; this.b0 = 1; this.b1 = this.b2 = this.a1 = this.a2 = 0; }
  _set(b0, b1, b2, a0, a1, a2) { this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = a1 / a0; this.a2 = a2 / a0; }
  _w(f) { return TAU * clamp(f, 10, SR * .45) / SR; }
  lp(f, q = .707) { const w = this._w(f), c = Math.cos(w), a = Math.sin(w) / (2 * q); this._set((1 - c) / 2, 1 - c, (1 - c) / 2, 1 + a, -2 * c, 1 - a); return this; }
  hp(f, q = .707) { const w = this._w(f), c = Math.cos(w), a = Math.sin(w) / (2 * q); this._set((1 + c) / 2, -(1 + c), (1 + c) / 2, 1 + a, -2 * c, 1 - a); return this; }
  bp(f, q = 1) { const w = this._w(f), c = Math.cos(w), a = Math.sin(w) / (2 * q); this._set(a, 0, -a, 1 + a, -2 * c, 1 - a); return this; }
  peak(f, q, db) { const A = Math.pow(10, db / 40), w = this._w(f), c = Math.cos(w), a = Math.sin(w) / (2 * q); this._set(1 + a * A, -2 * c, 1 - a * A, 1 + a / A, -2 * c, 1 - a / A); return this; }
  hshelf(f, db) { const A = Math.pow(10, db / 40), w = this._w(f), c = Math.cos(w), a = Math.sin(w) / 2 * Math.SQRT2, s = 2 * Math.sqrt(A) * a;
    this._set(A * ((A + 1) + (A - 1) * c + s), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - s), (A + 1) - (A - 1) * c + s, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - s); return this; }
  process(x) { const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2; this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y; return y; }
}

// ---------- arrangement ----------
// Fmaj9 – Am7 – Dm9 – Csus2, one chord per bar. Neighbouring chords share C and E, so the harmony
// glides instead of stepping: hopeful, calm, "things are handled".
const CHORDS = [
  { root: 41, notes: [57, 60, 64, 67], top: [72, 76] },   // Fmaj9  (A C E G over F)
  { root: 45, notes: [55, 60, 64, 69], top: [76, 79] },   // Am7    (G C E A)
  { root: 38, notes: [53, 57, 60, 64], top: [77, 74] },   // Dm9    (F A C E over D)
  { root: 36, notes: [55, 60, 62, 67], top: [74, 72] },   // Csus2  (G C D G)
];
const chordAt = b => CHORDS[((b % 4) + 4) % 4];
const LAST_BAR = Math.ceil((T.total - T.footA) / BAR);
const MID_BAR = 12, BUILD_BAR = 30, END_BAR = 31;
const groove = b => (b >= 2 && b <= 11) || (b >= 13 && b <= BUILD_BAR);
const part = b => ({
  kick: groove(b),
  clap: (b >= 4 && b <= 11) || (b >= 14 && b <= BUILD_BAR),
  shaker: (b >= 5 && b <= 11) || (b >= 16 && b <= BUILD_BAR),
  bass: b >= 0 && b <= BUILD_BAR && b !== MID_BAR,
  keys: (b >= 1 && b <= 11) || (b >= MID_BAR && b <= END_BAR),   // felt chords; the arp pulses underneath
  bell: (b >= 8 && b <= 11) || (b >= 20 && b <= 29),     // a quiet marimba top line in the fullest sections
  pad: true,
});
// the pad and keys lean back a little under each kick, so the low end stays clean (not a pump)
function duck(t) {
  const b = Math.floor((t - T.footA) / BAR);
  if (!part(b).kick) return 1;
  const since = ((t - T.footA) % (BEAT * 2) + BEAT * 2) % (BEAT * 2);
  return 1 - .15 * Math.exp(-since / .2);
}

// ---------- instruments ----------
// warm pad: sines with a little 2nd/3rd harmonic, slow chorus, low-passed. Chords overlap so they blend.
const AIR = .03;
function pad() {
  const events = [{ t0: 0.1, t1: T.footA, ch: CHORDS[0], intro: true }];
  for (let b = 0; b < LAST_BAR; b++) events.push({ t0: barAt(b), t1: barAt(b + 1), ch: chordAt(b) });
  for (const ev of events) {
    const atk = ev.intro ? 2.4 : .7, rel = ev.t1 >= T.end ? 4.5 : 1.1;
    const i0 = Math.floor(ev.t0 * SR), i1 = Math.min(N, Math.floor((ev.t1 + rel) * SR));
    const voices = ev.ch.notes.map((m, v) => ({ f: mtof(m), pL: Math.random() * TAU, pR: Math.random() * TAU, rate: .13 + v * .04 }));
    const fl = new Biquad().lp(2000, .6), fr = new Biquad().lp(2000, .6);
    const al = [new Biquad().hp(4000, .7), new Biquad().lp(12000, .7)], ar = [new Biquad().hp(4000, .7), new Biquad().lp(12000, .7)];   // a breath of air on top
    for (let i = i0; i < i1; i++) {
      const t = i / SR, k = t - ev.t0;
      let env = .5 - .5 * Math.cos(Math.PI * Math.min(1, k / atk)); if (t > ev.t1) env *= Math.max(0, 1 - (t - ev.t1) / rel) ** 1.5;
      let sl = 0, sr = 0;
      for (const v of voices) {
        const wob = 1 + .0018 * Math.sin(TAU * v.rate * t);
        v.pL += TAU * v.f * wob / SR; v.pR += TAU * v.f / wob / SR;
        sl += Math.sin(v.pL) + .22 * Math.sin(2 * v.pL) + .07 * Math.sin(3 * v.pL);
        sr += Math.sin(v.pR) + .22 * Math.sin(2 * v.pR) + .07 * Math.sin(3 * v.pR);
      }
      const g = .034 * env * duck(t) * (ev.intro ? .9 : 1);
      const l = fl.process(sl) * g + al[1].process(al[0].process(noise())) * AIR * env, r = fr.process(sr) * g + ar[1].process(ar[0].process(noise())) * AIR * env;
      put(mus, i, l * .8 + r * .2, r * .8 + l * .2); put(rev, i, l * .5, r * .5);
    }
  }
}

// sub bass: a sine plus its octave, gently saturated so it still reads on laptop speakers
function bass() {
  for (let b = 0; b < LAST_BAR; b++) {
    if (!part(b).bass) continue;
    const f = mtof(chordAt(b).root - 12), light = !groove(b);
    const hits = light ? [[0, 3.9]] : [[0, 2.4], [2.5, 1.4]];
    for (const [h, lenBeats] of hits) {
      const t0 = barAt(b) + h * BEAT, len = lenBeats * BEAT;
      const i0 = Math.floor(t0 * SR), i1 = Math.floor((t0 + len) * SR); let ph = 0;
      for (let i = i0; i < i1; i++) {
        const k = (i - i0) / SR; ph += TAU * f / SR;
        const env = Math.min(1, k / .03) * (light ? 1 : .75 + .25 * Math.exp(-k / .4)) * Math.min(1, (t0 + len - i / SR) / .08);
        const s = Math.tanh(1.4 * (Math.sin(ph) + .35 * Math.sin(2 * ph))) * .23 * env * (h ? .85 : 1);
        put(mus, i, s, s);
      }
    }
  }
}

// soft, round kick: no click, just a short pitched thump
function kick(t0, gain = 1) {
  const i0 = Math.floor(t0 * SR), n = Math.floor(.4 * SR); let ph = 0;
  for (let j = 0; j < n; j++) {
    const k = j / SR, f = 46 + 64 * Math.exp(-k / .035); ph += TAU * f / SR;
    const s = Math.sin(ph) * Math.min(1, k / .002) * Math.exp(-k / .2) * .46 * gain;
    put(mus, i0 + j, s, s);
  }
}
// soft clap / finger snap on 2 and 4: a few filtered noise bursts, darkened, mostly in the reverb
function clap(t0, gain = 1) {
  const i0 = Math.floor(t0 * SR), n = Math.floor(.25 * SR), bp = new Biquad().bp(1250, .9), lp = new Biquad().lp(3200, .6);
  for (let j = 0; j < n; j++) {
    const k = j / SR;
    const bursts = k < .022 ? (Math.exp(-(k % .0075) / .0025)) : Math.exp(-(k - .022) / .07);
    const s = lp.process(bp.process(noise())) * bursts * .11 * gain;
    put(mus, i0 + j, s * .92, s); put(rev, i0 + j, s * .9, s * .9);
  }
}
// shaker: very quiet, soft attack (no tick), swung 8ths
function shaker(t0, gain = 1) {
  const i0 = Math.floor(t0 * SR), n = Math.floor(.09 * SR), bp = new Biquad().bp(5200, .7), lp = new Biquad().lp(7000, .7);
  for (let j = 0; j < n; j++) {
    const k = j / SR, env = Math.min(1, k / .012) * Math.exp(-k / .03);
    const s = lp.process(bp.process(noise())) * env * .06 * gain;
    put(mus, i0 + j, s * .8, s * 1.2);
  }
}
function drums() {
  for (let b = 0; b < LAST_BAR; b++) {
    const p = part(b);
    for (let q = 0; q < 4; q++) {
      const t = barAt(b) + q * BEAT;
      if (p.kick && (q === 0 || q === 2)) kick(t, q ? .85 : 1);
      if (p.kick && q === 3 && b % 4 === 3) kick(t + BEAT / 2, .45);       // a light pickup into each phrase
      if (p.clap && (q === 1 || q === 3)) clap(t, .9);
      if (p.shaker) { shaker(t + BEAT * .56, 1); shaker(t, .5); }
    }
    // soft clap rolls into the mid card and into the end card
    if (b === MID_BAR - 1) for (let s = 12; s < 16; s++) clap(barAt(b) + s * S16, .25 + .12 * (s - 12));
    if (b === BUILD_BAR) for (let s = 8; s < 16; s++) clap(barAt(b) + s * S16, .2 + .4 * (s - 8) / 8);
  }
}

// felt keys: a soft Rhodes-like tone (gentle FM that mellows as it rings), broken chords on a relaxed rhythm
function keyNote(t0, m, vel, buf, len = 1.6, bright = 1) {
  const f = mtof(m), i0 = Math.floor(t0 * SR), n = Math.floor(len * SR), lp = new Biquad().lp(3600 * bright, .6); let ph = 0;
  for (let j = 0; j < n; j++) {
    const k = j / SR; ph += TAU * f / SR;
    const idx = (.9 * Math.exp(-k / .18) + .12) * bright;
    const env = Math.min(1, k / .006) * Math.exp(-k / .65) * Math.min(1, (len - k) / .15);
    const v = lp.process(Math.sin(ph + idx * Math.sin(ph))) * env * vel;
    buf[0][i0 + j] += v; buf[1][i0 + j] += v;
  }
}
function keys() {
  // 8th-note slots: chord tone index (or -1 = rest) and velocity. Space is part of the calm.
  const pattern = [[0, 1], [-1], [2, .7], [1, .75], [-1], [3, .8], [2, .6], [-1]];
  const tmp = [new Float32Array(N + SR * 2), new Float32Array(N + SR * 2)];
  for (let b = 0; b < LAST_BAR; b++) {
    if (!part(b).keys) continue;
    const notes = chordAt(b).notes, intro = b < 3, breakdown = b === MID_BAR, outro = b >= END_BAR;
    for (let s = 0; s < 8; s++) {
      const [idx, vel = 1] = pattern[s];
      if (idx < 0 || (outro && s > 3) || (intro && s % 4)) continue;
      keyNote(barAt(b) + s * BEAT / 2 + (s % 2 ? S16 * .12 : 0), notes[idx] + (s === 5 ? 12 : 0), .07 * vel * (outro ? 1 - s / 5 : 1), tmp, 1.7, breakdown ? .7 : 1);
    }
  }
  // a soft dotted-8th echo, crossed L/R, low-passed so the repeats sit behind
  const dl = Math.floor(BEAT * .75 * SR), el = new Biquad().lp(1600), er = new Biquad().lp(1600);
  for (let i = 0; i < N; i++) {
    const dL = i >= dl ? el.process(tmp[1][i - dl]) * .22 : 0, dR = i >= dl ? er.process(tmp[0][i - dl]) * .22 : 0;
    tmp[0][i] += dL; tmp[1][i] += dR;
    const g = duck(i / SR);
    put(mus, i, tmp[0][i] * g, tmp[1][i] * g); put(rev, i, tmp[0][i] * .3, tmp[1][i] * .3);
  }
}

// the "work getting done" pulse: a soft plucked arpeggio in triplet 8ths (~5 notes a second, like the
// Combinely film's bed). Even, low-passed, accented on the beat; it carries the momentum so the drums can stay light.
function arp() {
  const order = [0, 2, 3, 1, 2, 3, 0, 2, 3, 1, 3, 2];
  for (let b = 0; b < LAST_BAR; b++) {
    if (b > BUILD_BAR || b === MID_BAR) continue;
    const notes = chordAt(b).notes.map(n => n + 12), lvl = b < 2 ? .45 + .25 * b : (groove(b) ? 1 : .7);
    for (let s = 0; s < 12; s++) {
      const t0 = barAt(b) + s * BEAT / 3, f = mtof(notes[order[s]]), i0 = Math.floor(t0 * SR), n = Math.floor(.32 * SR);
      const lp = new Biquad().lp(3400, .6), pan = (s % 3 - 1) * .25, acc = s % 3 === 0 ? 1 : .72; let ph = 0;
      for (let j = 0; j < n; j++) {
        const k = j / SR; ph += TAU * f / SR;
        const tri = Math.sin(ph) + .12 * Math.sin(3 * ph) + .2 * Math.sin(2 * ph) * Math.exp(-k / .03);
        const s2 = lp.process(tri) * Math.min(1, k / .004) * Math.exp(-k / .075) * .058 * lvl * acc * duck(t0 + k);
        put(mus, i0 + j, s2 * (1 - pan), s2 * (1 + pan)); put(rev, i0 + j, s2 * .35, s2 * .35);
      }
    }
  }
}

// marimba top line: two notes a bar, quiet, round (sine + a fast-decaying 4th partial)
function marimba(t0, m, gain, buf = mus, pan = 0) {
  const f = mtof(m), i0 = Math.floor(t0 * SR), n = Math.floor(1.1 * SR); let a = 0, b = 0;
  for (let j = 0; j < n; j++) {
    const k = j / SR; a += TAU * f / SR; b += TAU * f * 3.93 / SR;
    const s = (Math.sin(a) * Math.exp(-k / .38) + .25 * Math.sin(b) * Math.exp(-k / .03)) * Math.min(1, k / .003) * gain;
    put(buf, i0 + j, s * (1 - pan), s * (1 + pan)); put(rev, i0 + j, s * .45, s * .45);
  }
}
function bell() {
  for (let b = 0; b < LAST_BAR; b++) {
    if (!part(b).bell) continue;
    chordAt(b).top.forEach((m, k) => marimba(barAt(b) + (k ? 2.5 : 0) * BEAT, m, .05, mus, k ? .2 : -.2));
  }
}

// ---------- sound design (soft: swells instead of noise risers, warm thumps instead of crashes) ----------
// swell: low-passed noise "breath" whose filter opens, plus a pad chord fading up; peaks at t1
function riser(t0, t1, gain = 1, ch = CHORDS[0]) {
  const i0 = Math.floor(t0 * SR), i1 = Math.floor(t1 * SR), bl = new Biquad(), br = new Biquad();
  const ph = ch.notes.map(() => 0);
  for (let i = i0; i < i1; i++) {
    const x = (i - i0) / (i1 - i0);
    if (((i - i0) & 31) === 0) { const f = 250 * Math.pow(10, x); bl.lp(f, .8); br.lp(f * 1.05, .8); }
    const env = Math.pow(x, 2) * gain;
    let tone = 0; ch.notes.forEach((m, v) => { ph[v] += TAU * mtof(m + 12) / SR; tone += Math.sin(ph[v]); });
    const l = (bl.process(noise()) * .22 + tone * .012) * env, r = (br.process(noise()) * .22 + tone * .012) * env;
    put(sfx, i, l, r); put(rev, i, l * .6, r * .6);
  }
}
function whoosh(t0, dur = .7, gain = 1, buf = sfx) {
  const i0 = Math.floor(t0 * SR), n = Math.floor(dur * SR), bp = new Biquad(), lp = new Biquad().lp(2600, .6);
  for (let j = 0; j < n; j++) {
    const x = j / n;
    if ((j & 31) === 0) bp.bp(350 + 1300 * Math.sin(Math.PI * x), .9);
    const env = Math.sin(Math.PI * x) ** 2 * gain, pan = (x - .5) * .7;
    const s = lp.process(bp.process(noise())) * .3 * env;
    put(buf, i0 + j, s * (1 - pan), s * (1 + pan)); put(rev, i0 + j, s * .35, s * .35);
  }
}
// impact: a warm sub "bloom" and a soft low thud; the air comes from a pad chord, not a crash
function impact(t0, gain = 1, ch = CHORDS[0]) {
  const i0 = Math.floor(t0 * SR), n = Math.floor(2.6 * SR), lp = new Biquad().lp(380); let ph = 0;
  const cp = ch.notes.map(() => 0);
  for (let j = 0; j < n; j++) {
    const k = j / SR, f = 40 + 34 * Math.exp(-k / .12); ph += TAU * f / SR;
    const sub = Math.sin(ph) * Math.min(1, k / .004) * Math.exp(-k / .7) * .55;
    const thud = lp.process(noise()) * Math.exp(-k / .06) * .3;
    let air = 0; ch.notes.forEach((m, v) => { cp[v] += TAU * mtof(m + 12) * (1 + .002 * v) / SR; air += Math.sin(cp[v]); });
    air *= .022 * Math.min(1, k / .04) * Math.exp(-k / 1.1);
    const s = (sub + thud) * gain, a = air * gain;
    put(sfx, i0 + j, s + a, s + a); put(rev, i0 + j, (thud * gain + a) * .8, (thud * gain + a) * .8);
  }
}
function shimmer(t0, notes, gain = 1) {
  notes.forEach((m, idx) => marimba(t0 + idx * .07, m, .045 * gain, sfx, (idx / (notes.length - 1) - .5) * .6));
}

// ---------- UI foley: what the viewer sees happening gets a sound (rounded, in key, nothing piercing) ----------
let uiPan = 0;
const nextPan = () => (uiPan = (uiPan + .37) % 1, (uiPan - .5) * .4);
// mouse click: a soft "tock" (short wooden body + a little filtered texture), then a quieter release
function click(t0, gain = 1) {
  const i0 = Math.floor(t0 * SR), n = Math.floor(.06 * SR), bp = new Biquad().bp(1700, 1.8), lp = new Biquad().lp(4200, .7); let ph = 0;
  const rel = Math.floor(.065 * SR), bp2 = new Biquad().bp(2100, 2);
  for (let j = 0; j < n; j++) {
    const k = j / SR; ph += TAU * (820 - 200 * Math.min(1, k / .01)) / SR;
    const body = Math.sin(ph) * Math.min(1, k / .0008) * Math.exp(-k / .009) * .3;
    const tex = lp.process(bp.process(noise())) * Math.exp(-k / .004) * .45;
    const s = (body + tex) * gain;
    put(ui, i0 + j, s, s); put(rev, i0 + j, s * .1, s * .1);
    const r = bp2.process(noise()) * Math.exp(-k / .003) * .12 * gain; put(ui, i0 + j + rel, r, r);
  }
}
// typing: soft, low key thocks at a human rhythm
function typing(t0, t1, gain = 1) {
  let t = t0, c = 0;
  while (t < t1) {
    const i0 = Math.floor(t * SR), n = Math.floor(.03 * SR), bp = new Biquad().bp(1300 + 500 * Math.abs(noise()), 1.4), lp = new Biquad().lp(3500), pan = noise() * .2;
    const g = (.55 + .45 * Math.abs(noise())) * gain * (c % 5 === 4 ? 1.2 : 1);
    for (let j = 0; j < n; j++) { const k = j / SR, s = lp.process(bp.process(noise())) * Math.min(1, k / .0006) * Math.exp(-k / .006) * .33 * g; put(ui, i0 + j, s * (1 - pan), s * (1 + pan)); }
    t += .06 + .05 * Math.abs(noise()); c++;
  }
}
// pop: an element appears. A short, round upward "bloop".
function pop(t0, pitch = 1, gain = 1) {
  const i0 = Math.floor(t0 * SR), n = Math.floor(.12 * SR), pan = nextPan(); let ph = 0;
  for (let j = 0; j < n; j++) {
    const k = j / SR, f = (420 + 300 * (1 - Math.exp(-k / .02))) * pitch; ph += TAU * f / SR;
    const s = Math.sin(ph) * Math.min(1, k / .004) * Math.exp(-k / .04) * .22 * gain;
    put(ui, i0 + j, s * (1 - pan), s * (1 + pan)); put(rev, i0 + j, s * .3, s * .3);
  }
}
// tap: a phrase of text appears. A tiny marimba tick on C6 (in key).
function tap(t0, pitch = 1, gain = 1) {
  const i0 = Math.floor(t0 * SR), n = Math.floor(.12 * SR), pan = nextPan(), f = mtof(84) * pitch; let ph = 0;
  for (let j = 0; j < n; j++) {
    const k = j / SR; ph += TAU * f / SR;
    const s = Math.sin(ph) * Math.min(1, k / .003) * Math.exp(-k / .028) * .1 * gain;
    put(ui, i0 + j, s * (1 - pan), s * (1 + pan)); put(rev, i0 + j, s * .4, s * .4);
  }
}
// check: a checkbox ticks. A soft pluck on E6/G6, short, with only a hint of overtone.
function check(t0, pitch = 1, gain = 1) {
  const i0 = Math.floor(t0 * SR), n = Math.floor(.14 * SR), pan = nextPan(), f = mtof(88) * pitch; let a = 0;
  for (let j = 0; j < n; j++) {
    const k = j / SR; a += TAU * f / SR;
    const s = (Math.sin(a) + .15 * Math.sin(2 * a) * Math.exp(-k / .01)) * Math.min(1, k / .002) * Math.exp(-k / .035) * .085 * gain;
    put(ui, i0 + j, s * (1 - pan), s * (1 + pan)); put(rev, i0 + j, s * .35, s * .35);
  }
}
// success: a task completes. Two rising marimba notes (G5 -> C6) with a soft fifth under them.
function success(t0, gain = 1) {
  marimba(t0, 79, .07 * gain, ui, -.15); marimba(t0 + .1, 84, .075 * gain, ui, .15); marimba(t0 + .1, 72, .035 * gain, ui, 0);
}
// flag: "needs review" appears. A gentle "hm?" (C6 -> A5): noticeable, never an alarm.
function flag(t0, gain = 1) { marimba(t0, 84, .055 * gain, ui); marimba(t0 + .11, 81, .05 * gain, ui); }
// app switch in the "too many tabs" opening: a soft click with a small swish
const tab = (t0, gain = 1) => { click(t0, .5 * gain); whoosh(t0 - .03, .18, .3 * gain, ui); };
const swoosh = (t0, gain = .4) => whoosh(t0 - .15, .45, gain, ui);

// Every on-screen action in the footage, in SOURCE seconds (read off 4 fps frame grids).
const FOOTAGE_EVENTS = [
  // "Sound familiar?": app windows flick past, then the line types in
  ...[0.75, 1.25, 2.0, 2.5, 3.25, 3.75, 4.25].map(t => ['tab', t]),
  ['swoosh', 4.75],
  ...[5.0, 5.3, 5.55, 6.25, 6.5, 6.75, 7.0].map((t, i) => ['tap', t, 1 + i * .03]),
  ['swoosh', 8.25], ['pop', 9.25, .9],
  // Privacy-first + the integration hub
  ...[11.5, 11.75, 12.0].map((t, i) => ['tap', t, 1 + i * .05]),
  ...[13.0, 13.25, 13.5, 13.75, 14.0, 14.25, 14.5, 15.25, 15.5, 15.75, 16.0, 16.25, 16.75, 17.0].map((t, i) => ['pop', t, 1 + (i % 7) * .06, .8]),
  ['swoosh', 18.0],
  ...[18.5, 18.7, 18.9, 19.1, 19.3].map((t, i) => ['check', t, 1 + i * .04]),
  // Ask your documents
  ['pop', 20.0, .85], ['type', 20.25, 22.4],
  ...[22.5, 22.75, 23.0].map((t, i) => ['pop', t, 1.05 + i * .07]),
  ['click', 23.25],
  ...[24.0, 24.3, 24.6, 24.9].map((t, i) => ['tap', t, 1.1 + i * .03, .8]),
  ['pop', 25.1, .75],
  ...[26.0, 26.25, 26.5].map((t, i) => ['check', t, 1 + i * .05]),
  // Tax prep: open Agents & Skills, pick the agent, click Run, the steps tick off
  ['click', 29.45], ['swoosh', 30.0], ['click', 31.85], ['type', 32.1, 33.1],
  ['check', 33.2], ['check', 34.0, 1.04], ['flag', 34.7], ['check', 35.45, 1.08], ['check', 36.2, 1.12],
  ['success', 37.2],
  ...[37.75, 38.25, 38.75].map((t, i) => ['tap', t, 1 + i * .05]),
  // Case files: the matter opens, type the brief, click Run, the report writes itself
  ['swoosh', 39.25], ['pop', 40.25, .9], ...[40.5, 40.65, 40.8].map((t, i) => ['pop', t, 1.05 + i * .06, .8]), ['pop', 41.0, .95],
  ['type', 41.5, 42.25], ['click', 42.5], ['swoosh', 43.3],
  ['tap', 43.6], ['tap', 44.25, 1.04], ['tap', 45.0, 1.08],
  ...[45.25, 45.5, 45.75, 46.0].map((t, i) => ['pop', t, 1 + i * .06, .75]),
  ...[46.25, 46.5, 46.75].map((t, i) => ['check', t, 1 + i * .04]),
  ['success', 47.5],
  // Prior auth: intake fields fill, the packet assembles, one item waits for a signature
  ['swoosh', 48.25], ['swoosh', 50.25], ['tap', 51.0], ['tap', 51.25, 1.05],
  ...[51.5, 52.0, 52.25, 52.5, 53.0, 53.5, 53.75].map((t, i) => ['check', t, .96 + i * .02, .85]),
  ['swoosh', 54.25, .3],
  ...[54.75, 55.25, 55.75, 56.5].map((t, i) => ['check', t, 1 + i * .04]),
  ['flag', 57.0], ['success', 57.3],
  // dashboard, judgment, CTA
  ['swoosh', 58.5], ['tap', 60.5], ['tap', 60.8, 1.06],
  ...[63.0, 63.25, 63.5, 63.75].map((t, i) => ['tap', t, 1 + i * .04]),
  ['pop', 63.9, 1], ['pop', 64.05, 1.08],
  ...[64.25, 64.5, 64.95].map((t, i) => ['check', t, 1 + i * .05]),
  ['swoosh', 65.5], ['pop', 65.75, .85],
  ...[66.0, 66.25, 66.5, 66.75].map((t, i) => ['tap', t, 1 + i * .04]),
  ['pop', 66.9, .95],
];

function design() {
  // INTRO card: "Meet" → logo lands on a warm bloom + marimba sparkle → tagline ticks → swell into the first frame
  whoosh(.35, .8, .35);
  impact(.98, .45); shimmer(.98, [72, 76, 79, 84], .9);
  tap(2.05, 1, .8); tap(2.2, 1.06, .8); tap(2.35, 1.12, .8);
  riser(2.3, T.footA, .8); impact(T.footA, .5);
  // MID card: swell out of "Ask", a bloom on the card, words + chips, swell back into the groove
  riser(T.mid - 2.0, T.mid, .7, CHORDS[3]); impact(T.mid, .7);
  tap(T.mid + .4, 1, .9); tap(T.mid + .6, 1.06, .9);
  pop(T.mid + 1.05, 1, .9); pop(T.mid + 1.2, 1.06, .9); pop(T.mid + 1.35, 1.12, .9);
  riser(T.mid + 1.0, barAt(13), .6); impact(barAt(13), .4);
  // END card: the build swells into the final bloom; title ticks, a pop on the button, a sparkle
  riser(barAt(BUILD_BAR), barAt(END_BAR), .8, CHORDS[3]); impact(barAt(END_BAR), .85);
  tap(T.end + .75, 1, .9); tap(T.end + .95, 1.06, .9);
  pop(T.end + 1.6, 1, 1); shimmer(T.end + 1.65, [65, 69, 72, 76], .8);
  // the footage itself
  for (const [kind, t, a = 1, b = 1] of FOOTAGE_EVENTS) {
    if (t >= CUT_A && t < CUT_B) continue;        // that slice of footage was cut out
    const at = src(t);
    if (kind === 'tab') tab(at);
    else if (kind === 'swoosh') swoosh(at, typeof a === 'number' && a !== 1 ? a : .4);
    else if (kind === 'tap') tap(at, a, b);
    else if (kind === 'pop') pop(at, a, b);
    else if (kind === 'check') check(at + .07, a, b);     // ticks land on the check mark (verified at 30 fps)
    else if (kind === 'click') click(at);
    else if (kind === 'type') typing(at, src(a), .9);
    else if (kind === 'success') success(at);
    else if (kind === 'flag') flag(at);
  }
}

// ---------- reverb (Freeverb-style, heavily damped so the tail is soft and dark) ----------
function reverb() {
  const combs = [1557, 1617, 1491, 1422, 1277, 1356, 1188, 1116].map(d => Math.round(d * SR / 44100));
  const aps = [556, 441, 341, 225].map(d => Math.round(d * SR / 44100));
  const out = [new Float32Array(N), new Float32Array(N)];
  for (let ch = 0; ch < 2; ch++) {
    const spread = ch ? 23 : 0, pre = new Biquad().hp(220, .7), post = new Biquad().lp(6000, .7);
    const cb = combs.map(d => ({ buf: new Float32Array(d + spread), i: 0, lp: 0 }));
    const ab = aps.map(d => ({ buf: new Float32Array(d + spread), i: 0 }));
    for (let n = 0; n < N; n++) {
      const x = pre.process(rev[ch][n]) * .25; let y = 0;
      for (const c of cb) { const o = c.buf[c.i]; c.lp = o * .45 + c.lp * .55; c.buf[c.i] = x + c.lp * .87; c.i = (c.i + 1) % c.buf.length; y += o; }
      for (const a of ab) { const o = a.buf[a.i]; a.buf[a.i] = y + o * .5; a.i = (a.i + 1) % a.buf.length; y = o - y; }
      out[ch][n] = post.process(y);
    }
  }
  // keep the room fairly narrow, like the reference (it's a bed, not a stadium)
  for (let n = 0; n < N; n++) { const l = out[0][n], r = out[1][n]; out[0][n] = l * .75 + r * .25; out[1][n] = r * .75 + l * .25; }
  return out;
}

// ---------- render ----------
pad(); bass(); drums(); keys(); arp(); bell(); design();
const verb = reverb();
// fade the whole thing out as the end card dips to black, so the loop restarts cleanly
const fadeStart = T.total - 1.3;
const mixOf = (a, wetGain) => [0, 1].map(ch => {
  const o = new Float32Array(N);
  for (let i = 0; i < N; i++) { const t = i / SR; const f = t > fadeStart ? Math.max(0, 1 - (t - fadeStart) / 1.3) : 1; o[i] = (a[ch][i] + verb[ch][i] * wetGain) * f; }
  return o;
});
// master tone: tuck the 2–5 kHz "harsh" band, roll off the top, keep the lows round
function master(st) {
  return st.map(ch => {
    const lo = new Biquad().hp(28, .7), mud = new Biquad().peak(420, 1, -1.5), harsh = new Biquad().peak(3200, .8, -2), top = new Biquad().hshelf(8000, -1.5), air = new Biquad().lp(15000, .7);
    return ch.map(v => air.process(top.process(harsh.process(mud.process(lo.process(v))))));
  });
}
// the reverb is shared: give the music stem most of it and the sfx stem the rest
// music carries the mood; swells and blooms sit with it; UI foley is clearly audible but small and soft
const music = master(mixOf(mus, .55).map(ch => ch.map(v => v * .8)));
const fxWet = mixOf(sfx, .4);
const effects = master([0, 1].map(ch => fxWet[ch].map((v, i) => v * 1.0 + ui[ch][i] * .85)));
const total = [0, 1].map(ch => music[ch].map((v, i) => v + effects[ch][i]));

function wav(file, [l, r], gain = null) {
  let peak = 1e-9; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(l[i]), Math.abs(r[i]));
  const g = gain ?? .89 / peak, buf = Buffer.alloc(44 + N * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
  for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(clamp(l[i] * g, -1, 1) * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(clamp(r[i] * g, -1, 1) * 32767), 46 + i * 4); }
  writeFileSync(path.join(OUT, file), buf);
  return g;
}
mkdirSync(OUT, { recursive: true });
// stems keep their relative level: write them with the gain of the full mix
const gMix = wav('score.wav', total);
wav('music.wav', music, gMix);
wav('sfx.wav', effects, gMix);
console.log(`score: ${T.total}s @ ${(60 / BEAT).toFixed(2)} BPM, bar ${BAR.toFixed(3)}s, ${LAST_BAR} bars → build/score.wav, music.wav, sfx.wav`);
