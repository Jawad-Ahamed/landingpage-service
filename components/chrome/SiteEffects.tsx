'use client';
// Site-wide behaviour every page shares:
//   • marks JS as ready (the <head> bootstrap hides reveal content only while JS is expected to run),
//   • the page-load class that starts entrance animations once fonts are in,
//   • reveal-on-scroll for .reveal and [data-inview] (home page markup),
//   • reading highlight for [data-read] (lit while in / above the middle 40% of the viewport),
//   • one delegated pointer listener for button edge light (--bx/--by) and tilt cards (--rx/--ry, max 2°).
// Everything re-binds on client navigation (pathname).
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const MAX_TILT = 2; // degrees

export default function SiteEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('js', 'js-ready');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncReduced = () => root.classList.toggle('reduced', reduce.matches);
    syncReduced();
    reduce.addEventListener('change', syncReduced);
    let cancelled = false;
    const start = () => { if (!cancelled) requestAnimationFrame(() => root.classList.add('is-loaded')); };
    if (document.fonts) Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]).then(start);
    else start();

    // ---- pointer layer (delegated, rAF-throttled) ----
    let tilted: HTMLElement | null = null;
    let raf = 0, lastEv: PointerEvent | null = null;
    const untilt = () => { if (tilted) { tilted.classList.remove('is-tilting'); tilted.style.setProperty('--rx', '0deg'); tilted.style.setProperty('--ry', '0deg'); tilted = null; } };
    const frame = () => {
      raf = 0;
      const e = lastEv; if (!e) return;
      const t = e.target as Element | null;
      const btn = t?.closest?.('.btn, .pg-filter') as HTMLElement | null;
      if (btn) {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--bx', `${e.clientX - r.left}px`);
        btn.style.setProperty('--by', `${e.clientY - r.top}px`);
      }
      const card = reduce.matches ? null : (t?.closest?.('[data-tilt]') as HTMLElement | null);
      if (card !== tilted) untilt();
      if (card) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;   // -0.5 … 0.5
        card.style.setProperty('--ry', `${(px * 2 * MAX_TILT).toFixed(2)}deg`);
        card.style.setProperty('--rx', `${(-py * 2 * MAX_TILT).toFixed(2)}deg`);
        card.classList.add('is-tilting');
        tilted = card;
      }
    };
    const onMove = (e: PointerEvent) => { if (e.pointerType !== 'mouse') return; lastEv = e; if (!raf) raf = requestAnimationFrame(frame); };
    const onLeave = () => untilt();
    document.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);

    return () => {
      cancelled = true;
      reduce.removeEventListener('change', syncReduced);
      document.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    // reveal-on-scroll (home page markup)
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        en.target.dispatchEvent(new CustomEvent('inview'));
        io.unobserve(en.target);
      });
    }, { threshold: .18, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.reveal:not(.is-in), [data-inview]:not(.is-in)').forEach(el => io.observe(el));

    // reading highlight: the band is the middle 40% of the viewport (30% inset top and bottom)
    const read = new IntersectionObserver(entries => {
      entries.forEach(en => {
        const above = !en.isIntersecting && en.boundingClientRect.top < 0;
        en.target.classList.toggle('is-lit', en.isIntersecting || above);
      });
    }, { rootMargin: '-30% 0px -30% 0px', threshold: 0 });
    document.querySelectorAll('[data-read]').forEach(el => read.observe(el));

    return () => { io.disconnect(); read.disconnect(); };
  }, [pathname]);

  return null;
}
