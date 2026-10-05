/* ==========================================================================
   MetaWurks V2 · Landing page mock — interactions
   Vanilla JS, no dependencies. Every animation respects prefers-reduced-motion.
   ========================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  let REDUCED = reduceMQ.matches;
  if (REDUCED) root.classList.add('reduced');

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOutBack = (t, s = 1.25) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ------------------------------------------------------------------
     1. Split headlines into words for a staggered rise
     ------------------------------------------------------------------ */
  const hlGroups = [];   // word spans that belong to one highlighted phrase
  function splitWords(el, baseDelay = 0, step = 55) {
    let i = 0;
    const frag = document.createDocumentFragment();
    const wrap = (text, cls) => {
      const group = cls && /\bhl\b/.test(cls) ? [] : null;
      if (group) hlGroups.push(group);
      text.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span');
        w.className = 'w';
        const inner = document.createElement('span');
        if (cls) inner.className = cls;
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
  }
  $$('.split').forEach(el => splitWords(el, +(el.dataset.delay || 120)));
  // One gradient across the whole phrase: each word shows its own slice (used by the
  // indigo -> blue -> cyan highlight in both themes)
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

  /* ------------------------------------------------------------------
     2. Nav, drawer, progress bar
     ------------------------------------------------------------------ */
  const nav = $('.nav');
  const toggle = $('.nav__toggle');
  const bar = $('.progress span');
  if (toggle) {
    const setMenu = open => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
    $$('.nav__drawer a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    // non-modal disclosure: Escape closes and returns focus to the toggle; a click outside closes it
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
    });
    document.addEventListener('click', e => {
      if (nav.classList.contains('is-open') && !nav.contains(e.target)) setMenu(false);
    });
  }

  /* ------------------------------------------------------------------
     3. Dotted globe renderer (echoes the V2 app's home orb)
     ------------------------------------------------------------------ */
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
      new ResizeObserver(() => this.resize()).observe(canvas);
      new IntersectionObserver(es => {
        this.visible = es[es.length - 1].isIntersecting;
        if (this.visible && !this.raf) this.loop();
      }, { rootMargin: '100px' }).observe(canvas);
    }
    // dot colour + intensity come from the active theme (--globe-rgb / --globe-gain on :root)
    applyTheme(quiet) {
      if (!this.o.themed) return;
      const cs = getComputedStyle(root);
      const get = n => cs.getPropertyValue(n).trim().replace(/\s+/g, '');
      const gain = parseFloat(cs.getPropertyValue('--globe-gain')) || 1;
      this.o.rgb = get(this.o.rgbVar || '--globe-rgb') || this.base.rgb;
      this.o.ringRgb = get('--globe-ring-rgb') || this.base.ringRgb;
      const arc = get('--globe-arc-rgb');
      this.o.arcRgb = arc && arc !== 'none' ? arc : null;   // the dashboard globe's peach orbit arcs (dark)
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
    draw(t) {
      const { ctx, w, h, o } = this;
      ctx.clearRect(0, 0, w, h);
      const R = Math.min(w, h) * .42, cx = w / 2, cy = h / 2;
      const cr = Math.cos(this.rot), sr = Math.sin(this.rot), ct = Math.cos(o.tilt), st = Math.sin(o.tilt);
      // orbit rings
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
        const d = (z + 1) / 2; // 0 back .. 1 front
        const a = (.06 + d * d * o.alpha) * this.boost;
        const s = o.size * (.45 + d * .9);
        ctx.fillStyle = `rgba(${o.rgb},${a.toFixed(3)})`;
        ctx.fillRect(cx + x * R - s / 2, cy + y * R - s / 2, s, s);
      }
    }
    loop(now) {
      if (!this.visible || REDUCED) { this.raf = null; this.last = null; return; }
      now = now || performance.now();
      // time-based step (speed is rad/ms): same spin at 60/120/144 Hz; the cap stops a jump after a pause
      const dt = this.last == null ? 16 : Math.min(now - this.last, 50);
      this.last = now;
      this.rot += this.o.speed * dt;
      this.draw();
      this.raf = requestAnimationFrame(t => this.loop(t));
    }
  }
  const globes = {};
  $$('canvas[data-globe]').forEach(c => {
    const kind = c.dataset.globe;
    const presets = {
      orb: { count: 900, alpha: .85, size: 1.5, speed: .00016, accent: 'rgba(233,162,59,.9)' },
      core: { count: 380, alpha: .9, size: 1.3, speed: .0002, rings: false },
      dark: { count: 1400, rgb: '157,176,242', alpha: .5, size: 1.6, speed: .00008, ringRgb: '157,176,242', rgbVar: '--globe-final-rgb' }, // the final CTA card
    };
    globes[kind] = new Globe(c, presets[kind] || {});
  });

  /* ------------------------------------------------------------------
     3b. Light / dark theme
     The <head> bootstrap already applied the saved choice (or the OS setting) before first paint.
     ------------------------------------------------------------------ */
  const themeBtn = $('.theme-toggle');
  const metaTheme = $('meta[name="theme-color"]');
  const darkMQ = window.matchMedia('(prefers-color-scheme: dark)');
  const THEME_KEY = 'mw-theme';
  const savedTheme = () => { try { const t = localStorage.getItem(THEME_KEY); return t === 'dark' || t === 'light' ? t : null; } catch (e) { return null; } };
  const isDark = () => root.getAttribute('data-theme') === 'dark';
  function syncTheme() {
    const dark = isDark();
    if (metaTheme) metaTheme.setAttribute('content', dark ? '#0B101C' : '#FFFFFF');
    if (themeBtn) themeBtn.setAttribute('aria-pressed', String(dark));
    Object.values(globes).forEach(g => g.applyTheme());
  }
  function setTheme(t, persist) {
    root.setAttribute('data-theme', t);
    if (persist) { try { localStorage.setItem(THEME_KEY, t); } catch (e) { /* private mode: the switch still works */ } }
    syncTheme();
  }
  if (!root.hasAttribute('data-theme')) root.setAttribute('data-theme', savedTheme() || (darkMQ.matches ? 'dark' : 'light'));
  syncTheme();
  let fadeTimer;
  if (themeBtn) themeBtn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    if (REDUCED) { setTheme(next, true); return; }
    if (document.startViewTransition) {
      // circular reveal of the new theme, expanding from the toggle
      const r = themeBtn.getBoundingClientRect();
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const vt = document.startViewTransition(() => setTheme(next, true));
      vt.ready.then(() => root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(.65, 0, .35, 1)', pseudoElement: '::view-transition-new(root)' }
      )).catch(() => {});
      return;
    }
    root.classList.add('theme-fade');
    setTheme(next, true);
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => root.classList.remove('theme-fade'), 520);
  });
  // keep following the OS until the visitor picks a theme themselves
  const onSystemTheme = e => { if (!savedTheme()) setTheme(e.matches ? 'dark' : 'light', false); };
  if (darkMQ.addEventListener) darkMQ.addEventListener('change', onSystemTheme);
  else if (darkMQ.addListener) darkMQ.addListener(onSystemTheme);

  /* ------------------------------------------------------------------
     4. Product walkthrough video (the "Watch it work" section)
     Plays while it is on screen, pauses when it leaves; chapter chips seek and track progress.
     ------------------------------------------------------------------ */
  const video = $('#demoVideo');
  const player = $('.player');
  const chapterBtns = $$('.chapters__list button[data-t]');
  const vToggle = $('.video-toggle');
  const watchBtn = $('.watch-btn');
  const soundBtn = $('.sound-toggle');
  const stageEl = $('.frame__stage');
  // watching: the visitor chose to watch (full clarity); before that it plays quietly behind the Watch button
  const V = { visible: false, userPaused: false, playBlocked: false, centered: -1, watching: false };

  function syncWatchBtn(playing) {
    if (!watchBtn || !player) return;
    player.classList.toggle('is-paused', !playing);
    const label = !V.watching ? 'Watch' : playing ? 'Pause' : 'Play';
    $('.watch-btn__txt', watchBtn).textContent = label;
    watchBtn.setAttribute('aria-label', !V.watching ? 'Watch the product walkthrough' : playing ? 'Pause the walkthrough' : 'Play the walkthrough');
  }
  // sound: the quiet preview is always muted; choosing to watch (a user gesture) turns it on
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
      // AbortError = we paused it ourselves; anything else (autoplay refused) waits for a click
      if (!err || err.name !== 'AbortError') V.playBlocked = true;
      setToggle(!video.paused);
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
      // keep the active chip in view inside the scrollable rail (without scrolling the page)
      if (idx !== V.centered && V.visible) {
        const list = b.parentElement;
        list.scrollTo({ left: b.offsetLeft - list.clientWidth / 2 + b.clientWidth / 2, behavior: REDUCED ? 'auto' : 'smooth' });
        V.centered = idx;
      }
    });
  }
  if (video && player) {
    video.addEventListener('timeupdate', markChapter);
    video.addEventListener('play', () => setToggle(true));
    video.addEventListener('pause', () => setToggle(false));
    chapterBtns.forEach(b => b.addEventListener('click', () => {
      startWatching(false);
      try { video.currentTime = +b.dataset.t + .05; } catch (e) { /* not ready yet */ }
      V.userPaused = false;
      playVideo();
      markChapter();
    }));
    if (soundBtn) soundBtn.addEventListener('click', () => {
      const on = video.muted;
      if (on && !V.watching) { startWatching(false); V.userPaused = false; playVideo(); }
      setSound(on);
    });
    if (watchBtn) watchBtn.addEventListener('click', e => {
      e.stopPropagation();
      if (!V.watching) { startWatching(true); V.userPaused = false; playVideo(); return; }
      if (video.paused) { V.userPaused = false; playVideo(); }
      else { V.userPaused = true; video.pause(); }
    });
    // a click anywhere on the picture starts watching, then toggles playback
    if (stageEl) stageEl.addEventListener('click', () => {
      if (!V.watching) { watchBtn.click(); return; }   // clicking the dimmed preview also starts watching
      if (video.paused) { V.userPaused = false; playVideo(); }
      else { V.userPaused = true; video.pause(); }
    });
    if (vToggle) vToggle.addEventListener('click', () => {
      if (video.paused) { V.userPaused = false; playVideo(); }
      else { V.userPaused = true; video.pause(); }
    });
    setToggle(false);
    new IntersectionObserver(es => {
      V.visible = es[es.length - 1].isIntersecting;
      if (V.visible) V.centered = -1;
      syncVideo();
    }, { threshold: .35 }).observe(player);
    document.addEventListener('visibilitychange', () => { if (document.hidden) { if (!video.paused) video.pause(); } else syncVideo(); });
    markChapter();
  }

  /* ------------------------------------------------------------------
     4b. Rotating hero headline
     Advances every HOLD ms; holds while the headline is hovered, off-screen or the tab is hidden,
     and restarts the full hold when it resumes. Reduced motion shows the first headline only.
     ------------------------------------------------------------------ */
  const rot = $('.rot');
  if (rot && !REDUCED) {
    const items = $$('.rot__item', rot);
    const HOLD = 4800;
    let cur = 0, timer = 0;
    const holds = new Set();
    function show(n) {
      const prev = items[cur];
      prev.classList.remove('is-on');
      prev.classList.add('is-out');
      setTimeout(() => prev.classList.remove('is-out'), 1000);
      cur = n;
      items[cur].classList.remove('is-out');
      items[cur].classList.add('is-on');
    }
    const schedule = () => {
      clearTimeout(timer);
      if (!holds.size) timer = setTimeout(() => { show((cur + 1) % items.length); schedule(); }, HOLD);
    };
    const hold = (why, on) => { on ? holds.add(why) : holds.delete(why); schedule(); };
    const title = rot.closest('h1');
    title.addEventListener('mouseenter', () => hold('hover', true));
    title.addEventListener('mouseleave', () => hold('hover', false));
    new IntersectionObserver(es => hold('offscreen', !es[es.length - 1].isIntersecting)).observe(title);
    document.addEventListener('visibilitychange', () => hold('hidden', document.hidden));
    schedule();
  }

  /* ------------------------------------------------------------------
     4c. Fit the product screens to the window
     The dashboard and the walkthrough player are scaled as a whole (like a screenshot) so each one
     is fully visible in a single screen below the nav. Never scaled up; phones already fit.
     ------------------------------------------------------------------ */
  const shots = $$('.hero__shot .workspace, .player');
  function fitShots() {
    const navH = (nav && nav.offsetHeight) || 68;
    const avail = window.innerHeight - navH - 40;   // 20px breathing room above and below
    shots.forEach(el => {
      el.style.zoom = '';
      const h = el.getBoundingClientRect().height;
      const fit = Math.min(1, Math.max(.55, avail / h));
      if (fit < .995) el.style.zoom = fit.toFixed(3);
    });
  }
  if (shots.length && 'zoom' in document.documentElement.style) {
    fitShots();
    window.addEventListener('resize', fitShots);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitShots);
  }

  let ticking = false;
  function requestTick() {
    if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; onScroll(); }); }
  }
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 8);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = `scaleX(${clamp(y / Math.max(1, max)).toFixed(4)})`;
  }
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', () => layoutHl());

  /* ------------------------------------------------------------------
     5. Page load choreography
     ------------------------------------------------------------------ */
  function start() {
    layoutHl();
    root.classList.add('is-loaded');
    onScroll();
  }
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, sleep(900)]).then(() => requestAnimationFrame(start));
    // fonts that land after the 900 ms cap (or later swaps) can rewrap the highlighted phrases
    const remeasure = () => layoutHl();
    document.fonts.ready.then(remeasure);
    if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', remeasure);
  } else window.addEventListener('load', start);

  /* ------------------------------------------------------------------
     6. Reveal on scroll + generic in-view flags
     ------------------------------------------------------------------ */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      en.target.dispatchEvent(new CustomEvent('inview'));
      io.unobserve(en.target);
    });
  }, { threshold: .18, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal, [data-inview]').forEach(el => io.observe(el));

  // "visible while on screen" helper for looping demos
  function whileVisible(el, onShow, onHide) {
    // Read the newest entry and gate on the ratio itself: the entry fired when the ratio drops
    // below .25 is still "intersecting", and no further callback may come at 0. Elements taller
    // than 4 viewports never reach .25, so half the viewport filled also counts as shown.
    // Callbacks fire on transitions only (the first entry always reports its state).
    let shown;
    new IntersectionObserver(es => {
      const e = es[es.length - 1];
      const vh = e.rootBounds ? e.rootBounds.height : window.innerHeight;
      const now = e.isIntersecting && (e.intersectionRatio >= .25 || e.intersectionRect.height >= vh * .5);
      if (now === shown) return;
      shown = now;
      now ? onShow() : onHide && onHide();
    }, { threshold: [0, .05, .1, .15, .2, .25] }).observe(el);
  }

  /* ------------------------------------------------------------------
     7. Marquee — clone track for a seamless loop
     ------------------------------------------------------------------ */
  $$('.marquee').forEach(m => {
    const t = $('.marquee__track', m);
    const c = t.cloneNode(true);
    c.setAttribute('aria-hidden', 'true');
    m.appendChild(c);
    // The original track started animating before the clone existed; sync clocks so the loop seam keeps the normal gap
    if (t.getAnimations) {
      const [a0] = t.getAnimations(), [a1] = c.getAnimations();
      if (a0 && a1) Promise.all([a0.ready, a1.ready]).then(() => {
        if (a0.startTime != null && a1.startTime != null) a1.startTime = a0.startTime;
        else a1.currentTime = a0.currentTime;
      }).catch(() => {});
    }
  });
  // Pause / resume control (WCAG 2.2.2): hover alone is not enough for keyboard and touch users
  $$('.marquee-toggle').forEach(b => {
    const m = $('.marquee', b.parentElement);
    if (!m) return;
    b.addEventListener('click', () => {
      const paused = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(paused));
      m.classList.toggle('is-paused', paused);
    });
  });

  /* ------------------------------------------------------------------
     8. Chaos → one workspace
     ------------------------------------------------------------------ */
  const chaos = $('.chaos');
  if (chaos) {
    const wins = $$('.chaos__win', chaos);
    const btns = $$('.chaos__toggle button', chaos);
    let auto = true, timer;
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
    btns.forEach(b => b.addEventListener('click', () => { auto = false; clearInterval(timer); set(b.dataset.state === 'one'); }));
    // Auto-cycle only while the demo is on screen; a toggle click (auto = false) stops it for good.
    let started = false, kick;
    if (REDUCED) set(true); // reduced motion: start on the calm end state rather than switching it on scroll
    whileVisible(chaos, () => {
      clearInterval(timer); clearTimeout(kick);
      if (!auto) return;
      if (REDUCED) { set(true); return; }
      if (!started) kick = setTimeout(() => { started = true; if (auto) set(true); }, 1800);
      timer = setInterval(() => { if (auto) set(!chaos.classList.contains('is-ordered')); }, 5200);
    }, () => { clearInterval(timer); clearTimeout(kick); });
  }

  /* ------------------------------------------------------------------
     9. Integration hub — spokes, pulses, nodes on an ellipse
     ------------------------------------------------------------------ */
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
      // Ideal spots on an ellipse, then nudge apart any nodes that would overlap (narrow screens)
      // and keep every node inside the hub, so no label collides or gets clipped at the viewport edge.
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
        const len = path.getTotalLength();
        path.style.setProperty('--len', len.toFixed(0));
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
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw); // label widths change once web fonts land
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(draw, 150); });
  }

  /* ------------------------------------------------------------------
     10. Ask-your-documents chat demo
     ------------------------------------------------------------------ */
  const ask = $('.ask');
  if (ask && window.ASK_SCENARIOS) {
    const sc = window.ASK_SCENARIOS;
    const qBtns = $$('.ask__qs button', ask);
    const filesEl = $('.files', ask), textEl = $('.prompt__text', ask), sendEl = $('.send', ask);
    const statusEl = $('.answer__status', ask), statusTxt = $('.answer__status span', ask);
    const ansEl = $('.answer__text', ask), vizEl = $('.answer__viz', ask), citesEl = $('.cites', ask);
    // The animated .chatwin is aria-hidden: .ask__sr holds the finished Q&A for the current
    // scenario (silent text equivalent) and .ask__live announces only answers the user asked for.
    const srEl = $('.ask__sr', ask), liveEl = $('.ask__live', ask);
    let run = 0, idx = 0, visible = false, loopTimer, liveTimer;
    const plain = html => { const t = document.createElement('template'); t.innerHTML = html; return t.content.textContent.replace(/\s+/g, ' ').trim(); };
    const describe = s => { if (srEl) srEl.textContent = `Question: ${plain(s.q)} Answer: ${plain(s.a)} ${s.done}. Sources: ${s.cites.join('; ')}.`; };
    const announce = s => {
      if (!liveEl) return;
      clearTimeout(liveTimer); liveEl.textContent = '';
      liveTimer = setTimeout(() => { liveEl.textContent = `${plain(s.a)} ${s.done}.`; }, 60);
    };
    describe(sc[idx]);

    const fileTile = f => `<span class="file">${f.logo ? `<img class="flogo" src="${f.logo}" alt="">` : `<b style="background:${f.c}">${f.t}</b>`}<span class="fn">${f.n}</span></span>`; // static, first-party sample data
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
      const alive = () => my === run && visible;
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
        const el = filesEl.lastElementChild; void el.offsetWidth; el.classList.add('is-in'); // flush start style so the entrance transition runs
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
      sendEl.classList.add('is-hit'); setTimeout(() => sendEl.classList.remove('is-hit'), 200);
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
      $$('.bars em', vizEl).forEach((e, k) => setTimeout(() => e.style.transform = `scaleX(${e.style.getPropertyValue('--w')})`, k * 180));
      const tl = $('.timeline', vizEl); if (tl) { tl.classList.add('is-in'); tl.style.setProperty('--tl', 1); }
      for (const d of $$('.queue div', vizEl)) { d.classList.add('is-in'); await sleep(220); if (!alive()) return; }
      await sleep(500); if (!alive()) return;
      for (let k = 0; k < s.cites.length; k++) {
        citesEl.insertAdjacentHTML('beforeend', `<span class="cite"><i>${k + 1}</i>${s.cites[k]}</span>`);
        const el = citesEl.lastElementChild; void el.offsetWidth; el.classList.add('is-in');
        await sleep(180); if (!alive()) return;
      }
      clearTimeout(loopTimer);
      loopTimer = setTimeout(() => { if (alive()) { idx = (i + 1) % sc.length; play(idx); } }, 5200);
    }
    // Only a user's click announces, and only the finished answer; the auto-loop stays silent.
    qBtns.forEach((b, k) => b.addEventListener('click', () => { clearTimeout(loopTimer); idx = k; play(k); announce(sc[k]); }));
    whileVisible($('.chatwin', ask), () => { if (!visible) { visible = true; play(idx); } }, () => { visible = false; run++; clearTimeout(loopTimer); });
  }

  /* ------------------------------------------------------------------
     11. Industry tabs with agent runs (ARIA tabs pattern)
     ------------------------------------------------------------------ */
  const tabsWrap = $('.usecases');
  if (tabsWrap) {
    const tabs = $$('.tab', tabsWrap);
    const panels = $$('.panel', tabsWrap);
    const tablist = $('[role="tablist"]', tabsWrap);
    const ctl = $('.tabs__ctl', tabsWrap);
    // auto: tabs rotate until the user takes over or presses pause (WCAG 2.2.2).
    // mouseOver only holds the countdown; the agent-run steps always play through.
    let cur = 0, run = 0, visible = false, auto = true, mouseOver = false, rafP, kick;
    const STEP_MS = 720, HOLD_MS = 3800;

    function setAuto(on) {
      auto = on;
      tabsWrap.classList.toggle('is-manual', !on);
      if (ctl) {
        const label = on ? 'Pause tab auto-advance' : 'Resume tab auto-advance';
        ctl.classList.toggle('is-paused', !on);
        ctl.setAttribute('aria-label', label);
        ctl.title = label;
      }
      if (on && kick) kick();
    }

    function select(i, focus) {
      cur = i;
      tabs.forEach((t, k) => {
        const on = k === i;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        t.style.setProperty('--tp', 0);
        if (on && focus) t.focus();
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
      cancelAnimationFrame(rafP);
      if (REDUCED || !visible) {
        steps.forEach(s => s.classList.add('is-done'));
        runEl.classList.add('is-done');
        return;
      }
      const total = steps.length * STEP_MS + 500 + HOLD_MS;
      let t0 = performance.now(), paused = 0, pausedAt = 0;
      const tabEl = tabs[i];
      const tick = now => {
        if (my !== run || REDUCED) return;
        if (!auto || mouseOver) { if (!pausedAt) pausedAt = now; }
        else if (pausedAt) { paused += now - pausedAt; pausedAt = 0; }
        if (!auto) return; // parked until the user resumes; kick() restarts the loop
        const el = (pausedAt || now) - t0 - paused;
        tabEl.style.setProperty('--tp', clamp(el / total).toFixed(3));
        if (el >= total) { select((i + 1) % tabs.length); return; }
        rafP = requestAnimationFrame(tick);
      };
      kick = () => { if (my === run) { cancelAnimationFrame(rafP); rafP = requestAnimationFrame(tick); } };
      rafP = requestAnimationFrame(tick);
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

    $$('[data-replay]', tabsWrap).forEach(btn => btn.addEventListener('click', () => {
      const pi = panels.indexOf(btn.closest('.panel'));
      setAuto(false); visible = true; select(pi);
      const runEl = $('.run', panels[pi]);
      if (runEl.getBoundingClientRect().top < 0 || runEl.getBoundingClientRect().bottom > innerHeight) runEl.scrollIntoView({ block: 'center', behavior: REDUCED ? 'auto' : 'smooth' });
    }));

    tabs.forEach((t, k) => {
      t.addEventListener('click', () => { setAuto(false); select(k); });
      t.addEventListener('keydown', e => {
        const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (e.key === 'Home') { e.preventDefault(); select(0, true); }
        else if (e.key === 'End') { e.preventDefault(); select(tabs.length - 1, true); }
        else if (dir) { e.preventDefault(); select((k + dir + tabs.length) % tabs.length, true); }
      });
    });
    [tablist, ...panels].filter(Boolean).forEach(el => {
      // A mouse resting on the tabs or a panel holds the countdown. Touch never sets it, so a tap can't leave it stuck.
      el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') mouseOver = true; });
      el.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') mouseOver = false; });
      // Focus (keyboard or click) or a tap inside hands control to the user: rotation stops until they press play.
      el.addEventListener('focusin', () => setAuto(false));
      el.addEventListener('click', () => setAuto(false));
    });
    if (ctl) ctl.addEventListener('click', () => setAuto(!auto));
    whileVisible(tabsWrap, () => { if (!visible) { visible = true; select(cur); } }, () => { visible = false; run++; cancelAnimationFrame(rafP); });
    select(0);
  }

  /* ------------------------------------------------------------------
     12. Bento cards — cursor spotlight
     ------------------------------------------------------------------ */
  $$('.card').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  /* ------------------------------------------------------------------
     13. Workspace mock — greeting, typed prompt, model roller, counters
     ------------------------------------------------------------------ */
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
      while (vis && id === my) {
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
      if (rollItems.length) rollTimer = setInterval(rollTick, 1500);
    }, () => { vis = false; my++; clearInterval(rollTimer); });
  }

  // count-up
  $$('[data-count]').forEach(el => {
    const target = +el.dataset.count, suffix = el.dataset.suffix || '';
    const render = v => { el.innerHTML = `${Math.round(v)}<em>${suffix}</em>`; };
    render(REDUCED ? target : 0);
    if (REDUCED) return;
    io.observe(el);
    el.addEventListener('inview', () => {
      const t0 = performance.now(), d = 1400;
      const step = now => {
        const t = clamp((now - t0) / d);
        render(target * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { once: true });
  });

  /* ------------------------------------------------------------------
     14. Agent activity log (security section)
     ------------------------------------------------------------------ */
  const term = $('.terminal');
  if (term) {
    const logs = $$('.log', term);
    let vis = false, id = 0;
    async function loopLog() {
      const my = ++id;
      while (vis && my === id) {
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

  /* ------------------------------------------------------------------
     15. Misc
     ------------------------------------------------------------------ */
  const yr = $('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();

  // apply the whole mode when the OS setting flips mid-session, not just the class
  reduceMQ.addEventListener && reduceMQ.addEventListener('change', e => {
    REDUCED = e.matches;
    root.classList.toggle('reduced', REDUCED);
    if (video) { if (REDUCED) video.pause(); else syncVideo(); }
    if (rot && REDUCED) { $$('.rot__item', rot).forEach((it, k) => { it.classList.toggle('is-on', k === 0); it.classList.remove('is-out'); }); }
    Object.values(globes).forEach(g => { if (!REDUCED && g.visible && !g.raf) g.loop(); });
  });

  // keep this last: tells the <head> bootstrap that setup finished, so it keeps the 'js' class
  root.classList.add('js', 'js-ready');
})();
