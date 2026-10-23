import Link from 'next/link';
import { CATEGORIES, POSTS } from '@/lib/blog';
import { pageMeta } from '@/lib/seo';
import { CtaBand } from '@/components/templates/blocks';
import FeaturedCarousel from '@/components/blog/FeaturedCarousel';
import BlogExplorer from '@/components/blog/BlogExplorer';
import Cover from '@/components/blog/Cover';
import LeadForm from '@/components/forms/LeadForm';
import { HeroLine, Reveal, Stagger, StaggerItem } from '@/components/motion/Motion';

export const metadata = pageMeta({ title: 'The MetaWurks Journal: AI, compliance and admin for professional firms', description: 'Practical guides for accounting, law and healthcare firms on using AI safely: IRC 7216, ABA Opinion 512, prior authorization, month-end close and choosing AI vendors.', path: '/blog' });

const card = ({ slug, title, description, tags, cover, readingMinutes, published }: (typeof POSTS)[number]) => ({ slug, title, description, tags, cover, readingMinutes, published });
const fmt = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function BlogIndex() {
  const featured = POSTS.filter(p => p.featured).map(card);
  const picks = POSTS.filter(p => p.pick).slice(0, 3);

  return (
    <main id="main">
      {/* Masthead */}
      <section className="pg-hero" aria-labelledby="pg-h1" style={{ paddingBottom: 'clamp(28px, 4vw, 44px)' }}>
        <div className="hero-s__bg" aria-hidden="true"><div className="pat-grid" /></div>
        <div className="container relative">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-3 md:flex-1">
              <span className="eyebrow">The MetaWurks Journal</span>
              <h1 className="pg-h1" id="pg-h1"><HeroLine>Less Admin.</HeroLine><HeroLine className="hl" delay={0.06}>More Judgment.</HeroLine></h1>
            </div>
            <Reveal delay={0.1} y={10} className="md:w-[400px] md:flex-none">
              <p className="lede">Practical guides for accounting, law and healthcare firms on using AI safely, and on the admin you can finally hand off.</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="section section--tight" aria-label="Featured articles" style={{ paddingTop: 'clamp(20px, 3vw, 40px)' }}>
        <div className="container"><Reveal><FeaturedCarousel slides={featured} /></Reveal></div>
      </section>

      {/* Editor's picks */}
      <section className="section section--paper section--tight" aria-labelledby="picks-h">
        <div className="container">
          <div className="mb-8 flex items-end justify-between gap-4">
            <Reveal><h2 className="h2" id="picks-h" style={{ fontSize: 'clamp(1.7rem, 2.6vw, 2.2rem)' }}>Editor&apos;s Picks</h2></Reveal>
          </div>
          <Stagger className="grid gap-4 lg:grid-cols-3">
            {picks.map(p => (
              <StaggerItem key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="post-card group grid h-full grid-cols-[120px_minmax(0,1fr)] items-center gap-4 rounded-xl2 border border-rule bg-surface p-3 text-ink transition-[border-color,box-shadow,transform] duration-250 ease-expo hover:-translate-y-0.5 hover:border-cobalt-200 hover:shadow-lift">
                  <Cover cover={p.cover} size="sm" />
                  <span className="flex min-w-0 flex-col gap-1.5">
                    <span className="eyebrow" style={{ fontSize: 11 }}>{p.tags[0]}</span>
                    <b className="text-[15.5px] leading-snug tracking-[-0.01em] group-hover:text-cobalt">{p.title}</b>
                    <span className="text-[13px] text-faint">{fmt(p.published)} · {p.readingMinutes} min</span>
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section section--tight" aria-labelledby="nl-h">
        <div className="container">
          <Reveal>
            <div className="final grid gap-8 text-left md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center" style={{ textAlign: 'left' }}>
              <div className="grid-lines" aria-hidden="true" />
              <div>
                <span className="eyebrow">The monthly brief</span>
                <h2 className="h2" id="nl-h" style={{ margin: '14px 0 0', maxWidth: '16ch' }}>One Useful Email a Month. <span className="final__hl">No Fluff.</span></h2>
                <p style={{ margin: '14px 0 0' }}>New guides, rule changes worth knowing and one workflow you can hand off, for firm owners who read on the train.</p>
              </div>
              <div className="pg-final"><LeadForm kind="newsletter" cta="Subscribe" fields={[]} done="Thanks, we've received your request to join the monthly brief." /></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Latest */}
      <section className="section" aria-labelledby="latest-h" style={{ paddingTop: 'clamp(24px, 4vw, 56px)' }}>
        <div className="container">
          <Reveal><h2 className="h2 mb-8" id="latest-h" style={{ fontSize: 'clamp(1.7rem, 2.6vw, 2.2rem)' }}>Latest Articles</h2></Reveal>
          <BlogExplorer posts={POSTS.map(card)} categories={CATEGORIES} />
        </div>
      </section>

      <CtaBand />
    </main>
  );
}
