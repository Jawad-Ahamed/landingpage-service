import Link from 'next/link';
import { Fragment } from 'react';
import { PLANS, PLAN_MATRIX, PRICING_CLAIMS, PRICING_FAQS } from '@/content/data/pricing';
import { pageMeta } from '@/lib/seo';
import { softwareApp } from '@/lib/schema';
import { AnswerBlock, CheckList, ClaimNotes, CtaBand, FaqSection, PageHero, Section, SectionHead } from '@/components/templates/blocks';
import Icon from '@/components/templates/Icon';
import JsonLd from '@/components/seo/JsonLd';
import { CountUp, Magnetic, Reveal, Stagger, StaggerItem } from '@/components/motion/Motion';

export const metadata = pageMeta({ title: 'Pricing: plans for solo practitioners to busy firms', description: 'MetaWurks pricing: Starter $19, Professional $39 and Enterprise $99 per month, billed monthly in USD. Your first month is free on any plan.', path: '/pricing' });

export default function PricingPage() {
  return (
    <main id="main">
      <PageHero trail={[{ name: 'Pricing', path: '/pricing' }]} layout="center" eyebrow="Pricing"
        headline={['Simple pricing.', 'Your first month is on us.†']}
        lede="Pick a plan by how much work you hand off. Every plan includes cited answers, built-in agents and every integration." ctas={false} />

      <section className="section section--tight" aria-label="Plans" style={{ paddingTop: 0 }}>
        <div className="container">
          <Stagger className="pg-plans">
            {PLANS.map(p => (
              <StaggerItem key={p.name} className={`pg-plan${p.featured ? ' pg-plan--featured' : ''}`}>
                {p.featured && <span className="pill pill--cob pg-plan__badge">Most popular</span>}
                <h3>{p.name}</h3>
                <p className="pg-plan__for">{p.for}</p>
                <div className="pg-plan__price"><b><CountUp to={p.price} prefix="$" /></b><span>/ month</span></div>
                <Magnetic strength={0.12}><Link className={`btn ${p.featured ? 'btn--primary' : 'btn--ghost'}`} href="/#book">{p.cta} <Icon name="arrow" className="arrow" /></Link></Magnetic>
                <CheckList items={p.features} />
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal><p className="pg-claims" style={{ textAlign: 'center' }}>Prices in USD, billed monthly. Need dedicated infrastructure or 24/7 support? <Link href="/#book">Ask about Custom</Link>.</p></Reveal>
        </div>
      </section>

      <Section label="Short answer" tight>
        <AnswerBlock answer={{ question: 'How much does MetaWurks cost?', updated: '2026-10-06',
          answer: 'MetaWurks costs $19 a month for Starter, $39 for Professional and $99 for Enterprise, billed monthly in USD. Plans differ by AI token allowance (3M, 6M or 10M), document storage (1, 5 or 15 GB) and support level. Every plan starts with the first month free.' }} />
      </Section>

      <Section paper label="Compare plans">
        <SectionHead eyebrow="Compare plans" title="Everything in every plan," hl="sized to your workload." />
        <Reveal>
          <div className="pg-table-wrap">
            <table className="pg-table">
              <thead><tr><th scope="col">&nbsp;</th>{PLANS.map(p => <th key={p.name} scope="col" className={p.featured ? 'is-us' : undefined}>{p.name} · ${p.price}</th>)}</tr></thead>
              <tbody>
                {PLAN_MATRIX.map(g => (
                  <Fragment key={g.group}>
                    <tr className="grp"><th colSpan={4}>{g.group}</th></tr>
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

      <FaqSection faqs={PRICING_FAQS} title="Pricing questions," hl="answered." />
      <CtaBand title="Not sure which plan? Find out what your" hl="admin hours are worth." secondary={{ label: 'Open the ROI calculator', href: '/resources/roi-calculator' }} />
      <JsonLd data={softwareApp()} />
    </main>
  );
}
