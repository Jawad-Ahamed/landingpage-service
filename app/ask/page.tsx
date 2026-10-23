import Link from 'next/link';
import { pageMeta } from '@/lib/seo';
import { PageHero, Section } from '@/components/templates/blocks';
import DocumentChat from '@/components/ask/DocumentChat';

// A working preview of the composer's privacy check. It runs entirely in the browser with no AI model behind it,
// so it stays out of search results and the sitemap.
export const metadata = {
  ...pageMeta({ title: 'Ask your documents: workspace preview', description: 'Try the MetaWurks composer: attach a file, ask a question, and see the privacy check that offers Private mode before a document is sent in Normal mode.', path: '/ask' }),
  robots: { index: false, follow: true },
};

export default function AskPage() {
  return (
    <main id="main">
      <PageHero trail={[{ name: 'Ask your documents', path: '/ask' }]} eyebrow="Workspace preview" ctas={false}
        headline={['Ask your documents,', 'with a privacy check first.']}
        lede="Attach a file, ask a question about it and send it in Normal mode. Before anything is sent, MetaWurks asks whether the document belongs in Private mode. This preview isn't connected to an AI model, and your files never leave your browser." />

      <Section label="Workspace preview" tight>
        <DocumentChat />
        <p className="dq-more"><Link href="/security#private-mode-check">Why does MetaWurks ask about Private mode? →</Link></p>
      </Section>
    </main>
  );
}
