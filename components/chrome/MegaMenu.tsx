'use client';
// Desktop mega-menu: opens on hover (with a short intent delay) or click, closes on Escape / outside click.
// Panels animate in with Motion. Links are plain <a>/<Link>, so everything is crawlable.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, m } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { MenuGroup } from '@/lib/menu';

export default function MegaMenu({ groups }: { groups: MenuGroup[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrap = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(null), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(null); (document.querySelector(`[data-mm="${open}"]`) as HTMLElement | null)?.focus(); } };
    const onDown = (e: PointerEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(null); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown); };
  }, [open]);

  const enter = (label: string) => { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(label), 90); };
  const leave = () => { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(null), 160); };

  return (
    <nav ref={wrap} className="nav__links" aria-label="Primary">
      {groups.map(g => g.href && !g.items ? (
        <Link key={g.label} href={g.href} aria-current={pathname === g.href ? 'page' : undefined}>{g.label}</Link>
      ) : (
        <div key={g.label} className="mm-wrap" onPointerEnter={e => e.pointerType === 'mouse' && enter(g.label)} onPointerLeave={e => e.pointerType === 'mouse' && leave()}>
          <button type="button" className="mm-trigger" data-mm={g.label} aria-expanded={open === g.label} aria-controls={`mm-${g.label}`} onClick={() => setOpen(o => (o === g.label ? null : g.label))}>
            {g.label}<svg aria-hidden="true"><use href="#i-chev" /></svg>
          </button>
          <AnimatePresence>
            {open === g.label && (
              <m.div id={`mm-${g.label}`} className="mm" style={{ ['--cols' as string]: g.cols || 2, x: '-50%' }}
                initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.985 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
                <div className="mm__grid">
                  {g.items!.map((it, k) => (
                    <m.div key={it.href + it.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * k, duration: 0.25 }}>
                      <Link className="mm__item" href={it.href} onClick={() => setOpen(null)}>
                        <span className="mm__ico">{it.img ? <img src={it.img} alt="" /> : <svg aria-hidden="true"><use href={`#i-${it.icon || 'arrow'}`} /></svg>}</span>
                        <span><b>{it.label}</b>{it.desc && <span>{it.desc}</span>}</span>
                      </Link>
                    </m.div>
                  ))}
                </div>
                {g.foot && <div className="mm__foot"><span>{g.foot.text}</span><Link href={g.foot.link.href} onClick={() => setOpen(null)}>{g.foot.link.label}<svg aria-hidden="true"><use href="#i-arrow" /></svg></Link></div>}
              </m.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </nav>
  );
}
