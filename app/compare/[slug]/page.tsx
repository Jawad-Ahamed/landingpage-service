import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { COMPARE, compare } from '@/content/data/compare';
import { pageMeta } from '@/lib/seo';
import { resourceItems, solutionItems, useCaseItems } from '@/lib/links';
import { AnswerBlock, CheckList, CtaBand, FaqSection, PageHero, Related, Section, SectionHead } from '@/components/templates/blocks';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Motion';

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => COMPARE.map(c => ({ slug: c.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = compare((await params).slug);
  if (!c) return {};
  return pageMeta({ title: c.kind === 'tool' ? `MetaWurks vs ${c.name}: which is right for your firm?` : `MetaWurks vs ${c.name.toLowerCase()}`, description: c.answer.answer.slice(0, 155).replace(/\s\S*$/, '') + '…', path: `/compare/${c.slug}` });
}

const fmt = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export default async function ComparePage({ params }: Props) {
  const c = compare((await params).slug);
  if (!c) notFound();

  return (
    <main id="main">
      <PageHero trail={[{ name: 'Compare', path: '/compare' }, { name: `vs ${c.name}`, path: `/compare/${c.slug}` }]}
        eyebrow="Comparison" headline={c.headline} lede={c.lede} layout="solo"
        secondary={{ label: 'See pricing', href: '/pricing' }} />

      <Section label="Short answer" tight><AnswerBlock answer={c.answer} /></Section>

      <Section paper label="Side by side">
        <SectionHead eyebrow="Side by side" title={`MetaWurks and ${c.name},`} hl="feature by feature." />
        <Reveal>
          <div className="pg-table-wrap">
            <table className="pg-table">
              <thead><tr><th scope="col">&nbsp;</th><th scope="col">{c.name}</th><th scope="col" className="is-us">MetaWurks</th></tr></thead>
              <tbody>{c.rows.map(r => <tr key={r.label}><th scope="row">{r.label}</th><td>{r.them}</td><td className="is-us">{r.us}</td></tr>)}</tbody>
            </table>
          </div>
        </Reveal>
        <p className="pg-claims">Information about {c.name} is based on public sources, checked {c.sources.map(s => <span key={s.url}><a href={s.url} target="_blank" rel="noopener">{s.label}</a> ({fmt(s.checked)})</span>)}. Products change; check the vendor&apos;s site for current details.</p>
      </Section>

      <Section label="Which should you choose">
        <SectionHead eyebrow="Honest answer" title="Which one" hl="fits your firm?" />
        <Stagger className="pg-ba">
          <StaggerItem className="pg-ba__col"><h3>Choose {c.name} If…</h3><CheckList items={c.whenThem} /></StaggerItem>
          <StaggerItem className="pg-ba__col pg-ba__col--after"><h3>Choose MetaWurks If…</h3><CheckList items={c.whenUs} tone="grn" /></StaggerItem>
        </Stagger>
      </Section>

      <FaqSection faqs={c.faqs} title={`MetaWurks vs ${c.name}:`} hl="FAQ." />
      <Related items={[...solutionItems(['accounting-tax', 'law-firms', 'healthcare-practices']), ...useCaseItems(['tax-prep']), ...resourceItems(['ai-vendor-due-diligence-checklist'])]} />
      <CtaBand />
    </main>
  );
}
