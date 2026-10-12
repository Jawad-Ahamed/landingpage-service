import { GLOSSARY } from '@/content/data/glossary';
import { pageMeta } from '@/lib/seo';
import { CtaBand, PageHero, Section, Tiles } from '@/components/templates/blocks';

export const metadata = pageMeta({ title: 'Glossary: AI, compliance and practice terms for firms', description: 'Plain-English definitions of the AI, compliance and practice-management terms accounting, law and healthcare firms run into, from IRC 7216 to MCP.', path: '/glossary' });

export default function GlossaryPage() {
  const terms = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
  return (
    <main id="main">
      <PageHero trail={[{ name: 'Glossary', path: '/glossary' }]} eyebrow="Glossary" headline={['The words behind', 'AI for professional firms.']}
        lede="Plain-English definitions of the AI, compliance and practice terms accounting, law and healthcare firms run into." layout="solo" ctas={false} />
      <Section label="All terms">
        <Tiles cols={3} items={terms.map(t => ({ title: t.term, body: t.short.split('. ')[0] + '.', href: `/glossary/${t.slug}`, more: 'Read definition' }))} />
      </Section>
      <CtaBand />
    </main>
  );
}
