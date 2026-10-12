import type { MetadataRoute } from 'next';
import { allRoutes } from '@/lib/routes';
import { STATIC_PAGES } from '@/content/data/pages';
import { SITE } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return allRoutes().map(path => {
    const sp = STATIC_PAGES.find(p => p.path === path);
    const depth = path === '/' ? 0 : path.split('/').length - 1;
    return { url: `${SITE.url}${path}`, lastModified: now, changeFrequency: sp?.changefreq || 'monthly', priority: path === '/' ? 1 : sp?.priority ?? (depth === 1 ? 0.8 : 0.6) };
  });
}
