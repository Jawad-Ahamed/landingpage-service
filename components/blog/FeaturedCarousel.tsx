'use client';
// Featured posts. Advances every 7 s with a 600 ms expo crossfade and a thin progress line; holds while hovered,
// focused or off-screen, and never auto-advances under reduced motion. Every slide is a real link in the HTML.
import Link from 'next/link';
import { AnimatePresence, m, useInView, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Cover from './Cover';
import type { Post } from '@/lib/blog';
import { EASE_EXPO } from '@/components/motion/Motion';
import { titleCase } from '@/lib/titleCase';

type Slide = Pick<Post, 'slug' | 'title' | 'description' | 'tags' | 'cover' | 'readingMinutes' | 'published'>;
const HOLD = 7000;
const fmt = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function FeaturedCarousel({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const auto = !reduce && !held && inView && slides.length > 1;
  const go = useCallback((n: number) => setI((n + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => go(i + 1), HOLD);
    return () => clearTimeout(t);
  }, [auto, i, go]);

  const s = slides[i];
  return (
    <div ref={ref} className="relative" onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)} onFocusCapture={() => setHeld(true)} onBlurCapture={() => setHeld(false)}
      role="region" aria-roledescription="carousel" aria-label="Featured articles">
      <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-14">
        <AnimatePresence mode="wait" initial={false}>
          <m.div key={s.slug} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.6, ease: EASE_EXPO }}
            className="flex min-w-0 flex-col gap-4" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`}>
            <span className="eyebrow">Featured · {s.tags[0]}</span>
            <h2 className="h2" style={{ fontSize: 'clamp(2rem, 3.6vw, 3rem)' }}><Link href={`/blog/${s.slug}`} className="text-ink hover:text-cobalt transition-colors duration-200 ease-expo">{titleCase(s.title)}</Link></h2>
            <p className="lede">{s.description}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14.5px] text-slate">
              <span>{fmt(s.published)}</span><span aria-hidden="true">·</span><span>{s.readingMinutes} min read</span>
            </div>
            <div><Link className="btn btn--primary" href={`/blog/${s.slug}`}>Read the guide <svg className="arrow" aria-hidden="true"><use href="#i-arrow" /></svg></Link></div>
          </m.div>
        </AnimatePresence>
        <AnimatePresence mode="wait" initial={false}>
          <m.div key={s.slug + '-c'} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.99 }} transition={{ duration: 0.6, ease: EASE_EXPO }}>
            <Link href={`/blog/${s.slug}`} className="post-card block shadow-lift rounded-xl2" tabIndex={-1} aria-hidden="true"><Cover cover={s.cover} size="lg" /></Link>
          </m.div>
        </AnimatePresence>
      </div>

      {slides.length > 1 && (
        <div className="mt-8 flex items-center gap-4">
          <div className="flex flex-1 gap-2" role="tablist" aria-label="Choose a featured article">
            {slides.map((sl, k) => (
              <button key={sl.slug} type="button" role="tab" aria-selected={k === i} aria-label={sl.title} onClick={() => go(k)}
                className="group relative h-[3px] flex-1 overflow-hidden rounded-full bg-rule">
                <span className={`absolute inset-y-0 left-0 rounded-full bg-cobalt ${k < i ? 'w-full' : 'w-0'}`}
                  style={k === i ? (auto ? { width: '100%', animation: `cvProgress ${HOLD}ms linear both` } : { width: '100%' }) : undefined} key={k === i ? `${i}-${auto}` : undefined} />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" className="pg-filter grid w-10 place-items-center px-0" onClick={() => go(i - 1)} aria-label="Previous featured article"><svg className="h-4 w-4 rotate-180" aria-hidden="true"><use href="#i-arrow" /></svg></button>
            <button type="button" className="pg-filter grid w-10 place-items-center px-0" onClick={() => go(i + 1)} aria-label="Next featured article"><svg className="h-4 w-4" aria-hidden="true"><use href="#i-arrow" /></svg></button>
          </div>
        </div>
      )}
    </div>
  );
}
