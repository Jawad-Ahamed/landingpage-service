import { POSTS } from '@/lib/blog';
import { pageMeta } from '@/lib/seo';
import { CtaBand, PageHero, Section, Tiles } from '@/components/templates/blocks';

export const metadata = pageMeta({ title: 'Blog: AI, compliance and admin for professional firms', description: 'Practical guides for accounting, law and healthcare firms on using AI safely: compliance, workflows and the admin you can hand off.', path: '/blog' });

const fmt = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function BlogIndex() {
  return (
    <main id="main">
      <PageHero trail={[{ name: 'Blog', path: '/blog' }]} eyebrow="Blog" headline={['Less admin.', 'More judgment.']}
        lede="Practical guides for accounting, law and healthcare firms on using AI safely, and on the admin you can finally hand off." layout="solo" ctas={false} />
      <Section label="All posts">
        <Tiles cols={3} items={POSTS.map(p => ({ eyebrow: `${p.tags[0] || 'Guide'} · ${fmt(p.published)}`, title: p.title, body: p.description, href: `/blog/${p.slug}`, more: `Read · ${p.readingMinutes} min` }))} />
      </Section>
      <CtaBand />
    </main>
  );
}
