import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SOLUTIONS, solution } from '@/content/data/solutions';
import { agent } from '@/content/data/agents';
import { pageMeta } from '@/lib/seo';
import { exists, href } from '@/lib/routes';
import { agentItems, resourceItems, useCaseItems } from '@/lib/links';
import { AnswerBlock, AppChips, ClaimNotes, CtaBand, FaqSection, PageHero, Related, Section, SectionHead, Tiles } from '@/components/templates/blocks';
import AgentRun from '@/components/templates/AgentRun';
import Icon from '@/components/templates/Icon';
import { Reveal } from '@/components/motion/Motion';

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => SOLUTIONS.map(s => ({ slug: s.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = solution((await params).slug);
  if (!s) return {};
  return pageMeta({ title: `AI for ${s.name.toLowerCase()}: private AI agents`, description: s.lede.slice(0, 155).replace(/\s\S*$/, '') + '…', path: `/solutions/${s.slug}` });
}

export default async function SolutionPage({ params }: Props) {
  const s = solution((await params).slug);
  if (!s) notFound();
  const lead = agent(s.agents[0]);

  return (
    <main id="main">
      <PageHero
        trail={[{ name: 'Solutions', path: '/solutions' }, { name: s.short, path: `/solutions/${s.slug}` }]}
        eyebrow={<><span className={`tag tag--${s.tag}`}>{s.short}</span></>}
        headline={s.headline}
        lede={s.lede}
        secondary={{ label: 'Estimate your hours back', href: '/resources/roi-calculator' }}
        meta={['Works with your current tools', 'Every answer cited', 'Drafts wait for your OK']}
        aside={<AgentRun run={s.run} apps={lead?.reads || []} />}
      />

      <Section label="Short answer" tight><AnswerBlock answer={s.answer} /></Section>

      <Section label="The problem">
        <SectionHead eyebrow="Sound familiar?" title="Too many systems." hl="Too few hands." />
        <Tiles cols={3} items={s.pains.map(p => ({ title: p.title, body: p.body, src: p.source, icon: 'clock' }))} />
      </Section>

      <Section paper label="What MetaWurks takes off your plate">
        <SectionHead eyebrow="What it does" title="Hand off the prep." hl="Keep the judgment." lede="Agents pull, match and draft inside the tools you already use, then flag what needs a human." />
        <Tiles cols={4} items={s.jobs.map((j, k) => ({ title: j.title, body: j.body, icon: ['calc', 'mail', 'calendar', 'receipt'][k % 4], href: s.useCases[k] && exists(href.useCase(s.useCases[k])) ? href.useCase(s.useCases[k]) : undefined, more: 'See how' }))} />
      </Section>

      <Section label="Compliance">
        <div className="pg-split">
          <div className="pg-sticky">
            <SectionHead eyebrow="Your obligations" title="Built for people bound" hl="by confidentiality." />
          </div>
          <div style={{ display: 'grid', gap: 16 }}>
            <Reveal><div className="pg-note"><span className="pg-note__ico"><Icon name="scale" /></span><div><h3>{s.compliance.title}</h3><p>{s.compliance.body}</p></div></div></Reveal>
            <Reveal delay={0.08}><div className="pg-note"><span className="pg-note__ico"><Icon name="shield" /></span><div><h3>Controls that help</h3><p>OAuth sign-in with no stored passwords, per-person connections, locked projects, cited answers and drafts that wait for approval. <a href="/security">See security &amp; data integrity</a>.</p></div></div></Reveal>
            <ClaimNotes ids={s.claims} />
          </div>
        </div>
      </Section>

      <Section paper label="Integrations">
        <SectionHead eyebrow="Connect" title="The tools you already use." lede="Each connection is a sign-in on the app's own screen, not a migration." />
        <Reveal><AppChips slugs={s.integrations} /></Reveal>
      </Section>

      <FaqSection faqs={s.faqs} title={`AI for ${s.short.toLowerCase()}:`} hl="straight answers." />
      <Related items={[...useCaseItems(s.useCases), ...agentItems(s.agents), ...resourceItems(['roi-calculator', 'ai-vendor-due-diligence-checklist'])]} />
      <CtaBand />
    </main>
  );
}
