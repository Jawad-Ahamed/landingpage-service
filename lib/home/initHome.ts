// @ts-nocheck — a faithful port of the original vanilla app.js (legacy/assets/app.js) for the home page.
// Differences from the original:
//   • everything is scoped to the home <main> and returns a cleanup function, so it can mount/unmount
//     with client-side navigation and React StrictMode (every listener, observer, timer and rAF is released);
//   • DOM rewrites (word split, marquee clone) are idempotent;
//   • site-wide pieces (nav, drawer, progress bar, theme toggle, reveal-on-scroll, page-load class) live in
//     components/chrome/SiteEffects.tsx. Globes re-read theme colours on the 'mw-theme' event it dispatches.
import { ASK_SCENARIOS } from './scenarios';

export function initHome(scope: HTMLElement): () => void {
  const root = document.documentElement;
  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  let REDUCED = reduceMQ.matches;

  // ---- lifecycle bookkeeping ----
  const ac = new AbortController();
  const signal = ac.signal;
  const observers = [];
  const timeouts = new Set();
  const intervals = new Set();
  const rafs = new Set();
  const on = (t, type, fn, opts = {}) => t && t.addEventListener(type, fn, { ...opts, signal });
  const observe = o => (observers.push(o), o);
  const later = (fn, ms) => { const id = setTimeout(() => { timeouts.delete(id); if (!signal.aborted) fn(); }, ms); timeouts.add(id); return id; };
  const cancelLater = id => { clearTimeout(id); timeouts.delete(id); };
  const every = (fn, ms) => { const id = setInterval(() => { if (!signal.aborted) fn(); }, ms); intervals.add(id); return id; };
  const stopEvery = id => { clearInterval(id); intervals.delete(id); };
  const frame = fn => { const id = requestAnimationFrame(t => { rafs.delete(id); if (!signal.aborted) fn(t); }); rafs.add(id); return id; };
  const cancelFrame = id => { cancelAnimationFrame(id); rafs.delete(id); };
  // a sleep that never resolves once the page is torn down, so async loops simply stop
  const sleep = ms => new Promise(r => later(r, ms));

  const $ = (s, el = scope) => el.querySelector(s);
  const $$ = (s, el = scope) => Array.from(el.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* 1. Split headlines into words for a staggered rise ------------------------------------------ */
  const hlGroups = [];
  function splitWords(el, baseDelay = 0, step = 55) {
    if (el.dataset.splitDone) {           // already split (re-mount): just rebuild the highlight groups
      const groups = new Map();
      $$('.w > span', el).forEach(s => { if (/\bhl\b/.test(s.className)) { const g = s.dataset.g; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(s); } });
      groups.forEach(g => hlGroups.push(g));
      return;
    }
    let i = 0, gi = 0;
    const frag = document.createDocumentFragment();
    const wrap = (text, cls) => {
      const group = cls && /\bhl\b/.test(cls) ? [] : null;
      const gid = String(gi++);
      if (group) hlGroups.push(group);
      text.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span');
        w.className = 'w';
        const inner = document.createElement('span');
        if (cls) inner.className = cls;
        if (group) inner.dataset.g = gid;
        inner.textContent = part;
        inner.style.transitionDelay = `${baseDelay + i++ * step}ms`;
        if (group) group.push(inner);
        w.appendChild(inner);
        frag.appendChild(w);
      });
    };
    Array.from(el.childNodes).forEach(node => {
      if (node.nodeType === 3) wrap(node.textContent);
      else if (node.nodeType === 1 && node.tagName === 'BR') frag.appendChild(node.cloneNode());
      else if (node.nodeType === 1) wrap(node.textContent, node.className);
    });
    el.textContent = '';
    el.appendChild(frag);
    el.dataset.splitDone = '1';
  }
  $$('.split').forEach(el => splitWords(el, +(el.dataset.delay || 120)));
  function layoutHl() {
    hlGroups.forEach(words => {
      if (!words.length) return;
      let total = 0;
      const xs = words.map((w, k) => {
        const r = w.getBoundingClientRect();
        if (k) {
          const p = words[k - 1].getBoundingClientRect();
          total += Math.abs(r.top - p.top) < 2 ? Math.max(0, r.left - p.right) : r.height * .25;
        }
        const x = total; total += r.width; return x;
      });
      words.forEach((w, k) => { w.style.setProperty('--hl-w', total.toFixed(1) + 'px'); w.style.setProperty('--hl-x', (-xs[k]).toFixed(1) + 'px'); });
    });
  }
  layoutHl();
  on(window, 'resize', () => layoutHl());
  if (document.fonts) {
    document.fonts.ready.then(() => { if (!signal.aborted) layoutHl(); });
    on(document.fonts, 'loadingdone', () => layoutHl());
  }

  /* 3. Dotted globe renderer ---------------------------------------------------------------------- */
  class Globe {
    constructor(canvas, o = {}) {
      this.c = canvas;
      this.ctx = canvas.getContext('2d');
      this.o = Object.assign({ count: 1100, rgb: '45,75,210', alpha: .75, size: 1.6, speed: .00012, tilt: .38, rings: true, ringRgb: '124,151,255', accent: null, themed: true }, o);
      this.base = { rgb: this.o.rgb, alpha: this.o.alpha, ringRgb: this.o.ringRgb };
      this.pts = [];
      const n = this.o.count, ga = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < n; i++) {
        const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = ga * i;
        this.pts.push([Math.cos(th) * r, y, Math.sin(th) * r, Math.random()]);
      }
      this.rot = Math.random() * 6;
      this.visible = false;
      this.boost = 1;
      this.applyTheme(true);
      this.resize();
      observe(new ResizeObserver(() => this.resize())).observe(canvas);
      observe(new IntersectionObserver(es => {
        this.visible = es[es.length - 1].isIntersecting;
        if (this.visible && !this.raf) this.loop();
      }, { rootMargin: '100px' })).observe(canvas);
    }
    applyTheme(quiet) {
      if (!this.o.themed) return;
      const cs = getComputedStyle(root);
      const get = n => cs.getPropertyValue(n).trim().replace(/\s+/g, '');
      const gain = parseFloat(cs.getPropertyValue('--globe-gain')) || 1;
      this.o.rgb = get(this.o.rgbVar || '--globe-rgb') || this.base.rgb;
      this.o.ringRgb = get('--globe-ring-rgb') || this.base.ringRgb;
      const arc = get('--globe-arc-rgb');
      this.o.arcRgb = arc && arc !== 'none' ? arc : null;
      this.o.alpha = Math.min(1, this.base.alpha * gain);
      if (!quiet && this.w && (REDUCED || !this.raf)) this.draw();
    }
    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = this.c.getBoundingClientRect();
      this.w = Math.max(1, r.width); this.h = Math.max(1, r.height);
      this.c.width = Math.round(this.w * dpr); this.c.height = Math.round(this.h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (REDUCED) this.draw(0);
    }
    draw() {
      const { ctx, w, h, o } = this;
      ctx.clearRect(0, 0, w, h);
      const R = Math.min(w, h) * .42, cx = w / 2, cy = h / 2;
      const cr = Math.cos(this.rot), sr = Math.sin(this.rot), ct = Math.cos(o.tilt), st = Math.sin(o.tilt);
      if (o.rings) {
        ctx.lineWidth = 1;
        for (let k = 0; k < 2; k++) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${o.ringRgb},${k ? .22 : .32})`;
          ctx.ellipse(cx, cy, R * (1.12 + k * .1), R * (.34 + k * .08), (-.35 + k * .6) + this.rot * .15, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (o.arcRgb) {
          ctx.lineWidth = 1.6;
          for (let k = 0; k < 2; k++) {
            const a0 = k ? 2.2 - this.rot * .8 : this.rot * 1.1;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${o.arcRgb},${k ? .5 : .78})`;
            ctx.ellipse(cx, cy, R * (1.12 + k * .1), R * (.34 + k * .08), (-.35 + k * .6) + this.rot * .15, a0, a0 + (k ? .55 : .85));
            ctx.stroke();
          }
          ctx.lineWidth = 1;
        }
        if (o.accent) {
          const a = this.rot * 1.6;
          const ex = cx + Math.cos(a) * R * 1.12 * Math.cos(-.35 + this.rot * .15) - Math.sin(a) * R * .34 * Math.sin(-.35 + this.rot * .15);
          const ey = cy + Math.cos(a) * R * 1.12 * Math.sin(-.35 + this.rot * .15) + Math.sin(a) * R * .34 * Math.cos(-.35 + this.rot * .15);
          ctx.fillStyle = o.accent;
          ctx.beginPath(); ctx.arc(ex, ey, 2.6, 0, Math.PI * 2); ctx.fill();
        }
      }
      for (const p of this.pts) {
        let x = p[0] * cr - p[2] * sr, z = p[0] * sr + p[2] * cr, y = p[1];
        const y2 = y * ct - z * st; z = y * st + z * ct; y = y2;
        const d = (z + 1) / 2;
        const a = (.06 + d * d * o.alpha) * this.boost;
        const s = o.size * (.45 + d * .9);
        ctx.fillStyle = `rgba(${o.rgb},${a.toFixed(3)})`;
        ctx.fillRect(cx + x * R - s / 2, cy + y * R - s / 2, s, s);
      }
    }
    loop(now) {
      if (!this.visible || REDUCED || signal.aborted) { this.raf = null; this.last = null; return; }
      now = now || performance.now();
      const dt = this.last == null ? 16 : Math.min(now - this.last, 50);
      this.last = now;
      this.rot += this.o.speed * dt;
      this.draw();
      this.raf = frame(t => this.loop(t));
    }
  }
  const globes = {};
  $$('canvas[data-globe]').forEach(c => {
    const kind = c.dataset.globe;
    const presets = {
      orb: { count: 900, alpha: .85, size: 1.5, speed: .00016, accent: 'rgba(233,162,59,.9)' },
      core: { count: 380, alpha: .9, size: 1.3, speed: .0002, rings: false },
      dark: { count: 1400, rgb: '157,176,242', alpha: .5, size: 1.6, speed: .00008, ringRgb: '157,176,242', rgbVar: '--globe-final-rgb' },
    };
    globes[kind] = new Globe(c, presets[kind] || {});
  });
  on(document, 'mw-theme', () => Object.values(globes).forEach(g => g.applyTheme()));

  /* 4. Product walkthrough video ----------------------------------------------------------------- */
  const video = $('#demoVideo');
  const player = $('.player');
  const chapterBtns = $$('.chapters__list button[data-t]');
  const vToggle = $('.video-toggle');
  const watchBtn = $('.watch-btn');
  const soundBtn = $('.sound-toggle');
  const stageEl = $('.frame__stage');
  const V = { visible: false, userPaused: false, playBlocked: false, centered: -1, watching: false };
  function syncWatchBtn(playing) {
    if (!watchBtn || !player) return;
    player.classList.toggle('is-paused', !playing);
    const label = !V.watching ? 'Watch' : playing ? 'Pause' : 'Play';
    $('.watch-btn__txt', watchBtn).textContent = label;
    watchBtn.setAttribute('aria-label', !V.watching ? 'Watch the product walkthrough' : playing ? 'Pause the walkthrough' : 'Play the walkthrough');
  }
  function setSound(on) {
    video.muted = !on;
    if (!soundBtn) return;
    soundBtn.setAttribute('aria-pressed', String(on));
    soundBtn.setAttribute('aria-label', on ? 'Mute sound' : 'Turn sound on');
  }
  function startWatching(fromStart) {
    if (V.watching) return;
    V.watching = true;
    player.classList.add('is-watching');
    setSound(true);
    if (fromStart) { try { video.currentTime = 0; } catch (e) { /* not ready yet */ } }
  }
  function setToggle(playing) {
    syncWatchBtn(playing);
    if (!vToggle) return;
    vToggle.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
    vToggle.innerHTML = playing
      ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';
  }
  function playVideo() {
    V.playBlocked = false;
    const pr = video.play();
    if (pr && pr.catch) pr.catch(err => {
      if (!err || err.name !== 'AbortError') V.playBlocked = true;
      if (!signal.aborted) setToggle(!video.paused);
    });
    setToggle(true);
  }
  function syncVideo() {
    if (!video) return;
    if (!V.visible) { if (!video.paused) video.pause(); return; }
    if (!REDUCED && video.paused && !V.userPaused && !V.playBlocked && !document.hidden) playVideo();
  }
  function markChapter() {
    const t = video.currentTime;
    let idx = 0;
    chapterBtns.forEach((b, i) => { if (t >= +b.dataset.t) idx = i; });
    chapterBtns.forEach((b, i) => {
      const cur = i === idx;
      if ((b.getAttribute('aria-current') === 'true') !== cur) b.setAttribute('aria-current', String(cur));
      if (!cur) return;
      const start = +b.dataset.t;
      const end = chapterBtns[i + 1] ? +chapterBtns[i + 1].dataset.t : (video.duration || 70);
      b.style.setProperty('--cp', clamp((t - start) / (end - start)).toFixed(3));
      if (idx !== V.centered && V.visible) {
        const list = b.parentElement;
        list.scrollTo({ left: b.offsetLeft - list.clientWidth / 2 + b.clientWidth / 2, behavior: REDUCED ? 'auto' : 'smooth' });
        V.centered = idx;
      }
    });
  }
  if (video && player) {
    on(video, 'timeupdate', markChapter);
    on(video, 'play', () => setToggle(true));
    on(video, 'pause', () => setToggle(false));
    chapterBtns.forEach(b => on(b, 'click', () => {
      startWatching(false);
      try { video.currentTime = +b.dataset.t + .05; } catch (e) { /* not ready yet */ }
      V.userPaused = false;
      playVideo();
      markChapter();
    }));
    on(soundBtn, 'click', () => {
      const turnOn = video.muted;
      if (turnOn && !V.watching) { startWatching(false); V.userPaused = false; playVideo(); }
      setSound(turnOn);
    });
    on(watchBtn, 'click', e => {
      e.stopPropagation();
      if (!V.watching) { startWatching(true); V.userPaused = false; playVideo(); return; }
      if (video.paused) { V.userPaused = false; playVideo(); }
      else { V.userPaused = true; video.pause(); }
    });
    on(stageEl, 'click', () => {
      if (!V.watching) { watchBtn.click(); return; }
      if (video.paused) { V.userPaused = false; playVideo(); }
      else { V.userPaused = true; video.pause(); }
    });
    on(vToggle, 'click', () => {
      if (video.paused) { V.userPaused = false; playVideo(); }
      else { V.userPaused = true; video.pause(); }
    });
    setToggle(false);
    observe(new IntersectionObserver(es => {
      V.visible = es[es.length - 1].isIntersecting;
      if (V.visible) V.centered = -1;
      syncVideo();
    }, { threshold: .35 })).observe(player);
    on(document, 'visibilitychange', () => { if (document.hidden) { if (!video.paused) video.pause(); } else syncVideo(); });
    markChapter();
  }

  /* 4b. Rotating hero headline ------------------------------------------------------------------- */
  const rot = $('.rot');
  if (rot && !REDUCED) {
    const items = $$('.rot__item', rot);
    const HOLD = 4800;
    let cur = Math.max(0, items.findIndex(it => it.classList.contains('is-on'))), timer = 0;
    const holds = new Set();
    function show(n) {
      const prev = items[cur];
      prev.classList.remove('is-on');
      prev.classList.add('is-out');
      later(() => prev.classList.remove('is-out'), 1000);
      cur = n;
      items[cur].classList.remove('is-out');
      items[cur].classList.add('is-on');
    }
    const schedule = () => {
      cancelLater(timer);
      if (!holds.size) timer = later(() => { show((cur + 1) % items.length); schedule(); }, HOLD);
    };
    const hold = (why, active) => { active ? holds.add(why) : holds.delete(why); schedule(); };
    const title = rot.closest('h1');
    on(title, 'mouseenter', () => hold('hover', true));
    on(title, 'mouseleave', () => hold('hover', false));
    observe(new IntersectionObserver(es => hold('offscreen', !es[es.length - 1].isIntersecting))).observe(title);
    on(document, 'visibilitychange', () => hold('hidden', document.hidden));
    schedule();
  }

  /* 4c. Fit the product screens to the window ---------------------------------------------------- */
  const shots = $$('.hero__shot .workspace, .player');
  function fitShots() {
    const nav = document.querySelector('.nav');
    const navH = (nav && nav.offsetHeight) || 68;
    const avail = window.innerHeight - navH - 40;
    shots.forEach(el => {
      el.style.zoom = '';
      const h = el.getBoundingClientRect().height;
      const fit = Math.min(1, Math.max(.55, avail / h));
      if (fit < .995) el.style.zoom = fit.toFixed(3);
    });
  }
  if (shots.length && 'zoom' in document.documentElement.style) {
    fitShots();
    on(window, 'resize', fitShots);
    if (document.fonts) document.fonts.ready.then(() => { if (!signal.aborted) fitShots(); });
  }

  // "visible while on screen" helper for looping demos (see the original for the ratio reasoning)
  function whileVisible(el, onShow, onHide) {
    let shown;
    observe(new IntersectionObserver(es => {
      const e = es[es.length - 1];
      const vh = e.rootBounds ? e.rootBounds.height : window.innerHeight;
      const now = e.isIntersecting && (e.intersectionRatio >= .25 || e.intersectionRect.height >= vh * .5);
      if (now === shown) return;
      shown = now;
      now ? onShow() : onHide && onHide();
    }, { threshold: [0, .05, .1, .15, .2, .25] })).observe(el);
  }

  /* 7. Marquee: clone the track for a seamless loop ---------------------------------------------- */
  $$('.marquee').forEach(m => {
    if ($('.marquee__track[aria-hidden="true"]', m)) return;      // already cloned
    const t = $('.marquee__track', m);
    const c = t.cloneNode(true);
    c.setAttribute('aria-hidden', 'true');
    m.appendChild(c);
    if (t.getAnimations) {
      const [a0] = t.getAnimations(), [a1] = c.getAnimations();
      if (a0 && a1) Promise.all([a0.ready, a1.ready]).then(() => {
        if (a0.startTime != null && a1.startTime != null) a1.startTime = a0.startTime;
        else a1.currentTime = a0.currentTime;
      }).catch(() => {});
    }
  });
  $$('.marquee-toggle').forEach(b => {
    const m = $('.marquee', b.parentElement);
    if (!m) return;
    on(b, 'click', () => {
      const paused = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(paused));
      m.classList.toggle('is-paused', paused);
    });
  });

  /* 8. Chaos → one workspace ---------------------------------------------------------------------- */
  const chaos = $('.chaos');
  if (chaos) {
    const wins = $$('.chaos__win', chaos);
    const btns = $$('.chaos__toggle button', chaos);
    let auto = true, timer, kick, started = false;
    const computeVectors = () => {
      const cr = chaos.getBoundingClientRect();
      wins.forEach(w => {
        const r = w.getBoundingClientRect();
        w.style.setProperty('--tx', (cr.left + cr.width / 2 - (r.left + r.width / 2)).toFixed(0) + 'px');
        w.style.setProperty('--ty', (cr.top + cr.height / 2 - (r.top + r.height / 2)).toFixed(0) + 'px');
      });
    };
    const set = ordered => {
      if (ordered) computeVectors();
      chaos.classList.toggle('is-ordered', ordered);
      btns.forEach(b => b.setAttribute('aria-pressed', String((b.dataset.state === 'one') === ordered)));
    };
    btns.forEach(b => on(b, 'click', () => { auto = false; stopEvery(timer); set(b.dataset.state === 'one'); }));
    if (REDUCED) set(true);
    whileVisible(chaos, () => {
      stopEvery(timer); cancelLater(kick);
      if (!auto) return;
      if (REDUCED) { set(true); return; }
      if (!started) kick = later(() => { started = true; if (auto) set(true); }, 1800);
      timer = every(() => { if (auto) set(!chaos.classList.contains('is-ordered')); }, 5200);
    }, () => { stopEvery(timer); cancelLater(kick); });
  }

  /* 9. Integration hub ---------------------------------------------------------------------------- */
  const hub = $('.hub');
  if (hub) {
    const svg = $('svg.lines', hub);
    const nodes = $$('.hub__node', hub);
    const NS = 'http://www.w3.org/2000/svg';
    const draw = () => {
      const w = hub.clientWidth, h = hub.clientHeight;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.innerHTML = '';
      const cx = w / 2, cy = h / 2, rx = w * .42, ry = h * .4;
      const GAP = 3;
      const pts = nodes.map((n, i) => {
        const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2 + .18;
        return { a, x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry, hw: n.offsetWidth / 2 + GAP, hh: n.offsetHeight / 2 + GAP };
      });
      for (let k = 0; k < 40; k++) {
        let moved = false;
        for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
          const p = pts[i], q = pts[j];
          const ox = p.hw + q.hw - Math.abs(p.x - q.x), oy = p.hh + q.hh - Math.abs(p.y - q.y);
          if (ox <= 0 || oy <= 0) continue;
          moved = true;
          if (ox < oy) { const s = (p.x < q.x ? -ox : ox) / 2; p.x += s; q.x -= s; }
          else { const s = (p.y < q.y ? -oy : oy) / 2; p.y += s; q.y -= s; }
        }
        pts.forEach(p => { p.x = clamp(p.x, p.hw - GAP, w - p.hw + GAP); p.y = clamp(p.y, p.hh - GAP, h - p.hh + GAP); });
        if (!moved) break;
      }
      nodes.forEach((n, i) => {
        const { a, x, y } = pts[i];
        n.style.left = (x / w * 100).toFixed(2) + '%';
        n.style.top = (y / h * 100).toFixed(2) + '%';
        n.style.setProperty('--i', i);
        const mx = (cx + x) / 2 + Math.sin(a) * 26, my = (cy + y) / 2 - Math.cos(a) * 26;
        const path = document.createElementNS(NS, 'path');
        const d = `M${x.toFixed(1)},${y.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${cx},${cy}`;
        path.setAttribute('d', d);
        path.id = `spoke${i}`;
        path.style.setProperty('--i', i);
        svg.appendChild(path);
        path.style.setProperty('--len', path.getTotalLength().toFixed(0));
        if (!REDUCED && i % 2 === 0) {
          const c = document.createElementNS(NS, 'circle');
          c.setAttribute('r', '3');
          c.setAttribute('class', 'pulse');
          const am = document.createElementNS(NS, 'animateMotion');
          am.setAttribute('dur', (2.4 + (i % 4) * .5) + 's');
          am.setAttribute('repeatCount', 'indefinite');
          am.setAttribute('begin', (1.8 + i * .25) + 's');
          am.setAttribute('path', d);
          c.appendChild(am);
          svg.appendChild(c);
        }
      });
    };
    draw();
    if (document.fonts) document.fonts.ready.then(() => { if (!signal.aborted) draw(); });
    let rt;
    on(window, 'resize', () => { cancelLater(rt); rt = later(draw, 150); });
  }

  /* 10. Ask-your-documents chat demo ------------------------------------------------------------- */
  const ask = $('.ask');
  if (ask) {
    const sc = ASK_SCENARIOS;
    const qBtns = $$('.ask__qs button', ask);
    const filesEl = $('.files', ask), textEl = $('.prompt__text', ask), sendEl = $('.send', ask);
    const statusEl = $('.answer__status', ask), statusTxt = $('.answer__status span', ask);
    const ansEl = $('.answer__text', ask), vizEl = $('.answer__viz', ask), citesEl = $('.cites', ask);
    const srEl = $('.ask__sr', ask), liveEl = $('.ask__live', ask);
    let run = 0, idx = 0, visible = false, loopTimer, liveTimer;
    const plain = html => { const t = document.createElement('template'); t.innerHTML = html; return t.content.textContent.replace(/\s+/g, ' ').trim(); };
    const describe = s => { if (srEl) srEl.textContent = `Question: ${plain(s.q)} Answer: ${plain(s.a)} ${s.done}. Sources: ${s.cites.join('; ')}.`; };
    const announce = s => {
      if (!liveEl) return;
      cancelLater(liveTimer); liveEl.textContent = '';
      liveTimer = later(() => { liveEl.textContent = `${plain(s.a)} ${s.done}.`; }, 60);
    };
    describe(sc[idx]);
    // static, first-party sample data
    const fileTile = f => `<span class="file">${f.logo ? `<img class="flogo" src="${f.logo}" alt="">` : `<b style="background:${f.c}">${f.t}</b>`}<span class="fn">${f.n}</span></span>`;
    const vizHTML = s => {
      if (s.viz === 'bars') return `<div class="bars">${s.bars.map(b => `<div class="b ${b.cls || ''}"><span>${b.l}</span><i><em style="--w:${b.w}"></em></i><b>${b.v}</b></div>`).join('')}</div>`;
      if (s.viz === 'timeline') return `<div class="timeline">${s.dates.map(d => `<div><b>${d.d}</b>${d.l}</div>`).join('')}</div>`;
      if (s.viz === 'queue') return `<div class="queue">${s.queue.map(q => `<div><span>${q.l}</span>${q.p}</div>`).join('')}</div>`;
      return '';
    };
    const showFinal = s => {
      filesEl.innerHTML = s.files.map(fileTile).join('');
      $$('.file', filesEl).forEach(f => f.classList.add('is-in'));
      textEl.innerHTML = s.q;
      statusEl.style.visibility = 'visible'; statusEl.classList.add('done'); statusTxt.textContent = s.done;
      ansEl.innerHTML = s.a;
      vizEl.innerHTML = vizHTML(s);
      $$('.bars em', vizEl).forEach(e => e.style.transform = `scaleX(${e.style.getPropertyValue('--w')})`);
      const tl = $('.timeline', vizEl); if (tl) { tl.classList.add('is-in'); tl.style.setProperty('--tl', 1); }
      $$('.queue div', vizEl).forEach(d => d.classList.add('is-in'));
      citesEl.innerHTML = s.cites.map((c, i) => `<span class="cite is-in"><i>${i + 1}</i>${c}</span>`).join('');
    };
    async function play(i) {
      const my = ++run;
      const alive = () => my === run && visible && !signal.aborted;
      const s = sc[i];
      qBtns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
      describe(s);
      if (REDUCED) { showFinal(s); return; }
      filesEl.innerHTML = ''; textEl.innerHTML = '<span class="ph">Ask anything…</span>';
      statusEl.classList.remove('done'); statusEl.style.visibility = 'hidden';
      ansEl.innerHTML = ''; vizEl.innerHTML = ''; citesEl.innerHTML = '';
      await sleep(350); if (!alive()) return;
      for (const f of s.files) {
        filesEl.insertAdjacentHTML('beforeend', fileTile(f));
        const el = filesEl.lastElementChild; void el.offsetWidth; el.classList.add('is-in');
        await sleep(260); if (!alive()) return;
      }
      textEl.innerHTML = '<span class="typed"></span><span class="caret"></span>';
      const typed = $('.typed', textEl);
      const dec = document.createElement('textarea'); dec.innerHTML = s.q.replace(/<[^>]+>/g, '');
      const q = dec.value;
      for (let k = 0; k < q.length; k++) {
        typed.textContent = q.slice(0, k + 1);
        await sleep(q[k] === ' ' ? 34 : 22 + Math.random() * 26); if (!alive()) return;
      }
      await sleep(300); if (!alive()) return;
      sendEl.classList.add('is-hit'); later(() => sendEl.classList.remove('is-hit'), 200);
      $('.caret', textEl) && $('.caret', textEl).remove();
      statusEl.style.visibility = 'visible'; statusTxt.textContent = s.searching;
      await sleep(1300); if (!alive()) return;
      statusEl.classList.add('done'); statusTxt.textContent = s.done;
      const words = s.a.split(/(\s+)/);
      let acc = '';
      for (const w of words) {
        acc += w; ansEl.innerHTML = acc;
        await sleep(/\s/.test(w) ? 0 : 42); if (!alive()) return;
      }
      vizEl.innerHTML = vizHTML(s);
      await sleep(60);
      $$('.bars em', vizEl).forEach((e, k) => later(() => e.style.transform = `scaleX(${e.style.getPropertyValue('--w')})`, k * 180));
      const tl = $('.timeline', vizEl); if (tl) { tl.classList.add('is-in'); tl.style.setProperty('--tl', 1); }
      for (const d of $$('.queue div', vizEl)) { d.classList.add('is-in'); await sleep(220); if (!alive()) return; }
      await sleep(500); if (!alive()) return;
      for (let k = 0; k < s.cites.length; k++) {
        citesEl.insertAdjacentHTML('beforeend', `<span class="cite"><i>${k + 1}</i>${s.cites[k]}</span>`);
        const el = citesEl.lastElementChild; void el.offsetWidth; el.classList.add('is-in');
        await sleep(180); if (!alive()) return;
      }
      cancelLater(loopTimer);
      loopTimer = later(() => { if (alive()) { idx = (i + 1) % sc.length; play(idx); } }, 5200);
    }
    qBtns.forEach((b, k) => on(b, 'click', () => { cancelLater(loopTimer); idx = k; play(k); announce(sc[k]); }));
    whileVisible($('.chatwin', ask), () => { if (!visible) { visible = true; play(idx); } }, () => { visible = false; run++; cancelLater(loopTimer); });
  }

  /* 11. Industry tabs with agent runs (ARIA tabs pattern) ---------------------------------------- */
  const tabsWrap = $('.usecases');
  let rafP;
  if (tabsWrap) {
    const tabs = $$('.tab', tabsWrap);
    const panels = $$('.panel', tabsWrap);
    const tablist = $('[role="tablist"]', tabsWrap);
    const ctl = $('.tabs__ctl', tabsWrap);
    let cur = 0, run = 0, visible = false, auto = true, mouseOver = false, kick;
    const STEP_MS = 720, HOLD_MS = 3800;
    function setAuto(isOn) {
      auto = isOn;
      tabsWrap.classList.toggle('is-manual', !isOn);
      if (ctl) {
        const label = isOn ? 'Pause tab auto-advance' : 'Resume tab auto-advance';
        ctl.classList.toggle('is-paused', !isOn);
        ctl.setAttribute('aria-label', label);
        ctl.title = label;
      }
      if (isOn && kick) kick();
    }
    function select(i, focus) {
      cur = i;
      tabs.forEach((t, k) => {
        const sel = k === i;
        t.setAttribute('aria-selected', String(sel));
        t.tabIndex = sel ? 0 : -1;
        t.style.setProperty('--tp', 0);
        if (sel && focus) t.focus();
      });
      panels.forEach((p, k) => { p.classList.toggle('is-active', k === i); p.hidden = k !== i; });
      animateRun(i);
    }
    async function animateRun(i) {
      const my = ++run;
      const panel = panels[i];
      const runEl = $('.run', panel);
      const steps = $$('.rstep', panel);
      runEl.classList.remove('is-done');
      steps.forEach(s => s.classList.remove('is-active', 'is-done'));
      cancelFrame(rafP);
      if (REDUCED || !visible) {
        steps.forEach(s => s.classList.add('is-done'));
        runEl.classList.add('is-done');
        return;
      }
      const total = steps.length * STEP_MS + 500 + HOLD_MS;
      const t0 = performance.now();
      let paused = 0, pausedAt = 0;
      const tabEl = tabs[i];
      const tick = now => {
        if (my !== run || REDUCED) return;
        if (!auto || mouseOver) { if (!pausedAt) pausedAt = now; }
        else if (pausedAt) { paused += now - pausedAt; pausedAt = 0; }
        if (!auto) return;
        const el = (pausedAt || now) - t0 - paused;
        tabEl.style.setProperty('--tp', clamp(el / total).toFixed(3));
        if (el >= total) { select((i + 1) % tabs.length); return; }
        rafP = frame(tick);
      };
      kick = () => { if (my === run) { cancelFrame(rafP); rafP = frame(tick); } };
      rafP = frame(tick);
      await sleep(400);
      for (const s of steps) {
        if (my !== run) return;
        s.classList.add('is-active');
        await sleep(STEP_MS * .75);
        if (my !== run) return;
        s.classList.remove('is-active'); s.classList.add('is-done');
        await sleep(STEP_MS * .25);
      }
      if (my === run) runEl.classList.add('is-done');
    }
    $$('[data-replay]', tabsWrap).forEach(btn => on(btn, 'click', () => {
      const pi = panels.indexOf(btn.closest('.panel'));
      setAuto(false); visible = true; select(pi);
      const runEl = $('.run', panels[pi]);
      if (runEl.getBoundingClientRect().top < 0 || runEl.getBoundingClientRect().bottom > innerHeight) runEl.scrollIntoView({ block: 'center', behavior: REDUCED ? 'auto' : 'smooth' });
    }));
    tabs.forEach((t, k) => {
      on(t, 'click', () => { setAuto(false); select(k); });
      on(t, 'keydown', e => {
        const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (e.key === 'Home') { e.preventDefault(); select(0, true); }
        else if (e.key === 'End') { e.preventDefault(); select(tabs.length - 1, true); }
        else if (dir) { e.preventDefault(); select((k + dir + tabs.length) % tabs.length, true); }
      });
    });
    [tablist, ...panels].filter(Boolean).forEach(el => {
      on(el, 'pointerenter', e => { if (e.pointerType === 'mouse') mouseOver = true; });
      on(el, 'pointerleave', e => { if (e.pointerType === 'mouse') mouseOver = false; });
      on(el, 'focusin', () => setAuto(false));
      on(el, 'click', () => setAuto(false));
    });
    on(ctl, 'click', () => setAuto(!auto));
    whileVisible(tabsWrap, () => { if (!visible) { visible = true; select(cur); } }, () => { visible = false; run++; cancelFrame(rafP); });
    select(0);
  }

  /* 12. Bento cards: cursor spotlight (one delegated listener) ----------------------------------- */
  on(scope, 'pointermove', e => {
    const c = e.target.closest && e.target.closest('.card');
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });

  /* 13. Workspace mock: greeting, typed prompt, model roller, counters --------------------------- */
  const greetWord = $('[data-greet]');
  if (greetWord) {
    const h = new Date().getHours();
    greetWord.textContent = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  }
  const ws = $('.workspace');
  if (ws) {
    const box = $('.askbox__text', ws);
    const prompts = (box.dataset.prompts || '').split('|').filter(Boolean);
    const roll = $('.model .roll', ws);
    const rollItems = roll ? $$('span', roll) : [];
    let vis = false, my = 0, ri = 0, rollTimer;
    async function typeLoop() {
      const id = ++my;
      let k = 0;
      while (vis && id === my && !signal.aborted) {
        const p = prompts[k++ % prompts.length];
        box.classList.add('typed');
        for (let i = 0; i <= p.length; i++) { if (!vis || id !== my) return; box.textContent = p.slice(0, i); await sleep(26); }
        await sleep(2600);
        for (let i = p.length; i >= 0; i -= 3) { if (!vis || id !== my) return; box.textContent = p.slice(0, i); await sleep(12); }
        await sleep(300);
      }
    }
    const rollTick = () => {
      ri = (ri + 1) % rollItems.length;
      rollItems.forEach(s => s.style.transform = `translateY(-${ri * 100}%)`);
    };
    whileVisible(ws, () => {
      if (vis) return; vis = true;
      if (REDUCED) { box.textContent = prompts[0] || ''; box.classList.add('typed'); return; }
      typeLoop();
      if (rollItems.length) rollTimer = every(rollTick, 1500);
    }, () => { vis = false; my++; stopEvery(rollTimer); });
  }

  // count-up
  const countIO = observe(new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      countIO.unobserve(en.target);
      const el = en.target, target = +el.dataset.count, suffix = el.dataset.suffix || '';
      const t0 = performance.now(), d = 1400;
      const step = now => {
        const t = clamp((now - t0) / d);
        el.innerHTML = `${Math.round(target * (1 - Math.pow(1 - t, 3)))}<em>${suffix}</em>`;
        if (t < 1) frame(step);
      };
      frame(step);
    });
  }, { threshold: .18, rootMargin: '0px 0px -6% 0px' }));
  $$('[data-count]').forEach(el => {
    const target = +el.dataset.count, suffix = el.dataset.suffix || '';
    el.innerHTML = `${REDUCED ? target : 0}<em>${suffix}</em>`;
    if (!REDUCED) countIO.observe(el);
  });

  /* 14. Agent activity log (security section) ---------------------------------------------------- */
  const term = $('.terminal');
  if (term) {
    const logs = $$('.log', term);
    let vis = false, id = 0;
    async function loopLog() {
      const my = ++id;
      while (vis && my === id && !signal.aborted) {
        logs.forEach(l => l.classList.remove('is-in'));
        await sleep(300);
        for (const l of logs) { if (!vis || my !== id) return; l.classList.add('is-in'); await sleep(900); }
        await sleep(4200);
      }
    }
    whileVisible(term, () => {
      if (vis) return; vis = true;
      if (REDUCED) { logs.forEach(l => l.classList.add('is-in')); return; }
      loopLog();
    }, () => { vis = false; id++; });
  }

  /* 15. Reduced motion flipped mid-session -------------------------------------------------------- */
  on(reduceMQ, 'change', e => {
    REDUCED = e.matches;
    if (video) { if (REDUCED) video.pause(); else syncVideo(); }
    if (rot && REDUCED) { $$('.rot__item', rot).forEach((it, k) => { it.classList.toggle('is-on', k === 0); it.classList.remove('is-out'); }); }
    Object.values(globes).forEach(g => { if (!REDUCED && g.visible && !g.raf) g.loop(); });
  });

  return () => {
    ac.abort();
    observers.forEach(o => o.disconnect());
    timeouts.forEach(id => clearTimeout(id));
    intervals.forEach(id => clearInterval(id));
    rafs.forEach(id => cancelAnimationFrame(id));
    Object.values(globes).forEach(g => { g.visible = false; g.raf = null; });
    if (video && !video.paused) video.pause();
  };
}
