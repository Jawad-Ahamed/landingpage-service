import type { Metadata } from 'next';
import { SITE } from './site';
import { SEO_TITLES } from '@/content/data/seoTitles';

type MetaInput = { title: string; description: string; path: string; type?: 'website' | 'article'; published?: string; absoluteTitle?: boolean };

/** Metadata for a page: canonical URL, Open Graph and Twitter cards. Titles get " · MetaWurks" from the layout template,
 *  unless content/data/seoTitles.ts sets an exact search title for the path (that one replaces only the <title>). */
export function pageMeta({ title, description, path, type = 'website', published, absoluteTitle }: MetaInput): Metadata {
  const url = `${SITE.url}${path}`;
  const seoTitle = SEO_TITLES[path];
  return {
    title: seoTitle ? { absolute: seoTitle } : absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url, siteName: SITE.name, type, ...(published ? { publishedTime: published } : {}), locale: 'en_US' },
    twitter: { card: 'summary_large_image', title, description },
  };
}
