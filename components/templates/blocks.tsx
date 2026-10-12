// Server-rendered building blocks shared by every page template.
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Answer, Faq } from '@/content/data/types';
import { INTEGRATIONS } from '@/content/data/integrations';
import { pendingNotes } from '@/content/data/claims';
import { breadcrumbs, faqPage } from '@/lib/schema';
import { exists } from '@/lib/routes';
import { bookHref } from '@/lib/site';
import JsonLd from '@/components/seo/JsonLd';
import { HeroLine, Reveal, Stagger, StaggerItem } from '@/components/motion/Motion';
import HeroScroll from '@/components/motion/HeroScroll';
import Icon from './Icon';
import Rich from './Rich';
import { titleCase, titlePair } from '@/lib/titleCase';

const fmtDate = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

/* ---------- Breadcrumbs (+ BreadcrumbList JSON-LD) ---------- */
export type Crumb = { name: string; path: string };
export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  const all = [{ name: 'Home', path: '/' }, ...trail];
  return (
    <>
      <nav className="pg-crumbs" aria-label="Breadcrumb">
        {all.map((c, i) => (
          <span key={c.path} style={{ display: 'contents' }}>
            {i > 0 && <span aria-hidden="true">/</span>}
            {i < all.length - 1 && exists(c.path) ? <Link href={c.path}>{c.name}</Link> : <span aria-current={i === all.length - 1 ? 'page' : undefined}>{c.name}</span>}
          </span>
        ))}
      </nav>
      <JsonLd data={breadcrumbs(all)} />
    </>
  );
}

/* ---------- Page hero ---------- */
type HeroProps = {
  trail: Crumb[];
  eyebrow?: ReactNode;
  headline: [string, string];
  lede: ReactNode;
  ctas?: boolean;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  meta?: string[];
  aside?: ReactNode;
  layout?: 'split' | 'solo' | 'center';
  logo?: { src: string; alt: string };
};
export function PageHero({ trail, eyebrow, headline, lede, ctas = true, primary, secondary, meta, aside, layout = aside ? 'split' : 'solo', logo }: HeroProps) {
  const p = primary || { label: 'Book a 1:1 call', href: bookHref('hero') };
  const copy = (
    <>
      <Breadcrumbs trail={trail} />
      {logo && <span className="pg-hero__logo"><img src={logo.src} alt={logo.alt} width={42} height={42} /></span>}
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1 className="pg-h1" id="pg-h1">
        <HeroLine>{titlePair(headline[0], headline[1])[0]}</HeroLine>
        <HeroLine className="hl" delay={0.06}>{titlePair(headline[0], headline[1])[1]}</HeroLine>
      </h1>
      <Reveal delay={0.1} y={12}><p className="lede">{lede}</p></Reveal>
      {ctas && (
        <Reveal delay={0.16} y={10}>
          <div className="pg-hero__ctas">
            <Link className="btn btn--primary" href={p.href}>{p.label} <Icon name="arrow" className="arrow" /></Link>
            {secondary && <Link className="btn btn--ghost" href={secondary.href}>{secondary.label}</Link>}
          </div>
        </Reveal>
      )}
      {meta && meta.length > 0 && (
        <Reveal delay={0.22} y={8}>
          <ul className="pg-hero__meta">{meta.map(m => <li key={m}><Icon name="check-c" />{m}</li>)}</ul>
        </Reveal>
      )}
    </>
  );
  return (
    <section className="pg-hero" aria-labelledby="pg-h1">
      <div className="hero-s__bg" aria-hidden="true"><div className="pat-grid" /></div>
      <HeroScroll className={`container pg-hero__inner${layout === 'solo' ? ' pg-hero__inner--solo' : layout === 'center' ? ' pg-hero__inner--center' : ''}`}
        copy={copy} aside={aside ? <Reveal delay={0.12} y={24}>{aside}</Reveal> : undefined} />
    </section>
  );
}

/* ---------- Short answer: the quotable 40–60 word answer (AEO) ---------- */
export function AnswerBlock({ answer }: { answer: Answer }) {
  return (
    <Reveal>
      <div className="pg-answer" id="answer">
        <h2 className="pg-answer__q">{titleCase(answer.question)}</h2>
        <p className="pg-answer__a">{answer.answer}</p>
        <span className="pg-answer__meta"><i aria-hidden="true" />Short answer · Updated <time dateTime={answer.updated}>{fmtDate(answer.updated)}</time></span>
      </div>
    </Reveal>
  );
}

/* ---------- Section wrapper + heading ---------- */
export function Section({ children, paper, id, label, tight }: { children: ReactNode; paper?: boolean; id?: string; label?: string; tight?: boolean }) {
  return (
    <section className={`section${paper ? ' section--paper' : ''}${tight ? ' section--tight' : ''}`} id={id} aria-label={label}>
      <div className="container">{children}</div>
    </section>
  );
}
export function SectionHead({ eyebrow, title, hl, lede, center }: { eyebrow?: string; title: string; hl?: string; lede?: ReactNode; center?: boolean }) {
  return (
    <div className={`section-head${center ? ' section-head--center' : ''}`}>
      {eyebrow && <Reveal y={12}><span className="eyebrow">{eyebrow}</span></Reveal>}
      <Reveal delay={0.06}><h2 className="h2">{titlePair(title, hl)[0]}{hl && <> <span className="hl">{titlePair(title, hl)[1]}</span></>}</h2></Reveal>
      {lede && <Reveal delay={0.12}><p className="lede">{lede}</p></Reveal>}
    </div>
  );
}

/* ---------- Lists, tiles, chips ---------- */
export function CheckList({ items, tone }: { items: string[]; tone?: 'no' | 'grn' }) {
  return <ul className={`pg-list${tone ? ` pg-list--${tone}` : ''}`}>{items.map(t => <li key={t}><Icon name={tone === 'no' ? 'eyeoff' : 'check'} /><span><Rich text={t} /></span></li>)}</ul>;
}

export function Tiles({ items, cols = 3 }: { items: { title: string; body: string; icon?: string; img?: string; href?: string; more?: string; src?: string; eyebrow?: string }[]; cols?: 2 | 3 | 4 }) {
  return (
    <Stagger className={`pg-grid pg-grid--${cols}`}>
      {items.map(t => {
        const inner = (
          <>
            {(t.icon || t.img) && <span className="pg-tile__ico">{t.img ? <img src={t.img} alt="" /> : <Icon name={t.icon!} />}</span>}
            {t.eyebrow && <span className="eyebrow">{t.eyebrow}</span>}
            <h3>{titleCase(t.title)}</h3>
            <p data-read><Rich text={t.body} /></p>
            {t.src && <span className="pg-tile__src">Source: {t.src}</span>}
            {t.href && <span className="pg-tile__more">{t.more || 'Learn more'} <Icon name="arrow" /></span>}
          </>
        );
        return (
          <StaggerItem key={t.title}>
            {t.href ? <Link className="pg-tile" href={t.href} style={{ height: '100%' }}>{inner}</Link> : <div className="pg-tile" style={{ height: '100%' }}>{inner}</div>}
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}

export function AppChips({ slugs, link = true }: { slugs: string[]; link?: boolean }) {
  const apps = slugs.map(s => INTEGRATIONS.find(i => i.slug === s)).filter(Boolean);
  return (
    <div className="pg-apps">
      {apps.map(a => link && exists(`/integrations/${a!.slug}`)
        ? <Link key={a!.slug} className="chip" href={`/integrations/${a!.slug}`}><img src={a!.logo} alt="" />{a!.name}</Link>
        : <span key={a!.slug} className="chip"><img src={a!.logo} alt="" />{a!.name}</span>)}
    </div>
  );
}

/* ---------- FAQ (+ FAQPage JSON-LD) ---------- */
export function FaqSection({ faqs, title = 'Questions firms ask', hl, eyebrow = 'FAQ', lede }: { faqs: Faq[]; title?: string; hl?: string; eyebrow?: string; lede?: string }) {
  if (!faqs.length) return null;
  return (
    <section className="section section--paper" aria-labelledby="faq-h" id="faq">
      <div className="container faq">
        <div className="section-head" style={{ marginBottom: 0 }}>
          <Reveal y={12}><span className="eyebrow">{eyebrow}</span></Reveal>
          <Reveal delay={0.06}><h2 className="h2" id="faq-h">{titlePair(title, hl)[0]}{hl && <> <span className="hl">{titlePair(title, hl)[1]}</span></>}</h2></Reveal>
          {lede && <Reveal delay={0.12}><p className="lede">{lede}</p></Reveal>}
        </div>
        <Reveal delay={0.1}>
          <div className="faq__list">
            {faqs.map(f => (
              <details className="qa" key={f.q}>
                <summary>{f.q}<i aria-hidden="true" /></summary>
                <div className="qa__a"><div><p><Rich text={f.a} /></p></div></div>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
      <JsonLd data={faqPage(faqs)} />
    </section>
  );
}

/* ---------- Pending-claims footnote ---------- */
export function ClaimNotes({ ids }: { ids?: string[] }) {
  const notes = pendingNotes(ids);
  if (!notes.length) return null;
  return <p className="pg-claims"><b>† Pending confirmation before launch:</b> {notes.join('; ')}.</p>;
}

/* ---------- Final call to action (the ink panel from the home page) ---------- */
export function CtaBand({ title = 'Book a 1:1 call for your firm\'s', hl = 'exact setup.', body = 'Bring your tool list and your worst admin chore. We\'ll show you what connects and what runs, live, on your own workflow.', secondary }: { title?: string; hl?: string; body?: string; secondary?: { label: string; href: string } }) {
  return (
    <section className="section section--tight" aria-labelledby="cta-h">
      <div className="container">
        <Reveal>
          <div className="final">
            <div className="grid-lines" aria-hidden="true" />
            <span className="eyebrow">Your firm, your setup</span>
            <h2 className="h2" id="cta-h">{titlePair(title, hl)[0]} <span className="final__hl">{titlePair(title, hl)[1]}</span></h2>
            <p>{body}</p>
            <div className="final__ctas">
              <Link className="btn btn--amber" href={bookHref('cta')}>Book a 1:1 call <Icon name="arrow" className="arrow" /></Link>
              <Link className="btn btn--line-dark" href={secondary?.href || '/resources/roi-calculator'}>{secondary?.label || 'Estimate your hours back'}</Link>
            </div>
            <p className="final__fine">Works with your current tools · Every answer cited · Drafts wait for your OK · Data never sold</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Related links (only to pages that exist) ---------- */
export function Related({ title = 'Keep exploring', items }: { title?: string; items: { eyebrow: string; title: string; body: string; href: string }[] }) {
  const live = items.filter(i => exists(i.href)).slice(0, 6);
  if (!live.length) return null;
  return (
    <section className="section pg-related" aria-labelledby="rel-h">
      <div className="container">
        <div className="section-head"><Reveal><h2 className="h2" id="rel-h">{titleCase(title)}</h2></Reveal></div>
        <Tiles cols={3} items={live.map(i => ({ ...i, more: 'Read more' }))} />
      </div>
    </section>
  );
}
