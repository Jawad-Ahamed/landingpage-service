import { INTEGRATIONS, INTEGRATION_CATEGORIES } from '@/content/data/integrations';
import { pageMeta } from '@/lib/seo';
import { AnswerBlock, CtaBand, FaqSection, PageHero, Section } from '@/components/templates/blocks';
import IntegrationDirectory from '@/components/templates/IntegrationDirectory';

export const metadata = pageMeta({ title: 'Integrations: QuickBooks, Xero, Gmail, Outlook, Drive and more', description: 'Connect MetaWurks to QuickBooks, Xero, Gmail, Outlook, Google Drive, OneDrive, Slack, Teams, Stripe and more through OAuth, or bring any tool with a Custom MCP connector.', path: '/integrations' });

const FAQS = [
  { q: 'How do integrations connect?', a: 'Through OAuth: you sign in on each app\'s own screen and MetaWurks receives an encrypted access token, never your password. Disconnecting revokes the token.' },
  { q: 'Do we have to migrate anything?', a: 'No. MetaWurks works on top of the tools you already use. Nothing to migrate, no new ledger to learn.' },
  { q: 'What if our tool isn\'t listed?', a: 'A [Custom MCP connector](/integrations/mcp) can bring in tools that offer an MCP server. Ask on a 1:1 call about your stack.' },
];

export default function IntegrationsPage() {
  return (
    <main id="main">
      <PageHero trail={[{ name: 'Integrations', path: '/integrations' }]} eyebrow={`${INTEGRATIONS.length} integrations · OAuth`}
        headline={['The tools you already use.', 'No passwords shared.']}
        lede="QuickBooks, Xero, Stripe, Gmail, Outlook, Slack, Teams and Drive, finally in one place. Nothing to migrate, no new system to learn." layout="solo" ctas={false} />
      <Section label="Short answer" tight>
        <AnswerBlock answer={{ question: 'Which tools does MetaWurks integrate with?', updated: '2026-10-06', answer: 'MetaWurks connects to QuickBooks, Xero, Stripe, Gmail, Outlook, Google Calendar, Google Drive, OneDrive, Slack, Microsoft Teams, Fireflies, Double, LinkedIn, Facebook and Figma through OAuth, plus any tool with an MCP server through a Custom MCP connector. Each person connects their own accounts and can disconnect anytime.' }} />
      </Section>
      <Section label="Directory">
        <IntegrationDirectory items={INTEGRATIONS.map(({ slug, name, logo, category, blurb }) => ({ slug, name, logo, category, blurb }))} categories={INTEGRATION_CATEGORIES} />
      </Section>
      <FaqSection faqs={FAQS} title="Integrations," hl="answered." />
      <CtaBand />
    </main>
  );
}
