'use client';
// "Latest articles": keyword search + category chips + a grid that re-flows with layout animation (250 ms, expo).
// All cards are server-rendered links first; filtering only hides cards.
import Link from 'next/link';
import { AnimatePresence, m } from 'motion/react';
import { useMemo, useState } from 'react';
import Cover from './Cover';
import type { Post } from '@/lib/blog';
import { EASE_EXPO } from '@/components/motion/Motion';
import { titleCase } from '@/lib/titleCase';

export type CardPost = Pick<Post, 'slug' | 'title' | 'description' | 'tags' | 'cover' | 'readingMinutes' | 'published'>;
const fmt = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export function PostCard({ p, size = 'md' }: { p: CardPost; size?: 'sm' | 'md' }) {
  return (
    <Link href={`/blog/${p.slug}`} className="post-card group flex h-full flex-col gap-4 text-ink">
      <Cover cover={p.cover} size={size} className="shadow-lift" />
      <span className="eyebrow" style={{ fontSize: 11.5 }}>{p.tags[0]}</span>
      <h3 className="text-[1.2rem] leading-tight tracking-[-0.02em] transition-colors duration-200 ease-expo group-hover:text-cobalt">{titleCase(p.title)}</h3>
      <p className="text-[15.5px] leading-relaxed text-slate">{p.description}</p>
      <span className="mt-auto text-[13.5px] text-faint">{fmt(p.published)} · {p.readingMinutes} min read</span>
    </Link>
  );
}

export default function BlogExplorer({ posts, categories }: { posts: CardPost[]; categories: string[] }) {
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const shown = useMemo(() => posts.filter(p => (cat === 'All' || p.tags.includes(cat)) && (!q || `${p.title} ${p.description} ${p.tags.join(' ')}`.toLowerCase().includes(q.trim().toLowerCase()))), [posts, cat, q]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="pg-dir__filters m-0" role="group" aria-label="Browse by category">
          {['All', ...categories].map(c => <button key={c} type="button" className="pg-filter" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
        </div>
        <label className="pg-search m-0 w-full md:w-[320px]"><svg aria-hidden="true"><use href="#i-search" /></svg><span className="sr-only">Search articles</span>
          <input type="search" placeholder="Search articles" value={q} onChange={e => setQ(e.target.value)} />
        </label>
      </div>
      <m.div layout className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map(p => (
            <m.article key={p.slug} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: EASE_EXPO }}>
              <PostCard p={p} />
            </m.article>
          ))}
        </AnimatePresence>
      </m.div>
      {!shown.length && <p className="text-slate">No articles match. Try another word or category.</p>}
    </div>
  );
}
