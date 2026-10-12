import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

export const dynamic = 'force-static';

// Until launch (NEXT_PUBLIC_INDEXABLE=true) everything is disallowed. After launch, search engines and the
// AI answer engines' crawlers are all welcome: being quotable in AI answers is the point of the AEO work.
export default function robots(): MetadataRoute.Robots {
  if (!SITE.indexable) return { rules: [{ userAgent: '*', disallow: '/' }] };
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
