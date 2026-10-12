import { RESOURCES } from '@/content/data/resources';
import { pageMeta } from '@/lib/seo';
import { CtaBand, PageHero, Section, Tiles } from '@/components/templates/blocks';

export const metadata = pageMeta({ title: 'Free resources: checklists, templates and an ROI calculator', description: 'Free tools for accounting, law and healthcare firms adopting AI: an admin-hours ROI calculator, an AI vendor due-diligence checklist, an AI-use policy template and a month-end close checklist.', path: '/resources' });

const ICON: Record<string, string> = { Calculator: 'calc', Checklist: 'check-c', Template: 'file', Guide: 'library' };

export default function ResourcesPage() {
  return (
    <main id="main">
      <PageHero trail={[{ name: 'Resources', path: '/resources' }]} eyebrow="Free resources" headline={['Tools for firms', 'adopting AI carefully.']}
        lede="Checklists, templates and a calculator you can use today, whether or not you ever use MetaWurks." layout="solo" ctas={false} />
      <Section label="All resources">
        <Tiles cols={2} items={RESOURCES.map(r => ({ eyebrow: `${r.kind} · ${r.format}${r.status === 'coming-soon' ? ' · Coming soon' : ''}`, title: r.title, body: r.blurb, icon: ICON[r.kind], href: `/resources/${r.slug}`, more: r.kind === 'Calculator' ? 'Open the calculator' : r.status === 'ready' ? 'Get it free' : 'Get it first' }))} />
      </Section>
      <CtaBand />
    </main>
  );
}
