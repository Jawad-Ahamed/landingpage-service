import { AGENTS } from '@/content/data/agents';
import { pageMeta } from '@/lib/seo';
import { AnswerBlock, CtaBand, PageHero, Section, SectionHead, Tiles } from '@/components/templates/blocks';

export const metadata = pageMeta({ title: 'AI agents for firms: tax prep, month-end close, collections and more', description: 'Built-in MetaWurks agents for tax prep, month-end close, collections and finance questions, plus examples of agents firms describe in plain English for legal and healthcare work.', path: '/agents' });

export default function AgentsPage() {
  const builtIn = AGENTS.filter(a => a.kind !== 'Example');
  const examples = AGENTS.filter(a => a.kind === 'Example');
  const tile = (a: typeof AGENTS[number]) => ({ eyebrow: `${a.kind} · ${a.area}`, title: a.name, body: a.blurb, icon: a.icon, href: `/agents/${a.slug}`, more: 'See it run' });
  return (
    <main id="main">
      <PageHero trail={[{ name: 'Agents', path: '/agents' }]} eyebrow="Agents & skills" headline={['The chores that eat your week,', 'handed off.']}
        lede="Start with built-in agents and skills, or describe a new one in plain English. No code, no IT ticket. Every agent drafts and flags; a person approves." layout="solo" />
      <Section label="Short answer" tight>
        <AnswerBlock answer={{ question: 'What is an AI agent for a professional firm?', updated: '2026-10-06', answer: 'An AI agent is software that completes a multi-step task, such as pulling a client\'s books, matching documents and drafting workpapers, using the tools you connect. In MetaWurks, agents prepare and flag; they never file, post or send without a person approving the result.' }} />
      </Section>
      <Section paper label="Built-in agents">
        <SectionHead eyebrow="Built in" title="Ready to run" hl="on day one." />
        <Tiles cols={3} items={builtIn.map(tile)} />
      </Section>
      <Section label="Example agents">
        <SectionHead eyebrow="Describe your own" title="Brief it like a new hire." hl="Rerun it anytime." lede="These are examples of agents firms describe in plain English for legal and healthcare work." />
        <Tiles cols={2} items={examples.map(tile)} />
      </Section>
      <CtaBand />
    </main>
  );
}
