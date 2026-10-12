'use client';
// "On this page" for long articles: highlights the section you're reading.
import { useEffect, useState } from 'react';

export default function Toc({ headings }: { headings: { id: string; text: string }[] }) {
  const [current, setCurrent] = useState('');
  useEffect(() => {
    const els = headings.map(h => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(es => {
      const vis = es.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) setCurrent(vis[0].target.id);
    }, { rootMargin: '0px 0px -70% 0px' });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [headings]);
  if (!headings.length) return null;
  return (
    <nav className="pg-toc" aria-label="On this page">
      <b className="eyebrow">On this page</b>
      {headings.map(h => <a key={h.id} href={`#${h.id}`} className={current === h.id ? 'is-current' : undefined}>{h.text}</a>)}
    </nav>
  );
}
