import type { Metadata } from 'next';
import { SITE } from './site';

type MetaInput = { title: string; description: string; path: string; type?: 'website' | 'article'; published?: string; absoluteTitle?: boolean };

/** Metadata for a page: canonical URL, Open Graph and Twitter cards. Titles get " · MetaWurks" from the layout template. */
export function pageMeta({ title, description, path, type = 'website', published, absoluteTitle }: MetaInput): Metadata {
  const url = `${SITE.url}${path}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url, siteName: SITE.name, type, ...(published ? { publishedTime: published } : {}), locale: 'en_US' },
    twitter: { card: 'summary_large_image', title, description },
  };
}
