import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { POSTS, post } from '@/lib/blog';
import { pageMeta } from '@/lib/seo';
import { article } from '@/lib/schema';
import { AnswerBlock, Breadcrumbs, CtaBand } from '@/components/templates/blocks';
import JsonLd from '@/components/seo/JsonLd';
import Toc from '@/components/templates/Toc';
import Cover from '@/components/blog/Cover';
import ReadingProgress from '@/components/blog/ReadingProgress';
import { PostCard } from '@/components/blog/BlogExplorer';
import LeadForm from '@/components/forms/LeadForm';
import { HeroLine, Reveal, Stagger, StaggerItem } from '@/components/motion/Motion';
import { titlePair } from '@/lib/titleCase';

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
  const related = [...POSTS.filter(o => o.slug !== p.slug && o.tags.some(t => p.tags.includes(t))), ...POSTS.filter(o => o.slug !== p.slug)]
    .filter((o, i, a) => a.findIndex(x => x.slug === o.slug) === i).slice(0, 3);

  return (
    <main id="main">
      <ReadingProgress target="article-body" />
      <section className="pg-hero" aria-labelledby="pg-h1" style={{ paddingBottom: 'clamp(32px, 5vw, 56px)' }}>
        <div className="hero-s__bg" aria-hidden="true"><div className="pat-grid" /></div>
        <div className="container relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
          <div className="flex min-w-0 flex-col gap-5">
            <Breadcrumbs trail={[{ name: 'Blog', path: '/blog' }, { name: p.title, path }]} />
            <span className="eyebrow">{p.tags.join(' · ')}</span>
            <h1 className="pg-h1" id="pg-h1" style={{ fontSize: 'clamp(2.2rem, 4.4vw, 3.6rem)' }}><HeroLine>{titlePair(p.headline[0], p.headline[1])[0]}</HeroLine><HeroLine className="hl" delay={0.06}>{titlePair(p.headline[0], p.headline[1])[1]}</HeroLine></h1>
            <Reveal delay={0.1} y={10}><p className="lede">{p.description}</p></Reveal>
            <Reveal delay={0.16} y={8}>
              <div className="pg-byline"><span>{p.author}</span><span aria-hidden="true">·</span><time dateTime={p.published}>{fmt(p.published)}</time><span aria-hidden="true">·</span><span>{p.readingMinutes} min read</span></div>
            </Reveal>
          </div>
          <Reveal delay={0.12} y={20}><Cover cover={p.cover} size="lg" className="shadow-lift" /></Reveal>
        </div>
      </section>

      <section className="section section--tight" aria-label="Short answer" style={{ paddingTop: 0 }}>
        <div className="container pg-article">
          <div style={{ maxWidth: '72ch' }}><AnswerBlock answer={{ question: 'The short answer', answer: p.answer, updated: p.updated || p.published }} /></div>
        </div>
      </section>

      <section className="section" aria-label="Article" style={{ paddingTop: 0 }}>
        <div className="container pg-article" id="article-body">
          <article className="pg-prose" dangerouslySetInnerHTML={{ __html: p.html }} />
          <Toc headings={p.headings} />
        </div>
      </section>

      <section className="section section--paper section--tight" aria-labelledby="nl-h">
        <div className="container grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
          <Reveal><div><span className="eyebrow">The monthly brief</span><h2 className="h2" id="nl-h" style={{ marginTop: 12, fontSize: 'clamp(1.7rem, 2.6vw, 2.2rem)' }}>Get the Next Guide <span className="hl">in Your Inbox.</span></h2></div></Reveal>
          <Reveal delay={0.08}><LeadForm kind="newsletter" cta="Subscribe" fields={[]} done="Thanks, we've received your request to join the monthly brief." /></Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="next-h">
        <div className="container">
          <div className="mb-8 flex items-end justify-between gap-4">
            <Reveal><h2 className="h2" id="next-h" style={{ fontSize: 'clamp(1.7rem, 2.6vw, 2.2rem)' }}>Read Next</h2></Reveal>
            <Link href="/blog" className="text-[15px] font-semibold">All articles →</Link>
          </div>
          <Stagger className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map(r => <StaggerItem key={r.slug} as="article"><PostCard p={r} /></StaggerItem>)}
          </Stagger>
        </div>
      </section>

      <CtaBand />
      <JsonLd data={article({ title: p.title, description: p.description, path, published: p.published, updated: p.updated, author: p.author })} />
    </main>
  );
}
