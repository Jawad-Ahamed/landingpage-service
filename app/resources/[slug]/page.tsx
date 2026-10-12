import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RESOURCES, resource } from '@/content/data/resources';
import { pageMeta } from '@/lib/seo';
import { resourceItems } from '@/lib/links';
import { CheckList, CtaBand, FaqSection, PageHero, Related, Section } from '@/components/templates/blocks';
import RoiCalculator from '@/components/forms/RoiCalculator';
import LeadForm from '@/components/forms/LeadForm';
import { Reveal } from '@/components/motion/Motion';

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => RESOURCES.map(r => ({ slug: r.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = resource((await params).slug);
  if (!r) return {};
  return pageMeta({ title: `${r.title} (free ${r.kind.toLowerCase()})`, description: r.blurb, path: `/resources/${r.slug}` });
}

const ROI_FAQS = [
  { q: 'How is "hours back" calculated?', a: 'People × admin hours per person per week × 4.33 weeks × the share you\'d hand off. The share is your own estimate; agents prep and people still review, so start conservative.' },
  { q: 'What counts as admin?', a: 'Work that isn\'t judgment: chasing documents, re-keying numbers between systems, inbox triage, reconciling payouts, building routine reports and assembling packets.' },
  { q: 'Do I have to give my email?', a: 'No. The calculator is free to use. Only emailing yourself the results asks for an address.' },
];

export default async function ResourcePage({ params }: Props) {
  const r = resource((await params).slug);
  if (!r) notFound();
  const others = RESOURCES.filter(o => o.slug !== r.slug).map(o => o.slug);

  if (r.kind === 'Calculator') {
    return (
      <main id="main">
        <PageHero trail={[{ name: 'Resources', path: '/resources' }, { name: r.title, path: `/resources/${r.slug}` }]} eyebrow="Free calculator"
          headline={['How many hours does', 'admin cost your firm?']} lede={r.blurb} layout="solo" ctas={false} />
        <section className="section section--tight" aria-label="Calculator" style={{ paddingTop: 0 }}>
          <div className="container"><Reveal><RoiCalculator /></Reveal></div>
        </section>
        <FaqSection faqs={ROI_FAQS} title="How the calculator" hl="works." />
        <Related items={resourceItems(others)} />
        <CtaBand title="Want these hours back? Book a 1:1 call for your" hl="exact setup." secondary={{ label: 'See pricing', href: '/pricing' }} />
      </main>
    );
  }

  return (
    <main id="main">
      <PageHero trail={[{ name: 'Resources', path: '/resources' }, { name: r.title, path: `/resources/${r.slug}` }]} eyebrow={`Free ${r.kind.toLowerCase()} · ${r.format}`}
        headline={[r.title.split(' for ')[0], r.title.includes(' for ') ? `for ${r.title.split(' for ')[1]}.` : 'Free to download.']} lede={r.blurb} ctas={false}
        aside={
          <div className="pg-card">
            <h3>{r.status === 'ready' ? 'Get it free' : 'Get it first'}</h3>
            <p style={{ color: 'var(--slate)', fontSize: 15.5 }}>{r.status === 'ready' ? 'We\'ll email it to you and show the download right away.' : 'It\'s being finalized. Leave your email and we\'ll send it the day it\'s ready.'}</p>
            <LeadForm kind="resource" resource={r.slug} cta={r.status === 'ready' ? 'Send me the ' + r.kind.toLowerCase() : 'Notify me'} fields={['name', 'firmType']}
              done={r.status === 'ready' ? 'Check your inbox for the download.' : 'You\'re on the list. We\'ll email it the day it\'s ready.'} />
          </div>
        } />
      <Section paper label="What you get">
        <div className="pg-split">
          <div className="pg-sticky"><Reveal><h2 className="h2">What&apos;s inside</h2></Reveal><Reveal delay={0.08}><p className="lede">For {r.audience.toLowerCase()}.</p></Reveal></div>
          <Reveal><div className="pg-card"><CheckList items={r.outcome} tone="grn" /></div></Reveal>
        </div>
      </Section>
      <Related items={resourceItems(others)} />
      <CtaBand />
    </main>
  );
}
