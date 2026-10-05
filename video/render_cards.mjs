// Render the HTML title cards in cards/ to 1920x1080 PNG frames at 30 fps, using the installed
// Google Chrome. Every card animates with CSS only; for each frame we pause all animations and set
// their currentTime, so output is deterministic and independent of machine speed.
//
//   node render_cards.mjs                    all cards  -> build/frames/<card>/0000.png …
//   node render_cards.mjs intro end          only some cards
//   node render_cards.mjs --stills 1.2,2.6   review stills -> build/stills/<card>_<t>.png
import { chromium } from 'playwright-core';
import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30;
let args = process.argv.slice(2);
let stills = null;
const si = args.indexOf('--stills');
if (si >= 0) { stills = args[si + 1].split(',').map(Number); args.splice(si, 2); }
const names = args.length ? args : ['intro', 'mid', 'end'];

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const seek = t => page.evaluate(ms => { for (const a of document.getAnimations()) { a.pause(); a.currentTime = ms; } }, t);

for (const name of names) {
  await page.goto(pathToFileURL(path.join(ROOT, 'cards', `${name}.html`)).href);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
  });
  const duration = Number(await page.getAttribute('body', 'data-duration'));
  if (stills) {
    const out = path.join(ROOT, 'build', 'stills');
    mkdirSync(out, { recursive: true });
    for (const t of stills) { await seek(t * 1000); await page.screenshot({ path: path.join(out, `${name}_${t.toFixed(2)}.png`) }); }
    console.log(`${name}: ${stills.length} stills`);
    continue;
  }
  const out = path.join(ROOT, 'build', 'frames', name);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const n = Math.round(duration * FPS);
  for (let f = 0; f < n; f++) {
    await seek(f * 1000 / FPS);
    await page.screenshot({ path: path.join(out, `${String(f).padStart(4, '0')}.png`) });
  }
  console.log(`${name}: ${n} frames (${duration}s)`);
}
await browser.close();
