'use client';
// THEATRICAL DARK → LIGHT SHIFT: the "documents in, finished prep out" section.
// One useScroll over a tall section drives everything (no timers):
//   • background (MotionValue): canvas → deep charcoal #0B0F19 (entering) → hold → architectural light #F9FAFB;
//   • the foreground tone flips once mid-way (250 ms CSS), so text never sits on a mid-grey at low contrast;
//   • scattered PDFs / spreadsheets glide into a neat stack, then the structured result rises in.
// In the dark theme the band stays dark (charcoal → slate) so the page doesn't flash white.
// Reduced motion: no scroll mapping; the finished, stacked state on a light ground.
import { m, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { titleCase, titlePair } from '@/lib/titleCase';

export type ShiftDoc = { kind: 'PDF' | 'XLSX' | 'CSV' | 'DOCX' | 'SCAN' | 'EML'; name: string };
export type ShiftRow = { label: string; value: string; flag?: boolean };
type Props = {
  eyebrow?: string;
  title?: string;
  hl?: string;
  lede?: string;
  steps?: { title: string; body: string }[];
  docs?: ShiftDoc[];
  result?: { title: string; status: string; rows: ShiftRow[] };
};

const KIND_COLOR: Record<ShiftDoc['kind'], string> = { PDF: '#B42318', XLSX: '#1E7A57', CSV: '#1E7A57', DOCX: '#2440BB', SCAN: '#7A5AF8', EML: '#C2410C' };

/** Accounting-specific version (solution and use-case pages for accounting & tax). */
export const ACCT_SHIFT: Required<Props> = {
  eyebrow: 'Documents in, finished prep out',
  title: 'Every PDF and spreadsheet,',
  hl: 'read, matched and cited.',
  lede: 'Statements, 1099s, receipts and exports arrive from Drive, OneDrive and the inbox. Agents read every page, match it to the ledger and hand back structured prep, with a source on every line.',
  steps: [
    { title: 'Ingest', body: 'Files sync from Google Drive, OneDrive and email attachments. No uploads, no re-keying.' },
    { title: 'Read', body: 'Scans, PDFs and spreadsheets are read page by page, including tables and handwritten totals.' },
    { title: 'Match', body: 'Figures are matched to QuickBooks or Xero, and anything that doesn\'t tie out is flagged.' },
    { title: 'Hand back', body: 'You get workpapers and a cited summary, with "Needs review" items first.' },
  ],
  docs: [
    { kind: 'PDF', name: 'Chase_Statement_Dec.pdf' },
    { kind: 'XLSX', name: 'Payroll_Q4_export.xlsx' },
    { kind: 'SCAN', name: 'Receipts_batch_07.jpg' },
    { kind: 'PDF', name: '1099-NEC_Northwind.pdf' },
    { kind: 'CSV', name: 'Stripe_payouts_2025.csv' },
  ],
  result: {
    title: 'Harbor & Pine · 2025 prep', status: 'Ready for review',
    rows: [
      { label: '1099s matched to deposits', value: '14 / 14' },
      { label: 'Bank statements parsed', value: '12 months' },
      { label: 'Payroll tied to ledger', value: '$412,880' },
      { label: 'Missing receipts', value: '3 · Needs review', flag: true },
      { label: 'Workpapers', value: 'Drafted' },
    ],
  },
};

const DEFAULTS: Required<Props> = {
  eyebrow: 'Documents in, finished prep out',
  title: 'Every PDF, chart and spreadsheet,',
  hl: 'read, matched and cited.',
  lede: 'Depositions, patient intake forms, payer policies, bank statements and 1099s arrive from Drive, OneDrive and the inbox. Agents read every page, match it to the right system and hand back structured prep, with a source on every line.',
  steps: [
    { title: 'Ingest', body: 'Files sync from Google Drive, OneDrive and email attachments. No uploads, no re-keying.' },
    { title: 'Read', body: 'Scans, PDFs and spreadsheets are read page by page, tables and handwriting included.' },
    { title: 'Match', body: 'Facts are matched to the ledger, the matter or the payer\'s criteria, and gaps are flagged.' },
    { title: 'Hand back', body: 'You get cited summaries, packets and workpapers, with "Needs review" items first.' },
  ],
  docs: [
    { kind: 'PDF', name: 'Deposition_Smith_Vol2.pdf' },
    { kind: 'SCAN', name: 'Intake_••••4471.jpg' },
    { kind: 'XLSX', name: 'Payroll_Q4_export.xlsx' },
    { kind: 'PDF', name: 'Payer_Policy_MRI.pdf' },
    { kind: 'PDF', name: '1099-NEC_Northwind.pdf' },
  ],
  result: {
    title: 'This morning, across the firm', status: 'Ready for review',
    rows: [
      { label: 'Alvarez · exhibit list', value: 'Cited' },
      { label: 'Patient ••4471 · prior auth', value: 'Packet ready' },
      { label: 'Harbor & Pine · 1099s', value: '14 / 14 matched' },
      { label: 'Gaps across all three', value: '3 · Needs review', flag: true },
      { label: 'Client and payer drafts', value: 'Waiting for OK' },
    ],
  },
};

// where each document starts (scattered) and ends (stacked), in px relative to the stage
const SCATTER = [[-30, 0, -7], [220, 20, 6], [10, 190, -4], [250, 230, 7], [90, 330, -3]] as const;
const STACK = [[30, 40, 0], [40, 52, 0], [50, 64, 0], [60, 76, 0], [70, 88, 0]] as const;

function Doc({ d, i, p, reduce }: { d: ShiftDoc; i: number; p: MotionValue<number>; reduce: boolean }) {
  const [sx, sy, sr] = SCATTER[i % SCATTER.length];
  const [tx, ty] = STACK[i % STACK.length];
  // timeline (p over the section): enter 0–.42 · pinned .42–1 · dark hold until .62 · light by .86
  const x = useTransform(p, [0.42, 0.62], [sx, tx]);
  const y = useTransform(p, [0.42, 0.62], [sy, ty]);
  const rotate = useTransform(p, [0.42, 0.62], [sr, 0]);
  const opacity = useTransform(p, [0.14 + i * 0.03, 0.3 + i * 0.03], [0, 1]);
  return (
    <m.div className="shift__doc doc-stack" data-tilt style={reduce ? { left: tx, top: ty } : { x, y, rotate, opacity, left: 0, top: 0 }}>
      <header><i style={{ background: KIND_COLOR[d.kind] }}>{d.kind}</i>{d.name}</header>
      <div className="ln" style={{ width: '92%' }} /><div className="ln" style={{ width: '76%' }} /><div className="ln" style={{ width: '84%' }} />
    </m.div>
  );
}

export default function ThemeShift(props: Props) {
  const c = { ...DEFAULTS, ...props } as Required<Props>;
  const ref = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();
  const [dark, setDark] = useState(false);
  const [tone, setTone] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const read = () => setDark(document.documentElement.getAttribute('data-theme') === 'dark');
    read();
    document.addEventListener('mw-theme', read);
    return () => document.removeEventListener('mw-theme', read);
  }, []);

  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const startBg = dark ? '#0B101C' : '#FFFFFF';
  const endBg = dark ? '#0F1522' : '#F9FAFB';
  const bg = useTransform(p, [0, 0.3, 0.62, 0.86], [startBg, '#0B0F19', '#0B0F19', endBg]);
  useMotionValueEvent(p, 'change', v => { const t = dark || (v > 0.15 && v < 0.74) ? 'dark' : 'light'; setTone(prev => (prev === t ? prev : t)); });

  const outY = useTransform(p, [0.6, 0.78], [40, 0]);
  const outOpacity = useTransform(p, [0.6, 0.74], [0, 1]);

  return (
    <m.section ref={ref} className="shift" data-tone={reduce ? (dark ? 'dark' : 'light') : tone} aria-labelledby="shift-h"
      style={{ ['--shift-bg' as string]: reduce ? endBg : bg, height: reduce ? 'auto' : '260vh' }}>
      <div className="shift__stage">
        <div className="container shift__grid">
          <div>
            <span className="eyebrow">{c.eyebrow}</span>
            <h2 className="h2" id="shift-h" style={{ marginTop: 16 }}>{titlePair(c.title, c.hl)[0]} <span style={{ color: 'var(--sh-accent)' }}>{titlePair(c.title, c.hl)[1]}</span></h2>
            <p className="lede" style={{ marginTop: 18 }}>{c.lede}</p>
            <ol className="shift__steps">
              {c.steps.map((s, i) => (
                <li key={s.title} className="shift__step" data-read>
                  <span className="shift__num">{String(i + 1).padStart(2, '0')}</span>
                  <span><b>{s.title}</b><span>{s.body}</span></span>
                </li>
              ))}
            </ol>
          </div>
          <div className="shift__docs" aria-hidden="true">
            {c.docs.map((d, i) => <Doc key={d.name} d={d} i={i} p={p} reduce={reduce} />)}
            <m.div className="shift__out" style={reduce ? undefined : { y: outY, opacity: outOpacity }} data-tilt>
              <h3>{titleCase(c.result.title)}<span className="pill pill--grn">{c.result.status}</span></h3>
              <ul style={{ marginTop: 10 }}>
                {c.result.rows.map(r => <li key={r.label}><span>{r.label}</span><b style={r.flag ? { color: 'var(--amber-dk)' } : undefined}>{r.value}</b></li>)}
              </ul>
            </m.div>
          </div>
        </div>
      </div>
      {/* the same facts for assistive tech, since the visual is decorative */}
      <p className="sr-only">{c.result.title}: {c.result.rows.map(r => `${r.label} ${r.value}`).join('; ')}.</p>
    </m.section>
  );
}
