// llms.txt (https://llmstxt.org): a plain-Markdown map of the site for AI assistants and answer engines.
import { AGENTS } from '@/content/data/agents';
import { COMPARE } from '@/content/data/compare';
import { GLOSSARY } from '@/content/data/glossary';
import { INTEGRATIONS } from '@/content/data/integrations';
import { PLANS } from '@/content/data/pricing';
import { RESOURCES } from '@/content/data/resources';
import { SOLUTIONS } from '@/content/data/solutions';
import { USE_CASES } from '@/content/data/useCases';
import { POSTS } from '@/lib/blog';
import { SITE, bookHref } from '@/lib/site';

export const dynamic = 'force-static';

export function GET() {
  const u = (p: string) => `${SITE.url}${p}`;
  const list = (items: { t: string; p: string; d: string }[]) => items.map(i => `- [${i.t}](${u(i.p)}): ${i.d}`).join('\n');
  const body = `# ${SITE.name}

> ${SITE.description}

Key facts:
- Who it's for: accounting & tax firms, law firms, healthcare practices and finance teams.
- How it works: connects the firm's existing tools through OAuth (no passwords stored); agents pull, match and draft; a person reviews. Every answer cites its source; email drafts wait for approval.
- Pricing (USD): ${PLANS.map(p => `${p.name} ${p.price === null ? '(custom, priority support)' : p.price === 0 ? '(free for one month, 1M AI tokens)' : `$${p.price}/month`}`).join(', ')}.
- Models: leading AI models with Auto routing, and Private mode, which is designed to run on MetaWurks' own model and servers instead of an outside AI provider.
- Integrations: 15+ ready-made; any MCP-enabled platform can be added within 24–48 hours.
- Data protection: client data is never sold; each person connects their own accounts; disconnecting a tool revokes its access token; Private mode is designed to keep sensitive work on MetaWurks' own model and servers. Healthcare practices talk to MetaWurks before bringing patient health information into the workspace. Details: ${u('/security')} and ${u('/privacy-policy')}.

## Product
- [Pricing](${u('/pricing')}): plans, what's included, pricing FAQ
- [Security and AI data privacy](${u('/security')}): how MetaWurks protects confidential business data, handles uploaded documents and AI processing, and what Private mode is for
- [Agents](${u('/agents')}): built-in and example agents

## Solutions
${list(SOLUTIONS.map(s => ({ t: s.name, p: `/solutions/${s.slug}`, d: s.answer.answer })))}

## Use cases
${list(USE_CASES.map(x => ({ t: x.name, p: `/use-cases/${x.slug}`, d: x.answer.answer })))}

## Agents
${list(AGENTS.map(a => ({ t: a.name, p: `/agents/${a.slug}`, d: a.blurb })))}

## Integrations
${list(INTEGRATIONS.map(i => ({ t: i.name, p: `/integrations/${i.slug}`, d: i.blurb })))}

## Comparisons
${list(COMPARE.map(c => ({ t: `MetaWurks vs ${c.name}`, p: `/compare/${c.slug}`, d: c.answer.answer })))}

## Glossary
${list(GLOSSARY.map(g => ({ t: g.term, p: `/glossary/${g.slug}`, d: g.short })))}

## Guides
${list(POSTS.map(p => ({ t: p.title, p: `/blog/${p.slug}`, d: p.description })))}

## Free resources
${list(RESOURCES.map(r => ({ t: r.title, p: `/resources/${r.slug}`, d: r.blurb })))}

## Company
- [About](${u('/about')}): what MetaWurks is, who it's for and the principles behind it
- [Custom automation services](${u('/services')}): fixed-price workflow automations built on your own accounts, separate from the workspace: packages, timelines, monthly costs and management plans
- [Contact](${u('/contact')}): book a 1:1 call, send a message, or email and phone details
- [Privacy policy](${u('/privacy-policy')}): how MetaWurks protects the privacy and confidentiality of client information
- [Terms of service](${u('/terms-of-service')}): terms for using the website and app: accounts, billing, your data, connected tools and AI output

## Contact
- Email: ${SITE.email}
- Phone: ${SITE.phone}
- Contact page: ${u('/contact')}
- Book a 1:1 call: ${bookHref('llms')}
`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
