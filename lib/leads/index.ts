// Where form submissions go. The destination is chosen with LEAD_SINK (default: console, i.e. the server log),
// so connecting HubSpot, Resend or a webhook later means adding one adapter here and setting an env var.
import { z } from 'zod';

export const LeadSchema = z.object({
  kind: z.enum(['book', 'contact', 'resource', 'newsletter', 'roi']),
  email: z.email('Enter a valid work email.').max(200),
  name: z.string().trim().max(120).optional().default(''),
  firm: z.string().trim().max(160).optional().default(''),
  firmType: z.string().trim().max(60).optional().default(''),
  message: z.string().trim().max(4000).optional().default(''),
  resource: z.string().trim().max(120).optional().default(''),
  page: z.string().trim().max(300).optional().default(''),
  utm: z.record(z.string(), z.string().max(200)).optional().default({}),
  extra: z.record(z.string(), z.union([z.string(), z.number()])).optional().default({}),
});
export type Lead = z.infer<typeof LeadSchema> & { receivedAt: string };

export type LeadSink = { name: string; send: (lead: Lead) => Promise<void> };

const consoleSink: LeadSink = {
  name: 'console',
  async send(lead) { console.info('[lead]', JSON.stringify(lead)); },
};

// A generic JSON webhook (Zapier, Make, a CRM's inbound endpoint…): set LEAD_SINK=webhook and LEAD_WEBHOOK_URL.
const webhookSink: LeadSink = {
  name: 'webhook',
  async send(lead) {
    const url = process.env.LEAD_WEBHOOK_URL;
    if (!url) throw new Error('LEAD_WEBHOOK_URL is not set');
    const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(lead) });
    if (!r.ok) throw new Error(`Webhook responded ${r.status}`);
  },
};

export function getLeadSink(): LeadSink {
  switch (process.env.LEAD_SINK) {
    case 'webhook': return webhookSink;
    default: return consoleSink;
  }
}
