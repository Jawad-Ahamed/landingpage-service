// Where form submissions go. The destination is chosen with LEAD_SINK, so connecting HubSpot, Resend or a webhook
// later means adding one adapter here and setting an env var.
//   LEAD_SINK=webhook  POST each lead as JSON to LEAD_WEBHOOK_URL.
//   LEAD_SINK=console  log each lead to the server log only (a deliberate opt-in: nobody is notified).
//   unset              console in development; in production there is no sink, so forms tell the visitor their
//                      message was not sent instead of showing a false "Received".
import { z } from 'zod';
import { FIELD_LABEL, LEAD_KINDS, REQUIRED, TOPICS } from './fields';

const MAX_EXTRA_KEYS = 20;   // the ROI calculator sends 7
const BAD_EXTRA = 'The form sent unexpected data. Please reload the page and try again.';

export const LeadSchema = z.object({
  kind: z.enum(LEAD_KINDS),
  email: z.email('Enter a valid work email, like name@yourfirm.com.').max(200, 'Keep your email under 200 characters.'),
  name: z.string().trim().max(120, 'Keep your name under 120 characters.').optional().default(''),
  firm: z.string().trim().max(160, 'Keep your firm name under 160 characters.').optional().default(''),
  firmType: z.string().trim().max(60).optional().default(''),
  topic: z.union([z.literal(''), z.enum(TOPICS.map(t => t.value))]).optional().default(''),
  message: z.string().trim().max(4000, 'Keep your message under 4,000 characters.').optional().default(''),
  resource: z.string().trim().max(120).optional().default(''),
  page: z.string().trim().max(300).optional().default(''),
  utm: z.record(z.string(), z.string().max(200)).optional().default({}),
  extra: z.record(z.string().regex(/^[A-Za-z0-9_]{1,40}$/, BAD_EXTRA), z.union([z.string().max(200, BAD_EXTRA), z.number().refine(Number.isFinite, BAD_EXTRA)]))
    .refine(x => Object.keys(x).length <= MAX_EXTRA_KEYS, BAD_EXTRA).optional().default({}),
}).superRefine((lead, ctx) => {
  for (const f of REQUIRED[lead.kind]) {
    if (f !== 'email' && !lead[f]) ctx.addIssue({ code: 'custom', path: [f], message: `Please add ${FIELD_LABEL[f]}.` });
  }
});
export type Lead = z.infer<typeof LeadSchema> & { receivedAt: string };

export type LeadSink = { name: string; send: (lead: Lead) => Promise<void> };

const consoleSink: LeadSink = {
  name: 'console',
  async send(lead) { console.info('[lead]', JSON.stringify(lead)); },
};

const WEBHOOK_TIMEOUT_MS = 10_000;

// A generic JSON webhook (Zapier, Make, a CRM's inbound endpoint…): set LEAD_SINK=webhook and LEAD_WEBHOOK_URL.
const webhookSink: LeadSink = {
  name: 'webhook',
  async send(lead) {
    const url = process.env.LEAD_WEBHOOK_URL;
    if (!url) throw new Error('LEAD_WEBHOOK_URL is not set');
    const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(lead), signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS) });
    if (!r.ok) throw new Error(`Webhook responded ${r.status}`);
  },
};

/** The configured sink, or null when nothing would deliver the lead (production without LEAD_SINK, or an unknown value). */
export function getLeadSink(): LeadSink | null {
  switch (process.env.LEAD_SINK) {
    case 'webhook': return webhookSink;
    case 'console': return consoleSink;
    case undefined: case '': return process.env.NODE_ENV === 'production' ? null : consoleSink;
    default: return null;
  }
}
