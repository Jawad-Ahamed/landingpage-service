// Content model for every data-driven page. Copy is plain text; `**bold**` and `[link](/path)` are allowed
// in body strings and rendered by components/templates/Rich.tsx.

export type Faq = { q: string; a: string };

/** A short, quotable direct answer near the top of a page (the AEO core: 40–60 words). */
export type Answer = { question: string; answer: string; updated: string };

export type Step = { label: string; pill?: { text: string; tone: 'grn' | 'amb' | 'cob' | 'gray' }; flag?: boolean };

export type AgentRun = { title: string; app: string; steps: Step[]; done: string };

export type Integration = {
  slug: string;
  name: string;
  tagline: string;              // hero line 2
  logo: string;                 // /assets/logos/*.svg
  category: 'Email & calendar' | 'Accounting' | 'Files' | 'Team chat' | 'Payments' | 'Meetings' | 'Social' | 'Design' | 'Custom';
  blurb: string;                // one line for cards and the directory
  answer: Answer;
  reads: string[];              // what MetaWurks can read once connected
  does: string[];               // what agents can do with it
  never: string[];              // what it will not do
  prompts: string[];            // example prompts
  agents: string[];             // agent slugs
  useCases: string[];           // use-case slugs
  faqs: Faq[];
  claims?: string[];            // claim ids this page relies on (pending ones fail a launch build)
};

export type Agent = {
  slug: string;
  name: string;
  kind: 'Built-in' | 'Skill' | 'Example';     // Example = described in plain English by a firm, not shipped built-in
  area: 'Accounting & tax' | 'Finance' | 'Legal' | 'Healthcare' | 'Everyday' | 'Marketing';
  icon: string;                 // sprite id without the i- prefix
  blurb: string;
  answer: Answer;
  asks: string[];
  reads: string[];              // integration slugs
  run: AgentRun;
  reviews: string[];            // what it always hands back to a human
  faqs: Faq[];
};

export type Solution = {
  slug: string;
  name: string;                 // "Accounting & tax firms"
  short: string;                // "Accounting & tax"
  tag: 'acct' | 'legal' | 'health' | 'fin';
  headline: [string, string];   // line 1, highlighted line 2
  lede: string;
  answer: Answer;
  pains: { title: string; body: string; source?: string }[];
  jobs: { title: string; body: string }[];
  compliance: { title: string; body: string };
  run: AgentRun;
  agents: string[];
  useCases: string[];
  integrations: string[];
  faqs: Faq[];
  claims?: string[];
};

export type UseCase = {
  slug: string;
  name: string;
  verticals: Solution['tag'][];
  headline: [string, string];
  lede: string;
  answer: Answer;
  before: string[];
  after: string[];
  howto: { name: string; text: string }[];   // HowTo steps (also rendered as JSON-LD)
  run: AgentRun;
  agents: string[];
  integrations: string[];
  faqs: Faq[];
};

export type Compare = {
  slug: string;
  name: string;                  // "ChatGPT"
  kind: 'tool' | 'way-of-working';
  headline: [string, string];
  lede: string;
  answer: Answer;
  rows: { label: string; them: string; us: string }[];
  whenThem: string[];            // honest: when the alternative is the better fit
  whenUs: string[];
  sources: { label: string; url: string; checked: string }[];
  faqs: Faq[];
};

export type Plan = { name: string; price: number | null; period: string; for: string; features: string[]; cta: string; featured?: boolean; badge?: string };

export type GlossaryTerm = { slug: string; term: string; short: string; body: string[]; related: string[]; seeAlso?: { label: string; href: string }[] };
