// The ROI results email (HTML + plain text), laid out after the "MetaWurks ROI Results Email" design. Every figure is
// recomputed here from the visitor's inputs with the calculator's own formulas (lib/roi.ts). Email-safe markup:
// tables, inline styles, brand colours from styles/site.css, no web fonts, no scripts, every visitor string escaped.
import { FIRM_TYPES, WEEKS_PER_MONTH, money, roiResults, wholeNumber, type RoiInput } from '@/lib/roi';
import { SITE, bookHref } from '@/lib/site';
import type { Mail } from './mail';

export const ROI_SUBJECT = 'Your MetaWurks Admin Hours ROI Estimate';

const C = { ink: '#0E1B33', cobalt: '#2440BB', paper: '#F2F5FE', tint: '#F2F5FF', rule: '#E2E7EF', slate: '#4B5567', faint: '#525C6E', panel: '#0C1736', panelText: '#C9D0DD', lift: '#9DB2FF' };
const FONT = `-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif`;

const esc = (v: string) => v.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch] as string);

/** First name for the greeting, only when it looks like a name (letters, apostrophes, hyphens). */
function firstName(name: string): string {
  const first = name.trim().split(/\s+/)[0] || '';
  return /^[\p{L}\p{M}'’-]{1,40}$/u.test(first) ? first : '';
}

export type RoiEmailInput = { name: string; firmType: string; input: RoiInput };

export function roiEmail({ name, firmType, input }: RoiEmailInput): Omit<Mail, 'to'> {
  const r = roiResults(input);
  const type = FIRM_TYPES.some(t => t.label === firmType) ? firmType : '';
  const first = firstName(name);
  const greeting = first ? `Hi ${first},` : 'Hi there,';
  const plan = r.plan.price === null ? `${r.plan.name} (custom pricing)` : `${r.plan.name} ($${r.plan.price}/mo)`;
  const site = SITE.url;
  const book = bookHref('roi-email');
  const links = { pricing: `${site}/pricing`, agents: `${site}/agents`, integrations: `${site}/integrations`, contact: `${site}/contact`, calculator: `${site}/resources/roi-calculator` };

  const cards: [string, string, boolean][] = [
    ['Estimated admin hours today, per month', `${wholeNumber(r.adminMonth)} hrs`, false],
    ['Estimated hours back, per month', `${wholeNumber(r.back)} hrs`, true],
    ['Estimated monthly value of hours back', money(r.value), false],
    ['Estimated annualized value', money(r.year), true],
  ];
  const more: [string, string][] = [
    ['Hours back per person, per month', `${r.perPerson.toFixed(1)} hrs`],
    ['Suggested plan', plan],
  ];
  const inputs: [string, string][] = [
    ...(type ? [['Firm type', type] as [string, string]] : []),
    ['People doing admin', wholeNumber(input.team)],
    ['Admin hours per person, per week', `${wholeNumber(input.hours)} hours`],
    ['Value of an hour of their time', money(input.rate)],
    ['Share of admin work to hand off', `${input.share}%`],
  ];
  const meaning = `Based on the information you entered, handing off ${input.share}% of about ${wholeNumber(r.adminMonth)} admin hours a month could return approximately ${wholeNumber(r.back)} hours a month, or ${r.perPerson.toFixed(1)} hours per person.`;
  const reinvest = 'That time can go back into client service, higher-value work and day-to-day operations. Agents prepare the work and people still review it, so treat this as a starting point.';
  const about = 'MetaWurks connects the tools your firm already uses, then AI agents pull, match and draft the admin for your review. Every answer shows the document or record it came from.';
  const disclaimer = `These figures are estimates based on the information you provided, using ${WEEKS_PER_MONTH} weeks a month. The value of time recovered is not a guarantee of cash savings, additional revenue or business results.`;
  const why = 'You are receiving this email because you asked for your results using the ROI calculator on metawurks.com.';

  /* ---------- HTML ---------- */
  const label = (t: string, color = C.cobalt) => `<p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${color}">${esc(t)}</p>`;
  const card = ([k, v, hl]: [string, string, boolean]) =>
    `<td width="50%" valign="top" style="padding:6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:1px solid ${C.rule};border-radius:12px"><tr><td style="padding:16px 18px"><p style="margin:0 0 8px;font-size:13px;line-height:1.4;color:${C.slate}">${esc(k)}</p><p style="margin:0;font-size:28px;line-height:1.1;font-weight:700;letter-spacing:-.02em;color:${hl ? C.cobalt : C.ink}">${esc(v)}</p></td></tr></table></td>`;
  const rows = (list: [string, string][]) => list.map(([k, v]) =>
    `<tr><td style="padding:10px 0;border-bottom:1px solid ${C.rule};font-size:14px;color:${C.slate}">${esc(k)}</td><td align="right" style="padding:10px 0 10px 12px;border-bottom:1px solid ${C.rule};font-size:14px;font-weight:600;color:${C.ink}">${esc(v)}</td></tr>`).join('');
  const button = (href: string, text: string, primary: boolean) =>
    `<a href="${esc(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 22px;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none;${primary ? `background:${C.cobalt};color:#FFFFFF` : `background:#FFFFFF;color:${C.ink}`}">${esc(text)}</a>`;
  const next = (href: string, title: string, body: string) =>
    `<td width="50%" valign="top" style="padding:8px 8px 8px 0"><a href="${esc(href)}" style="font-size:14px;font-weight:700;color:${C.cobalt};text-decoration:none">${esc(title)} &rarr;</a><p style="margin:4px 0 0;font-size:13px;line-height:1.5;color:${C.slate}">${esc(body)}</p></td>`;

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(ROI_SUBJECT)}</title></head>
<body style="margin:0;padding:0;background:${C.paper};font-family:${FONT};color:${C.ink}">
<div style="display:none;max-height:0;overflow:hidden">About ${esc(wholeNumber(r.back))} admin hours back a month, worth an estimated ${esc(money(r.value))}. Here are your results and inputs.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#FFFFFF;border-radius:16px;border:1px solid ${C.rule}">
<tr><td style="padding:24px 28px;border-bottom:1px solid ${C.rule}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td><a href="${esc(site)}" style="text-decoration:none"><img src="${esc(`${site}/assets/brand/metawurks-logo.png`)}" width="134" height="50" alt="MetaWurks" style="display:block;border:0;font-size:22px;font-weight:700;color:${C.ink}"></a></td>
    <td align="right" style="font-size:13px;color:${C.faint}">A private AI workspace for your firm</td>
  </tr></table>
</td></tr>
<tr><td style="padding:28px 28px 8px">
  ${label('Your ROI estimate')}
  <h1 style="margin:0 0 18px;font-size:28px;line-height:1.15;letter-spacing:-.02em;color:${C.ink}">Your MetaWurks Admin Hours ROI Estimate</h1>
  <p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:${C.ink}">${esc(greeting)}</p>
  <p style="margin:0;font-size:16px;line-height:1.6;color:${C.slate}">Thanks for using the MetaWurks ROI Calculator. Based on the information you provided, here is your personalized estimate of the time and value your team could recover by handing administrative work to MetaWurks.</p>
</td></tr>
<tr><td style="padding:20px 22px 8px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.tint};border-radius:14px"><tr><td style="padding:16px 12px 12px">
    <div style="padding:0 6px">${label('Your estimated results')}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${card(cards[0])}${card(cards[1])}</tr><tr>${card(cards[2])}${card(cards[3])}</tr></table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px"><tr><td style="padding:0 6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows(more)}</table></td></tr></table>
    <p style="margin:14px 6px 0;padding:12px 14px;border-radius:10px;background:#FFFFFF;border:1px solid ${C.rule};font-size:13px;line-height:1.55;color:${C.slate}">${esc(disclaimer)}</p>
  </td></tr></table>
</td></tr>
<tr><td style="padding:20px 28px 8px">
  ${label('Your calculator inputs')}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows(inputs)}</table>
</td></tr>
<tr><td style="padding:20px 28px 8px">
  ${label('What this could mean for your firm')}
  <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:${C.ink}">${esc(meaning)}</p>
  <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:${C.slate}">${esc(reinvest)}</p>
  <p style="margin:0;font-size:15px;line-height:1.6;color:${C.slate}">${esc(about)}</p>
</td></tr>
<tr><td style="padding:20px 22px 8px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.panel};border-radius:14px"><tr><td style="padding:24px 24px 16px">
    ${label('Your next step', C.lift)}
    <p style="margin:0 0 8px;font-size:22px;line-height:1.25;font-weight:700;color:#FFFFFF">Want to explore the opportunity?</p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.55;color:${C.panelText}">Bring your tool list and your worst admin chore to a 1:1 call. We'll show you where agents could fit into your team's existing work.</p>
    ${button(book, 'Book a 1:1 call', true)}${button(links.pricing, 'View MetaWurks pricing', false)}
  </td></tr></table>
</td></tr>
<tr><td style="padding:16px 28px 4px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>${next(links.agents, 'See example agents', 'Tax prep, month-end close, matter summaries and more, each ending with your review.')}${next(links.integrations, 'Explore integrations', 'Connect the tools and documents your firm already uses.')}</tr>
    <tr>${next(links.contact, 'Get your questions answered', 'Talk with our team about your use cases.')}${next(links.pricing, 'Start with a plan that fits', `Based on your team size, we'd suggest ${plan}.`)}</tr>
  </table>
</td></tr>
<tr><td style="padding:20px 28px;border-top:1px solid ${C.rule}">
  <p style="margin:0 0 4px;font-size:15px;color:${C.slate}">Regards,</p>
  <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:${C.ink}">The MetaWurks Team</p>
  <a href="mailto:${esc(SITE.email)}" style="font-size:15px;color:${C.cobalt}">${esc(SITE.email)}</a>
</td></tr>
<tr><td style="padding:18px 28px 24px;border-top:1px solid ${C.rule}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td valign="top" style="font-size:13px;color:${C.faint}"><b style="font-size:16px;color:${C.ink}">MetaWurks</b><br>A private AI workspace for your firm's busywork.</td>
    <td valign="top" align="right" style="font-size:13px;white-space:nowrap"><a href="${esc(site)}" style="color:${C.slate}">Website</a> &nbsp;|&nbsp; <a href="${esc(links.pricing)}" style="color:${C.slate}">Pricing</a> &nbsp;|&nbsp; <a href="${esc(links.contact)}" style="color:${C.slate}">Contact</a></td>
  </tr></table>
  <p style="margin:14px 0 0;font-size:12px;line-height:1.5;color:${C.faint}">${esc(why)} <a href="${esc(links.calculator)}" style="color:${C.faint}">Run the calculator again</a>.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;

  /* ---------- Plain text ---------- */
  const list = (l: [string, string][]) => l.map(([k, v]) => `- ${k}: ${v}`).join('\n');
  const text = [
    ROI_SUBJECT.toUpperCase(),
    '',
    greeting,
    '',
    'Thanks for using the MetaWurks ROI Calculator. Based on the information you provided, here is your personalized estimate of the time and value your team could recover by handing administrative work to MetaWurks.',
    '',
    'YOUR ESTIMATED RESULTS',
    list([...cards.map(([k, v]) => [k, v] as [string, string]), ...more]),
    '',
    disclaimer,
    '',
    'YOUR CALCULATOR INPUTS',
    list(inputs),
    '',
    'WHAT THIS COULD MEAN FOR YOUR FIRM',
    meaning,
    reinvest,
    about,
    '',
    'YOUR NEXT STEP',
    `Book a 1:1 call: ${book}`,
    `View MetaWurks pricing: ${links.pricing}`,
    `See example agents: ${links.agents}`,
    `Explore integrations: ${links.integrations}`,
    `Contact us: ${links.contact}`,
    '',
    'Regards,',
    'The MetaWurks Team',
    SITE.email,
    site,
    '',
    `${why} Run the calculator again: ${links.calculator}`,
  ].join('\n');

  return { subject: ROI_SUBJECT, html, text, replyTo: SITE.email };
}
