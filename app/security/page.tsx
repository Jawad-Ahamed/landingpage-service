import Link from 'next/link';
import { pageMeta } from '@/lib/seo';
import { resourceItems } from '@/lib/links';
import { AnswerBlock, ClaimNotes, CtaBand, FaqSection, PageHero, Related, Section, SectionHead, Tiles } from '@/components/templates/blocks';
import Icon from '@/components/templates/Icon';
import { Reveal } from '@/components/motion/Motion';

// Blocked claims (HIPAA, BAA, SOC 2 in content/data/claims.ts) are never stated here, positively or as a "not yet" list;
// healthcare and vendor-review questions are answered by pointing to a 1:1 call.
export const metadata = pageMeta({ title: 'Security and AI data privacy at MetaWurks', description: 'How MetaWurks protects confidential business information: OAuth sign-in with no stored passwords, per-person connections, cited answers, drafts that wait for your approval, Private mode for sensitive documents, and data that is never sold.', path: '/security' });

const PILLARS = [
  { icon: 'key', title: 'OAuth, never passwords', body: 'You sign in on each app\'s own screen. MetaWurks never stores or shares your passwords, and access tokens are stored encrypted.' },
  { icon: 'file', title: 'Every answer cited', body: 'Answers link to the file, page or ledger record they came from, so anyone can verify a number in seconds. That\'s what we mean by data integrity.' },
  { icon: 'mail', title: 'Drafts wait for your OK', body: 'Agents write the email; you read it, edit it and approve it. Nothing goes to a client on its own, and "Needs review" items wait for a person.' },
  { icon: 'users', title: 'Your connections stay yours', body: 'Each person connects their own accounts, so one partner\'s inbox isn\'t the whole firm\'s inbox.' },
  { icon: 'lock', title: 'Locked projects', body: 'Keep sensitive work, like a client\'s tax return or a matter, in a private, locked project apart from the rest of the workspace.' },
  { icon: 'unlink', title: 'Leave clean', body: 'Disconnect a tool and its access token is revoked. To have your account\'s data deleted, contact us.' },
  { icon: 'eyeoff', title: 'Private mode for sensitive work', body: 'Private mode is designed to answer with MetaWurks\' own model, hosted by MetaWurks, instead of an outside AI provider. Use it for confidential files, and ask us for the technical details.' },
  { icon: 'pulse', title: 'Health data by arrangement', body: 'Healthcare practices talk to us before patient records come into the workspace, and we confirm in writing what\'s appropriate for the practice first.' },
  { icon: 'shield', title: 'Never sold', body: 'Your data is never sold, before or after you leave. Outside Private mode, AI model providers process requests under their own data-use terms, and we\'ll walk you through the terms that apply to your workspace.' },
];

// Normal mode vs Private mode, limited to what content/data/claims.ts and /privacy-policy already state.
const MODE_ROWS: { label: string; normal: string; priv: string; both?: boolean }[] = [
  { label: 'Who answers', normal: 'An outside AI model, chosen for each task by Auto.', priv: 'Designed to be the MetaWurks Private LLM, on MetaWurks\' own servers.' },
  { label: 'Where your question and files go', normal: 'To the third-party AI model provider handling the task, so it can answer.', priv: 'Designed to stay with MetaWurks rather than go to an outside AI provider.' },
  { label: 'Whether a provider may learn from them', normal: 'Governed by that provider\'s data-use terms; we\'ll walk you through the terms that apply to your workspace.', priv: 'Designed not to involve an outside AI provider.' },
  { label: 'Reads your file for sensitive content', normal: 'No. The check is a reminder, not a scan.', priv: 'No.' },
];

const FAQS = [
  { q: 'How does MetaWurks protect confidential business data?', a: 'MetaWurks is built for firms bound by confidentiality. Tools connect through OAuth, so MetaWurks never stores your passwords; each person connects their own accounts; disconnecting a tool revokes its access token; answers cite the file or record they came from; and email drafts wait for your approval before anything is sent. For sensitive documents, Private mode is designed to answer with MetaWurks\' own model instead of an outside AI provider. Your data is never sold. Our [Privacy Policy](/privacy-policy) sets out what we collect and how we use it.' },
  { q: 'How does MetaWurks handle uploaded documents?', a: 'Documents you upload, and the files and records agents read from your connected tools, are used to answer your questions and prepare the drafts you ask for. Every answer cites the page, file or record it came from, so your team can check each figure. In Normal mode, the AI model provider handling a task processes the content needed to answer it; Private mode is designed to keep requests with MetaWurks instead. To ask what we hold for your account, or to have it deleted, [contact us](/contact).' },
  { q: 'What privacy considerations apply when using AI with client files?', a: 'Know where client data goes, keep a person reviewing the output, and match each task to the right mode. Before using any AI tool with client information, check which providers process it and under what terms, make sure nothing reaches a client without review, and use Private mode for confidential files. Professional rules apply too, such as [IRC Section 7216](/blog/ai-for-cpa-firms-irc-7216) for tax preparers and [ABA Formal Opinion 512](/blog/aba-formal-opinion-512-small-firms) for lawyers.' },
  { q: 'Why does MetaWurks ask me to switch to Private mode when I attach a document?', a: 'MetaWurks can\'t tell from a file whether it\'s confidential, so it asks every time you send a question with an attachment in Normal mode. You can switch the conversation to Private mode, continue in Normal mode, or go back and review the file. [See how the two modes differ](/security#private-mode-check).' },
  { q: 'Is my clients\' data used to train AI models?', a: 'We never sell your data. Outside Private mode, the AI model providers your workspace uses process requests under their own data-use terms, and we\'ll walk you through the current terms for those providers on a 1:1 call. For confidential files, use Private mode, which is designed to keep requests with MetaWurks.' },
  { q: 'Can healthcare practices use MetaWurks with patient records?', a: 'Talk to us first. Before any patient health information comes into MetaWurks, we\'ll go through your practice\'s requirements on a 1:1 call and confirm in writing what\'s appropriate.' },
  { q: 'How can we review MetaWurks\' security for our vendor assessment?', a: 'Book a 1:1 call and we\'ll walk you through how MetaWurks handles client data and answer your due-diligence questions. Our free [AI Vendor Due-Diligence Checklist](/resources/ai-vendor-due-diligence-checklist) lists the questions firms usually ask, and our [Privacy Policy](/privacy-policy) and [Terms of Service](/terms-of-service) set out how we handle your information.' },
  { q: 'What happens to our data if we leave?', a: 'Disconnect any tool and its access token is revoked. To ask for your account\'s data to be deleted, [contact us](/contact). Your data is never sold, before or after you leave.' },
  { q: 'Who at MetaWurks can see our data?', a: 'Access is limited to what\'s needed to run and support the service. Ask on a 1:1 call for the details that matter to your firm\'s policy.' },
];

export default function SecurityPage() {
  return (
    <main id="main">
      <PageHero trail={[{ name: 'Security & data integrity', path: '/security' }]} eyebrow="Trust center"
        headline={['Your clients\' data stays', 'your clients\' data.']}
        lede="Built for people bound by confidentiality: CPAs, attorneys and medical practices. Here's exactly how MetaWurks protects their information, in plain English."
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

      <Section id="private-mode-check" label="Private mode and attached documents">
        <div className="pg-why">
          <div className="section-head">
            <span className="eyebrow">Private mode</span>
            <h2 className="h2">Why does MetaWurks ask me to switch to Private Mode when I attach a document?</h2>
            <p className="lede">Because a file can hold more than you meant to share, and MetaWurks can&apos;t tell which files are confidential. When you send a question with an attachment in Normal mode, MetaWurks pauses once so you can choose how that document is handled. Nothing is sent until you do.</p>
          </div>

          <div className="pg-prose">
            <h3>Why the Check Appears</h3>
            <p>The check appears whenever you send a question with at least one attached file while the conversation is in Normal mode. It doesn&apos;t scan, classify or score your document, and it doesn&apos;t mean anything sensitive was found. It&apos;s a reminder at the one moment it can still help: before the file goes out with your question. Questions without attachments, and anything sent in Private mode, go straight through.</p>
            <p>You get three choices:</p>
            <ul>
              <li><strong>Switch to Private mode.</strong> The conversation moves to Private mode first, then the same question and file are sent. Nothing goes out in Normal mode.</li>
              <li><strong>Continue in Normal mode.</strong> Your question is sent as it is, and the conversation stays in Normal mode.</li>
              <li><strong>Cancel and review document.</strong> You&apos;re back in the composer with your question and attachment untouched, so you can remove the file, edit the question or switch modes yourself.</li>
            </ul>

            <h3>What Normal Mode and Private Mode Mean</h3>
            <p><strong>Normal mode</strong> is the standard workspace. Auto picks a model for each task, and your question, your attachments and the content needed to answer them are processed by the third-party AI model provider handling it.</p>
            <p><strong>Private mode</strong> is designed to work like an incognito window for a conversation: MetaWurks answers with its own model, on its own servers, instead of sending what you type and attach to an outside AI provider. Ask us for the technical details on a 1:1 call.</p>
          </div>

          <div className="pg-table-wrap">
            <table className="pg-table">
              <caption className="sr-only">Normal mode compared with Private mode</caption>
              <thead><tr><th scope="col">&nbsp;</th><th scope="col">Normal mode</th><th scope="col" className="is-us">Private mode</th></tr></thead>
              <tbody>
                {MODE_ROWS.map(r => (
                  <tr key={r.label}>
                    <th scope="row">{r.label}</th>
                    {r.both ? <td colSpan={2} data-label="Both modes">{r.normal}</td> : <><td data-label="Normal mode">{r.normal}</td><td className="is-us" data-label="Private mode">{r.priv}</td></>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pg-prose">
            <h3>When to Use Private Mode</h3>
            <p>Consider Private mode whenever a file holds information your clients, patients or firm expect you to keep confidential, for example:</p>
            <ul>
              <li><strong>Confidential financial records:</strong> tax returns, bank and brokerage statements, payroll reports and general ledgers.</li>
              <li><strong>Client documents:</strong> engagement letters, client correspondence, and privileged or matter files.</li>
              <li><strong>Contracts:</strong> agreements under negotiation, NDAs and anything with confidentiality terms.</li>
              <li><strong>Personal information:</strong> Social Security numbers, dates of birth, account numbers and home addresses.</li>
            </ul>
            <p>Patient records are different: healthcare practices talk to us before patient health information comes into MetaWurks, and we confirm in writing what&apos;s appropriate for the practice first. Private mode doesn&apos;t replace that conversation.</p>

            <h3>What to Know About How Documents Are Handled</h3>
            <ul>
              <li><strong>Third-party AI processing:</strong> in Normal mode, a third-party AI model provider processes your question and attachments to produce the answer. Private mode is designed so that no outside AI provider does.</li>
              <li><strong>Provider terms:</strong> in Normal mode, each AI model provider processes requests under its own data-use terms, including whether it may use them to improve its models. We&apos;ll walk you through the terms that apply to your workspace.</li>
              <li><strong>Your data requests:</strong> to ask what we hold for your account, or to have your account&apos;s data deleted, <Link href="/contact">contact us</Link>.</li>
              <li><strong>Never sold:</strong> your data is never sold, in either mode.</li>
            </ul>

            <h3>What Switching Modes Does and Doesn&apos;t Change</h3>
            <p>Switching is meant to change which model answers the conversation: the MetaWurks Private LLM instead of an outside provider. When you switch from the check, your question and attachment carry over unchanged.</p>
            <p>Switching doesn&apos;t:</p>
            <ul>
              <li>recall anything already sent in Normal mode. That&apos;s why the check comes before the question is sent;</li>
              <li>read your files or tell you whether they&apos;re confidential;</li>
              <li>replace the conversation healthcare practices have with us before patient records come into the workspace.</li>
            </ul>
            <p>Want to see it? <Link href="/ask">Try the check in the workspace preview</Link>. It runs in your browser and isn&apos;t connected to an AI model.</p>
          </div>

          <figure className="pg-shot">
            <picture>
              <source media="(max-width: 640px)" srcSet="/assets/screens/private-mode-warning-mobile.png" width={780} height={1688} />
              <img src="/assets/screens/private-mode-warning-desktop.png" width={1920} height={1200} loading="lazy"
                alt="The privacy check dialog, titled “Review your document's privacy”, open over the MetaWurks question composer. It says the document may contain confidential or sensitive information and that the conversation is in Normal mode, lists the attached example file, and offers three buttons: Switch to Private mode, Continue in Normal mode, and Cancel and review document." />
            </picture>
            <figcaption>The privacy check in the MetaWurks workspace preview, shown before a question with an attached example engagement letter is sent in Normal mode.</figcaption>
          </figure>
          <ClaimNotes ids={['private-mode', 'model-providers', 'model-training']} />
        </div>
      </Section>

      <Section label="Vendor checklist" tight>
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
