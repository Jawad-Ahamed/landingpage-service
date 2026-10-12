import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { USE_CASES, useCase } from '@/content/data/useCases';
import { agent } from '@/content/data/agents';
import { pageMeta } from '@/lib/seo';
import { howTo } from '@/lib/schema';
import { agentItems, integrationItems, resourceItems, solutionItems, solutionsUsing } from '@/lib/links';
import { AnswerBlock, AppChips, CheckList, CtaBand, FaqSection, PageHero, Related, Section, SectionHead } from '@/components/templates/blocks';
import AgentRun from '@/components/templates/AgentRun';
import JsonLd from '@/components/seo/JsonLd';
import ThemeShift, { ACCT_SHIFT } from '@/components/motion/ThemeShift';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Motion';
import { titleCase } from '@/lib/titleCase';

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => USE_CASES.map(u => ({ slug: u.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const u = useCase((await params).slug);
  if (!u) return {};
  return pageMeta({ title: `${u.name} with AI: how firms automate it`, description: u.answer.answer.slice(0, 155).replace(/\s\S*$/, '') + '…', path: `/use-cases/${u.slug}` });
}

export default async function UseCasePage({ params }: Props) {
  const u = useCase((await params).slug);
  if (!u) notFound();
  const lead = agent(u.agents[0]);

  return (
    <main id="main">
      <PageHero
        trail={[{ name: 'Use cases', path: '/use-cases' }, { name: u.name, path: `/use-cases/${u.slug}` }]}
        eyebrow="Use case"
        headline={u.headline}
        lede={u.lede}
        secondary={{ label: 'Estimate your hours back', href: '/resources/roi-calculator' }}
        aside={<AgentRun run={u.run} apps={lead?.reads || u.integrations} />}
      />

      <Section label="Short answer" tight><AnswerBlock answer={u.answer} /></Section>

      <ThemeShift {...ACCT_SHIFT} />

      <Section paper label="Before and after">
        <SectionHead eyebrow="The payoff" title="From busywork" hl="to finished prep." />
        <Stagger className="pg-ba">
          <StaggerItem className="pg-ba__col"><h3>Before</h3><CheckList items={u.before} tone="no" /></StaggerItem>
          <StaggerItem className="pg-ba__col pg-ba__col--after"><h3>With MetaWurks</h3><CheckList items={u.after} tone="grn" /></StaggerItem>
        </Stagger>
      </Section>

      <Section label="How to do it">
        <div className="pg-split">
          <div className="pg-sticky">
            <SectionHead eyebrow="Step by step" title={`How to automate ${u.name.toLowerCase()}`} hl="in five steps." />
            <Reveal><AppChips slugs={u.integrations} /></Reveal>
          </div>
          <Stagger as="ol" className="pg-steps">
            {u.howto.map(s => <StaggerItem as="li" key={s.name} className="pg-step"><div><h3>{titleCase(s.name)}</h3><p data-read>{s.text}</p></div></StaggerItem>)}
          </Stagger>
        </div>
        <JsonLd data={howTo({ name: `How to automate ${u.name.toLowerCase()} with AI`, description: u.answer.answer, steps: u.howto })} />
      </Section>

      <FaqSection faqs={u.faqs} title={`${u.name} with AI:`} hl="your questions." />
      <Related items={[...agentItems(u.agents), ...integrationItems(u.integrations.slice(0, 3)), ...solutionItems(solutionsUsing('useCases', u.slug)), ...resourceItems(['month-end-and-tax-season-checklist'])]} />
      <CtaBand />
    </main>
  );
}
