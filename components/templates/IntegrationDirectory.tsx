'use client';
// Filterable integrations directory. Every card is a real link in the server HTML; filtering just hides cards.
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { m, AnimatePresence } from 'motion/react';
import type { Integration } from '@/content/data/types';

export default function IntegrationDirectory({ items, categories }: { items: Pick<Integration, 'slug' | 'name' | 'logo' | 'category' | 'blurb'>[]; categories: string[] }) {
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const shown = useMemo(() => items.filter(i => (cat === 'All' || i.category === cat) && (!q || `${i.name} ${i.blurb} ${i.category}`.toLowerCase().includes(q.toLowerCase()))), [items, cat, q]);

  return (
    <div>
      <label className="pg-search"><svg aria-hidden="true"><use href="#i-search" /></svg><span className="sr-only">Search integrations</span>
        <input type="search" placeholder="Search integrations" value={q} onChange={e => setQ(e.target.value)} />
      </label>
      <div className="pg-dir__filters" role="group" aria-label="Filter by category">
        {['All', ...categories].map(c => <button key={c} type="button" className="pg-filter" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      <m.div layout className="pg-grid pg-grid--3">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map(i => (
            <m.div key={i.slug} layout initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .96 }} transition={{ duration: .3 }}>
              <Link className="pg-tile pg-int" href={`/integrations/${i.slug}`} style={{ height: '100%' }}>
                <span className="pg-int__logo"><img src={i.logo} alt="" width={28} height={28} /></span>
                <span className="pg-int__body"><span className="pg-int__cat">{i.category}</span><h3>{i.name}</h3><p>{i.blurb}</p></span>
              </Link>
            </m.div>
          ))}
        </AnimatePresence>
      </m.div>
      {!shown.length && <p className="muted">No match. A <Link href="/integrations/mcp">Custom MCP connector</Link> may bring your tool in.</p>}
    </div>
  );
}
