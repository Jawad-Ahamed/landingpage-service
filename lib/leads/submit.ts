// Shared by the server action (JS forms) and /api/lead (no-JS fallback): validate, drop bots, send to the sink.
import { getLeadSink, LeadSchema } from './index';

export type SubmitResult = { ok: true } | { ok: false; error: string };

const MIN_FILL_MS = 2500;   // humans take longer than this to fill a form; bots usually don't

export async function submitLead(raw: Record<string, unknown>): Promise<SubmitResult> {
  // honeypot: a hidden field only bots fill in. Pretend success so they learn nothing.
  if (typeof raw.website === 'string' && raw.website.trim() !== '') return { ok: true };
  const started = Number(raw.startedAt || 0);
  if (started && Date.now() - started < MIN_FILL_MS) return { ok: true };

  const utm: Record<string, string> = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) if (typeof raw[k] === 'string' && raw[k]) utm[k] = raw[k] as string;
  const extra: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(raw)) if (k.startsWith('x_') && (typeof v === 'string' || typeof v === 'number')) extra[k.slice(2)] = v;

  const parsed = LeadSchema.safeParse({ ...raw, utm, extra });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message || 'Please check the form.' };
  try {
    await getLeadSink().send({ ...parsed.data, receivedAt: new Date().toISOString() });
    return { ok: true };
  } catch (e) {
    console.error('[lead] delivery failed', e);
    return { ok: false, error: 'Something went wrong on our side. Please email admin@metawurks.com.' };
  }
}
