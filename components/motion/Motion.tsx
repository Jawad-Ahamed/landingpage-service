'use client';
// Motion primitives shared by every page (Motion, formerly Framer Motion).
// LazyMotion keeps the animation runtime small; MotionConfig honours the visitor's reduced-motion setting.
// Reveals never hide content for crawlers or no-JS visitors: html:not(.js) [data-reveal] stays visible (pages.css).
import { LazyMotion, MotionConfig, domAnimation, m, useMotionValue, useSpring, useInView, animate } from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';

export const EASE = [0.22, 1, 0.36, 1] as const;

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.8, ease: EASE }}>{children}</MotionConfig>
    </LazyMotion>
  );
}

type RevealProps = { children: ReactNode; delay?: number; y?: number; className?: string; as?: 'div' | 'section' | 'li' | 'span' };

/** Fades and rises into place the first time it scrolls into view. */
export function Reveal({ children, delay = 0, y = 26, className, as = 'div' }: RevealProps) {
  const C = m[as];
  return (
    <C data-reveal className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }} transition={{ duration: 0.85, ease: EASE, delay }}>
      {children}
    </C>
  );
}

/** Children rise in one after another (use <StaggerItem> inside). */
export function Stagger({ children, className, gap = 0.07, as = 'div' }: { children: ReactNode; className?: string; gap?: number; as?: 'div' | 'ul' | 'ol' }) {
  const C = m[as];
  return (
    <C data-reveal className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}>
      {children}
    </C>
  );
}
export function StaggerItem({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'li' | 'article' }) {
  const C = m[as];
  return (
    <C data-reveal className={className} variants={{ hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }}>
      {children}
    </C>
  );
}

/** Hero headline lines: slide up from a soft blur. Opacity is never 0, so the largest paint isn't delayed. */
export function HeroLine({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <m.span className={className} style={{ display: 'block' }} initial={{ y: '0.35em', filter: 'blur(10px)', opacity: 0.35 }}
      animate={{ y: 0, filter: 'blur(0px)', opacity: 1 }} transition={{ duration: 0.95, ease: EASE, delay }}>
      {children}
    </m.span>
  );
}

/** Pulls gently toward the cursor (desktop pointers only). */
export function Magnetic({ children, strength = 0.22 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  return (
    <m.span ref={ref} style={{ x, y, display: 'inline-flex' }}
      onPointerMove={e => {
        if (e.pointerType !== 'mouse' || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}>
      {children}
    </m.span>
  );
}

/** Counts up to a number when it scrolls into view. */
export function CountUp({ to, prefix = '', suffix = '', decimals = 0 }: { to: number; prefix?: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fmt = (v: number) => `${prefix}${v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
    if (reduce) { el.textContent = fmt(to); return; }
    const c = animate(0, to, { duration: 1.4, ease: EASE, onUpdate: v => { el.textContent = fmt(v); } });
    return () => c.stop();
  }, [inView, to, prefix, suffix, decimals]);
  return <span ref={ref}>{`${prefix}${to.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`}</span>;
}
