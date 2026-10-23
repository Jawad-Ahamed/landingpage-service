'use client';
// One form for every lead type (book a call, contact, resource download, newsletter, ROI results).
// Server actions submit even before JS loads (progressive enhancement); with JS, success shows inline or moves to `next`.
// Validation happens on the server (noValidate), so every browser shows the same accessible, per-field messages.
import { useActionState, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { sendLead } from '@/app/actions/lead';
import type { SubmitResult } from '@/lib/leads/submit';
import { REQUIRED, TOPICS, type LeadField, type LeadKind } from '@/lib/leads/fields';

type Props = {
  kind: LeadKind;
  cta: string;
  resource?: string;
  next?: string;                  // go here after success (e.g. a thanks page with the download)
  fields?: Exclude<LeadField, 'email'>[];
  extra?: Record<string, string | number>;
  done?: string;
  okTitle?: string | null;        // bold lead-in before `done`; null shows `done` on its own
  messageLabel?: string;
};

export default function LeadForm({ kind, cta, resource, next, fields = ['name', 'firm', 'firmType'], extra = {}, done = 'Thanks, we\'ll follow up by email.', okTitle = 'Received.', messageLabel = 'What would you like to hand off?' }: Props) {
  const [state, action, pending] = useActionState<SubmitResult | null, FormData>(sendLead, null);
  const pathname = usePathname();
  const router = useRouter();
  const [started, setStarted] = useState(0);
  const [utm, setUtm] = useState<Record<string, string>>({});
  const form = useRef<HTMLFormElement>(null);
  const uid = useId();

  useEffect(() => {
    setStarted(Date.now());
    const q = new URLSearchParams(window.location.search);
    const u: Record<string, string> = {};
    q.forEach((v, k) => { if (k.startsWith('utm_')) u[k] = v; });
    setUtm(u);
  }, []);
  useEffect(() => { if (state?.ok && next) router.push(next); }, [state, next, router]);
  // After a failed submit, move focus to the first field that needs fixing (the alert is announced either way).
  useEffect(() => {
    if (state && !state.ok) form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);
  // `disabled={pending}` only lands after a re-render, so two clicks in the same tick would both submit.
  // This flag blocks the second one synchronously and clears once the action settles.
  const inFlight = useRef(false);
  useEffect(() => { if (!pending) inFlight.current = false; }, [pending, state]);
  const guard = (e: FormEvent<HTMLFormElement>) => {
    if (inFlight.current) e.preventDefault();
    else inFlight.current = true;
  };

  if (state?.ok && !next) {
    return <div className="pg-form__ok" role="status"><svg aria-hidden="true"><use href="#i-check-c" /></svg><div>{okTitle && <><b>{okTitle}</b> </>}{done}</div></div>;
  }

  const failed = state && !state.ok ? state : null;
  const errs = failed?.fieldErrors || {};
  const vals = failed?.values || {};
  const shown: LeadField[] = ['email', ...fields];
  const req = (f: LeadField) => REQUIRED[kind].includes(f);
  const hidden = Object.entries(errs).filter(([f]) => !shown.includes(f as LeadField)).map(([, m]) => m);
  const id = (f: LeadField) => `${uid}-${f}`;
  // Props every visible control shares: id, name, required state, and the error wiring. Selects also get a key
  // from the echoed value: React never updates a select's defaultValue after mount, so they remount instead.
  const ctl = (f: LeadField) => ({
    id: id(f), name: f, required: req(f), defaultValue: vals[f] ?? '',
    'aria-invalid': errs[f] ? true : undefined,
    'aria-describedby': errs[f] ? `${id(f)}-err` : undefined,
  });
  const label = (f: LeadField, text: string) => (
    <label htmlFor={id(f)}>{text}{req(f) ? <span className="pg-req" aria-hidden="true"> *</span> : <span className="pg-opt"> (optional)</span>}</label>
  );
  const err = (f: LeadField) => errs[f] ? <p className="pg-input__err" id={`${id(f)}-err`}>{errs[f]}</p> : null;

  return (
    <form ref={form} className="pg-form" action={action} onSubmit={guard} noValidate aria-busy={pending || undefined}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="page" value={pathname} />
      {next && <input type="hidden" name="next" value={next} />}
      {resource && <input type="hidden" name="resource" value={resource} />}
      <input type="hidden" name="startedAt" value={started || ''} readOnly />
      {Object.entries(utm).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {Object.entries(extra).map(([k, v]) => <input key={k} type="hidden" name={`x_${k}`} value={String(v)} />)}
      <label className="pg-hp" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      {shown.length > 1 && <p className="pg-form__note">Fields marked <span aria-hidden="true">*</span><span className="sr-only">with an asterisk</span> are required.</p>}

      {(fields.includes('name') || fields.includes('firm')) && (
        <div className="pg-form__row">
          {fields.includes('name') && <div className="pg-input">{label('name', 'Your name')}<input {...ctl('name')} autoComplete="name" maxLength={120} />{err('name')}</div>}
          {fields.includes('firm') && <div className="pg-input">{label('firm', 'Firm')}<input {...ctl('firm')} autoComplete="organization" maxLength={160} />{err('firm')}</div>}
        </div>
      )}
      <div className="pg-input">{label('email', 'Work email')}<input {...ctl('email')} type="email" autoComplete="email" inputMode="email" maxLength={200} />{err('email')}</div>
      {fields.includes('firmType') && (
        <div className="pg-input">{label('firmType', 'Type of firm')}
          <select key={`firmType-${vals.firmType ?? ''}`} {...ctl('firmType')}>
            <option value="">Choose one</option>
            <option>Accounting & tax</option><option>Law firm</option><option>Healthcare practice</option><option>Finance team</option><option>Other</option>
          </select>
          {err('firmType')}
        </div>
      )}
      {fields.includes('topic') && (
        <div className="pg-input">{label('topic', 'What is this about?')}
          <select key={`topic-${vals.topic ?? ''}`} {...ctl('topic')}>
            <option value="">Choose one</option>
            {TOPICS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          {err('topic')}
        </div>
      )}
      {fields.includes('message') && <div className="pg-input">{label('message', messageLabel)}<textarea {...ctl('message')} maxLength={4000} />{err('message')}</div>}
      {failed && <div className="pg-form__err" role="alert"><p>{failed.error}</p>{hidden.map(m => <p key={m}>{m}</p>)}</div>}
      <button className="btn btn--primary" type="submit" disabled={pending}>{pending ? 'Sending…' : cta}</button>
      <p className="pg-form__fine">We use your details only to reply and to send what you asked for. Never sold.{kind !== 'contact' && kind !== 'book' && ' Unsubscribe anytime.'} See our <Link href="/privacy-policy">privacy policy</Link>.</p>
    </form>
  );
}
