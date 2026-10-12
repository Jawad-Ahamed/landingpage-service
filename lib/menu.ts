// Navigation and footer structure, built on the server from content so menus only link to pages that exist.
import { SOLUTIONS } from '@/content/data/solutions';
import { USE_CASES } from '@/content/data/useCases';
import { COMPARE } from '@/content/data/compare';
import { RESOURCES } from '@/content/data/resources';
import { INTEGRATIONS } from '@/content/data/integrations';
import { exists } from './routes';
import { SITE } from './site';

export type MenuItem = { label: string; desc?: string; href: string; icon?: string; img?: string };
export type MenuGroup = { label: string; href?: string; items?: MenuItem[]; cols?: number; foot?: { text: string; link: MenuItem } };

const live = (items: MenuItem[]) => items.filter(i => i.href.startsWith('/#') || exists(i.href));

export function getMenu(): MenuGroup[] {
  const groups: MenuGroup[] = [
    { label: 'Product', cols: 2, items: live([
      { label: 'How it works', desc: 'Connect, ask, review: three steps', href: '/#how', icon: 'sparkle' },
      { label: 'Agents & skills', desc: 'Tax prep, close, collections and more', href: '/agents', icon: 'bot' },
      { label: 'Integrations', desc: `${INTEGRATIONS.length} tools through OAuth, plus MCP`, href: '/integrations', icon: 'plug' },
      { label: 'Security & data integrity', desc: 'Cited answers, approvals, never sold', href: '/security', icon: 'shield' },
      { label: 'Watch it work', desc: 'A short product walkthrough', href: '/#watch', icon: 'play' },
      { label: 'Pricing', desc: 'From $19 a month, first month free', href: '/pricing', icon: 'receipt' },
    ]), foot: { text: 'Bring your tool list and your worst admin chore.', link: { label: 'Book a 1:1 call', href: '/#book' } } },
    { label: 'Solutions', cols: 2, items: live([
      ...SOLUTIONS.map(s => ({ label: s.name, desc: s.answer.question.replace(/^How can an? /, '').replace(/\?$/, ''), href: `/solutions/${s.slug}`, icon: s.tag === 'acct' ? 'calc' : s.tag === 'legal' ? 'scale' : s.tag === 'health' ? 'pulse' : 'chart' })),
      ...USE_CASES.map(u => ({ label: u.name, desc: u.lede.split('. ')[0], href: `/use-cases/${u.slug}`, icon: 'check-c' })),
      ...COMPARE.map(c => ({ label: `MetaWurks vs ${c.name}`, desc: 'An honest comparison', href: `/compare/${c.slug}`, icon: 'tabs' })),
    ]) },
    { label: 'Integrations', href: '/integrations' },
    { label: 'Resources', cols: 2, items: live([
      ...RESOURCES.map(r => ({ label: r.title, desc: r.kind === 'Calculator' ? 'Hours and dollars lost to admin' : `Free ${r.kind.toLowerCase()}`, href: `/resources/${r.slug}`, icon: r.kind === 'Calculator' ? 'calc' : 'file' })),
      { label: 'Blog', desc: 'Guides on AI, compliance and admin', href: '/blog', icon: 'edit' },
      { label: 'Glossary', desc: 'From IRC 7216 to MCP', href: '/glossary', icon: 'library' },
    ]) },
    { label: 'Pricing', href: '/pricing' },
  ];
  return groups.filter(g => g.href || (g.items && g.items.length));
}

export type FooterCol = { title: string; links: { label: string; href: string }[] };

export function getFooter(): FooterCol[] {
  const f = (links: { label: string; href: string }[]) => links.filter(l => l.href.startsWith('/#') || l.href.startsWith('mailto:') || exists(l.href));
  return [
    { title: 'Product', links: f([{ label: 'How it works', href: '/#how' }, { label: 'Agents & skills', href: '/agents' }, { label: 'Integrations', href: '/integrations' }, { label: 'Pricing', href: '/pricing' }, { label: 'Watch it work', href: '/#watch' }]) },
    { title: 'Solutions', links: f([...SOLUTIONS.map(s => ({ label: s.short, href: `/solutions/${s.slug}` })), ...USE_CASES.map(u => ({ label: u.name, href: `/use-cases/${u.slug}` }))]) },
    { title: 'Resources', links: f([{ label: 'Blog', href: '/blog' }, { label: 'Glossary', href: '/glossary' }, ...RESOURCES.slice(0, 3).map(r => ({ label: r.title.replace(/ for Firms$/, ''), href: `/resources/${r.slug}` }))]) },
    { title: 'Trust & company', links: f([{ label: 'Security & data integrity', href: '/security' }, { label: 'Privacy policy', href: '/privacy' }, { label: 'Terms of service', href: '/terms' }, { label: 'Contact', href: `mailto:${SITE.email}` }, { label: 'Book a 1:1 call', href: '/#book' }]) },
  ];
}
