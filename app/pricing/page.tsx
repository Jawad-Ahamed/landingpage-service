import Link from 'next/link';
import { Fragment } from 'react';
import { PLANS, PLAN_MATRIX, PRICING_CLAIMS, PRICING_FAQS, priceLabel } from '@/content/data/pricing';
import { pageMeta } from '@/lib/seo';
import { bookHref } from '@/lib/site';
import { softwareApp } from '@/lib/schema';
import { AnswerBlock, CheckList, ClaimNotes, CtaBand, FaqSection, PageHero, Section, SectionHead } from '@/components/templates/blocks';
import Icon from '@/components/templates/Icon';
import JsonLd from '@/components/seo/JsonLd';
import Testimonials from '@/components/templates/Testimonials';
import { CountUp, Reveal, Stagger, StaggerItem } from '@/components/motion/Motion';

export const metadata = pageMeta({ title: 'Pricing: Free Trial, Professional, Firm and Enterprise', description: 'MetaWurks pricing: a one-month free trial with 1M AI tokens, then Professional $39 or Firm $99 per month (USD), or a custom Enterprise plan with priority support.', path: '/pricing' });

export default function PricingPage() {
  return (
    <main id="main">
      <PageHero trail={[{ name: 'Pricing', path: '/pricing' }]} layout="center" eyebrow="Pricing"
        headline={['Simple Pricing.', 'Start With a Free Month.']}
        lede="Try everything free for a month with 1M AI tokens. Then pick a plan by how much work you hand off. Every plan includes every model, Private mode, cited answers and the built-in agents." ctas={false} />

      <section className="section section--tight" aria-label="Plans" style={{ paddingTop: 0 }}>
        <div className="container">
          <Stagger className="pg-plans">
            {PLANS.map(p => (
              <StaggerItem key={p.name} className={`pg-plan${p.featured ? ' pg-plan--featured' : ''}`}>
                {(p.featured || p.badge) && <span className="pill pill--cob pg-plan__badge">{p.featured ? 'Most popular' : p.badge}</span>}
                <h3>{p.name}</h3>
                <p className="pg-plan__for">{p.for}</p>
                <div className="pg-plan__price"><b>{p.price ? <CountUp to={p.price} prefix="$" /> : priceLabel(p)}</b><span>{p.price === null ? 'priority support' : p.period}</span></div>
                <Link className={`btn ${p.featured ? 'btn--primary' : 'btn--ghost'}`} href={p.price === null ? bookHref('pricing') : '/#book'}>{p.cta} <Icon name="arrow" className="arrow" /></Link>
                <CheckList items={p.features} />
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal><p className="pg-claims" style={{ textAlign: 'center' }}>Prices in USD, billed monthly. Using a platform we don&apos;t list? If it has an MCP connection, we add it within 24–48 hours. <Link href={bookHref('pricing')}>Talk to us</Link>.</p></Reveal>
        </div>
      </section>

      <Section label="Short answer" tight>
        <AnswerBlock answer={{ question: 'How Much Does MetaWurks Cost?', updated: '2026-10-09',
          answer: 'MetaWurks starts with a free one-month trial that includes 1M AI tokens. After that, Professional is $39 a month and Firm is $99 a month, billed in USD. Enterprise is custom-priced with priority support. Every plan includes every AI model, Private mode, cited answers and the built-in agents.' }} />
      </Section>

      <Section paper label="Compare plans">
        <SectionHead eyebrow="Compare plans" title="Everything in Every Plan," hl="Sized to Your Workload." />
        <Reveal>
          <div className="pg-table-wrap">
            <table className="pg-table">
              <thead><tr><th scope="col">&nbsp;</th>{PLANS.map(p => <th key={p.name} scope="col" className={p.featured ? 'is-us' : undefined}>{p.name} · {priceLabel(p)}</th>)}</tr></thead>
              <tbody>
                {PLAN_MATRIX.map(g => (
                  <Fragment key={g.group}>
                    <tr className="grp"><th colSpan={PLANS.length + 1}>{g.group}</th></tr>
                    {g.rows.map(r => (
                      <tr key={r.label}><th scope="row">{r.label}</th>
                        {r.v.map((v, k) => <td key={k} className={PLANS[k].featured ? 'is-us' : undefined}>{v === true ? <span className="yes"><Icon name="check" /><span className="sr-only">Included</span></span> : v === false ? <span className="no">—<span className="sr-only">Not included</span></span> : v}</td>)}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
        <ClaimNotes ids={PRICING_CLAIMS} />
      </Section>

      <Testimonials />
      <FaqSection faqs={PRICING_FAQS} title="Pricing Questions," hl="Answered." />
      <CtaBand title="Not Sure Which Plan? Find Out What Your" hl="Admin Hours Are Worth." secondary={{ label: 'Open the ROI calculator', href: '/resources/roi-calculator' }} />
      <JsonLd data={softwareApp()} />
    </main>
  );
}
