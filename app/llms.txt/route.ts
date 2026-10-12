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
import { SITE } from '@/lib/site';

export const dynamic = 'force-static';

export function GET() {
  const u = (p: string) => `${SITE.url}${p}`;
  const list = (items: { t: string; p: string; d: string }[]) => items.map(i => `- [${i.t}](${u(i.p)}): ${i.d}`).join('\n');
  const body = `# ${SITE.name}

> ${SITE.description}

Key facts:
- Who it's for: accounting & tax firms, law firms, healthcare practices and finance teams.
- How it works: connects the firm's existing tools through OAuth (no passwords stored); agents pull, match and draft; a person reviews. Every answer cites its source; email drafts wait for approval.
- Pricing (USD, billed monthly): ${PLANS.map(p => `${p.name} $${p.price}`).join(', ')}.
- Data: never sold. Not HIPAA compliant and no SOC 2 report today; BAA position not settled (see the security page).

## Product
- [Pricing](${u('/pricing')}): plans, what's included, pricing FAQ
- [Security & data integrity](${u('/security')}): how client data is handled, and what is not claimed yet
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

## Contact
- Email: ${SITE.email}
- Book a 1:1 call: ${u('/#book')}
`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
