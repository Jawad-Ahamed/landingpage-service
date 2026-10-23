'use client';
// "Agents at work": an illustrative live feed of agent steps across law, accounting and healthcare.
// New events arrive every ~2 s only while the feed is on screen (layout animation, 250 ms expo).
// Fictional firms and sample data; reduced motion shows a still list.
import { AnimatePresence, m, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { EASE_EXPO } from '@/components/motion/Motion';

type V = 'legal' | 'acct' | 'health';
type Ev = { v: V; agent: string; text: string; pill: string; tone: 'grn' | 'amb' | 'cob' | 'gray' };

const POOL: Ev[] = [
  { v: 'legal', agent: 'Matter Summary', text: 'Read 42 files in Alvarez v. Coastline Freight', pill: '42 files', tone: 'gray' },
  { v: 'acct', agent: 'Tax Prep', text: 'Matched 14 1099s to bank deposits for Harbor & Pine', pill: 'Matched', tone: 'grn' },
  { v: 'health', agent: 'Prior Auth', text: 'Checked payer criteria for lumbar MRI (CPT 72148)', pill: 'Criteria met', tone: 'grn' },
  { v: 'legal', agent: 'Matter Summary', text: 'Exhibit C cited in complaint, not found in folder', pill: 'Needs review', tone: 'amb' },
  { v: 'acct', agent: 'Month-end close', text: 'Reconciled 214 Stripe payouts to Xero deposits', pill: '214 matched', tone: 'grn' },
  { v: 'health', agent: 'Intake', text: 'Patient intake read for a prior-auth packet', pill: 'Needs sign-off', tone: 'cob' },
  { v: 'acct', agent: 'Collections', text: 'Drafted 5 overdue reminders in Gmail', pill: 'Not sent', tone: 'cob' },
  { v: 'legal', agent: 'Deadlines', text: 'Mapped 9 key dates, Mar 2023 → Jun 2025, each cited', pill: 'Cited', tone: 'cob' },
  { v: 'health', agent: 'Prior Auth', text: 'Referring provider NPI missing from the packet', pill: 'Needs review', tone: 'amb' },
  { v: 'acct', agent: 'Tax Prep', text: 'Client document request drafted for 3 missing receipts', pill: 'Waiting for OK', tone: 'cob' },
  { v: 'legal', agent: 'Engagement', text: 'Found 4 clients with unsigned engagement letters in Drive', pill: '4 found', tone: 'gray' },
  { v: 'health', agent: 'Scheduling', text: 'Follow-up visit summary drafted for clinician review', pill: 'Draft', tone: 'cob' },
];
const LABEL: Record<V, string> = { legal: 'Legal', acct: 'Accounting', health: 'Healthcare' };
const TAG: Record<V, string> = { legal: 'tag--legal', acct: 'tag--acct', health: 'tag--health' };
const MAX = 6;

export default function ActivityFeed() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<'all' | V>('all');
  const [items, setItems] = useState(() => POOL.slice(0, MAX).map((e, i) => ({ ...e, id: i, at: MAX - i })));
  const next = useRef(MAX);

  useEffect(() => {
    if (!inView || reduce) return;
    const t = setInterval(() => {
      setItems(prev => {
        const e = POOL[next.current % POOL.length];
        const id = next.current++;
        return [{ ...e, id, at: 0 }, ...prev.map(p => ({ ...p, at: p.at + 1 }))].slice(0, MAX * 2);
      });
    }, 2100);
    return () => clearInterval(t);
  }, [inView, reduce]);

  const shown = useMemo(() => items.filter(i => filter === 'all' || i.v === filter).slice(0, MAX), [items, filter]);
  const counts = useMemo(() => ({ legal: items.filter(i => i.v === 'legal').length, acct: items.filter(i => i.v === 'acct').length, health: items.filter(i => i.v === 'health').length }), [items]);

  return (
    <section className="section section--paper" id="activity" aria-labelledby="act-h">
      <div className="container grid items-center gap-10 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:gap-16">
        <div className="flex flex-col gap-5">
          <span className="eyebrow">Agents at work</span>
          <h2 className="h2" id="act-h">Matters, Returns and Prior Auths, <span className="hl">Moving at Once.</span></h2>
          <p className="lede" data-read>While your team is with clients and patients, agents work across every practice area: reading, matching, drafting and flagging. Anything uncertain waits for a person.</p>
          <div className="grid grid-cols-3 gap-3">
            {(['legal', 'acct', 'health'] as V[]).map(v => (
              <div key={v} className="rounded-xl2 border border-rule bg-surface p-4">
                <span className={`tag ${TAG[v]}`}>{LABEL[v]}</span>
                <b className="mt-3 block text-[28px] font-bold tracking-[-0.04em] tabular-nums">{counts[v]}</b>
                <span className="text-[13px] text-slate">steps in this feed</span>
              </div>
            ))}
          </div>
        </div>

        <div ref={ref} className="act-panel" aria-label="Sample agent activity">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule-soft px-5 py-4">
            <span className="flex items-center gap-2 text-[14px] font-semibold"><i className="act-live" aria-hidden="true" />Agent activity <span className="font-normal text-faint">· example</span></span>
            <div className="flex gap-1.5" role="group" aria-label="Filter activity">
              {(['all', 'legal', 'acct', 'health'] as const).map(f => (
                <button key={f} type="button" className="pg-filter" style={{ height: 30, padding: '0 12px', fontSize: 13 }} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f === 'all' ? 'All' : LABEL[f]}</button>
              ))}
            </div>
          </div>
          <m.ul layout className="flex min-h-[420px] flex-col gap-2 p-3" aria-live="off">
            <AnimatePresence initial={false} mode="popLayout">
              {shown.map(e => (
                <m.li key={e.id} layout initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: EASE_EXPO }}
                  className={`act-row${e.tone === 'amb' ? ' is-flag' : ''}`}>
                  <span className={`tag ${TAG[e.v]}`}>{LABEL[e.v]}</span>
                  <span className="min-w-0"><b>{e.agent}</b><span>{e.text}</span></span>
                  <span className={`pill pill--${e.tone}`}>{e.pill}</span>
                  <time className="act-time">{e.at === 0 ? 'now' : `${e.at * 2}m`}</time>
                </m.li>
              ))}
            </AnimatePresence>
          </m.ul>
        </div>
      </div>
    </section>
  );
}
