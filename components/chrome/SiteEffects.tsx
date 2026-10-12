'use client';
// Site-wide behaviour that every page shares (ported from the original app.js):
//   • marks JS as ready (the <head> bootstrap hides reveal content only while JS is expected to run),
//   • the page-load class that starts entrance animations once fonts are in,
//   • reveal-on-scroll for .reveal and [data-inview], re-run on every client navigation.
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

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
    return () => { cancelled = true; reduce.removeEventListener('change', syncReduced); };
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        en.target.dispatchEvent(new CustomEvent('inview'));
        io.unobserve(en.target);
      });
    }, { threshold: .18, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.reveal:not(.is-in), [data-inview]:not(.is-in)').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
