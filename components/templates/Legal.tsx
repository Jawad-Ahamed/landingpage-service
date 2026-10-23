// Template for legal pages (privacy policy, terms): plain hero, a draft banner, numbered sections with a contents list
// (inline at the top on small screens, a sticky "On this page" rail on wide ones), and amber "Review note" callouts for
// every point that still needs a business or legal decision. Review notes are labelled in words, not only by colour,
// and say they are not policy text, so a reader can always tell the draft's open questions from its content.
import { Fragment, type ReactNode } from 'react';
import type { Answer, Faq } from '@/content/data/types';
import { AnswerBlock, ClaimNotes, FaqSection, PageHero } from './blocks';
import Icon from './Icon';
import Toc from './Toc';

const fmtDate = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export type LegalSection = { id: string; title: string; body: ReactNode };

type Props = {
  path: string;
  name: string;                   // breadcrumb label, e.g. "Privacy Policy"
  headline: [string, string];
  lede: ReactNode;
  updated: string;                // YYYY-MM-DD
  sections: LegalSection[];
  claims: string[];               // claim ids; pending ones are listed and fail a launch build
  doc?: string;                   // how the banner names the document, e.g. "This privacy policy"
  draft?: boolean;                // false hides the draft banner and status line (the business's call, not counsel approval)
  answer?: Answer;                // a short, quotable answer shown above the contents
  faqs?: { title: string; hl?: string; items: Faq[] };
};

export function LegalPage({ path, name, headline, lede, updated, sections, claims, doc = 'This document', draft = true, answer, faqs }: Props) {
  const toc = sections.map((s, i) => ({ id: s.id, text: `${i + 1}. ${s.title}` }));
  return (
    <main id="main">
      <PageHero trail={[{ name, path }]} eyebrow="Legal" headline={headline} lede={lede} ctas={false} layout="solo" />
      <section className="section" aria-label={name} style={{ paddingTop: 0 }}>
        <div className="container pg-article">
          <div className="min-w-0 pg-legal-col">
            {draft && (
              <div className="pg-review pg-review--banner" role="note" aria-label="Document status">
                <Icon name="flag" />
                <div>
                  <b>Draft for legal review · not in effect</b>
                  <p>{doc} has not been approved by counsel and does not apply yet. Notes marked &ldquo;Review note&rdquo; list open questions for MetaWurks and its advisers; they are not part of the policy text and will be resolved before it is published.</p>
                </div>
              </div>
            )}
            <p className="pg-legal-meta" style={draft ? { marginTop: 18 } : undefined}>
              {draft && <span><b>Status:</b> Draft, not in effect</span>}
              <span><b>Last updated:</b> <time dateTime={updated}>{fmtDate(updated)}</time></span>
              {draft && <span><b>Effective date:</b> set when approved</span>}
            </p>
            {answer && <div style={{ marginTop: 22 }}><AnswerBlock answer={answer} /></div>}
            <nav className="pg-legal-toc" aria-labelledby="legal-toc-h">
              <h2 className="eyebrow" id="legal-toc-h">Contents</h2>
              <ol>{toc.map(t => <li key={t.id}><a href={`#${t.id}`}>{t.text}</a></li>)}</ol>
            </nav>
            <article className="pg-prose" style={{ marginTop: 8 }}>
              {sections.map((s, i) => (
                <Fragment key={s.id}>
                  <h2 id={s.id}>{i + 1}. {s.title}</h2>
                  {s.body}
                </Fragment>
              ))}
            </article>
            <ClaimNotes ids={claims} />
          </div>
          <Toc headings={toc} />
        </div>
      </section>
      {faqs && <FaqSection faqs={faqs.items} title={faqs.title} hl={faqs.hl} eyebrow="Common questions" />}
    </main>
  );
}
