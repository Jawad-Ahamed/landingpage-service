import Link from 'next/link';
import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { SITE } from '@/lib/site';
import { PLANS } from '@/content/data/pricing';
import { LegalPage, type LegalSection } from '@/components/templates/Legal';
import { CLAIMS } from '@/content/data/claims';

// Plain-English terms built only from facts the site already states (pricing, how the product works). The draft banner
// and on-page review notes were removed at the business's request (2026-10-23), as on the privacy policy; every open
// question they carried is tracked in docs/terms-of-service-open-items.md. Counsel approval is still pending, so the
// 'legal-terms' claim keeps launch builds failing (CLAIMS_MODE=launch) and the page stays out of search results until
// it is set to "confirmed".
const APPROVED = CLAIMS.find(c => c.id === 'legal-terms')?.status === 'confirmed';

export const metadata: Metadata = {
  ...pageMeta({
    title: 'Terms of Service',
    description: 'The terms for using metawurks.com and the MetaWurks app: your account, plans and billing, your data, connected tools, AI output and your review, and acceptable use.',
    path: '/terms-of-service',
  }),
  ...(APPROVED ? {} : { robots: { index: false, follow: SITE.indexable } }),
};

const UPDATED = '2026-10-23';
const planLine = PLANS.map(p => `${p.name}: ${p.price === null ? 'custom pricing' : p.price === 0 ? 'free for one month' : `$${p.price} per month`}`).join('; ');

const SECTIONS: LegalSection[] = [
  { id: 'agreement', title: 'About these terms', body: <>
    <p>These terms apply when you use this website or the MetaWurks app at {SITE.appUrl.replace(/^https?:\/\//, '')} (together, the &ldquo;Service&rdquo;). By creating an account or using the Service, you agree to them on behalf of yourself and the firm you represent. Our <Link href="/privacy-policy">privacy policy</Link> explains how we handle personal information.</p>
  </> },
  { id: 'eligibility', title: 'Who can use MetaWurks', body: <>
    <p>MetaWurks is a business service for professional firms and finance teams. If you sign up for a firm, you confirm that you are allowed to accept these terms for it.</p>
  </> },
  { id: 'accounts', title: 'Your account', body: <>
    <ul>
      <li>Keep your sign-in details secure and tell us at <a href={`mailto:${SITE.email}`}>{SITE.email}</a> if you think someone else has used your account.</li>
      <li>You are responsible for what happens in your account and for the people your firm invites.</li>
      <li>Each person connects their own tools, and only connects accounts they are allowed to use.</li>
    </ul>
  </> },
  { id: 'plans', title: 'Plans, trial and billing', body: <>
    <p>Current plans are listed on our <Link href="/pricing">pricing page</Link> ({planLine}). The free trial covers your first month and includes 1M AI tokens. Paid plans are billed monthly in US dollars, and you can change or cancel your plan at any time.</p>
  </> },
  { id: 'your-data', title: 'Your data', body: <>
    <p>Your firm&rsquo;s files, connected-tool data and the work agents produce from them remain yours. You allow us to host, process and transmit that data only as needed to provide and support the Service for you. We never sell your data.</p>
  </> },
  { id: 'connected-tools', title: 'Connected tools and other services', body: <>
    <p>MetaWurks connects to tools such as email, accounting and file storage through OAuth: you sign in on each tool&rsquo;s own screen, and MetaWurks never stores your passwords. Your use of those tools, of Calendly for booking calls, and of the AI model providers behind the Service stays subject to their own terms. Disconnecting a tool revokes its access token.</p>
  </> },
  { id: 'ai-output', title: 'AI output and your review', body: <>
    <p>MetaWurks uses AI models, and AI output can be incomplete or wrong. That&rsquo;s why answers cite the file or record they came from, agents flag gaps as &ldquo;Needs review&rdquo;, and email drafts wait for your approval before anything is sent.</p>
    <ul>
      <li>You decide what to rely on, send or file. Review output before you use it with clients.</li>
      <li>MetaWurks does not give legal, tax, medical or financial advice. Your professional obligations, including confidentiality and supervision duties, remain yours.</li>
    </ul>
  </> },
  { id: 'acceptable-use', title: 'Acceptable use', body: <>
    <p>Don&rsquo;t use the Service to:</p>
    <ul>
      <li>break the law or anyone&rsquo;s rights, including confidentiality and intellectual-property rights;</li>
      <li>upload malware, or try to probe, disrupt or get around the Service&rsquo;s security or limits;</li>
      <li>access accounts or data you aren&rsquo;t authorized to use;</li>
      <li>resell or provide the Service to others without our written permission.</li>
    </ul>
    <p>Before uploading protected health information (PHI) to the Service, healthcare practices must first agree with us in writing what&rsquo;s appropriate for their practice. See <Link href="/security">Security &amp; data integrity</Link>.</p>
  </> },
  { id: 'ownership', title: 'Our service and feedback', body: <>
    <p>MetaWurks owns the Service, including its software, design and brand. These terms don&rsquo;t transfer any of it to you. If you send us suggestions, we may use them to improve the Service.</p>
  </> },
  { id: 'termination', title: 'Suspension and cancellation', body: <>
    <p>You can stop using the Service and cancel your plan at any time. We may suspend or close an account that breaks these terms or puts the Service or other customers at risk.</p>
  </> },
  { id: 'availability', title: 'Service availability and AI output', body: <>
    <p>We work to keep MetaWurks available, accurate and secure, but no online service can be guaranteed to be uninterrupted or error-free, and AI output can be incomplete or wrong. MetaWurks supports your firm&rsquo;s work; it doesn&rsquo;t replace professional judgment. Review output before you rely on it, as described in <a href="#ai-output">section 7</a>.</p>
  </> },
  { id: 'changes', title: 'Changes to these terms', body: <>
    <p>When we change these terms, we&rsquo;ll update the &ldquo;Last updated&rdquo; date at the top of this page.</p>
  </> },
  { id: 'contact', title: 'Contact us', body: <>
    <ul>
      <li>Email: <a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
      <li>Phone: <a href={`tel:${SITE.phone.replace(/[^+\d]/g, '')}`}>{SITE.phone}</a></li>
      <li>Mail: {SITE.address}</li>
    </ul>
    <p>Or use our <Link href="/contact">contact page</Link>.</p>
  </> },
];

export default function TermsPage() {
  return (
    <LegalPage path="/terms-of-service" name="Terms of Service" headline={['Terms of', 'Service']} updated={UPDATED} sections={SECTIONS}
      lede="The ground rules for using MetaWurks: your account, plans and billing, your data, and why every AI output gets your review."
      draft={false} claims={['legal-terms', 'token-allowances']} />
  );
}
