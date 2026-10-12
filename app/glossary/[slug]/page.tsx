import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GLOSSARY, glossaryTerm } from '@/content/data/glossary';
import { pageMeta } from '@/lib/seo';
import { definedTerm } from '@/lib/schema';
import { exists } from '@/lib/routes';
import { CtaBand, PageHero, Section } from '@/components/templates/blocks';
import JsonLd from '@/components/seo/JsonLd';
import { Reveal } from '@/components/motion/Motion';

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => GLOSSARY.map(g => ({ slug: g.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = glossaryTerm((await params).slug);
  if (!g) return {};
  return pageMeta({ title: `What is ${g.term}? Definition for firms`, description: g.short.slice(0, 158).replace(/\s\S*$/, '') + '…', path: `/glossary/${g.slug}` });
}

export default async function GlossaryTermPage({ params }: Props) {
  const g = glossaryTerm((await params).slug);
  if (!g) notFound();
  const related = g.related.map(glossaryTerm).filter(Boolean);
  const path = `/glossary/${g.slug}`;

  return (
    <main id="main">
      <PageHero trail={[{ name: 'Glossary', path: '/glossary' }, { name: g.term, path }]} eyebrow="Glossary"
        headline={['What is', `${g.term}?`]} lede={g.short} layout="solo" ctas={false} />
      <Section label="Definition">
        <div className="pg-article">
          <Reveal>
            <article className="pg-prose">
              {g.body.map((p, i) => <p key={i}>{p}</p>)}
              <p style={{ fontSize: 14.5, color: 'var(--faint)' }}>General information, not legal or tax advice.</p>
            </article>
          </Reveal>
          <aside className="pg-toc" aria-label="Related">
            {related.length > 0 && <><b className="eyebrow">Related terms</b>{related.map(r => <Link key={r!.slug} href={`/glossary/${r!.slug}`}>{r!.term}</Link>)}</>}
            {g.seeAlso && <><b className="eyebrow" style={{ marginTop: 14 }}>See also</b>{g.seeAlso.filter(s => exists(s.href)).map(s => <Link key={s.href} href={s.href}>{s.label}</Link>)}</>}
            <Link href="/glossary" style={{ marginTop: 14 }}>← All terms</Link>
          </aside>
        </div>
      </Section>
      <CtaBand />
      <JsonLd data={definedTerm({ term: g.term, short: g.short, path })} />
    </main>
  );
}
