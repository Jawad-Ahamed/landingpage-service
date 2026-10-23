// Hand-built pages (hubs and singles). Data-driven pages are listed by lib/routes.ts from their collections.
export type StaticPage = { path: string; title: string; changefreq?: 'weekly' | 'monthly' | 'yearly'; priority?: number };

export const STATIC_PAGES: StaticPage[] = [
  { path: '/pricing', title: 'Pricing', priority: 0.9 },
  { path: '/integrations', title: 'Integrations', priority: 0.9 },
  { path: '/agents', title: 'Agents', priority: 0.8 },
  { path: '/security', title: 'Security & data integrity', priority: 0.8 },
  { path: '/resources', title: 'Resources', priority: 0.7 },
  { path: '/glossary', title: 'Glossary', priority: 0.6 },
  { path: '/blog', title: 'Blog', changefreq: 'weekly', priority: 0.7 },
  { path: '/services', title: 'Custom automation services', priority: 0.8 },
  { path: '/about', title: 'About', priority: 0.6 },
  { path: '/contact', title: 'Contact', priority: 0.6 },
  { path: '/privacy-policy', title: 'Privacy policy', changefreq: 'yearly', priority: 0.3 },
  { path: '/terms-of-service', title: 'Terms of service', changefreq: 'yearly', priority: 0.3 },
];
