// JSON-LD builders (schema.org). Only facts we can stand behind: no ratings, no review counts.
import type { Article, BreadcrumbList, DefinedTerm, FAQPage, HowTo, Organization, SoftwareApplication, WithContext } from 'schema-dts';
import type { Faq } from '@/content/data/types';
import { PLANS } from '@/content/data/pricing';
import { SITE } from './site';

const abs = (p: string) => (p.startsWith('http') ? p : `${SITE.url}${p}`);
// FAQ answers may contain [label](href) links; schema text should be plain
const plain = (s: string) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '');

export const organization = (): WithContext<Organization> => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.name,
  url: SITE.url,
  logo: abs('/assets/brand/metawurks-logo.png'),
  email: SITE.email,
  telephone: SITE.phone,
  address: { '@type': 'PostalAddress', streetAddress: '16192 Coastal Hwy', addressLocality: 'Lewes', addressRegion: 'DE', postalCode: '19958', addressCountry: 'US' },
});

export const softwareApp = (): WithContext<SoftwareApplication> => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE.name,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: SITE.url,
  description: SITE.description,
  offers: PLANS.map(p => ({ '@type': 'Offer', name: p.name, price: p.price.toFixed(2), priceCurrency: 'USD', url: abs('/pricing') })),
});

export const faqPage = (faqs: Faq[]): WithContext<FAQPage> => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })),
});

export const breadcrumbs = (trail: { name: string; path: string }[]): WithContext<BreadcrumbList> => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: abs(t.path) })),
});

export const article = (a: { title: string; description: string; path: string; published: string; updated?: string; author: string }): WithContext<Article> => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: a.title,
  description: a.description,
  mainEntityOfPage: abs(a.path),
  datePublished: a.published,
  dateModified: a.updated || a.published,
  author: { '@type': 'Organization', name: a.author },
  publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: abs('/assets/brand/metawurks-logo.png') } },
});

export const definedTerm = (t: { term: string; short: string; path: string }): WithContext<DefinedTerm> => ({
  '@context': 'https://schema.org',
  '@type': 'DefinedTerm',
  name: t.term,
  description: t.short,
  url: abs(t.path),
  inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'MetaWurks glossary', url: abs('/glossary') },
});

export const howTo = (h: { name: string; description: string; steps: { name: string; text: string }[] }): WithContext<HowTo> => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: h.name,
  description: h.description,
  step: h.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text })),
});
