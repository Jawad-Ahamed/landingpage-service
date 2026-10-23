// Shared by the server action (JS forms) and /api/lead (no-JS fallback): validate, drop bots, send to the sink.
// The ROI calculator is the exception: its job is to email the visitor their results, so it succeeds only when the
// mail provider has accepted that email (see sendRoiResults below).
import { getLeadSink, LeadSchema, type Lead } from './index';
import { getMailer } from './mail';
import { roiEmail } from './roiEmail';
import { roiInputFrom } from '@/lib/roi';
import { SITE } from '@/lib/site';

/** On failure, `fieldErrors` maps a field name to its message and `values` echoes what was typed, so the form
 *  can show each error next to its field and keep the person's input (React 19 resets forms after an action). */
export type SubmitResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string>; values?: Record<string, string> };

const MIN_FILL_MS = 2500;   // humans take longer than this to fill a form; bots usually don't
const ECHO = ['name', 'email', 'firm', 'firmType', 'topic', 'message'];

export async function submitLead(raw: Record<string, unknown>): Promise<SubmitResult> {
  // honeypot: a hidden field only bots fill in. Pretend success so they learn nothing.
  if (typeof raw.website === 'string' && raw.website.trim() !== '') return { ok: true };
  const values: Record<string, string> = {};
  for (const k of ECHO) if (typeof raw[k] === 'string') values[k] = (raw[k] as string).slice(0, 4000);
  const started = Number(raw.startedAt || 0);
  // Too fast to be typed. Other forms pretend success; the ROI form must never claim an email went out, so it asks
  // for a retry instead (a person who autofilled the form just clicks again).
  if (started && Date.now() - started < MIN_FILL_MS) return raw.kind === 'roi' ? { ok: false, error: ROI_NOT_SENT, values } : { ok: true };

  const utm: Record<string, string> = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) if (typeof raw[k] === 'string' && raw[k]) utm[k] = raw[k] as string;
  const extra: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(raw)) if (k.startsWith('x_') && (typeof v === 'string' || typeof v === 'number')) extra[k.slice(2)] = v;

  const parsed = LeadSchema.safeParse({ ...raw, utm, extra });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const f = String(i.path[0] ?? '');
      if (f && !fieldErrors[f]) fieldErrors[f] = i.message;
    }
    const n = Object.keys(fieldErrors).length;
    return { ok: false, error: n > 1 ? `Please fix the ${n} fields marked below.` : 'Please fix the field marked below.', fieldErrors, values };
  }
  if (parsed.data.kind === 'roi') return sendRoiResults({ ...parsed.data, receivedAt: new Date().toISOString() }, values);
  const sink = getLeadSink();
  if (!sink) {
    console.error('[lead] no delivery configured (set LEAD_SINK)');
    return { ok: false, error: `Your message was not sent: our form isn't connected right now. Please email ${SITE.email}.`, values };
  }
  try {
    await sink.send({ ...parsed.data, receivedAt: new Date().toISOString() });
    return { ok: true };
  } catch (e) {
    console.error('[lead] delivery failed', describe(e));
    return { ok: false, error: `Something went wrong on our side and your message was not sent. Please try again, or email ${SITE.email}.`, values };
  }
}

/* ---------- ROI calculator: email the visitor their results ---------- */
// Per server instance, in memory: a repeat of the same request while the first is in flight shares its outcome, and an
// identical request soon after a delivered one is not sent twice. Each address gets at most ROI_MAX_PER_HOUR emails,
// keyed on the recipient (not on a spoofable client IP) so the form can't be used to flood someone's inbox.
const ROI_REPEAT_MS = 2 * 60_000;
const ROI_MAX_PER_HOUR = 5;
const HOUR_MS = 3_600_000;
const roiInFlight = new Map<string, Promise<SubmitResult>>();
const roiDelivered = new Map<string, number>();
const roiSentTo = new Map<string, number[]>();

const ROI_NOT_SENT = 'We couldn\'t send your results right now. Please try again.';

function pruneRoi(now: number) {
  if (roiDelivered.size > 2000) for (const [k, t] of roiDelivered) if (now - t > ROI_REPEAT_MS) roiDelivered.delete(k);
  if (roiSentTo.size > 2000) for (const [k, ts] of roiSentTo) if (!ts.some(t => now - t < HOUR_MS)) roiSentTo.delete(k);
}

async function sendRoiResults(lead: Lead, values: Record<string, string>): Promise<SubmitResult> {
  const input = roiInputFrom(lead.extra);
  if (!input) return { ok: false, error: 'Please check the calculator values and try again.', values };
  const mailer = getMailer();
  if (!mailer) {
    console.error('[roi] results email not sent: email delivery is not configured (LEAD_MAIL_*)');
    return { ok: false, error: `We couldn't email your results: email delivery isn't set up on our side right now. Your results are still on this page. Please try again later, or email ${SITE.email}.`, values };
  }

  const firmType = String(lead.extra.firmType ?? '');
  const to = lead.email.toLowerCase();
  const key = JSON.stringify([to, lead.name, firmType, input]);
  const now = Date.now();
  pruneRoi(now);
  if (now - (roiDelivered.get(key) ?? 0) < ROI_REPEAT_MS) return { ok: true };   // already delivered moments ago
  const running = roiInFlight.get(key);
  if (running) return running;
  const recent = (roiSentTo.get(to) || []).filter(t => now - t < HOUR_MS);
  if (recent.length >= ROI_MAX_PER_HOUR) {
    return { ok: false, error: 'Your results have already been emailed to this address several times in the last hour. Please check your inbox, or try again later.', values };
  }

  const job = (async (): Promise<SubmitResult> => {
    try {
      const id = await mailer.send({ to: lead.email, ...roiEmail({ name: lead.name, firmType, input }) });
      roiDelivered.set(key, Date.now());
      roiSentTo.set(to, [...(roiSentTo.get(to) || []).filter(t => Date.now() - t < HOUR_MS), Date.now()]);
      console.info('[roi] results email accepted', JSON.stringify({ transport: mailer.name, id }));
    } catch (e) {
      console.error('[roi] results email failed', describe(e));
      return { ok: false, error: ROI_NOT_SENT, values };
    }
    // The email is delivered; also hand the lead to the team's sink when one is set. Its failure is logged, not shown.
    const sink = getLeadSink();
    if (sink) {
      try { await sink.send(lead); } catch (e) { console.error('[lead] delivery failed', describe(e)); }
    }
    return { ok: true };
  })().finally(() => roiInFlight.delete(key));
  roiInFlight.set(key, job);
  return job;
}

// Name, message and the cause's code only: never the webhook URL or the lead itself.
function describe(e: unknown): string {
  if (!(e instanceof Error)) return 'Unknown error';
  const code = (e.cause as { code?: unknown } | undefined)?.code;
  const msg = e.message.replace(/[a-z][a-z0-9+.-]*:\/\/\S+/gi, '[url]');   // e.g. "Failed to parse URL from <url>"
  return `${e.name}: ${msg}${typeof code === 'string' ? ` (${code})` : ''}`;
}
