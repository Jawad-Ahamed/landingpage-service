'use client';
// Admin Hours ROI Calculator. Free to use; only requesting a copy of the results asks for an address.
// Assumptions are shown on the page and kept conservative: the hand-off share is the visitor's own estimate.
import { useMemo, useState } from 'react';
import { m, AnimatePresence } from 'motion/react';
import LeadForm from './LeadForm';
import { FIRM_TYPES, ROI_LIMITS, WEEKS_PER_MONTH, money, roiResults, wholeNumber as num } from '@/lib/roi';

function Range({ id, label, value, min, max, step = 1, onChange, fmt, hint }: { id: string; label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; fmt: (v: number) => string; hint?: string }) {
  const p = ((value - min) / (max - min)) * 100;
  return (
    <div className="pg-field">
      <div className="pg-field__top"><label htmlFor={id}>{label}</label><output htmlFor={id}>{fmt(value)}</output></div>
      <input id={id} className="pg-range" type="range" min={min} max={max} step={step} value={value} style={{ ['--p' as string]: `${p}%` }} onChange={e => onChange(+e.target.value)} />
      {hint && <small>{hint}</small>}
    </div>
  );
}

function Tick({ value }: { value: string }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <m.span key={value} initial={{ y: '0.5em', opacity: 0, filter: 'blur(4px)' }} animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }} exit={{ y: '-0.5em', opacity: 0 }} transition={{ duration: 0.35 }} style={{ display: 'inline-block' }}>{value}</m.span>
    </AnimatePresence>
  );
}

export default function RoiCalculator() {
  const [type, setType] = useState(FIRM_TYPES[0]);
  const [team, setTeam] = useState(5);
  const [hours, setHours] = useState(FIRM_TYPES[0].hours);
  const [rate, setRate] = useState(FIRM_TYPES[0].rate);
  const [share, setShare] = useState(35);
  const [emailOpen, setEmailOpen] = useState(false);

  const r = useMemo(() => roiResults({ team, hours, rate, share }), [team, hours, rate, share]);

  const pickType = (t: typeof FIRM_TYPES[number]) => { setType(t); setHours(t.hours); setRate(t.rate); };

  return (
    <div className="pg-calc">
      <div className="pg-calc__in">
        <fieldset className="pg-field pg-seg">
          <legend>Your firm</legend>
          {FIRM_TYPES.map(t => <button key={t.id} type="button" className="pg-filter" aria-pressed={type.id === t.id} onClick={() => pickType(t)}>{t.label}</button>)}
        </fieldset>
        <Range id="team" label="People doing admin" value={team} {...ROI_LIMITS.team} onChange={setTeam} fmt={v => `${v}`} />
        <Range id="hours" label="Admin hours per person, per week" value={hours} {...ROI_LIMITS.hours} onChange={setHours} fmt={v => `${v} h`} hint="Chasing documents, re-keying, inbox triage, reconciling, building reports." />
        <Range id="rate" label="What an hour of their time is worth" value={rate} {...ROI_LIMITS.rate} onChange={setRate} fmt={v => money(v)} hint="Billing rate, or loaded cost for non-billable staff." />
        <Range id="share" label="Share of that admin you'd hand off" value={share} {...ROI_LIMITS.share} onChange={setShare} fmt={v => `${v}%`} hint="Your estimate. Agents prep; people still review, so start conservative." />
      </div>

      <div className="pg-calc__out" aria-live="polite">
        <span className="eyebrow">Hours back every month</span>
        <div className="pg-big"><Tick value={num(r.back)} /> <span style={{ fontSize: '.4em', letterSpacing: '-.02em' }}>hours</span></div>
        <div className="pg-calc__rows">
          <div><span>Admin hours today, per month</span><b>{num(r.adminMonth)} h</b></div>
          <div><span>Hours back per person, per month</span><b>{r.perPerson.toFixed(1)} h</b></div>
          <div><span>Value of hours back, per month</span><b><Tick value={money(r.value)} /></b></div>
          <div><span>Per year</span><b><Tick value={money(r.year)} /></b></div>
          <div><span>Suggested plan</span><b>{r.plan.name} · {r.plan.price === null ? 'custom pricing' : `$${r.plan.price}/mo`}</b></div>
        </div>
        <div style={{ marginTop: 22 }}>
          {!emailOpen
            ? <button type="button" className="btn btn--amber" onClick={() => setEmailOpen(true)} style={{ background: '#fff', color: '#0E1B33' }}>Email me these results</button>
            : <div className="pg-final"><LeadForm kind="roi" cta="Email my results" fields={['name', 'firm']} extra={{ firmType: type.label, team, hours, rate, share, hoursBack: Math.round(r.back), valueMonth: Math.round(r.value) }} okTitle={null} done="Your ROI results have been emailed to you." /></div>}
        </div>
        <p className="pg-calc__fine">Estimate only, using {WEEKS_PER_MONTH} weeks a month and your inputs. Actual results depend on your workflows and how much review your work needs.</p>
      </div>
    </div>
  );
}
