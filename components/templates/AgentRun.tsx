'use client';
// The animated "agent run" card (same look as the home page): steps tick off one by one while the card is on
// screen, hold on the finished state, then replay. Reduced motion shows the finished run.
import { useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { AgentRun as Run } from '@/content/data/types';
import { INTEGRATIONS } from '@/content/data/integrations';
import { titleCase } from '@/lib/titleCase';

const STEP_MS = 720, HOLD_MS = 4200;

export default function AgentRun({ run, asks, apps = [], note = 'Sample run · fictional data' }: { run: Run; asks?: [string, string][]; apps?: string[]; note?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const [step, setStep] = useState(run.steps.length);   // server + no-JS: the finished run
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (!inView || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setStep(run.steps.length); setActive(-1); return; }
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) => new Promise<void>(r => timers.push(setTimeout(r, ms)));
    (async () => {
      while (!cancelled) {
        setStep(0); setActive(-1);
        await wait(450);
        for (let i = 0; i < run.steps.length && !cancelled; i++) {
          setActive(i); await wait(STEP_MS * 0.75);
          if (cancelled) return;
          setActive(-1); setStep(i + 1); await wait(STEP_MS * 0.25);
        }
        await wait(HOLD_MS);
      }
    })();
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [inView, run.steps.length]);

  const done = step >= run.steps.length;
  const chips = apps.map(s => INTEGRATIONS.find(i => i.slug === s)).filter(Boolean).slice(0, 3);

  return (
    <div>
      <div ref={ref} className={`run${done ? ' is-done' : ''}`}>
        <div className="run__head">
          <div className="run__title"><h3>{titleCase(run.title)}</h3></div>
          <div className="run__state" aria-hidden="true"><i className="spin" /><span className="ok"><svg><use href="#i-check" /></svg></span></div>
        </div>
        {chips.length > 0 && (
          <div className="run__apps">
            {chips.map(i => <span key={i!.slug} className="chip"><img className="app-ico" src={i!.logo} alt="" />{i!.name}<span className="dot"><span className="sr-only">connected</span></span></span>)}
          </div>
        )}
        {asks && asks.length > 0 && <div className="run__asks">Asks: {asks.map(([q, a]) => <span key={q}>{q} <b>{a}</b></span>)}</div>}
        <ol className="run__steps">
          {run.steps.map((s, i) => (
            <li key={s.label} className={`rstep${s.flag ? ' is-flag' : ''}${i < step ? ' is-done' : ''}${i === active ? ' is-active' : ''}`}>
              <span className="box"><svg><use href={s.flag ? '#i-flag' : '#i-check'} /></svg></span>
              {s.label}
              {s.pill ? <span className={`pill pill--${s.pill.tone}`}>{s.pill.text}</span> : <span />}
            </li>
          ))}
        </ol>
        <div className="run__foot"><span className="rdy">{run.done}</span><span className="btn btn--primary" aria-hidden="true">Review</span></div>
      </div>
      <p className="run-note">{note}</p>
    </div>
  );
}
