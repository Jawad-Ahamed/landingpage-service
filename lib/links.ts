// Internal-linking graph: integration → agents → use cases → solution → resources.
// Every page gets a handful of related links (Related() drops any that don't exist yet).
import { agent } from '@/content/data/agents';
import { integration } from '@/content/data/integrations';
import { solution, SOLUTIONS } from '@/content/data/solutions';
import { useCase } from '@/content/data/useCases';
import { resource } from '@/content/data/resources';
import { href } from './routes';

type Item = { eyebrow: string; title: string; body: string; href: string };

export const agentItems = (slugs: string[]): Item[] =>
  slugs.map(agent).filter(Boolean).map(a => ({ eyebrow: `Agent · ${a!.area}`, title: a!.name, body: a!.blurb, href: href.agent(a!.slug) }));

export const useCaseItems = (slugs: string[]): Item[] =>
  slugs.map(useCase).filter(Boolean).map(u => ({ eyebrow: 'Use case', title: u!.name, body: u!.lede.split('. ')[0] + '.', href: href.useCase(u!.slug) }));

export const integrationItems = (slugs: string[]): Item[] =>
  slugs.map(integration).filter(Boolean).map(i => ({ eyebrow: `Integration · ${i!.category}`, title: i!.name, body: i!.blurb, href: href.integration(i!.slug) }));

export const solutionItems = (slugs: string[]): Item[] =>
  slugs.map(solution).filter(Boolean).map(s => ({ eyebrow: 'Solution', title: s!.name, body: s!.lede.split('. ')[0] + '.', href: href.solution(s!.slug) }));

export const resourceItems = (slugs: string[]): Item[] =>
  slugs.map(resource).filter(Boolean).map(r => ({ eyebrow: `Free ${r!.kind.toLowerCase()}`, title: r!.title, body: r!.blurb, href: href.resource(r!.slug) }));

/** Solutions whose page lists this integration / agent / use case. */
export const solutionsUsing = (kind: 'integrations' | 'agents' | 'useCases', slug: string) =>
  SOLUTIONS.filter(s => s[kind].includes(slug)).map(s => s.slug);
