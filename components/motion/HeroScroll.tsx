'use client';
// Hero → product demo continuity (scroll-tied, no timers):
//   • the headline column drifts down 20px and fades as the hero scrolls away;
//   • the product visual scales 0.95 → 1.0 over the first ~45% of that scroll, settling into focus.
// Driven by a single useScroll on the hero; transforms only (compositor-friendly). Static under reduced motion.
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef, type ReactNode } from 'react';

export default function HeroScroll({ copy, aside, className }: { copy: ReactNode; aside?: ReactNode; className: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 20]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.2]);
  const scale = useTransform(scrollYProgress, [0, 0.45], [0.95, 1]);

  return (
    <div ref={ref} className={className}>
      <m.div className="pg-hero__copy" style={reduce ? undefined : { y, opacity }}>{copy}</m.div>
      {aside && <m.div className="pg-hero__aside" style={reduce ? undefined : { scale, transformOrigin: '50% 0%' }}>{aside}</m.div>}
    </div>
  );
}
