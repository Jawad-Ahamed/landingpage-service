import { pageMeta } from '@/lib/seo';
import { CLAIMS } from '@/content/data/claims';
import { resourceItems } from '@/lib/links';
import { AnswerBlock, ClaimNotes, CtaBand, FaqSection, PageHero, Related, Section, SectionHead, Tiles } from '@/components/templates/blocks';
import Icon from '@/components/templates/Icon';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Motion';

export const metadata = pageMeta({ title: 'Security & data integrity: how MetaWurks handles client data', description: 'How MetaWurks protects client data: OAuth sign-in with no stored passwords, cited answers, drafts that wait for approval, locked projects, and data that is never sold. Plus what we don\'t claim yet.', path: '/security' });

const PILLARS = [
  { icon: 'key', title: 'OAuth, never passwords', body: 'You sign in on each app\'s own screen. MetaWurks never stores or shares your passwords, and access tokens are stored encrypted.' },
  { icon: 'file', title: 'Every answer cited', body: 'Answers link to the file, page or ledger record they came from, so anyone can verify a number in seconds. That\'s what we mean by data integrity.' },
  { icon: 'mail', title: 'Drafts wait for your OK', body: 'Agents write the email; you read it, edit it and approve it. Nothing goes to a client on its own, and "Needs review" items wait for a person.' },
  { icon: 'users', title: 'Your connections stay yours', body: 'Each person connects their own accounts, so one partner\'s inbox isn\'t the whole firm\'s inbox.' },
  { icon: 'lock', title: 'Locked projects', body: 'Keep sensitive work, like a client\'s tax return or a matter, in a private, locked project apart from the rest of the workspace.' },
  { icon: 'unlink', title: 'Leave clean', body: 'Disconnect a tool and its access token is revoked. Delete your account and its associated data goes with it.†' },
  { icon: 'cloud', title: 'Encrypted, on Google Cloud', body: 'Sensitive data is encrypted, traffic runs over HTTPS, and the platform is hosted on Google Cloud.†' },
  { icon: 'eyeoff', title: 'Patient details masked', body: 'Patient identifiers are masked at intake, so an agent can work the file without exposing who it\'s about.†' },
  { icon: 'shield', title: 'Never sold', body: 'Your data is never sold, before or after you leave. Whether a model provider may learn from it depends on its terms, which we\'re confirming in writing.†' },
];

const FAQS = [
  { q: 'Is my clients\' data used to train AI models?', a: 'We never sell your data. Whether a model provider can learn from your data depends on its terms. We\'re confirming those terms in writing for every provider behind Auto and will walk you through them on your call.' },
  { q: 'Are you HIPAA compliant? Will you sign a BAA?', a: 'Not today, and we won\'t claim otherwise. Talk to us before uploading patient records; we\'ll state our BAA position plainly on a 1:1 call. Don\'t process PHI until that\'s settled in writing.' },
  { q: 'Do you have a SOC 2 report?', a: 'Not yet. We\'ll publish our status here when an audit is underway, and we\'ll never imply a certification we don\'t hold.' },
  { q: 'What happens to our data if we leave?', a: 'Disconnect any tool and its access token is revoked. Delete your account and its associated data is deleted too. Your data is never sold, before or after you leave.' },
  { q: 'Who at MetaWurks can see our data?', a: 'Access is limited to what\'s needed to run and support the service. Ask on a 1:1 call for the details that matter to your firm\'s policy.' },
];

export default function SecurityPage() {
  const notYet = CLAIMS.filter(c => c.status === 'blocked');
  return (
    <main id="main">
      <PageHero trail={[{ name: 'Security & data integrity', path: '/security' }]} eyebrow="Trust center"
        headline={['Your clients\' data stays', 'your clients\' data.']}
        lede="Built for people bound by confidentiality: CPAs, attorneys and medical practices. Here's exactly what we do, in plain English, and what we don't claim yet."
        layout="solo" secondary={{ label: 'Get the vendor checklist', href: '/resources/ai-vendor-due-diligence-checklist' }}
        meta={['OAuth sign-in', 'Cited answers', 'Drafts wait for approval', 'Never sold']} />

      <Section label="Short answer" tight>
        <AnswerBlock answer={{ question: 'How does MetaWurks keep client data secure?', updated: '2026-10-06',
          answer: 'MetaWurks connects to your firm\'s tools through OAuth, so it never stores passwords. Each person connects their own accounts, sensitive work can sit in locked projects, every answer cites its source, and no email reaches a client without approval. Disconnecting a tool revokes its token, and your data is never sold.' }} />
      </Section>

      <Section paper label="How we protect your data">
        <SectionHead eyebrow="What we do" title="Nine commitments," hl="in plain English." />
        <Tiles cols={3} items={PILLARS} />
        <ClaimNotes ids={['delete', 'gcp', 'phi-masking', 'model-training']} />
      </Section>

      <Section label="What we don't claim">
        <div className="pg-split">
          <div className="pg-sticky">
            <SectionHead eyebrow="Honest status" title="What we don't" hl="claim yet." lede="Careful firms deserve straight answers. Here's what isn't in place today, so you can plan around it." />
          </div>
          <Stagger className="pg-grid" gap={0.08}>
            {notYet.map(c => (
              <StaggerItem key={c.id} className="pg-note">
                <span className="pg-note__ico"><Icon name="flag" /></span>
                <div><h3>{c.text.replace(/\.$/, '')}: Not Yet</h3><p>{c.id === 'baa' ? 'Our BAA position isn\'t settled. Don\'t process PHI in MetaWurks until it is, in writing.' : c.id === 'hipaa' ? 'We don\'t claim HIPAA compliance. Talk to us before any patient records come near the workspace.' : 'No SOC 2 report exists yet. We\'ll publish our status here when an audit is underway.'}</p></div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      <Section paper label="Vendor checklist" tight>
        <Reveal>
          <div className="pg-note" style={{ alignItems: 'center' }}>
            <span className="pg-note__ico"><Icon name="check-c" /></span>
            <div><h3>Ask Every AI Vendor the Same 25 Questions.</h3><p>Our free checklist covers training, retention, access, PHI, IRC 7216 and ABA Opinion 512, with what a good answer sounds like. <a href="/resources/ai-vendor-due-diligence-checklist">Get the checklist →</a></p></div>
          </div>
        </Reveal>
      </Section>

      <FaqSection faqs={FAQS} title="The questions you should ask" hl="any AI vendor." />
      <Related items={resourceItems(['ai-vendor-due-diligence-checklist', 'firm-ai-use-policy-template', 'roi-calculator'])} />
      <CtaBand />
    </main>
  );
}
