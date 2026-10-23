'use client';
// "Built for the software your profession runs on": three profession lanes whose connectors draw into the
// MetaWurks workspace as the section scrolls through (scroll-tied pathLength, no timers). Industry tools are
// shown as monogram tiles and marked as connecting via Custom MCP connector (pending confirmation).
import Link from 'next/link';
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { INDUSTRY_LANES } from '@/content/data/industryTools';
import { INTEGRATIONS } from '@/content/data/integrations';
import { EASE_EXPO } from '@/components/motion/Motion';

const PATHS = ['M100 0 C100 70, 300 50, 300 120', 'M300 0 L300 120', 'M500 0 C500 70, 300 50, 300 120'];
const NATIVE = ['gmail', 'outlook', 'quickbooks', 'xero', 'google-drive', 'onedrive', 'slack', 'microsoft-teams', 'stripe'];

export default function IndustryStack() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'center 45%'] });
  const draw = useTransform(scrollYProgress, [0.25, 0.85], [0, 1]);
  const hubGlow = useTransform(scrollYProgress, [0.7, 1], [0, 1]);
  const native = NATIVE.map(s => INTEGRATIONS.find(i => i.slug === s)).filter(Boolean);

  return (
    <section ref={ref} className="section" id="industries" aria-labelledby="ind-h">
      <div className="container">
        <div className="section-head section-head--center">
          <m.span className="eyebrow" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE_EXPO }}>Every practice, one workspace</m.span>
          <m.h2 className="h2" id="ind-h" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE_EXPO, delay: 0.05 }}>
            Built Around the Software <span className="hl">Your Profession Runs On.</span>
          </m.h2>
          <p className="lede" data-read>Law firms, accounting practices and medical offices each run on their own systems. MetaWurks sits on top of all of them, so one workspace can prep a matter, a return and a prior auth.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {INDUSTRY_LANES.map((lane, li) => (
            <m.div key={lane.id} className="ind-lane" initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '0px 0px -10% 0px' }} transition={{ duration: 0.6, ease: EASE_EXPO, delay: li * 0.06 }}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className={`tag tag--${lane.tag}`}>{lane.label}</span>
                <span className="text-[12px] font-semibold uppercase tracking-[.07em] text-faint">Via MCP</span>
              </div>
              <ul className="grid grid-cols-2 gap-2">
                {lane.tools.map(t => (
                  <li key={t.name} className="ind-tool doc-stack" data-tilt>
                    <span className="ind-mono" style={{ background: t.color }}>{t.mono}</span>
                    <span className="min-w-0"><b>{t.name}</b><span>{t.what}</span></span>
                  </li>
                ))}
              </ul>
            </m.div>
          ))}
        </div>

        <svg className="ind-wires hidden lg:block" viewBox="0 0 600 120" preserveAspectRatio="none" aria-hidden="true">
          {PATHS.map(d => <path key={d} d={d} className="ind-wire-base" vectorEffect="non-scaling-stroke" />)}
          {PATHS.map(d => <m.path key={d + 'x'} d={d} className="ind-wire" vectorEffect="non-scaling-stroke" style={reduce ? undefined : { pathLength: draw }} />)}
        </svg>

        <m.div className="ind-hub" style={reduce ? undefined : { ['--glow' as string]: hubGlow }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="ind-hub__mark"><img src="/assets/brand/metawurks-mark.png" alt="" width={30} height={30} className="is-lt" /><img src="/assets/brand/metawurks-mark-dark.png" alt="" width={30} height={30} className="is-dk" /></span>
              <span><b className="block text-[17px] tracking-[-0.01em]">MetaWurks Workspace</b><span className="text-[14px] text-slate">Agents read across every connected system, with a source on every answer.</span></span>
            </div>
            <Link href="/integrations" className="btn btn--ghost btn--sm">See all integrations</Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {native.map(i => <Link key={i!.slug} href={`/integrations/${i!.slug}`} className="chip"><img className="app-ico" src={i!.logo} alt="" />{i!.name}</Link>)}
            <Link href="/integrations/mcp" className="chip"><img className="app-ico" src="/assets/logos/mcp.svg" alt="" />Custom MCP connector</Link>
          </div>
        </m.div>
        <p className="pg-claims text-center">Industry tools connect through MCP: if your platform offers an MCP connection, we add it within 24–48 hours. Which tools connect for your firm is confirmed on a 1:1 call. Product names belong to their owners; no partnership is implied.</p>
      </div>
    </section>
  );
}
