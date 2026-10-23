// End-to-end check of the composer's privacy check on /ask and its explainer on /security, driven through the
// Chrome DevTools Protocol in a headless Edge or Chrome. No test libraries: Node 22+ has fetch and WebSocket.
//
//   npm run dev                       (or npm run build && npm start)
//   npm run test:e2e                  run every scenario
//   npm run test:e2e -- --screenshots also save the dialog screenshots to public/assets/screens/
//
// BASE_URL (default http://localhost:3000) and BROWSER (path to a Chromium browser) override the defaults.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';

const BASE = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const SHOTS = process.argv.includes('--screenshots');
const ROOT = path.resolve(import.meta.dirname, '../..');
const FIXTURE = path.join(ROOT, 'tests/fixtures/Fictional_Engagement_Letter.txt');
const SHOT_DIR = path.join(ROOT, 'public/assets/screens');
const QUESTION = 'Summarize the fee terms and flag anything unusual in this engagement letter.';
const BROWSERS = [
  process.env.BROWSER,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

const sleep = ms => new Promise(r => setTimeout(r, ms));
let passed = 0;
async function step(name, fn) {
  await fn();
  passed++;
  console.log(`  ✔ ${name}`);
}

/* ---------- a minimal CDP client ---------- */
async function launch() {
  const exe = BROWSERS.find(p => existsSync(p));
  if (!exe) throw new Error('No Chromium browser found. Set BROWSER to the path of Chrome or Edge.');
  const profile = mkdtempSync(path.join(tmpdir(), 'mw-e2e-'));
  const proc = spawn(exe, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--disable-extensions', 'about:blank']);
  const port = await new Promise((resolve, reject) => {
    let buf = '';
    proc.stderr.on('data', d => { buf += d; const m = /DevTools listening on ws:\/\/[^:]+:(\d+)\//.exec(buf); if (m) resolve(m[1]); });
    proc.on('exit', code => reject(new Error(`Browser exited early (${code})`)));
    setTimeout(() => reject(new Error('Browser did not start')), 20000);
  });
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const calls = new Map();
  const waiters = [];
  ws.onmessage = e => {
    const msg = JSON.parse(e.data);
    if (msg.id && calls.has(msg.id)) {
      const { resolve, reject } = calls.get(msg.id);
      calls.delete(msg.id);
      msg.error ? reject(new Error(`${msg.error.message} ${msg.error.data || ''}`)) : resolve(msg.result);
    } else if (msg.method) {
      for (const w of waiters.filter(w => w.method === msg.method)) { waiters.splice(waiters.indexOf(w), 1); w.resolve(msg.params); }
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const n = ++id; calls.set(n, { resolve, reject }); ws.send(JSON.stringify({ id: n, method, params })); });
  const once = (method, timeout = 10000) => new Promise((resolve, reject) => {
    const w = { method, resolve };
    waiters.push(w);
    setTimeout(() => { if (waiters.includes(w)) { waiters.splice(waiters.indexOf(w), 1); reject(new Error(`Timed out waiting for ${method}`)); } }, timeout);
  });
  const close = () => { ws.close(); proc.kill(); setTimeout(() => rmSync(profile, { recursive: true, force: true }), 1500); };
  return { send, once, close };
}

/* ---------- page helpers ---------- */
function helpers({ send, once }) {
  const evaluate = async expression => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(`${r.exceptionDetails.text}: ${r.exceptionDetails.exception?.description || expression}`);
    return r.result.value;
  };
  const waitFor = async (expression, label = expression, timeout = 15000) => {
    const end = Date.now() + timeout;
    while (Date.now() < end) { if (await evaluate(expression)) return; await sleep(100); }
    throw new Error(`Timed out waiting for: ${label}`);
  };
  const center = async selector => {
    const box = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return null; el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' }); const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
    if (!box) throw new Error(`No element: ${selector}`);
    return box;
  };
  const mouse = async ({ x, y }, clickCount = 1) => {
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount });
  };
  const click = async selector => mouse(await center(selector));
  // two real clicks as fast as the protocol allows (a double-click)
  const doubleClick = async selector => { const p = await center(selector); await mouse(p, 1); await mouse(p, 2); };
  const key = async (key, code, keyCode, text) => {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: keyCode, ...(text ? { text } : {}) });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: keyCode });
  };
  const type = async text => send('Input.insertText', { text });
  const goto = async url => {
    const loaded = once('Page.loadEventFired', 60000);
    await send('Page.navigate', { url });
    await loaded;
  };
  // the real "Attach file" button opens the file chooser; the test answers it with the fixture
  const attach = async () => {
    const opened = once('Page.fileChooserOpened');
    await click('.dq__attach');
    const { backendNodeId } = await opened;
    await send('DOM.setFileInputFiles', { files: [FIXTURE], backendNodeId });
    await waitFor(`document.querySelectorAll('.dq__composer .dq__file').length > 0`, 'attachment chip');
  };
  const shot = async name => {
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    mkdirSync(SHOT_DIR, { recursive: true });
    writeFileSync(path.join(SHOT_DIR, name), Buffer.from(data, 'base64'));
    console.log(`  📸 public/assets/screens/${name}`);
  };
  return { evaluate, waitFor, click, doubleClick, key, type, goto, attach, shot };
}

/* ---------- state probes ---------- */
const S = {
  hydrated: `(() => { const t = document.querySelector('#ask-q'); return !!t && Object.keys(t).some(k => k.startsWith('__reactProps')); })()`,
  // open as a modal, rendered, fully opaque, inside the viewport and on top at its centre
  dialogVisible: `(() => { const d = document.querySelector('.dq-dialog'); if (!d.open || !d.matches(':modal')) return false;
    const cs = getComputedStyle(d), r = d.getBoundingClientRect(), hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return cs.display !== 'none' && cs.visibility === 'visible' && Number(cs.opacity) > 0.99 && r.width > 0 && r.height > 0
      && r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth && d.contains(hit); })()`,
  dialogOpen: `document.querySelector('.dq-dialog').open`,
  mode: `document.querySelector('.dq').dataset.mode`,
  status: `document.querySelector('.dq').dataset.status`,
  sent: `document.querySelectorAll('.dq__turn').length`,
  question: `document.querySelector('#ask-q').value`,
  chips: `[...document.querySelectorAll('.dq__composer .dq__file')].map(li => li.textContent)`,
  active: `(() => { const a = document.activeElement; return a ? (a.id || a.textContent.trim()) : null; })()`,
  lastBadge: `[...document.querySelectorAll('.dq__badge')].at(-1)?.textContent`,
  normalPressed: `document.querySelector('.dq__switch button').getAttribute('aria-pressed')`,
};

async function setViewport(send, mobile) {
  await send('Emulation.setDeviceMetricsOverride', mobile
    ? { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }
    : { width: 1280, height: 800, deviceScaleFactor: 1.5, mobile: false });
}

async function main() {
  const cdp = await launch();
  const { send } = cdp;
  const h = helpers(cdp);
  const { evaluate: ev, waitFor } = h;
  try {
    await send('Page.enable');
    await send('DOM.enable');
    await send('Runtime.enable');
    await send('Page.setInterceptFileChooserDialog', { enabled: true });
    // light theme for the screenshots; motion stays at the browser default, as visitors have it
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
    await setViewport(send, false);

    const open = async () => {
      await h.goto(`${BASE}/ask`);
      // hydrated once React has attached its props to the composer
      await waitFor(S.hydrated, 'hydration', 90000);
    };
    // record every [mode, status] the composer passes through, to prove the order of the mode switch and the send
    const record = () => ev(`(() => { const el = document.querySelector('.dq'); window.__log = []; new MutationObserver(() => window.__log.push([el.dataset.mode, el.dataset.status])).observe(el, { attributes: true, attributeFilter: ['data-mode', 'data-status'] }); })()`);
    const draft = async () => { await h.click('#ask-q'); await h.type(QUESTION); await h.attach(); };

    console.log(`/ask on ${BASE}`);
    await open();
    console.log(`  served by Next.js ${await ev('window.next?.version')}`);

    await step('a question without an attachment is sent without the check', async () => {
      await h.click('#ask-q');
      await h.type('What is a 1099-NEC?');
      await h.click('.dq__send');
      await waitFor(`${S.sent} === 1`, 'first message');
      assert.equal(await ev(S.dialogOpen), false);
      assert.equal(await ev(S.lastBadge), 'Sent in Normal mode');
    });

    await step('attaching a file and clicking Send in Normal mode shows the check before anything is sent', async () => {
      await draft();
      await h.click('.dq__send');
      await waitFor(S.dialogVisible, 'dialog visible on screen');
      assert.equal(await ev(S.sent), 1, 'nothing new was sent');
      assert.equal(await ev(S.mode), 'normal');
      assert.equal(await ev(S.status), 'review');
    });

    if (SHOTS) {
      await sleep(300);
      await h.shot('private-mode-warning-desktop.png');
    }

    await step('the dialog is an accessible modal with the agreed copy and no detection claim', async () => {
      const a11y = await ev(`(() => { const d = document.querySelector('.dq-dialog'); return {
        modal: d.matches(':modal'), label: document.getElementById(d.getAttribute('aria-labelledby'))?.textContent,
        desc: document.getElementById(d.getAttribute('aria-describedby'))?.textContent, text: d.textContent }; })()`);
      assert.equal(a11y.modal, true);
      assert.equal(a11y.label, "Review your document's privacy");
      assert.match(a11y.desc, /may contain confidential or sensitive information/);
      assert.match(a11y.desc, /currently using Normal mode/);
      assert.doesNotMatch(a11y.text, /\bdetected\b|\bwe found\b/i);
      assert.match(a11y.text, /Fictional_Engagement_Letter\.txt/);
      assert.equal(await ev(S.active), 'Switch to Private mode', 'focus starts on the safest choice');
      await h.key('Tab', 'Tab', 9);
      assert.equal(await ev(S.active), 'Continue in Normal mode', 'Tab moves through the choices');
      await h.key('Tab', 'Tab', 9);
      assert.equal(await ev(S.active), 'Cancel and review document');
    });

    await step('Escape closes the check and keeps the question and attachment', async () => {
      await h.key('Escape', 'Escape', 27);
      await waitFor(`!${S.dialogOpen}`, 'dialog closed');
      assert.equal(await ev(S.question), QUESTION);
      assert.match((await ev(S.chips)).join(), /Fictional_Engagement_Letter\.txt/);
      assert.equal(await ev(S.mode), 'normal');
      assert.equal(await ev(S.sent), 1);
      assert.equal(await ev(S.active), 'ask-q', 'focus returns to the question');
    });

    await step('Cancel and review document returns to the composer with the draft intact', async () => {
      await h.click('#ask-q');
      await h.key('Enter', 'Enter', 13, '\r');   // the keyboard path opens it too
      await waitFor(S.dialogVisible, 'dialog visible again');
      await h.click('.dq-dialog__btn--text');
      await waitFor(`!${S.dialogOpen}`, 'dialog closed');
      assert.equal(await ev(S.question), QUESTION);
      assert.equal((await ev(S.chips)).length, 1);
      assert.equal(await ev(S.mode), 'normal');
      assert.equal(await ev(S.status), 'idle');
      assert.equal(await ev(S.sent), 1);
    });

    await step('Continue in Normal mode (double-clicked) sends exactly once and keeps Normal mode', async () => {
      await h.click('.dq__send');
      await waitFor(S.dialogVisible, 'dialog visible');
      await h.doubleClick('.dq-dialog__btn:not(.dq-dialog__btn--primary):not(.dq-dialog__btn--text)');
      await waitFor(`${S.sent} === 2`, 'second message');
      await sleep(1200);   // longer than a send: a duplicate would have landed by now
      assert.equal(await ev(S.sent), 2);
      assert.equal(await ev(S.lastBadge), 'Sent in Normal mode');
      assert.equal(await ev(S.mode), 'normal');
      assert.equal(await ev(S.normalPressed), 'true');
      assert.equal(await ev(S.dialogOpen), false, 'not shown again for the same submission');
      assert.equal(await ev(S.question), '', 'composer clears after sending');
    });

    await step('Switch to Private mode switches first, then sends the same question and file once', async () => {
      await draft();
      await record();
      await h.doubleClick('.dq__send');   // a double-click on Send opens one check
      await waitFor(S.dialogVisible, 'dialog visible');
      await h.doubleClick('.dq-dialog__btn--primary');
      await waitFor(`${S.sent} === 3`, 'third message');
      await sleep(1200);
      assert.equal(await ev(S.sent), 3);
      assert.equal(await ev(S.lastBadge), 'Sent in Private mode');
      assert.equal(await ev(S.mode), 'private');
      const last = await ev(`(() => { const t = [...document.querySelectorAll('.dq__turn')].at(-1); return { q: t.querySelector('.dq__msg p').textContent, files: [...t.querySelectorAll('.dq__file')].map(f => f.textContent) }; })()`);
      assert.equal(last.q, QUESTION);
      assert.deepEqual(last.files, ['Fictional_Engagement_Letter.txt']);
      const log = await ev('window.__log');
      const firstSend = log.find(([, s]) => s === 'sending');
      assert.deepEqual(firstSend, ['private', 'sending'], `mode was private before the send started (${JSON.stringify(log)})`);
      assert.ok(!log.some(([m, s]) => m === 'normal' && s === 'sending'), 'never sending in Normal mode');
    });

    await step('in Private mode, an attachment goes straight through', async () => {
      await draft();
      await h.click('.dq__send');
      await waitFor(`${S.sent} === 4`, 'fourth message');
      assert.equal(await ev(S.dialogOpen), false);
      assert.equal(await ev(S.lastBadge), 'Sent in Private mode');
    });

    await step('a question typed while the page is still loading still gets the check', async () => {
      // A slow first load (e.g. next dev compiling the page) shows the composer before React takes it over.
      await send('Network.enable');
      await send('Network.setCacheDisabled', { cacheDisabled: true });
      await send('Network.emulateNetworkConditions', { offline: false, latency: 400, downloadThroughput: 150 * 1024, uploadThroughput: 150 * 1024 });
      const nav = send('Page.navigate', { url: `${BASE}/ask` });
      await waitFor(`!!document.querySelector('#ask-q')?.getBoundingClientRect().width`, 'composer visible', 60000);
      assert.equal(await ev(S.hydrated), false, 'precondition: the question must be typed before hydration (slow the network further if this fails)');
      await h.click('#ask-q');
      await h.type(QUESTION);
      await send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
      await send('Network.setCacheDisabled', { cacheDisabled: false });
      await nav;
      await waitFor(S.hydrated, 'hydration', 90000);
      await waitFor(`!document.querySelector('.dq__send').disabled`, 'Send enabled for the early question');
      assert.equal(await ev(S.question), QUESTION);
      await h.attach();
      await h.click('.dq__send');
      await waitFor(S.dialogVisible, 'dialog visible');
      assert.equal(await ev(S.sent), 0, 'nothing sent before a choice');
      assert.equal(await ev(S.mode), 'normal');
      await h.click('.dq-dialog__btn--text');
      await waitFor(`!${S.dialogOpen}`, 'dialog closed');
      assert.equal(await ev(S.question), QUESTION);
    });

    await step('on a phone, the check fits the screen with no sideways scrolling', async () => {
      await setViewport(send, true);
      await open();
      await draft();
      await h.click('.dq__send');
      await waitFor(S.dialogVisible, 'dialog visible on mobile');
      const fit = await ev(`(() => { const r = document.querySelector('.dq-dialog').getBoundingClientRect(); const b = [...document.querySelectorAll('.dq-dialog__btn')].map(b => b.getBoundingClientRect()); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, vw: innerWidth, vh: innerHeight, widest: Math.max(...[...document.querySelectorAll('.dq, .dq *')].map(e => e.getBoundingClientRect().right)), minTap: Math.min(...b.map(x => x.height)) }; })()`);
      assert.ok(fit.left >= 0 && fit.right <= fit.vw, `dialog inside the width (${fit.left}–${fit.right} of ${fit.vw})`);
      assert.ok(fit.top >= 0 && fit.bottom <= fit.vh, 'dialog inside the height');
      // measured on the composer itself: the site's decorative section glows (.seam) briefly overhang the page while animating
      assert.ok(fit.widest <= fit.vw + 0.5, `composer fits the screen (right edge ${Math.round(fit.widest)} of ${fit.vw})`);
      assert.ok(fit.minTap >= 40, `buttons are comfortable tap targets (${fit.minTap}px)`);
    });
    if (SHOTS) {
      await sleep(300);
      await h.shot('private-mode-warning-mobile.png');
    }

    console.log(`/security on ${BASE}`);
    for (const mobile of [false, true]) {
      await step(`the explainer, table and screenshot load on ${mobile ? 'mobile' : 'desktop'}`, async () => {
        await setViewport(send, mobile);
        await h.goto(`${BASE}/security?view=${mobile ? 'mobile' : 'desktop'}#private-mode-check`);   // distinct URLs: a hash-only change fires no load event
        await ev(`document.querySelector('.pg-shot').scrollIntoView({ block: 'center' })`);
        await waitFor(`(() => { const i = document.querySelector('.pg-shot img'); return i.complete && i.naturalWidth > 0; })()`, 'screenshot loaded');
        const page = await ev(`(() => { const s = document.querySelector('#private-mode-check'); const i = s.querySelector('.pg-shot img'); return {
          h2: s.querySelector('h2').textContent, img: i.currentSrc, alt: i.alt, caption: s.querySelector('figcaption').textContent,
          rows: s.querySelectorAll('.pg-table tbody tr').length, faq: [...document.querySelectorAll('.qa summary')].some(q => /switch to Private mode when I attach/.test(q.textContent)),
          vw: innerWidth, widest: Math.max(...[...s.querySelectorAll('.pg-why, .pg-why *')].filter(e => !e.closest('.pg-table-wrap') || e.matches('.pg-table-wrap')).map(e => e.getBoundingClientRect().right)) }; })()`);
        assert.equal(page.h2, 'Why does MetaWurks ask me to switch to Private Mode when I attach a document?');
        assert.match(page.img, mobile ? /private-mode-warning-mobile\.png$/ : /private-mode-warning-desktop\.png$/);
        assert.match(page.alt, /Review your document's privacy/);
        assert.match(page.caption, /example engagement letter/i);
        assert.equal(page.rows, 4);
        assert.ok(page.faq, 'FAQ entry present');
        // the section's own content, table box and screenshot stay inside the screen (the table scrolls inside its own box)
        assert.ok(page.widest <= page.vw + 0.5, `section fits the screen (right edge ${Math.round(page.widest)} of ${page.vw})`);
      });
    }
    console.log(`\n${passed} checks passed.`);
  } finally {
    cdp.close();
  }
}

main().catch(err => { console.error(`\n✖ ${err.stack || err.message}`); process.exitCode = 1; });
