import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement, Fragment } from 'react';
import HomeEffects from '@/components/home/HomeEffects';
import ThemeShift from '@/components/motion/ThemeShift';
import IndustryStack from '@/components/home/IndustryStack';
import ActivityFeed from '@/components/home/ActivityFeed';
import ModelRouter from '@/components/home/ModelRouter';
import PrivateMode from '@/components/home/PrivateMode';

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
    </>
  );
}
