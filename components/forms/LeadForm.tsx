'use client';
// One form for every lead type (book a call, contact, resource download, newsletter, ROI results).
// Server actions submit even before JS loads (progressive enhancement); with JS, success shows inline or moves to `next`.
import { useActionState, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { sendLead } from '@/app/actions/lead';
import type { SubmitResult } from '@/lib/leads/submit';

type Props = {
  kind: 'book' | 'contact' | 'resource' | 'newsletter' | 'roi';
  cta: string;
  resource?: string;
  next?: string;                  // go here after success (e.g. a thanks page with the download)
  fields?: ('name' | 'firm' | 'firmType' | 'message')[];
  extra?: Record<string, string | number>;
  done?: string;
};

export default function LeadForm({ kind, cta, resource, next, fields = ['name', 'firm', 'firmType'], extra = {}, done = 'Thanks! We\'ll be in touch within one business day.' }: Props) {
  const [state, action, pending] = useActionState<SubmitResult | null, FormData>(sendLead, null);
  const pathname = usePathname();
  const router = useRouter();
  const [started, setStarted] = useState(0);
  const [utm, setUtm] = useState<Record<string, string>>({});

  useEffect(() => {
    setStarted(Date.now());
    const q = new URLSearchParams(window.location.search);
    const u: Record<string, string> = {};
    q.forEach((v, k) => { if (k.startsWith('utm_')) u[k] = v; });
    setUtm(u);
  }, []);
  useEffect(() => { if (state?.ok && next) router.push(next); }, [state, next, router]);

  if (state?.ok && !next) {
    return <div className="pg-form__ok" role="status"><svg aria-hidden="true"><use href="#i-check-c" /></svg><div><b>Received.</b> {done}</div></div>;
  }

  return (
    <form className="pg-form" action={action}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="page" value={pathname} />
      {next && <input type="hidden" name="next" value={next} />}
      {resource && <input type="hidden" name="resource" value={resource} />}
      <input type="hidden" name="startedAt" value={started || ''} readOnly />
      {Object.entries(utm).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {Object.entries(extra).map(([k, v]) => <input key={k} type="hidden" name={`x_${k}`} value={String(v)} />)}
      <label className="pg-hp" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>

      {(fields.includes('name') || fields.includes('firm')) && (
        <div className="pg-form__row">
          {fields.includes('name') && <label className="pg-input"><span>Your name</span><input name="name" autoComplete="name" required /></label>}
          {fields.includes('firm') && <label className="pg-input"><span>Firm</span><input name="firm" autoComplete="organization" /></label>}
        </div>
      )}
      <label className="pg-input"><span>Work email</span><input name="email" type="email" autoComplete="email" required /></label>
      {fields.includes('firmType') && (
        <label className="pg-input"><span>Type of firm</span>
          <select name="firmType" defaultValue="">
            <option value="" disabled>Choose one</option>
            <option>Accounting & tax</option><option>Law firm</option><option>Healthcare practice</option><option>Finance team</option><option>Other</option>
          </select>
        </label>
      )}
      {fields.includes('message') && <label className="pg-input"><span>What would you like to hand off?</span><textarea name="message" /></label>}
      {state && !state.ok && <p className="pg-form__err" role="alert">{state.error}</p>}
      <button className="btn btn--primary" type="submit" disabled={pending}>{pending ? 'Sending…' : cta}</button>
      <p className="pg-form__fine">We use your details only to reply and to send what you asked for. Never sold. Unsubscribe anytime.</p>
    </form>
  );
}
