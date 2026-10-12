import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { POSTS, post } from '@/lib/blog';
import { pageMeta } from '@/lib/seo';
import { article } from '@/lib/schema';
import { resourceItems } from '@/lib/links';
import { AnswerBlock, CtaBand, PageHero, Related, Section } from '@/components/templates/blocks';
import JsonLd from '@/components/seo/JsonLd';
import Toc from '@/components/templates/Toc';

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => POSTS.map(p => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = post((await params).slug);
  if (!p) return {};
  return pageMeta({ title: p.title, description: p.description, path: `/blog/${p.slug}`, type: 'article', published: p.published });
}

const fmt = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export default async function PostPage({ params }: Props) {
  const p = post((await params).slug);
  if (!p) notFound();
  const path = `/blog/${p.slug}`;
  const others = POSTS.filter(o => o.slug !== p.slug).slice(0, 3);

  return (
    <main id="main">
      <PageHero trail={[{ name: 'Blog', path: '/blog' }, { name: p.title, path }]} eyebrow={p.tags.join(' · ')}
        headline={p.headline}
        lede={p.description} layout="solo" ctas={false} />

      <Section label="Article" tight>
        <div className="pg-byline" style={{ marginBottom: 22 }}>
          <span>{p.author}</span><span>·</span><time dateTime={p.published}>{fmt(p.published)}</time><span>·</span><span>{p.readingMinutes} min read</span>
        </div>
        <AnswerBlock answer={{ question: 'The short answer', answer: p.answer, updated: p.updated || p.published }} />
      </Section>

      <section className="section" aria-label="Article body" style={{ paddingTop: 0 }}>
        <div className="container pg-article">
          <article className="pg-prose" dangerouslySetInnerHTML={{ __html: p.html }} />
          <Toc headings={p.headings} />
        </div>
      </section>

      <Related title="Read next" items={[...others.map(o => ({ eyebrow: o.tags[0] || 'Blog', title: o.title, body: o.description, href: `/blog/${o.slug}` })), ...resourceItems(['ai-vendor-due-diligence-checklist', 'firm-ai-use-policy-template', 'roi-calculator'])]} />
      <CtaBand />
      <JsonLd data={article({ title: p.title, description: p.description, path, published: p.published, updated: p.updated, author: p.author })} />
    </main>
  );
}
