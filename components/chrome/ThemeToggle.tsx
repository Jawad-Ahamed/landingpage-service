'use client';
// Light / dark switch. The <head> bootstrap applied the saved choice (or the OS setting) before first paint;
// this keeps following the OS until the visitor picks a theme, and reveals the new theme in a circle from the button.
import { useEffect, useRef, useState } from 'react';

const KEY = 'mw-theme';
const saved = () => { try { const t = localStorage.getItem(KEY); return t === 'dark' || t === 'light' ? t : null; } catch { return null; } };

function apply(t: 'dark' | 'light', persist: boolean) {
  const root = document.documentElement;
  root.setAttribute('data-theme', t);
  if (persist) { try { localStorage.setItem(KEY, t); } catch { /* private mode: the switch still works */ } }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#0B101C' : '#FFFFFF');
  document.dispatchEvent(new CustomEvent('mw-theme', { detail: t }));
}

export default function ThemeToggle() {
  const btn = useRef<HTMLButtonElement>(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setDark(root.getAttribute('data-theme') === 'dark');
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystem = (e: MediaQueryListEvent) => { if (!saved()) { apply(e.matches ? 'dark' : 'light', false); setDark(e.matches); } };
    mq.addEventListener('change', onSystem);
    return () => mq.removeEventListener('change', onSystem);
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    const commit = () => { apply(next, true); setDark(next === 'dark'); };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    if (!reduced && doc.startViewTransition && btn.current) {
      const r = btn.current.getBoundingClientRect();
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const vt = doc.startViewTransition(commit);
      vt.ready.then(() => root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(.65, 0, .35, 1)', pseudoElement: '::view-transition-new(root)' },
      )).catch(() => {});
      return;
    }
    if (!reduced) { root.classList.add('theme-fade'); setTimeout(() => root.classList.remove('theme-fade'), 520); }
    commit();
  };

  return (
    <button ref={btn} className="theme-toggle" type="button" aria-label="Dark theme" aria-pressed={dark} title="Toggle dark theme" onClick={toggle}>
      <svg className="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" /></svg>
      <svg className="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" aria-hidden="true"><path d="M20.4 14.6A8.4 8.4 0 0 1 9.4 3.6a8.4 8.4 0 1 0 11 11z" /></svg>
    </button>
  );
}
