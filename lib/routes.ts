// One place that knows every URL. Related-link and menu builders use `exists()` so nothing links to a page
// that hasn't been built yet.
import { AGENTS } from '@/content/data/agents';
import { COMPARE } from '@/content/data/compare';
import { GLOSSARY } from '@/content/data/glossary';
import { INTEGRATIONS } from '@/content/data/integrations';
import { SOLUTIONS } from '@/content/data/solutions';
import { USE_CASES } from '@/content/data/useCases';
import { POSTS } from '@/lib/blog';
import { RESOURCES } from '@/content/data/resources';
import { STATIC_PAGES } from '@/content/data/pages';

export const href = {
  integration: (s: string) => `/integrations/${s}`,
  agent: (s: string) => `/agents/${s}`,
  solution: (s: string) => `/solutions/${s}`,
  useCase: (s: string) => `/use-cases/${s}`,
  compare: (s: string) => `/compare/${s}`,
  glossary: (s: string) => `/glossary/${s}`,
  post: (s: string) => `/blog/${s}`,
  resource: (s: string) => `/resources/${s}`,
};

export function allRoutes(): string[] {
  return [
    '/',
    ...STATIC_PAGES.map(p => p.path),
    ...INTEGRATIONS.map(i => href.integration(i.slug)),
    ...AGENTS.map(a => href.agent(a.slug)),
    ...SOLUTIONS.map(s => href.solution(s.slug)),
    ...USE_CASES.map(u => href.useCase(u.slug)),
    ...COMPARE.map(c => href.compare(c.slug)),
    ...GLOSSARY.map(g => href.glossary(g.slug)),
    ...POSTS.map(p => href.post(p.slug)),
    ...RESOURCES.map(r => href.resource(r.slug)),
  ];
}

let cache: Set<string> | null = null;
export const exists = (path: string) => (cache ??= new Set(allRoutes())).has(path.split('#')[0] || '/');
