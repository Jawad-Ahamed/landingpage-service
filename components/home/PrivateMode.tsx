'use client';
// "Private mode": MetaWurks' new incognito mode. A faithful, simplified recreation of the product screen plays a
// short loop while on screen: the public workspace, a click on the incognito button, the "Switch to Private mode?"
// confirmation, then "Welcome to Private mode", where a prompt is answered by MetaWurks' own Private LLM.
// Viewers can flip Public / Private themselves (which stops the loop). Reduced motion shows the private state.
import { AnimatePresence, m, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { EASE_EXPO } from '@/components/motion/Motion';

export function Incognito({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 11.5h18" /><path d="M5.5 11.5 7.4 5.6a1 1 0 0 1 1.3-.6l3.3 1.3 3.3-1.3a1 1 0 0 1 1.3.6l1.9 5.9" />
      <circle cx="7.5" cy="16.5" r="2.6" /><circle cx="16.5" cy="16.5" r="2.6" /><path d="M10.1 16.3c1.2-.8 2.6-.8 3.8 0" />
    </svg>
  );
}

type Phase = 'public' | 'press' | 'modal' | 'confirm' | 'private';
const SCRIPT: [Phase, number][] = [['public', 2200], ['press', 700], ['modal', 1700], ['confirm', 600], ['private', 5200]];
const PROMPT = 'Summarize the Alvarez engagement letter and flag unusual terms';

const NAV = [
  ['i-bot', 'Agents & Skills'], ['i-library', 'Knowledge Source'], ['i-file', 'Data Library', 'sub'], ['i-plug', 'Integrations', 'sub'], ['i-folder', 'Projects'],
];

export default function PrivateMode() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [manual, setManual] = useState<null | 'public' | 'private'>(null);

  useEffect(() => {
    if (!inView || reduce || manual) return;
    const t = setTimeout(() => setStep(s => (s + 1) % SCRIPT.length), SCRIPT[step][1]);
    return () => clearTimeout(t);
  }, [inView, reduce, manual, step]);

  const phase: Phase = manual ?? (reduce ? 'private' : SCRIPT[step][0]);
  const isPrivate = phase === 'private';
  const modal = phase === 'modal' || phase === 'confirm';
  const cursor = phase === 'press' ? 'c-toggle' : phase === 'modal' ? 'c-mid' : phase === 'confirm' ? 'c-confirm' : 'c-rest';

  return (
    <section className="section" id="private" aria-labelledby="pm-h">
      <div className="container">
        <div className="section-head section-head--center">
          <span className="eyebrow pm-eyebrow"><em>New</em>Private mode</span>
          <h2 className="h2" id="pm-h">Incognito for Your Firm&apos;s AI. <span className="hl">Nothing Goes to an Outside Provider.</span></h2>
          <p className="lede" data-read>One click switches any conversation to Private mode. MetaWurks then answers with our own model, running on our own servers. What you type and attach is never sent to an outside AI provider.</p>
        </div>

        <div className="pm-switch" role="group" aria-label="Show the workspace in">
          <button type="button" aria-pressed={!isPrivate} onClick={() => setManual('public')}>Public models</button>
          <button type="button" aria-pressed={isPrivate} onClick={() => setManual('private')}><Incognito />Private mode</button>
          <i className="pm-switch__pill" data-on={isPrivate ? 'private' : 'public'} aria-hidden="true" />
        </div>

        <div ref={ref} className={`pm-app${isPrivate ? ' is-private' : ''}`} aria-label="Illustration of the MetaWurks workspace switching to Private mode" role="img">
          <aside className="pm-side" aria-hidden="true">
            <div className="pm-brand"><img src="/assets/brand/metawurks-mark.png" alt="" className="is-lt" /><img src="/assets/brand/metawurks-mark-dark.png" alt="" className="is-dk" /><b>MetaWurks</b></div>
            <span className="pm-new"><svg><use href="#i-edit" /></svg>New Conversation</span>
            {NAV.map(([ico, label, sub]) => <span key={label} className={`pm-nav${sub ? ' pm-nav--sub' : ''}`}><svg><use href={`#${ico}`} /></svg>{label}</span>)}
            <hr />
            <span className="pm-label">Conversations</span>
            <span className="pm-search">Search All Conversations<svg><use href="#i-search" /></svg></span>
            <span className="pm-conv">Research this and give me…<svg><use href="#i-lock" /></svg></span>
            <span className="pm-conv">I want to know about…</span>
            <span className="pm-conv">Give me recent 5 emails…</span>
          </aside>

          <div className="pm-main">
            <div className="pm-top" aria-hidden="true">
              <span className={`pm-ico pm-ico--incog${isPrivate ? ' is-on' : ''}${phase === 'press' ? ' is-press' : ''}`}><Incognito /></span>
              <span className="pm-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg></span>
              <span className="pm-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></svg></span>
            </div>

            <div className={`pm-stage${modal ? ' is-blur' : ''}`} aria-hidden="true">
              <AnimatePresence mode="wait" initial={false}>
                {isPrivate ? (
                  <m.div key="priv" className="pm-hello" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5, ease: EASE_EXPO }}>
                    <span className="pm-orb"><Incognito /></span>
                    <h3>Welcome to Private mode</h3>
                    <p>Your chat stays on our own servers. Nothing goes to an outside provider.</p>
                  </m.div>
                ) : (
                  <m.div key="pub" className="pm-hello" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5, ease: EASE_EXPO }}>
                    <span className="pm-globe" />
                    <h3>Good morning, <span className="pm-grad">Alex</span></h3>
                    <p>What are we working on?</p>
                  </m.div>
                )}
              </AnimatePresence>

              <div className="pm-composer">
                <span className="pm-input">{isPrivate && !reduce ? <Typed text={PROMPT} /> : isPrivate ? PROMPT : 'Ask anything…'}</span>
                <div className="pm-tools">
                  <span className="pm-chip pm-chip--sq"><svg><use href="#i-plus" /></svg></span>
                  {!isPrivate && <><span className="pm-chip"><svg><use href="#i-file" /></svg>Data Library</span><span className="pm-chip"><svg><use href="#i-plug" /></svg>Integrations</span></>}
                  <span className="pm-grow" />
                  {isPrivate
                    ? <span className="pm-chip pm-chip--priv"><Incognito />Private LLM · our servers</span>
                    : <><span className="pm-chip"><svg><use href="#i-globe" /></svg>Web</span><span className="pm-chip">Auto<svg><use href="#i-chev" /></svg></span></>}
                  <span className="pm-round pm-round--mic"><svg><use href="#i-mic" /></svg></span>
                  <span className="pm-round"><svg><use href="#i-send" /></svg></span>
                </div>
              </div>

              <div className="pm-cards">
                {[['Research', 'Get a clear, well-sourced summary on anything you\'re exploring.'], ['Improve writing', 'Sharpen tone and clarity while keeping your own voice.'], ['Meeting notes', 'Turn raw notes into decisions and action items.']].map(([t, b]) => (
                  <span key={t} className="pm-card"><b>{t}</b>{b}</span>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {modal && (
                <m.div className="pm-modal" aria-hidden="true" initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4, ease: EASE_EXPO }}>
                  <span className="pm-modal__ico"><Incognito /></span>
                  <b>Switch to Private mode?</b>
                  <p>Private mode answers with our own model, running on our servers. What you type and attach is never sent to an outside AI provider.</p>
                  <div><span className="pm-btn-text">Stay in public</span><span className={`pm-btn${phase === 'confirm' ? ' is-press' : ''}`}>Switch to private</span></div>
                </m.div>
              )}
            </AnimatePresence>

            {!manual && !reduce && <i className={`pm-cursor ${cursor}`} aria-hidden="true" />}
          </div>
        </div>

        <ul className="pm-points">
          <li><span><Incognito /></span><div><b>One click, any conversation</b><p data-read>Flip to Private mode from the top bar, like an incognito window. Flip back when you want the outside models again.</p></div></li>
          <li><span><svg aria-hidden="true"><use href="#i-cloud" /></svg></span><div><b>Our model, our servers</b><p data-read>Answers come from the MetaWurks Private LLM, hosted by us. No outside AI provider sees the prompt or the files.</p></div></li>
          <li><span><svg aria-hidden="true"><use href="#i-scale" /></svg></span><div><b>Made for the sensitive work</b><p data-read>Privileged matters, client tax files and engagement letters can stay with the one vendor you already vetted.</p></div></li>
        </ul>
      </div>
    </section>
  );
}

function Typed({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const t = setInterval(() => setN(v => (v >= text.length ? v : v + 1)), 28);
    return () => clearInterval(t);
  }, [text]);
  return <>{text.slice(0, n)}<i className="pm-caret" /></>;
}
