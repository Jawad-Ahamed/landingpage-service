'use client';
// Top navigation: sticky bar, scroll progress, mobile drawer (non-modal disclosure: Escape or a click outside closes it).
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import ThemeToggle from './ThemeToggle';
import MegaMenu from './MegaMenu';
import type { MenuGroup } from '@/lib/menu';
import { bookHref } from '@/lib/site';

export function Lockup({ size = 50 }: { size?: number }) {
  const word = Math.round(size * 1.68);
  return (
    <span className={size > 50 ? 'lockup lockup--lg' : 'lockup'}>
      <img className="lockup__mark is-lt" src="/assets/brand/metawurks-mark.png" alt="" width={size} height={size} />
      <img className="lockup__mark is-dk" src="/assets/brand/metawurks-mark-dark.png" alt="" width={size} height={size} />
      <img className="lockup__word is-lt" src="/assets/brand/metawurks-wordmark.png" alt="" width={word} height={size} />
      <img className="lockup__word is-dk" src="/assets/brand/metawurks-wordmark-dark.png" alt="" width={word} height={size} />
    </span>
  );
}

export default function Nav({ menu }: { menu: MenuGroup[] }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const nav = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      setScrolled(y > 8);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${Math.min(1, Math.max(0, y / Math.max(1, max))).toFixed(4)})`;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); toggle.current?.focus(); } };
    const onClick = (e: MouseEvent) => { if (nav.current && !nav.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('click', onClick); };
  }, [open]);

  return (
    <>
      <div className="progress" aria-hidden="true"><span ref={bar} /></div>
      <header ref={nav} className={`nav${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
        <div className="container nav__inner">
          <Link className="brand" href="/" aria-label="MetaWurks home"><Lockup /></Link>
          <MegaMenu groups={menu} />
          <div className="nav__cta">
            <ThemeToggle />
            <Link className="nav__signin" href="/#book">Try MetaWurks for free</Link>
            <Link className="btn btn--primary btn--sm" href={bookHref('nav')}>Book a 1:1 call</Link>
            <button ref={toggle} className="nav__toggle" type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="drawer" onClick={() => setOpen(o => !o)}><span /></button>
          </div>
        </div>
        <nav className="nav__drawer" id="drawer" aria-label="Primary">
          {menu.map(g => g.href && !g.items ? <Link key={g.label} href={g.href} onClick={() => setOpen(false)}>{g.label}</Link> : (
            <div key={g.label} className="mm-group"><b>{g.label}</b>{g.items!.map(it => <Link key={it.href + it.label} href={it.href} onClick={() => setOpen(false)}>{it.label}</Link>)}</div>
          ))}
          <Link href="/#book" onClick={() => setOpen(false)}>Try MetaWurks for free</Link>
          <Link className="btn btn--primary" href={bookHref('nav')} onClick={() => setOpen(false)}>Book a 1:1 call</Link>
        </nav>
      </header>
    </>
  );
}
