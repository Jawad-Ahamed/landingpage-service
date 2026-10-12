'use client';
// A 3px reading-progress line across the top of an article, tied directly to scroll (no easing lag).
import { m, useScroll } from 'motion/react';
import { useLayoutEffect, useRef } from 'react';

export default function ReadingProgress({ target }: { target: string }) {
  const ref = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => { ref.current = document.getElementById(target); }, [target]);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  return <m.div className="read-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />;
}
