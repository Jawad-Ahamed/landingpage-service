import Link from 'next/link';
import { pageMeta } from '@/lib/seo';
import { SERVICES_EMAIL, bookHref } from '@/lib/site';
import { service } from '@/lib/schema';
import { ASSESS, CONNECTS, COSTS, EXPECT, INQUIRY_HINTS, MANAGEMENT, OFFERINGS, PACKAGES, PROBLEMS, RUNNING, SAMPLES, SERVICE_FAQS, STEPS, TERMS } from '@/content/data/services';
import { FaqSection, PageHero, Section, SectionHead } from '@/components/templates/blocks';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Motion';
import Icon from '@/components/templates/Icon';
import JsonLd from '@/components/seo/JsonLd';
import LeadForm from '@/components/forms/LeadForm';
import FlowDiagram from '@/components/services/FlowDiagram';
import { titleCase, titlePair } from '@/lib/titleCase';
import '@/styles/services.css';

// Custom automation services: a separate offering from the MetaWurks workspace (the product). All prices, timelines
// and terms come from content/data/services.ts (the client-facing pricing sheet). Sample projects are illustrations.
// Order: what it is → the problems → what we build → examples → process → your tools → expectations → cost → why.
export const metadata = pageMeta({
  title: 'Custom business automation services for firms and small businesses',
  description: 'Custom workflow automation for accounting firms and small businesses: leads, documents, data entry and reports. Fixed setup from $300, paid at go-live.',
  path: '/services',
});

const pkgName = (id: string) => PACKAGES.find(p => p.id === id)!.name;
const INQ_H = titlePair('Discuss your', 'automation needs.');

const H3 = ({ children, className }: { children: string; className?: string }) => <h3 className={className}>{titleCase(children)}</h3>;

function Meter({ level }: { level: number }) {
  return (
    <span className="sv-meter" aria-label={`Level ${level} of 4`} role="img">
      {[1, 2, 3, 4].map(n => <i key={n} className={n <= level ? 'is-on' : undefined} />)}
    </span>
  );
}

export default function ServicesPage() {
  return (
    <main id="main" className="sv">
      <JsonLd data={service()} />

      {/* 1. Hero: what it is, who it is for, the problems, how it works, next step */}
      <PageHero trail={[{ name: 'Services', path: '/services' }]} eyebrow="Custom automation services"
        headline={['Custom workflow automation,', 'built around your business.']}
        lede="Our team designs and builds automations for accounting firms, clinics, trades and other small businesses. We connect the apps you already use so leads, documents and data stop being copied by hand, with AI where it helps. Setup starts at $300 and is paid at go-live."
        primary={{ label: 'Discuss your automation needs', href: bookHref('services-hero') }}
        secondary={{ label: 'Describe your workflow', href: '#inquire' }}
        meta={['Discovery call', 'Written scope and fixed price', 'Built, tested and handed over']}
        aside={<FlowDiagram />} />

      {/* 2. Product vs service */}
      <Section tight label="Two ways to work with MetaWurks">
        <Reveal>
          <div className="sv-ways">
            <h2 className="sv-ways__h">Two ways to work with MetaWurks</h2>
            <div className="sv-ways__grid">
              {OFFERINGS.map(o => (
                <div key={o.id} className={`sv-way${o.id === 'services' ? ' sv-way--this' : ''}`}>
                  <span className="sv-way__tag">{o.tag}{o.id === 'services' && <span className="pill pill--cob">This page</span>}</span>
                  <H3>{o.name}</H3>
                  <p className="sv-way__lede">{o.lede}</p>
                  <dl className="sv-way__rows">
                    {o.rows.map(r => <div key={r.k}><dt>{r.k}</dt><dd>{r.v}</dd></div>)}
                  </dl>
                  <p className="sv-way__links">
                    {o.links.map(l => <Link key={l.href} href={l.href}>{l.label}<Icon name="arrow" /></Link>)}
                  </p>
                </div>
              ))}
            </div>
            <p className="sv-ways__note"><Icon name="flag" /><span>Separate offerings: an automation project is scoped and priced on its own and does not require a workspace subscription.</span></p>
          </div>
        </Reveal>
      </Section>

      {/* 3. Why businesses need custom automation */}
      <Section paper id="problems" label="Problems custom automation solves">
        <SectionHead eyebrow="Why automate" title="Everyday busywork," hl="taken off your team's desk."
          lede="Four jobs many small businesses still do by hand, and what changes when a workflow runs them." />
        <Stagger as="ul" className="sv-pbs">
          {PROBLEMS.map(p => (
            <StaggerItem as="li" key={p.title} className="sv-pb">
              <span className="sv-pb__ico"><Icon name={p.icon} /></span>
              <H3>{p.title}</H3>
              <p>{p.body}</p>
              <Link className="sv-pb__fit" href={`#pkg-${p.pkg}`}>{pkgName(p.pkg)} package<Icon name="arrow" /></Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* 4. What MetaWurks can build */}
      <Section id="packages" label="What we build">
        <SectionHead eyebrow="What we build" title="Four kinds of business automation," hl="from one workflow to a connected system."
          lede="Pick the closest fit and the discovery call confirms it. Each workflow shown is the package's own example; yours is scoped to your process." />
        <Stagger className="sv-builds" gap={0.08}>
          {PACKAGES.map(p => (
            <StaggerItem as="article" key={p.id} className="sv-build">
              <div id={`pkg-${p.id}`} className="sv-anchor" />
              <div className="sv-build__id">
                <div className="sv-build__lvl"><Meter level={p.level} /><span>{p.name}</span></div>
                <H3 className="sv-build__title">{p.title}</H3>
                <p className="sv-build__price"><b>{p.price}</b>{p.per && <span>{p.per}</span>}<small>fixed setup price</small></p>
                <dl className="sv-build__facts">
                  <div><dt>Ready in</dt><dd>{p.ready}</dd></div>
                </dl>
                <Link className="sv-more" href="#inquire">Discuss this package<Icon name="arrow" /></Link>
              </div>
              <dl className="sv-build__desc">
                <div><dt>What it is</dt><dd>{p.covers}</dd></div>
                <div><dt>Who it suits</dt><dd>{p.who}</dd></div>
                <div><dt>What you get</dt><dd>{p.deliverable}</dd></div>
              </dl>
              <div className="sv-build__flow">
                <span className="sv-label">Example: how the workflow runs</span>
                <ol>{p.flow.map(s => <li key={s}><span>{s}</span></li>)}</ol>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <p className="sv-fine">Monthly platform and AI usage for each package is listed under <Link href="#costs">What you pay</Link>.</p>
      </Section>

      {/* 5. Concrete examples */}
      <Section paper id="examples" label="Sample projects, before and after">
        <SectionHead eyebrow="Examples" title="Before and after," hl="on three sample projects."
          lede={<>Three jobs done by hand, then automated, with what each would cost in year one. <b>Sample estimates for illustration</b>, not client results.</>} />
        <Stagger className="sv-cases">
          {SAMPLES.map((s, i) => (
            <StaggerItem as="article" key={s.id} className={`sv-case${i === 0 ? ' sv-case--lead' : ''}`}>
              <header className="sv-case__head">
                <span className="pg-tile__ico"><Icon name={s.icon} /></span>
                <div><H3>{s.who}</H3><span className="sv-case__pkg">{s.pkg}</span></div>
                <span className="pill pill--gray">Sample estimate</span>
              </header>
              <div className="sv-ba">
                <div className="sv-ba__col sv-ba__col--before">
                  <span className="sv-label">Before · by hand</span>
                  <ol>{s.before.map(b => <li key={b}>{b}</li>)}</ol>
                </div>
                <span className="sv-ba__to" aria-hidden="true"><Icon name="arrow" /></span>
                <div className="sv-ba__col sv-ba__col--after">
                  <span className="sv-label">Proposed automation</span>
                  <ol>{s.after.map(a => <li key={a}><Icon name="check" />{a}</li>)}</ol>
                </div>
              </div>
              <p className="sv-case__benefit"><span className="sv-label">Intended outcome</span>{s.benefit}</p>
              <dl className="sv-case__cost">
                <div><dt>Setup</dt><dd>{s.setup.replace(/ setup$/, '')}</dd></div>
                <div><dt>Monthly</dt><dd>{s.monthly}</dd></div>
                <div className="sv-case__year"><dt>Year one</dt><dd>{s.year}</dd></div>
              </dl>
            </StaggerItem>
          ))}
        </Stagger>
        <p className="sv-fine">Sample estimates for illustration. Your price comes from the written scope after the discovery call.</p>
      </Section>

      {/* 6. Process */}
      <Section id="process" label="How a project runs">
        <SectionHead eyebrow="How a project works" title="From first conversation" hl="to a workflow you own."
          lede="The same six steps for every package, with your part in each." />
        <Stagger as="ol" className="sv-steps" gap={0.08}>
          {STEPS.map((s, i) => (
            <StaggerItem as="li" key={s.title} className="sv-step">
              <span className="sv-step__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <div className="sv-step__body">
                <H3>{s.title}</H3>
                <p>{s.body}</p>
                <p className="sv-step__you"><b>Your part:</b> {s.you}</p>
                {s.pill && <span className="pill pill--cob">{s.pill}</span>}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <p className="sv-fine">The exact steps depend on the scope. On an Automation System, design, build, testing and handover repeat for each phase.</p>
      </Section>

      {/* 7. Working with existing tools */}
      <Section paper id="technology" label="Working with your existing tools">
        <div className="pg-split sv-tech">
          <div>
            <SectionHead eyebrow="Your existing tools" title="Built around the apps" hl="you already use."
              lede="You don't need to switch software. We look at each app in the process and work out how the workflow can connect to it." />
            <Stagger as="ol" className="sv-assess">
              {ASSESS.map(a => (
                <StaggerItem as="li" key={a.title} className="sv-assess__item">
                  <H3>{a.title}</H3>
                  <p>{a.body}</p>
                </StaggerItem>
              ))}
            </Stagger>
            <Reveal delay={0.1}>
              <p className="sv-caveat"><Icon name="flag" /><span>Not every app can be connected and not every step should be automated. What can be connected, and how, is confirmed in discovery before you commit.</span></p>
            </Reveal>
          </div>
          <div className="sv-tech__side">
            <Reveal y={24}>
              <div className="sv-hub">
                <svg className="sv-hub__lines" viewBox="0 0 300 300" preserveAspectRatio="none" aria-hidden="true">
                  {[[50, 50], [150, 50], [250, 50], [50, 150], [250, 150], [50, 250], [150, 250], [250, 250]].map(([x, y]) => (
                    <line key={`${x}-${y}`} x1="150" y1="150" x2={x} y2={y} vectorEffect="non-scaling-stroke" />
                  ))}
                </svg>
                <div className="sv-hub__core">
                  <span className="sv-hub__logo"><Icon name="logo" /></span>
                  <b>Your automation</b>
                  <small>Built on Claude Code</small>
                </div>
                <ul className="sv-hub__nodes" aria-label="What builds connect">
                  {CONNECTS.map(c => <li key={c.label}><Icon name={c.icon} />{c.label}</li>)}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <ul className="sv-tech__facts">
                <li><Icon name="bot" /><span><b>Built and run with Claude Code.</b> Kimi Code on request.</span></li>
              </ul>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* 8. What the client can expect */}
      <Section id="expect" label="What to expect">
        <SectionHead eyebrow="What to expect" title="What you get, what we agree" hl="and what we need from you." />
        <Stagger className="sv-expect">
          {EXPECT.map((e, i) => (
            <StaggerItem key={e.title} className={`sv-expect__col${i === 1 ? ' sv-expect__col--mid' : ''}`}>
              <div className="sv-expect__head"><span className="pg-tile__ico"><Icon name={e.icon} /></span><H3>{e.title}</H3></div>
              <ul>{e.items.map(t => <li key={t}><Icon name="check" />{t}</li>)}</ul>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* 9. What you pay */}
      <Section paper id="costs" label="What you pay">
        <SectionHead eyebrow="What you pay" title="Four costs," hl="all visible up front."
          lede={<>The setup comes to us once, at go-live; its price is listed with <Link href="#packages">each package</Link>. Platform and AI usage are billed to you by the providers. Management is optional.</>} />
        <Reveal>
          <ol className="sv-stack" aria-label="The four costs of an automation">
            {COSTS.map(c => {
              const ours = c.who.includes('MetaWurks');
              return (
                <li key={c.n} className={`sv-stack__seg${ours ? ' is-ours' : ''}${c.title === 'Management' ? ' is-opt' : ''}`}>
                  <span className="sv-stack__n" aria-hidden="true">{c.n}</span>
                  <H3>{c.title}</H3>
                  <p>{c.when}</p>
                  <span className="sv-stack__who"><i aria-hidden="true" />{c.who}</span>
                </li>
              );
            })}
          </ol>
        </Reveal>

        <div className="sv-sub">
          <Reveal><H3 className="sv-sub__h">Monthly usage, by package</H3></Reveal>
          <Reveal delay={0.06}>
            <div className="pg-table-wrap sv-table" tabIndex={0} role="region" aria-label="Monthly usage estimates by package">
              <table className="pg-table">
                <caption className="sr-only">Estimated monthly platform and AI costs, paid to the providers</caption>
                <thead><tr><th scope="col">Package</th><th scope="col">Platform</th><th scope="col">AI and connectors</th><th scope="col" className="is-us">Monthly total</th></tr></thead>
                <tbody>
                  {RUNNING.map(r => (
                    <tr key={r.name}><th scope="row">{r.name}</th><td>{r.platform}</td><td>{r.ai}</td><td className="is-us">{r.total}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
          <p className="sv-fine">Estimates, confirmed in discovery. Connector tools like Make (about $11/mo) or Zapier (from $30/mo) are added only if an app needs one.</p>
        </div>

        <div className="sv-sub">
          <Reveal><H3 className="sv-sub__h">After go-live: who runs it</H3></Reveal>
          <Stagger className="sv-plans">
            {MANAGEMENT.map(m => (
              <StaggerItem as="article" key={m.name} className={`sv-plan${m.featured ? ' sv-plan--feat' : ''}`}>
                {m.featured && <span className="sv-plan__flag">Most support</span>}
                <H3>{m.name}</H3>
                <p className="sv-plan__price"><b>{m.price}</b>{m.period && <span>{m.period}</span>}</p>
                <p className="sv-plan__for">{m.for}</p>
                <ul className="sv-plan__list">{m.features.map(f => <li key={f}><Icon name="check" />{f}</li>)}</ul>
                <p className="sv-plan__terms">{m.terms}</p>
              </StaggerItem>
            ))}
          </Stagger>
          <p className="sv-fine">Care or Managed is required when AI handles every job. Extra hours start at $15 per hour.</p>
        </div>
      </Section>

      {/* 10. Why MetaWurks */}
      <Section id="why" label="Why MetaWurks">
        <div className="sv-why">
          <SectionHead eyebrow="Why MetaWurks" title="Built around your process," hl="on terms that keep you in control." />
          <Reveal delay={0.1}>
            <div className="sv-why__prose">
              <p>Off-the-shelf tools ask you to reshape your process to fit them. A custom workflow starts from how your business already works: the steps you follow, the apps you pay for and the rules your team applies. It is scoped to the job you need done, and nothing more.</p>
              <p>Custom automation services come from the team behind the <Link href="/">MetaWurks workspace</Link>, which connects the tools professional firms already use.</p>
            </div>
          </Reveal>
        </div>
        <Stagger as="ol" className="sv-ledger">
          {TERMS.map((t, i) => (
            <StaggerItem as="li" key={t.title} className="sv-ledger__row">
              <span className="sv-ledger__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className="pg-tile__ico"><Icon name={t.icon} /></span>
              <H3>{t.title}</H3>
              <p>{t.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* 11. FAQ */}
      <FaqSection faqs={SERVICE_FAQS} eyebrow="FAQ" title="Questions about" hl="custom automation projects." />

      {/* 12. Inquiry */}
      <section className="section sv-inquire" id="inquire" aria-labelledby="inq-h">
        <div className="container sv-inquire__grid">
          <Reveal>
            <div className="final sv-ink">
              <div className="grid-lines" aria-hidden="true" />
              <span className="eyebrow">Start a conversation</span>
              <h2 className="h2" id="inq-h">{INQ_H[0]} <span className="final__hl">{INQ_H[1]}</span></h2>
              <p>Tell us about the process you want to fix. A short description helps us prepare for the discovery call, so the first conversation can start from your workflow.</p>
              <span className="sv-ink__label">Helpful to include</span>
              <ul className="sv-ink__list">
                {INQUIRY_HINTS.map(h => <li key={h}><Icon name="check-c" />{h}</li>)}
              </ul>
              <div className="final__ctas">
                <Link className="btn btn--amber" href={bookHref('services-cta')}>Book a discovery call <Icon name="arrow" className="arrow" /></Link>
              </div>
              <p className="sv-ink__mail">Prefer email? <a href={`mailto:${SERVICES_EMAIL}?subject=Custom%20automation`}>{SERVICES_EMAIL}</a></p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="pg-card sv-form">
              <h3 className="sv-form__h">{titleCase('Describe your workflow')}</h3>
              <p className="sv-form__lede">We reply by email to arrange a discovery call. After the call you receive a written scope with one fixed price, and nothing is built until you agree it.</p>
              <LeadForm kind="contact" cta="Send my workflow" fields={['name', 'firm', 'message']}
                messageLabel="What would you like to automate? Describe the process and the apps involved." extra={{ interest: 'custom-automation' }}
                done="We'll reply by email to set up a discovery call." />
              <p className="sv-form__alt">Asking about the MetaWurks workspace instead? <Link href="/contact">Contact the team</Link>.</p>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
