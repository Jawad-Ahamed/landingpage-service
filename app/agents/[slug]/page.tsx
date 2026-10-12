import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AGENTS, agent } from '@/content/data/agents';
import { pageMeta } from '@/lib/seo';
import { integrationItems, resourceItems, solutionItems, solutionsUsing } from '@/lib/links';
import { USE_CASES } from '@/content/data/useCases';
import { useCaseItems } from '@/lib/links';
import { AnswerBlock, AppChips, CheckList, CtaBand, FaqSection, PageHero, Related, Section, SectionHead } from '@/components/templates/blocks';
import AgentRun from '@/components/templates/AgentRun';
import Icon from '@/components/templates/Icon';
import { Stagger, StaggerItem } from '@/components/motion/Motion';

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => AGENTS.map(a => ({ slug: a.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = agent((await params).slug);
  if (!a) return {};
  return pageMeta({ title: `${a.name}: AI agent for ${a.area.toLowerCase()}`, description: a.answer.answer.slice(0, 155).replace(/\s\S*$/, '') + '…', path: `/agents/${a.slug}` });
}

export default async function AgentPage({ params }: Props) {
  const a = agent((await params).slug);
  if (!a) notFound();
  const kindLabel = a.kind === 'Example' ? 'Example agent · describe your own' : a.kind;
  const ucs = USE_CASES.filter(u => u.agents.includes(a.slug)).map(u => u.slug);

  return (
    <main id="main">
      <PageHero
        trail={[{ name: 'Agents', path: '/agents' }, { name: a.name, path: `/agents/${a.slug}` }]}
        eyebrow={<><Icon name={a.icon} /> {kindLabel} · {a.area}</>}
        headline={[a.name + '.', 'Prep done. Judgment yours.']}
        lede={a.blurb}
        secondary={{ label: 'All agents', href: '/agents' }}
        aside={<AgentRun run={a.run} apps={a.reads} />}
      />

      <Section label="Short answer" tight><AnswerBlock answer={a.answer} /></Section>

      <Section paper label="How it works">
        <SectionHead eyebrow="How it works" title="Brief it like a new hire." hl="Review it like a partner." />
        <Stagger className="pg-grid pg-grid--3">
          <StaggerItem className="pg-card"><h3><Icon name="chat" />It Asks</h3><CheckList items={a.asks} /></StaggerItem>
          <StaggerItem className="pg-card"><h3><Icon name="plug" />It Reads</h3><AppChips slugs={a.reads} /></StaggerItem>
          <StaggerItem className="pg-card"><h3><Icon name="flag" />It Always Hands Back</h3><CheckList items={a.reviews} /></StaggerItem>
        </Stagger>
      </Section>

      <FaqSection faqs={a.faqs} title={`${a.name}:`} hl="your questions." />
      <Related items={[...useCaseItems(ucs), ...integrationItems(a.reads), ...solutionItems(solutionsUsing('agents', a.slug)), ...resourceItems(['roi-calculator'])]} />
      <CtaBand />
    </main>
  );
}
