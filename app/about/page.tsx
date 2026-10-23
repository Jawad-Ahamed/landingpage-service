import Link from 'next/link';
import { pageMeta } from '@/lib/seo';
import { bookHref } from '@/lib/site';
import { AGENTS } from '@/content/data/agents';
import { INTEGRATIONS } from '@/content/data/integrations';
import { SOLUTIONS } from '@/content/data/solutions';
import type { Integration, Step } from '@/content/data/types';
import { PageHero, Section, SectionHead, Tiles } from '@/components/templates/blocks';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Motion';
import Icon from '@/components/templates/Icon';
import { titleCase, titlePair } from '@/lib/titleCase';

// Built from copy the site already states (home page, security, agents, solutions). No team, history, customer
// or traction claims: none are confirmed. Only confirmed claims are used (cited, oauth, drafts-wait), so no † notes.
export const metadata = pageMeta({
  title: 'About MetaWurks: private AI agents for professional firms',
  description: 'MetaWurks is a private AI workspace for accounting, law and healthcare firms and finance teams. It connects the tools you already use, drafts the admin for your review, cites every answer and never sells your data.',
  path: '/about',
});

const agent = (slug: string) => AGENTS.find(a => a.slug === slug)!;
const apps = (slugs: string[]) => slugs.map(s => INTEGRATIONS.find(i => i.slug === s)).filter((i): i is Integration => !!i);
const acct = SOLUTIONS.find(s => s.slug === 'accounting-tax');

const HERO_APPS = apps(['gmail', 'outlook', 'quickbooks', 'google-drive', 'onedrive', 'microsoft-teams', 'slack']);
const GRID_APPS = apps(['gmail', 'outlook', 'quickbooks', 'xero', 'google-drive', 'onedrive', 'microsoft-teams', 'slack']);

const GLANCE = [
  { icon: 'users', title: 'Who we serve', body: 'Accounting and tax firms, law firms, healthcare practices and finance teams: places where an answer has to come with its source.' },
  { icon: 'library', title: 'What we do', body: 'A private AI workspace that connects the tools your firm already uses, then pulls, matches and drafts the admin for your review.' },
  { icon: 'sparkle', title: 'How we work', body: 'Agents handle the repetitive prep and flag gaps as "Needs review". People review, edit and approve the result.' },
];

const FLOW = [
  { title: 'Connect', body: 'Link the tools you already use through each app\'s own sign-in. Nothing to migrate.' },
  { title: 'Ask or assign', body: 'Ask a question in plain English, or hand a task to an agent.' },
  { title: 'Review', body: 'Check the cited sources, resolve anything flagged and approve the final work.' },
];

const COMMITMENTS = [
  { icon: 'check-c', title: 'Useful, not just impressive', body: 'Agents are built around the admin firms repeat: tax prep, month-end close, matter summaries, prior-auth packets.' },
  { icon: 'file', title: 'Sources you can check', body: 'Every answer cites the file or record it came from.' },
  { icon: 'plug', title: 'Your tools, your connections', body: 'MetaWurks works on top of the tools you already pay for, and each person connects their own accounts.' },
  { icon: 'users', title: 'Human review stays central', body: 'Agents prepare; a person reviews. Email drafts wait for your OK before anything is sent.' },
];

const steps = (slug: string, pick: number[]): Step[] => pick.map(i => agent(slug).run.steps[i]).filter(Boolean);

const PRO = [
  {
    icon: 'calc', title: 'Accounting & tax', tone: 'acct',
    body: 'Pull the books, match 1099s to deposits, flag missing receipts and draft the organizer and workpapers. Close the month with exceptions flagged.',
    run: { name: agent('tax-prep').name, steps: steps('tax-prep', [1, 2]) },
    links: [
      ...(acct ? [{ label: 'Accounting & tax solution', href: `/solutions/${acct.slug}` }] : []),
      { label: agent('tax-prep').name, href: '/agents/tax-prep' },
      { label: agent('month-end-close').name, href: '/agents/month-end-close' },
    ],
  },
  {
    icon: 'scale', title: 'Legal', tone: 'legal',
    body: agent('matter-summary').blurb,
    run: { name: agent('matter-summary').name, steps: steps('matter-summary', [3, 4]) },
    links: [{ label: agent('matter-summary').name, href: '/agents/matter-summary' }],
  },
  {
    icon: 'pulse', title: 'Healthcare', tone: 'health',
    body: 'An example agent matches chart notes against a payer\'s criteria and assembles the prior-auth packet for clinician sign-off.',
    run: { name: agent('prior-auth').name, steps: steps('prior-auth', [3, 4]) },
    links: [{ label: agent('prior-auth').name, href: '/agents/prior-auth' }],
    caution: 'Talk to us before any patient records come near the workspace.',
  },
];

/* ---------- Small visuals, built from the home page's demo pieces (sample data, fictional) ---------- */
function Cites({ items }: { items: string[] }) {
  return <div className="cites">{items.map((c, i) => <span key={c} className="cite is-in"><i>{i + 1}</i>{c}</span>)}</div>;
}

function RunSteps({ items, pills = true }: { items: Step[]; pills?: boolean }) {
  return (
    <ol className="run__steps">
      {items.map(s => (
        <li key={s.label} className={`rstep is-done${s.flag ? ' is-flag' : ''}`}>
          <span className="box"><Icon name={s.flag ? 'flag' : 'check'} /></span>{s.label}
          {pills && s.pill ? <span className={`pill pill--${s.pill.tone}`}>{s.pill.text}</span> : <span />}
        </li>
      ))}
    </ol>
  );
}

function HeroPanel() {
  return (
    <div className="ab-hero-vis">
      <div className="ab-panel">
        <div className="ab-panel__bar"><span><Icon name="chat" />Ask a question</span><span className="pill pill--cob">Cited</span></div>
        <div className="ab-panel__body">
          <p className="ab-q"><Icon name="search" />When was the breach notice served in Alvarez, and how long after the agreement was signed?</p>
          <div className="ab-ans">
            <span className="ab-ans__status"><Icon name="check-c" />Answered from 3 sources</span>
            <p>The notice was served in <b>November 2024</b>, <b>20 months</b> after the March 2023 agreement was signed.</p>
          </div>
          <div className="ab-srcs">
            <span className="ab-srcs__h">Sources</span>
            <ol>
              <li><i>1</i><span>Breach_Notice_Nov2024.pdf</span><small>p.1</small></li>
              <li><i>2</i><span>Alvarez_Supply_Agreement.pdf</span><small>§9.2</small></li>
              <li><i>3</i><span>Alvarez_Complaint.pdf</span><small>¶14</small></li>
            </ol>
          </div>
        </div>
      </div>
      <p className="ab-note">Example matter</p>
      <ul className="ab-logos" aria-label="Some of the tools MetaWurks connects">
        {HERO_APPS.map(a => (
          <li key={a.slug}><Link href={`/integrations/${a.slug}`}><img src={a.logo} alt="" width={24} height={24} />{a.name}</Link></li>
        ))}
        <li><Link href="/integrations"><span className="ab-logos__more" aria-hidden="true">···</span>And more</Link></li>
      </ul>
    </div>
  );
}

function DocToAnswer() {
  return (
    <div className="ab-d2a" role="img" aria-label="Illustration: a highlighted line in a profit and loss PDF becomes a cited answer about Q3 contractor spend.">
      <div className="ab-doc" aria-hidden="true">
        <div className="ab-doc__head"><Icon name="file" />HarborPine_PnL_Q3.pdf</div>
        <div className="ab-doc__lines"><span /><span /><span className="is-hit" /><span /><span /></div>
        <span className="pill pill--gray">Page 2</span>
      </div>
      <span className="ab-d2a__arrow" aria-hidden="true"><Icon name="arrow" /></span>
      <div className="ab-doc ab-doc--ans" aria-hidden="true">
        <div className="ab-doc__head"><Icon name="sparkle" />Answer<span className="pill pill--cob">Cited</span></div>
        <p>Contractor spend was <b>$48,210</b> in Q3, up <b>18%</b> from <b>$40,860</b> in Q2.</p>
        <Cites items={['PnL_Q3.pdf · p.2', 'PnL_Q2.pdf · p.2', 'QuickBooks · Contractors']} />
      </div>
    </div>
  );
}

const DIFFERENT = [
  {
    icon: 'file', title: 'Answers with sources',
    body: 'Every answer cites the file, page or ledger record behind it, so anyone can check a number in seconds.',
    vis: <Cites items={['Breach_Notice · p.1', 'Supply_Agreement · §9.2']} />,
  },
  {
    icon: 'plug', title: 'Your tools stay connected',
    body: 'Work across Gmail, Outlook, QuickBooks, Xero, Drive, OneDrive and more, without migrating anything.',
    vis: <div className="ab-grid-logos">{GRID_APPS.map(a => <span key={a.slug} title={a.name}><img src={a.logo} alt="" width={22} height={22} /></span>)}</div>,
  },
  {
    icon: 'bot', title: 'Agents handle repetitive prep',
    body: 'Agents pull, match and draft the routine work, then flag anything they couldn\'t confirm.',
    vis: <RunSteps items={steps('tax-prep', [0, 1, 2])} pills={false} />,
  },
  {
    icon: 'edit', title: 'People stay in control',
    body: 'You review, edit and approve the results. Tools connect through OAuth; MetaWurks never stores your passwords.',
    vis: <div className="mini-approve"><div><span>3 missing receipts</span><span className="pill pill--amb">Needs review</span></div><div><span>Client request · Gmail</span><span className="pill pill--cob">Waiting for your OK</span></div></div>,
  },
];

const H3 = ({ children }: { children: string }) => <h3>{titleCase(children)}</h3>;

export default function AboutPage() {
  return (
    <main id="main">
      {/* A. Hero */}
      <PageHero trail={[{ name: 'About', path: '/about' }]} eyebrow="About MetaWurks"
        headline={['Private AI for the work', 'behind your work.']}
        lede="MetaWurks connects the tools your firm already uses, then AI agents pull, match and draft the admin across accounting, legal and healthcare work. Answers come with their sources, and people stay in control of what goes out."
        primary={{ label: 'Book a 1:1 call', href: bookHref('about') }}
        secondary={{ label: 'Explore the agents', href: '/agents' }}
        aside={<HeroPanel />} />

      {/* B. At a glance */}
      <Section label="MetaWurks at a glance" tight>
        <SectionHead eyebrow="At a glance" title="MetaWurks" hl="at a glance." lede="Who we serve, what we do and how we work." />
        <Tiles cols={3} items={GLANCE} />
      </Section>

      {/* C. Purpose */}
      <Section paper label="Our purpose">
        <div className="pg-split ab-purpose">
          <div>
            <SectionHead eyebrow="Our purpose" title="Turn scattered firm information" hl="into work people can verify." />
            <Reveal delay={0.1}>
              <div className="ab-prose">
                <p>A firm&apos;s ledger, inbox, drive and portals don&apos;t talk to each other, so skilled people spend their evenings hunting for one receipt and re-keying numbers between systems.</p>
                <p>MetaWurks sits on top of the tools a firm already pays for and brings that information into one private workspace. Every answer shows the document or record it came from.</p>
                <p>Agents do the pulling, matching and drafting. People stay in control: they review, edit and approve before anything reaches a client.</p>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.12} y={24}>
            <DocToAnswer />
            <p className="ab-note">Example client</p>
          </Reveal>
        </div>
      </Section>

      {/* D. What makes MetaWurks different */}
      <Section label="What makes MetaWurks different">
        <SectionHead eyebrow="How it's different" title="What makes MetaWurks" hl="different." />
        <Stagger className="ab-cards ab-cards--4">
          {DIFFERENT.map(d => (
            <StaggerItem key={d.title} className="pg-tile ab-diff">
              <span className="pg-tile__ico"><Icon name={d.icon} /></span>
              <H3>{d.title}</H3>
              <p>{d.body}</p>
              <div className="ab-mini" aria-hidden="true">{d.vis}</div>
            </StaggerItem>
          ))}
        </Stagger>
        <p className="ab-note ab-note--start">Example client and matter</p>
      </Section>

      {/* E. Workflow */}
      <Section paper label="How the workflow runs">
        <SectionHead eyebrow="How it works" title="A practical workflow, from connected tools" hl="to reviewed work." />
        <Stagger as="ol" className="ab-flow" gap={0.1}>
          {FLOW.map((f, i) => (
            <StaggerItem as="li" key={f.title} className="ab-flow__step">
              <span className="ab-flow__num" aria-hidden="true">{i + 1}</span>
              <div className="ab-flow__body">
                <H3>{f.title}</H3>
                <p>{f.body}</p>
                <div className="ab-flow__vis" aria-hidden="true">
                  {i === 0 && <div className="mini-chips">{apps(['quickbooks', 'gmail', 'outlook', 'google-drive']).map(a => <span key={a.slug} className="chip"><img className="app-ico" src={a.logo} alt="" />{a.name}<span className="dot" /></span>)}</div>}
                  {i === 1 && <div className="mini-ask"><span>What&apos;s Q3 contractor spend?</span><b><Icon name="up" /></b></div>}
                  {i === 2 && <div className="ab-pills"><span className="pill pill--cob">Cited</span><span className="pill pill--amb">Needs review</span><span className="pill pill--grn">Approved</span></div>}
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* F. Built for professional work */}
      <Section label="Built for professional work">
        <SectionHead eyebrow="Who it's for" title="Built for" hl="professional work."
          lede="Example agents for the work each kind of firm repeats. Every one ends with a person's review." />
        <Stagger className="ab-cards ab-cards--3">
          {PRO.map(p => (
            <StaggerItem key={p.title} className="pg-card ab-pro">
              <div className="ab-pro__top">
                <span className="pg-tile__ico"><Icon name={p.icon} /></span>
                <H3>{p.title}</H3>
              </div>
              <p className="ab-pro__body">{p.body}</p>
              <div className="ab-run" aria-hidden="true">
                <div className="ab-run__head"><b>{p.run.name}</b><span className={`tag tag--${p.tone}`}>Example run</span></div>
                <RunSteps items={p.run.steps} />
              </div>
              {p.caution && <p className="ab-caution"><Icon name="flag" />{p.caution}</p>}
              <ul className="ab-links">
                {p.links.map(l => <li key={l.href}><Link href={l.href}>{l.label}<Icon name="arrow" /></Link></li>)}
              </ul>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* G. Our commitment */}
      <Section paper tight label="Our commitment">
        <SectionHead eyebrow="Our commitment" title="The principles behind" hl="the product." />
        <Stagger as="ul" className="ab-commit">
          {COMMITMENTS.map(c => (
            <StaggerItem as="li" key={c.title} className="ab-commit__item">
              <span className="pg-tile__ico"><Icon name={c.icon} /></span>
              <div><H3>{c.title}</H3><p>{c.body}</p></div>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* H. Final CTA (the ink panel from CtaBand, with one action) */}
      <section className="section section--tight" aria-labelledby="cta-h">
        <div className="container">
          <Reveal>
            <div className="final">
              <div className="grid-lines" aria-hidden="true" />
              <span className="eyebrow">Your firm, your setup</span>
              <h2 className="h2" id="cta-h">{titlePair('See how MetaWurks fits', 'your firm\'s workflow.')[0]} <span className="final__hl">{titlePair('See how MetaWurks fits', 'your firm\'s workflow.')[1]}</span></h2>
              <p>Bring your tool list and your worst admin chore to a 1:1 call. We&apos;ll show you what connects and what runs on your own workflow.</p>
              <div className="final__ctas">
                <Link className="btn btn--amber" href={bookHref('about-cta')}>Book a 1:1 call <Icon name="arrow" className="arrow" /></Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
