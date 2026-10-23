import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement, Fragment } from 'react';
import HomeEffects from '@/components/home/HomeEffects';
import ThemeShift from '@/components/motion/ThemeShift';
import IndustryStack from '@/components/home/IndustryStack';
import ActivityFeed from '@/components/home/ActivityFeed';
import ModelRouter from '@/components/home/ModelRouter';
import PrivateMode from '@/components/home/PrivateMode';
import JsonLd from '@/components/seo/JsonLd';
import { faqPage } from '@/lib/schema';

// The home page markup is the original landing page, served as static HTML (fully crawlable).
// Each top-level <section> is rendered as a real React element (so `main > .section` styling still applies),
// which lets React-built sections slot in between them. Its demos are mounted by HomeEffects.
const html = readFileSync(path.join(process.cwd(), 'content/home/sections.html'), 'utf8');

type Sec = { id: string; attrs: Record<string, string>; inner: string };
const SECTIONS: Sec[] = [...html.matchAll(/<section([^>]*)>([\s\S]*?)<\/section>/g)].map(([, a, inner]) => {
  const attrs: Record<string, string> = {};
  for (const [, k, v] of a.matchAll(/([\w-]+)="([^"]*)"/g)) attrs[k === 'class' ? 'className' : k] = v;
  return { id: attrs.id || '', attrs, inner };
});

// React sections inserted after the home section with this id, and original sections left out
const INSERT_AFTER: Record<string, React.ReactNode> = {
  how: <><IndustryStack /><ThemeShift /></>,
  agents: <><ActivityFeed /><ModelRouter /><PrivateMode /></>,
};
const OMIT = new Set(['outcome']);   // its before/after repeated the problem section

// The FAQ in the static markup above, also published as FAQPage structured data for search engines and AI assistants.
const decode = (s: string) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&(apos|#39);/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const HOME_FAQS = [...html.matchAll(/<details class="qa"><summary>([\s\S]*?)<i[^>]*><\/i><\/summary><div class="qa__a"><div>([\s\S]*?)<\/div><\/div><\/details>/g)]
  .map(([, q, a]) => ({ q: decode(q), a: decode(a) }));

export default function HomePage() {
  return (
    <>
      <main id="main">
        {SECTIONS.filter(s => !OMIT.has(s.id)).map((s, i) => (
          <Fragment key={s.id || i}>
            {createElement('section', { ...s.attrs, dangerouslySetInnerHTML: { __html: s.inner } })}
            {INSERT_AFTER[s.id]}
          </Fragment>
        ))}
      </main>
      <HomeEffects />
      {HOME_FAQS.length > 0 && <JsonLd data={faqPage(HOME_FAQS)} />}
    </>
  );
}
