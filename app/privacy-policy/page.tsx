import Link from 'next/link';
import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { SITE } from '@/lib/site';
import { CLAIMS, claim } from '@/content/data/claims';
import { LegalPage, type LegalSection } from '@/components/templates/Legal';
import type { Faq } from '@/content/data/types';

// Policy text states only what this repository's code or the claims registry (content/data/claims.ts, "confirmed")
// supports. The draft banner and on-page review notes were removed at the business's request (2026-10-22); every
// open question they carried is tracked in docs/privacy-policy-audit.md. Counsel approval is still pending, so:
//   • the pending claims below keep launch builds failing (CLAIMS_MODE=launch), without listing them on the page;
//   • the page stays out of search results until 'legal-privacy' is set to "confirmed".
const PENDING = ['legal-privacy', 'model-training', 'subprocessors', 'delete', 'gcp', 'phi-masking'];
PENDING.forEach(id => claim(id));
const APPROVED = CLAIMS.find(c => c.id === 'legal-privacy')?.status === 'confirmed';

export const metadata: Metadata = {
  ...pageMeta({
    title: 'Privacy Policy',
    description: 'How MetaWurks protects the privacy and confidentiality of client information: what we collect on metawurks.com and in the app, how we use and share it, and the choices you have.',
    path: '/privacy-policy',
  }),
  ...(APPROVED ? {} : { robots: { index: false, follow: SITE.indexable } }),
};

const UPDATED = '2026-10-23';
const host = (u: string) => u.replace(/^https?:\/\//, '');
const mail = <a href={`mailto:${SITE.email}`}>{SITE.email}</a>;

/* ---------- Confidential-data questions, answered up front and in the FAQ ---------- */
// Safeguards named here are the registry-confirmed ones (oauth, revoke, cited, drafts-wait, private-mode, never-sold)
// plus per-person connections (stated on /security). No certification, audit, encryption or retention claims.
const SAFEGUARDS = 'Tools connect through OAuth, so MetaWurks never stores your passwords; each person connects their own accounts; disconnecting a tool revokes its access token; answers cite the file or record they came from; and email drafts wait for your approval before anything is sent. For sensitive work, Private mode is designed to keep requests on MetaWurks’ own model and servers rather than send them to an outside AI provider. And we never sell your data.';
const PROTECT_Q = 'How does MetaWurks protect confidential client data?';
const PROTECT_A = `MetaWurks is committed to protecting the privacy and confidentiality of client information, and data protection is a priority in how the product works. ${SAFEGUARDS}`;
const CONFIDENTIAL_Q = 'Does MetaWurks provide privacy and security for clients’ confidential data?';
const CONFIDENTIAL_A = `Yes. Our privacy practices are designed to safeguard the information firms entrust to MetaWurks and to handle client information responsibly. ${SAFEGUARDS} Questions about a specific requirement? Ask us through the [contact page](/contact).`;

const FAQS: Faq[] = [
  { q: PROTECT_Q, a: PROTECT_A },
  { q: CONFIDENTIAL_Q, a: CONFIDENTIAL_A },
  { q: 'Does MetaWurks sell client data or use it for advertising?', a: 'No. We never sell your data, before or after you leave. This website has no advertising pixels, analytics or tracking cookies.' },
  { q: 'Is client data sent to outside AI providers?', a: 'Outside Private mode, yes: your requests and the content needed to answer them are processed by the third-party AI model providers your workspace uses, under their own data-use terms, including whether they may retain that data or use it to improve their models. We’ll walk you through those terms; ask us through our [contact page](/contact). Private mode is designed to keep requests on MetaWurks’ own model and servers instead.' },
  { q: 'Who can see the information my firm connects?', a: 'Each person connects their own accounts through each tool’s own sign-in, so one person’s inbox isn’t shared with the whole firm, and nothing reaches a client without a person’s approval. Disconnect a tool at any time and its access token is revoked.' },
  { q: 'Can healthcare practices use MetaWurks with patient health information?', a: 'Talk to us first. Before any protected health information (PHI) comes into MetaWurks, we’ll go through your practice’s requirements on a 1:1 call and confirm in writing what’s appropriate. See [Security & data integrity](/security).' },
  { q: 'How do I ask about, correct or delete my information?', a: `Email ${SITE.email}, or use the [contact page](/contact) and choose “Privacy or data request”. The same address is the place to report a security concern.` },
];

const SECTIONS: LegalSection[] = [
  { id: 'who-we-are', title: 'Who we are', body: <>
    <p>MetaWurks (&ldquo;MetaWurks&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) provides a private AI workspace for professional firms, built first for accounting and tax firms and also used by law firms and finance teams. This policy explains how we handle personal information in two places:</p>
    <ul>
      <li><strong>The website</strong>, {host(SITE.url)}, including its contact, resource, newsletter and ROI calculator forms.</li>
      <li><strong>The app</strong>, the MetaWurks workspace at {host(SITE.appUrl)}, where your firm connects the tools it already uses and works with AI agents.</li>
    </ul>
    <p>When your firm brings its clients&rsquo; information into the app, your firm decides what to bring and why. <a href="#client-data">Section 4</a> explains how the app handles that information.</p>
  </> },

  { id: 'what-we-collect', title: 'Information we collect', body: <>
    <h3>On the website</h3>
    <ul>
      <li><strong>What you type into our forms.</strong> When you contact us, request a resource, join our newsletter or ask us to email your ROI calculator results, we collect what you enter: your name, work email, firm name, type of firm, the topic you choose and your message.</li>
      <li><strong>ROI calculator.</strong> The calculator runs in your browser and nothing is sent while you use it. If you ask us to email your results, we receive the inputs you chose (such as team size, admin hours and hourly value) and calculate the results from them.</li>
      <li><strong>Form context.</strong> Each submission records the page it came from, the resource you asked for (if any) and, if the link you followed included them, campaign tags (the <code>utm_</code> parameters in the address). We don&rsquo;t attach your IP address to form submissions.</li>
      <li><strong>Email and phone.</strong> If you email or call us, we receive your contact details and whatever you choose to tell us.</li>
      <li><strong>Booking a call.</strong> &ldquo;Book a 1:1 call&rdquo; links take you to Calendly, an external scheduling service. Nothing from Calendly loads on our pages; the details you enter there are collected by Calendly under its own privacy policy and shared with us so we can hold the call.</li>
      <li><strong>Server logs.</strong> The service that hosts the website records standard request details, such as IP address, browser type, the page requested and the time of the request.</li>
    </ul>
    <h3>Cookies, analytics and local storage</h3>
    <p>The website does not use analytics tools, advertising pixels or tracking cookies, and it does not set cookies. It saves one setting in your browser&rsquo;s local storage, <code>mw-theme</code>, which remembers whether you chose the light or dark theme; it stays on your device and is never sent to us. Fonts, images and videos are served from our own domain, so loading a page doesn&rsquo;t share your details with a font or video service.</p>
    <h3>In the app</h3>
    <p>When your firm uses the app, we process account details (such as name and work email), the tools each person chooses to connect and the permissions they grant, files you upload, the content agents read from connected tools to answer questions and prepare drafts, and the questions, answers and drafts you create.</p>
  </> },

  { id: 'how-we-use', title: 'How we use information', body: <>
    <ul>
      <li><strong>To answer you and send what you asked for</strong>: a reply to your message, a resource, the newsletter, or an email with your ROI calculator results.</li>
      <li><strong>To schedule and prepare for calls</strong> you book.</li>
      <li><strong>To provide the app</strong> to your firm: answering questions from your connected tools and files, preparing the drafts you ask for, and supporting your team.</li>
      <li><strong>To keep the service secure and working</strong>, including automated checks that filter spam from our forms (a hidden field and a minimum time to fill in the form; no third-party CAPTCHA) and limits on how often results are emailed to one address.</li>
      <li><strong>To meet legal obligations.</strong></li>
    </ul>
    <p><strong>We never sell your personal information.</strong> The website has no advertising or cross-site tracking.</p>
  </> },

  { id: 'client-data', title: 'How the app handles your clients’ data', body: <>
    <p>MetaWurks is built for firms bound by confidentiality, where client and financial information must stay under the firm&rsquo;s control. In the app:</p>
    <ul>
      <li><strong>No stored passwords.</strong> Tools connect through OAuth: you sign in on each tool&rsquo;s own screen, and MetaWurks never stores your passwords.</li>
      <li><strong>Your connections stay yours.</strong> Each person connects their own accounts, so one person&rsquo;s inbox isn&rsquo;t shared with the whole firm.</li>
      <li><strong>Disconnect any time.</strong> Disconnecting a tool revokes its access token.</li>
      <li><strong>Answers show their sources.</strong> Answers cite the file or record they came from.</li>
      <li><strong>You approve what goes out.</strong> Email drafts wait for your approval before anything is sent.</li>
      <li><strong>Private mode.</strong> Private mode is designed to run on MetaWurks&rsquo; own model and servers, so that requests in Private mode aren&rsquo;t sent to an outside AI provider. For technical details, ask us through our <a href="/contact">contact page</a>.</li>
      <li><strong>Outside Private mode</strong>, your requests, and the content needed to answer them, are processed by the third-party AI model providers your workspace uses.</li>
    </ul>
    <p><strong>Health information.</strong> Healthcare practices should talk to us before bringing protected health information (PHI) into MetaWurks, so we can review the practice&rsquo;s requirements and confirm in writing what&rsquo;s appropriate first. See <Link href="/security">Security &amp; data integrity</Link>.</p>
  </> },

  { id: 'sharing', title: 'Who we share information with', body: <>
    <p>We share personal information only as needed to run MetaWurks:</p>
    <ul>
      <li><strong>Hosting and infrastructure providers</strong> that run the website and the app.</li>
      <li><strong>The service that receives website form submissions</strong> on our behalf, so our team can reply.</li>
      <li><strong>Our email provider</strong>, which delivers the emails you ask for, such as your ROI calculator results.</li>
      <li><strong>Calendly</strong>, when you book a call.</li>
      <li><strong>AI model providers</strong>, when you use the app outside Private mode.</li>
      <li><strong>The tools you connect</strong>: information moves between MetaWurks and each connected tool under that tool&rsquo;s own terms.</li>
      <li><strong>Authorities</strong>, when the law requires it.</li>
    </ul>
  </> },

  { id: 'retention', title: 'How long we keep information', body: <>
    <p>We keep personal information only as long as we need it for the purposes in this policy or as the law requires. To ask about or request deletion of information we hold about you, contact us using the details in <a href="#contact">section 12</a>.</p>
  </> },

  { id: 'security', title: 'How we safeguard information', body: <>
    <p>Protecting the confidentiality and integrity of the information entrusted to MetaWurks is a priority. The website is served over HTTPS with standard security headers. In the app, tools connect through OAuth, so MetaWurks never stores your passwords for them, each person&rsquo;s connections are their own, and disconnecting a tool revokes its access token. Sensitive work can run in Private mode, which is designed to keep requests on MetaWurks&rsquo; own model and servers.</p>
    <p>For more detail, see <Link href="/security">Security &amp; data integrity</Link>. If you think you&rsquo;ve found a security problem, please tell us at {mail}.</p>
  </> },

  { id: 'your-choices', title: 'Your choices and rights', body: <>
    <ul>
      <li><strong>Access, correction and deletion.</strong> Email {mail}, or use our <Link href="/contact">contact page</Link> and choose &ldquo;Privacy or data request&rdquo;, to ask what we hold about you, to correct it or to delete it.</li>
      <li><strong>Newsletter.</strong> Email us at any time to unsubscribe.</li>
      <li><strong>Connected tools.</strong> Disconnect any tool in the app; its access token is revoked.</li>
      <li><strong>Theme setting.</strong> Clear this site&rsquo;s data in your browser to remove the saved theme choice.</li>
    </ul>
  </> },

  { id: 'children', title: 'Children', body: <>
    <p>MetaWurks is a business service for professional firms. It is not directed at children, and we don&rsquo;t knowingly collect children&rsquo;s personal information.</p>
  </> },

  { id: 'international', title: 'International transfers', body: <>
    <p>We and the service providers listed in <a href="#sharing">section 5</a> may process information in countries other than the one you live in.</p>
  </> },

  { id: 'changes', title: 'Changes to this policy', body: <>
    <p>When we change this policy, we&rsquo;ll update the &ldquo;Last updated&rdquo; date at the top of this page.</p>
  </> },

  { id: 'contact', title: 'Privacy questions and contact', body: <>
    <p>For questions about privacy or data protection, or a request about your information:</p>
    <ul>
      <li>Email: {mail}</li>
      <li>Phone: <a href={`tel:${SITE.phone.replace(/[^+\d]/g, '')}`}>{SITE.phone}</a></li>
      <li>Mail: {SITE.address}</li>
      <li>Contact page: <Link href="/contact">choose &ldquo;Privacy or data request&rdquo;</Link></li>
    </ul>
  </> },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage path="/privacy-policy" name="Privacy Policy" headline={['Privacy', 'Policy']} updated={UPDATED} sections={SECTIONS}
      draft={false} claims={[]}
      lede="How MetaWurks protects the privacy and confidentiality of the information you and your clients entrust to us: what we collect, how we use it, who we share it with, and the choices you have."
      answer={{ question: PROTECT_Q, answer: PROTECT_A, updated: UPDATED }}
      faqs={{ title: 'Privacy and security,', hl: 'answered.', items: FAQS }} />
  );
}
