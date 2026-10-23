'use client';
// "Every leading model, one private workspace": Auto routes each task to a model provider. Tasks cycle while
// on screen; the wire from Auto to the chosen provider lights and a pulse travels along it (600 ms expo).
// Routing pairs are illustrative examples, not benchmarks. The last row is MetaWurks' own Private LLM (Private mode).
import { m, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { EASE_EXPO } from '@/components/motion/Motion';
import { Incognito } from './PrivateMode';

const PROVIDERS: { id: string; company: string; model: string; private?: boolean }[] = [
  { id: 'openai', company: 'OpenAI', model: 'GPT' },
  { id: 'anthropic', company: 'Anthropic', model: 'Claude' },
  { id: 'google', company: 'Google', model: 'Gemini' },
  { id: 'xai', company: 'xAI', model: 'Grok' },
  { id: 'deepseek', company: 'DeepSeek', model: 'DeepSeek' },
  { id: 'private', company: 'MetaWurks', model: 'Private LLM', private: true },
];
const TASKS = [
  { v: 'Legal', text: 'Summarize a 300-page deposition with cites', to: 'anthropic' },
  { v: 'Accounting', text: 'Reconcile a 4,000-row payout export', to: 'openai' },
  { v: 'Healthcare', text: 'Extract criteria from a scanned payer policy', to: 'google' },
  { v: 'Everyday', text: 'Draft a quick client reply', to: 'deepseek' },
  { v: 'Research', text: 'Summarize this week\'s rule changes from the web', to: 'xai' },
  { v: 'Private mode', text: 'Review a client\'s engagement letter in Private mode', to: 'private' },
];
const ROW = 64; // px between provider rows (matches CSS)

export default function ModelRouter() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!inView || reduce) return;
    const t = setInterval(() => setI(n => (n + 1) % TASKS.length), 2600);
    return () => clearInterval(t);
  }, [inView, reduce]);
  const task = TASKS[i];
  const target = PROVIDERS.findIndex(p => p.id === task.to);
  const H = ROW * (PROVIDERS.length + 1); // provider rows + the "+ more" row

  return (
    <section className="section" id="models" aria-labelledby="models-h">
      <div className="container grid items-center gap-12 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <div className="flex flex-col gap-5">
          <span className="eyebrow">Model choice</span>
          <h2 className="h2" id="models-h">Leading AI Models, One Workspace. <span className="hl">Plus Our Own Private LLM.</span></h2>
          <p className="lede" data-read>Use leading AI models from one workspace. Leave it on Auto and each task goes to the model that suits it. For the sensitive work, switch to Private mode, which is designed to use our own model instead.</p>
          <ul className="pg-list">
            <li><svg aria-hidden="true"><use href="#i-check" /></svg><span data-read>Switch models per conversation, without separate accounts or logins.</span></li>
            <li><svg aria-hidden="true"><use href="#i-check" /></svg><span data-read>The same rules whichever model answers: cited sources, drafts that wait for approval, data never sold.</span></li>
            <li><svg aria-hidden="true"><use href="#i-lock" /></svg><span data-read><b>Private mode:</b> designed so what you type or attach isn&apos;t sent to an outside AI provider. <a href="#private">See how it works</a>.</span></li>
          </ul>
          <p className="pg-claims" style={{ marginTop: 0 }}>Example routing. Auto chooses the model for each task.</p>
        </div>

        <div ref={ref} className="mr-panel">
          <div className="mr-task">
            <span className="text-[12px] font-semibold uppercase tracking-[.08em] text-faint">Task</span>
            <m.div key={i} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE_EXPO }}>
              <span className={`pill ${task.to === 'private' ? 'pill--grn' : 'pill--cob'}`}>{task.v}</span>
              <p className="mt-2 text-[17px] font-semibold tracking-[-0.01em] text-ink">{task.text}</p>
            </m.div>
          </div>
          <div className="mr-route">
            <div className={`mr-auto${task.to === 'private' ? ' is-private' : ''}`}>{task.to === 'private' ? <Incognito /> : <svg aria-hidden="true"><use href="#i-sparkle" /></svg>}<b>{task.to === 'private' ? 'Private' : 'Auto'}</b><span>{task.to === 'private' ? 'stays with us' : 'picks per task'}</span></div>
            <svg className="mr-wires" viewBox={`0 0 120 ${H}`} style={{ height: H }} preserveAspectRatio="none" aria-hidden="true">
              {PROVIDERS.map((p, k) => {
                const y = ROW / 2 + k * ROW;
                const d = `M0 ${H / 2} C 60 ${H / 2}, 60 ${y}, 120 ${y}`;
                const on = k === target;
                return (
                  <g key={p.id}>
                    <path d={d} className={`mr-wire${on ? ' is-on' : ''}${p.private ? ' is-private' : ''}`} vectorEffect="non-scaling-stroke" />
                    {on && !reduce && <m.path key={`${i}-p`} d={d} className="mr-pulse" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0, pathOffset: 0 }} animate={{ pathLength: 0.18, pathOffset: 0.82 }} transition={{ duration: 0.6, ease: EASE_EXPO }} />}
                  </g>
                );
              })}
            </svg>
            <ul className="mr-providers">
              {PROVIDERS.map((p, k) => (
                <li key={p.id} className={[k === target ? 'is-on' : '', p.private ? 'mr-private' : ''].join(' ').trim() || undefined}>
                  <span className="mr-dot" aria-hidden="true" /><b>{p.model}{p.private && <em className="mr-new">New</em>}</b><span>{p.company}</span>
                </li>
              ))}
              <li className="mr-more"><span className="mr-dot" aria-hidden="true" /><b>+ more</b><span>as they launch</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
