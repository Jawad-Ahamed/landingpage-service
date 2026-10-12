import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { INTEGRATIONS, integration } from '@/content/data/integrations';
import { agent } from '@/content/data/agents';
import { pageMeta } from '@/lib/seo';
import { possessive } from '@/lib/site';
import { agentItems, resourceItems, solutionItems, solutionsUsing, useCaseItems } from '@/lib/links';
import { AnswerBlock, CheckList, ClaimNotes, CtaBand, FaqSection, PageHero, Related, Section, SectionHead } from '@/components/templates/blocks';
import AgentRun from '@/components/templates/AgentRun';
import Icon from '@/components/templates/Icon';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Motion';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => INTEGRATIONS.map(i => ({ slug: i.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const i = integration((await params).slug);
  if (!i) return {};
  return pageMeta({ title: `${i.name} integration: AI agents for your firm`, description: `${i.answer.answer.slice(0, 155).replace(/\s\S*$/, '')}…`, path: `/integrations/${i.slug}` });
}

export default async function IntegrationPage({ params }: Props) {
  const i = integration((await params).slug);
  if (!i) notFound();
  const featured = i.agents.map(agent).find(Boolean);

  return (
    <main id="main">
      <PageHero
        trail={[{ name: 'Integrations', path: '/integrations' }, { name: i.name, path: `/integrations/${i.slug}` }]}
        logo={{ src: i.logo, alt: `${i.name} logo` }}
        eyebrow={`${i.category} · Connects through OAuth`}
        headline={[`MetaWurks + ${i.name}.`, i.tagline]}
        lede={i.blurb}
        secondary={{ label: 'All integrations', href: '/integrations' }}
        meta={['Sign in on the app\'s own screen', 'No passwords stored', 'Disconnect anytime']}
        aside={featured ? <AgentRun run={featured.run} apps={featured.reads} /> : undefined}
      />

      <Section label="Short answer" tight>
        <AnswerBlock answer={i.answer} />
      </Section>

      <Section paper label={`What MetaWurks does with ${i.name}`}>
        <SectionHead eyebrow="Once connected" title={`What MetaWurks can do with ${i.name}†`} />
        <Stagger className="pg-grid pg-grid--3">
          <StaggerItem className="pg-card"><h3><Icon name="file" />What it reads</h3><CheckList items={i.reads} /></StaggerItem>
          <StaggerItem className="pg-card"><h3><Icon name="bolt" />What agents do</h3><CheckList items={i.does} /></StaggerItem>
          <StaggerItem className="pg-card"><h3><Icon name="shield" />What it never does</h3><CheckList items={i.never} tone="no" /></StaggerItem>
        </Stagger>
        <ClaimNotes ids={i.claims} />
      </Section>

      <Section label="Example prompts">
        <div className="pg-split">
          <div className="pg-sticky">
            <SectionHead eyebrow="Try asking" title="Ask in plain English." lede={`Questions like these run against your own ${i.name} data. Every answer shows where it came from.`} />
          </div>
          <Stagger className="pg-prompts">
            {i.prompts.map(p => <StaggerItem key={p} className="pg-prompt"><Icon name="chat" />{p}</StaggerItem>)}
          </Stagger>
        </div>
      </Section>

      <Section paper label="How to connect">
        <SectionHead eyebrow="Setup" title={`Connect ${i.name} in about a minute.`} />
        <Reveal>
          <ol className="pg-steps">
            <li className="pg-step"><div><h3>Open Integrations</h3><p>In your MetaWurks workspace, open Integrations and choose {i.name}.</p></div></li>
            <li className="pg-step"><div><h3>Sign in on {possessive(i.name)} own screen</h3><p>MetaWurks receives an encrypted access token. It never sees or stores your password.</p></div></li>
            <li className="pg-step"><div><h3>Ask or run an agent</h3><p>Ask a question or run an agent that uses {i.name}. Disconnect anytime and the token is revoked.</p></div></li>
          </ol>
        </Reveal>
      </Section>

      <FaqSection faqs={i.faqs} title={`${i.name} + MetaWurks:`} hl="your questions." />

      <Related items={[...agentItems(i.agents), ...useCaseItems(i.useCases), ...solutionItems(solutionsUsing('integrations', i.slug)), ...resourceItems(['ai-vendor-due-diligence-checklist'])]} />
      <CtaBand />
    </main>
  );
}
