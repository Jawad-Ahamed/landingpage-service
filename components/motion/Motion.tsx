'use client';
// Motion primitives (Motion, formerly Framer Motion). One motion language for the whole site:
//   • easing: EASE_EXPO [0.16, 1, 0.3, 1] (ultra-smooth easeOutExpo) or EASE_LUXE [0.22, 1, 0.36, 1]
//   • durations: micro-interactions ≤ 250 ms, scroll reveals ≤ 600 ms
//   • no springs, no elastic overshoot, no 3D flips
// Reveals never hide content for crawlers or no-JS visitors: html:not(.js) [data-reveal] stays visible.
import { LazyMotion, MotionConfig, domAnimation, m, useInView, animate } from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';

export const EASE_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_LUXE = [0.22, 1, 0.36, 1] as const;
export const DUR = { micro: 0.25, reveal: 0.6 } as const;
/** @deprecated kept for older imports; same as EASE_LUXE */
export const EASE = EASE_LUXE;

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: DUR.reveal, ease: EASE_EXPO }}>{children}</MotionConfig>
    </LazyMotion>
  );
}

const VIEW = { once: true, margin: '0px 0px -10% 0px' } as const;

type RevealProps = { children: ReactNode; delay?: number; y?: number; className?: string; as?: 'div' | 'section' | 'li' | 'span' };

/** Rises 16–24px into place the first time it scrolls into view (600 ms, expo). */
export function Reveal({ children, delay = 0, y = 20, className, as = 'div' }: RevealProps) {
  const C = m[as];
  return (
    <C data-reveal className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEW} transition={{ duration: DUR.reveal, ease: EASE_EXPO, delay }}>
      {children}
    </C>
  );
}

/** Children rise in one after another (use <StaggerItem> inside). */
export function Stagger({ children, className, gap = 0.06, as = 'div' }: { children: ReactNode; className?: string; gap?: number; as?: 'div' | 'ul' | 'ol' }) {
  const C = m[as];
  return (
    <C data-reveal className={className} initial="hidden" whileInView="show" viewport={VIEW}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}>
      {children}
    </C>
  );
}
export function StaggerItem({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'li' | 'article' }) {
  const C = m[as];
  return (
    <C data-reveal className={className} variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: DUR.reveal, ease: EASE_EXPO } } }}>
      {children}
    </C>
  );
}

/** Hero headline lines: rise from a slight offset. Opacity never starts at 0, so the largest paint isn't delayed. */
export function HeroLine({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <m.span className={className} style={{ display: 'block' }} initial={{ y: '0.3em', opacity: 0.4 }}
      animate={{ y: 0, opacity: 1 }} transition={{ duration: DUR.reveal, ease: EASE_EXPO, delay }}>
      {children}
    </m.span>
  );
}

/** Counts up to a number when it scrolls into view (600 ms, expo). */
export function CountUp({ to, prefix = '', suffix = '', decimals = 0 }: { to: number; prefix?: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const fmt = (v: number) => `${prefix}${v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = animate(0, to, { duration: DUR.reveal, ease: EASE_EXPO, onUpdate: v => { el.textContent = fmt(v); } });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, to]);
  return <span ref={ref}>{fmt(to)}</span>;
}
