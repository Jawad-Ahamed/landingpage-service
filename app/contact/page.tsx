import { pageMeta } from '@/lib/seo';
import { SITE, bookHref } from '@/lib/site';
import { PageHero, Section, SectionHead, Tiles } from '@/components/templates/blocks';
import Icon from '@/components/templates/Icon';
import LeadForm from '@/components/forms/LeadForm';
import { Reveal } from '@/components/motion/Motion';

export const metadata = pageMeta({
  title: 'Contact us',
  description: 'Book a 1:1 call, send the MetaWurks team a message, or reach us by email or phone. For firms evaluating MetaWurks, existing customers, and privacy questions.',
  path: '/contact',
});

const tel = `tel:${SITE.phone.replace(/[^+\d]/g, '')}`;

const ROUTES = [
  { icon: 'calendar', eyebrow: 'Evaluating MetaWurks', title: 'Book a 1:1 call', body: 'Bring your tool list and your worst admin chore. We\'ll show you what connects and what runs, on your own workflow.', href: bookHref('contact'), more: 'Pick a time' },
  { icon: 'users', eyebrow: 'Existing customers', title: 'Get help with your workspace', body: `Email ${SITE.email} with your firm's name and what you need, or send the form below and choose "I'm an existing customer."`, href: `mailto:${SITE.email}?subject=MetaWurks%20support`, more: 'Email us' },
  { icon: 'shield', eyebrow: 'Privacy, press & everything else', title: 'Ask us anything', body: 'Questions about your data, a privacy request, or something else entirely: send the form below or email us.', href: '#message', more: 'Send a message' },
];

export default function ContactPage() {
  return (
    <main id="main">
      <PageHero trail={[{ name: 'Contact', path: '/contact' }]} eyebrow="Contact"
        headline={['Talk to', 'the MetaWurks team.']}
        lede="Evaluating MetaWurks for your firm, already a customer, or asking about privacy? Pick the route that fits."
        layout="solo" primary={{ label: 'Book a 1:1 call', href: bookHref('contact-hero') }} secondary={{ label: 'Send a message', href: '#message' }} />

      <Section label="Ways to reach us" tight>
        <h2 className="sr-only">Ways to reach us</h2>
        <Tiles cols={3} items={ROUTES} />
      </Section>

      <Section paper id="message" label="Send a message">
        <div className="pg-split">
          <div className="pg-sticky">
            <SectionHead eyebrow="Send a message" title="Tell us what you" hl="need." lede="Send the form and we'll reply by email. Prefer email or phone? Use the details below." />
            <Reveal delay={0.1}>
              <ul className="pg-details" aria-label="Contact details">
                <li><span className="pg-note__ico"><Icon name="mail" /></span><div><b>Email</b><a href={`mailto:${SITE.email}`}>{SITE.email}</a></div></li>
                <li><span className="pg-note__ico"><Icon name="chat" /></span><div><b>Phone</b><a href={tel}>{SITE.phone}</a></div></li>
                <li><span className="pg-note__ico"><Icon name="inbox" /></span><div><b>Mailing address</b><span>{SITE.address}</span></div></li>
                <li><span className="pg-note__ico"><Icon name="calendar" /></span><div><b>Book a call</b><a href={bookHref('contact-details')}>Choose a time on Calendly</a></div></li>
              </ul>
            </Reveal>
          </div>
          <Reveal delay={0.08}>
            <div className="pg-card">
              <h3 className="sr-only">Contact form</h3>
              <LeadForm kind="contact" cta="Send message" fields={['name', 'firm', 'topic', 'message']} messageLabel="How can we help?"
                done="We'll reply by email." />
            </div>
          </Reveal>
        </div>
      </Section>
    </main>
  );
}
