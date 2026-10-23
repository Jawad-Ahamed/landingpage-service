// Custom automation services (/services). Every price, timeline, example and term below comes from the client-facing
// "MetaWurks Automation Pricing" sheet. From the internal economics sheet, only the project stages (discovery, design,
// build, testing, handover) are used; its hours, costs, margins and pricing rules are never shown here.
// No client names, logos, testimonials or results: the sample projects are the sheet's own illustrations.
// Each fact lives in one section, so the page doesn't repeat itself.
import type { Faq } from './types';

/* ---------- The two MetaWurks offerings ---------- */
export const OFFERINGS = [
  {
    id: 'workspace', tag: 'Our product', name: 'The MetaWurks workspace',
    lede: 'Software your team signs in to and uses every day.',
    rows: [
      { k: 'What it is', v: 'A private AI workspace: ask questions across your tools and hand routine admin to built-in agents, with every answer cited.' },
      { k: 'Who uses it', v: 'Accounting, law and healthcare firms and finance teams.' },
      { k: 'How it is priced', v: 'A monthly subscription, with a free first month.' },
    ],
    links: [{ label: 'How it works', href: '/#how' }, { label: 'Product pricing', href: '/pricing' }],
  },
  {
    id: 'services', tag: 'Custom automation services', name: 'A workflow built for your business',
    lede: 'A project our team delivers for you, around the way you already work.',
    rows: [
      { k: 'What it is', v: 'We design and build an automation for one specific process, connecting the apps you already use, with AI steps where they help.' },
      { k: 'Who it is for', v: 'Firms and small businesses with repetitive work between apps: accounting firms, clinics, trades and others.' },
      { k: 'How it is priced', v: 'One fixed setup price from $300. Platform and AI usage are billed to you by the providers.' },
    ],
    links: [{ label: 'See what we build', href: '#packages' }],
  },
];

/* ---------- The busywork automation removes: one line each ---------- */
export const PROBLEMS = [
  { icon: 'copy', title: 'Re-typing data between apps', body: 'New records move from one app to the next on their own, so nobody copies them by hand.', pkg: 'basic' },
  { icon: 'inbox', title: 'Leads lost across inboxes', body: 'Every inquiry lands in one CRM and gets the same follow-up, whichever channel it came from.', pkg: 'standard' },
  { icon: 'receipt', title: 'Documents keyed in by hand', body: 'AI reads each receipt or document and enters the details where they belong, such as QuickBooks.', pkg: 'advanced-ai' },
  { icon: 'tabs', title: 'One process, five tools', body: 'Intake, contracts, billing and reports become one connected flow, built in phases.', pkg: 'system' },
];

/* ---------- What we build (the four packages) ---------- */
export type Package = {
  id: string; level: 1 | 2 | 3 | 4; name: string; title: string; price: string; per?: string;
  covers: string; flow: string[]; who: string; deliverable: string; ready: string;
};

export const PACKAGES: Package[] = [
  {
    id: 'basic', level: 1, name: 'Basic', title: 'Simple app-to-app workflows', price: '$300–400',
    covers: 'One simple workflow connecting 1 to 2 apps, triggered by an event such as a form being submitted.',
    flow: ['A web form is submitted', 'The entry is added to your CRM', 'An email alert goes to the team'],
    who: 'Clinics, practices and service businesses with a single intake or inquiry form.',
    deliverable: 'One live workflow on your accounts.', ready: '2 to 4 days',
  },
  {
    id: 'standard', level: 2, name: 'Standard', title: 'Lead capture and follow-up', price: '$400–700',
    covers: 'A workflow across 3 to 5 apps, with branching logic (different paths for different cases) and error alerts.',
    flow: ['Leads arrive from 3 sources', 'Each one is added to the CRM', 'A follow-up email goes out', 'A failed step sends an error alert'],
    who: 'Trades such as HVAC companies, and any business taking inquiries from several channels.',
    deliverable: 'One live multi-app workflow, with its branching rules documented.', ready: '1 week',
  },
  {
    id: 'advanced-ai', level: 3, name: 'Advanced AI', title: 'AI document and data workflows', price: '$700–1,000',
    covers: 'Workflows with AI steps: reading documents, extracting details, sending SMS or connecting to custom APIs.',
    flow: ['Receipts arrive by email', 'AI reads each one and extracts the details', 'The entry is posted in QuickBooks', 'An SMS confirms it'],
    who: 'Accounting firms, and any business that keys details from documents by hand.',
    deliverable: 'One live AI-assisted workflow, tested on your real documents.', ready: '1 to 2 weeks',
  },
  {
    id: 'system', level: 4, name: 'Automation System', title: 'Connected automation systems', price: '$1,000+', per: '/phase',
    covers: 'Several connected workflows across your business, delivered one phase at a time.',
    flow: ['Client intake', 'Contract', 'Billing', 'CRM update', 'Reports'],
    who: 'Businesses whose intake, contracts, billing and reporting run in separate tools.',
    deliverable: 'Connected workflows, each phase scoped, built, tested and handed over.', ready: '1 to 2 weeks per phase',
  },
];

/* ---------- Sample projects (before → after) ---------- */
export type Sample = { id: string; who: string; pkg: string; icon: string; before: string[]; after: string[]; benefit: string; setup: string; monthly: string; year: string };
// The sheet's "What clients pay in year one" examples. Labelled "Sample estimates for illustration" wherever shown.
// The "before" steps describe the manual version of the same workflow; they are illustrations, not client stories.
export const SAMPLES: Sample[] = [
  { id: 'accounting', who: 'Accounting firm', pkg: 'Advanced AI + Care', icon: 'calc', before: ['Receipts arrive by email', 'Someone opens and reads each one', 'Vendor, date and amount typed into QuickBooks', 'Client chased separately when something is missing'], after: ['Receipts arrive by email', 'AI extracts the details', 'Entered in QuickBooks', 'SMS sent'], benefit: 'Receipts are entered straight from the email, staff stop keying vendor, date and amount, and the client gets a text when it is done.', setup: '$900', monthly: 'About $90/mo usage, Care $50/mo', year: '$2,600' },
  { id: 'hvac', who: 'HVAC company', pkg: 'Standard', icon: 'chart', before: ['Leads arrive from 3 sources', 'Copied into the CRM when someone has time', 'Follow-up written one by one'], after: ['Leads from 3 sources', 'CRM', 'AI follow-up emails'], benefit: 'Every lead lands in one CRM and gets a follow-up email, whichever channel it came through.', setup: '$500', monthly: 'About $30/mo platform and AI', year: '$860' },
  { id: 'dental', who: 'Dental clinic', pkg: 'Basic', icon: 'pulse', before: ['Patient fills in a form', 'Front desk re-types it into a sheet', 'Front desk told in person or not at all'], after: ['Patient form', 'Sheet', 'Front desk alert'], benefit: 'Form entries reach the sheet without re-typing, and the front desk is alerted when a new one arrives.', setup: '$350', monthly: 'About $30/mo platform', year: '$710' },
];

/* ---------- How a project runs: the five delivery stages, plus the written scope ---------- */
export const STEPS = [
  { title: 'Discovery', body: 'A call about the process, the apps it touches, and where automation fits and where it does not.', you: 'Walk us through how it runs today.' },
  { title: 'Written scope', body: 'The steps, the apps, the timeline, estimated monthly costs and one fixed setup price, in writing.', you: 'Review and agree the scope. Nothing is built before that.', pill: 'Fixed price' },
  { title: 'Design', body: 'We map every trigger, rule and step, and how each app will connect.', you: 'Confirm how unusual cases should be handled.' },
  { title: 'Build', body: 'We build the workflow on your own accounts, so it is yours from day one.', you: 'Give access to the accounts it uses.' },
  { title: 'Testing', body: 'Every step is tested with your real data before anything goes live.', you: 'Check the results look right.' },
  { title: 'Handover', body: 'Go-live with documentation, a video walkthrough, a live training call and 30 days of free fixes.', you: 'Join the training call. The setup is paid now.', pill: 'Pay at go-live' },
];

/* ---------- Working with your existing tools ---------- */
export const CONNECTS = [
  { icon: 'globe', label: 'Web forms' }, { icon: 'users', label: 'CRMs' }, { icon: 'mail', label: 'Email' }, { icon: 'tabs', label: 'Spreadsheets' },
  { icon: 'calc', label: 'QuickBooks' }, { icon: 'chat', label: 'SMS' }, { icon: 'file', label: 'Document reading' }, { icon: 'plug', label: 'Custom APIs' },
];

export const ASSESS = [
  { title: 'List every app in the workflow', body: 'On the discovery call we note each app the process touches, and what has to happen in it.' },
  { title: 'Check how each one connects', body: 'Through the app\'s own connection, a connector tool such as Make or Zapier when an app needs one, or a custom API on the Advanced AI package.' },
  { title: 'Confirm it in the written scope', body: 'The approach for every app, and any monthly cost it adds, is agreed before you commit.' },
];

/* ---------- What to expect ---------- */
export const EXPECT = [
  { icon: 'check-c', title: 'Included in every setup', items: ['Discovery call and written scope', 'Testing on your real data', 'Documentation and a video walkthrough', 'A live training call', '30 days of free fixes', 'Payment only at go-live'] },
  { icon: 'search', title: 'Agreed in the written scope', items: ['Which steps and apps are included', 'The access the build needs', 'The fixed setup price', 'Estimated monthly provider costs', 'The timeline, or phases for larger systems', 'Self-run, Care or Managed after go-live'] },
  { icon: 'users', title: 'What we need from you', items: ['Time for the discovery call', 'A walkthrough of the process as it runs today', 'Sign-off on the written scope', 'Access to the accounts the workflow uses', 'Real data to test with'] },
];

/* ---------- Costs ---------- */
export const COSTS = [
  { n: '1', title: 'Setup', when: 'One time, paid at go-live', who: 'Paid to MetaWurks' },
  { n: '2', title: 'Platform', when: 'Monthly', who: 'Paid to the provider' },
  { n: '3', title: 'AI and connectors', when: 'Monthly', who: 'Paid to the provider' },
  { n: '4', title: 'Management', when: 'Optional, $50 to $100/mo each', who: 'Paid to MetaWurks' },
];

export const RUNNING = [
  { name: 'Basic', platform: '$20 to $40', ai: '$0 to $3', total: '$20 to $43' },
  { name: 'Standard', platform: '$20 to $40', ai: '$1 to $15', total: '$21 to $55' },
  { name: 'Advanced AI', platform: '$20 to $40', ai: '$10 to $100', total: '$30 to $140' },
  { name: 'Automation System', platform: '$20 to $40', ai: '$40 to $250', total: '$60 to $290' },
];

export type Plan = { name: string; price: string; period?: string; for: string; features: string[]; terms: string; featured?: boolean };
export const MANAGEMENT: Plan[] = [
  { name: 'Self-run', price: '$0', for: 'You run it.', features: ['Documentation and training', '30 days of free fixes', 'After that, help from $15/hr when needed'], terms: 'No monthly fee' },
  { name: 'Care', price: '$50', period: '/mo', for: 'We keep it running.', features: ['We monitor it and fix breakages', 'We apply updates', 'Monthly report'], terms: 'Up to 1 hr · reply in 2 business days' },
  { name: 'Managed', price: '$100', period: '/mo', for: 'We keep it running and improving.', featured: true, features: ['Everything in Care', 'Small changes', 'AI and cost tuning', 'Monthly call'], terms: 'Up to 2 hrs · reply in 1 business day' },
];

/* ---------- Why MetaWurks ---------- */
export const TERMS = [
  { icon: 'key', title: 'You own all of it', body: 'Every account and every finished workflow is yours. The platform and AI bill to you directly, so nothing is locked to us.' },
  { icon: 'receipt', title: 'Costs you can see', body: 'One fixed setup price, agreed before we start, and monthly provider costs estimated up front.' },
  { icon: 'edit', title: 'Scope stays honest', body: 'Changes outside the written scope are billed from $15/hr, or become a new phase. No surprise invoices.' },
  { icon: 'calendar', title: 'Month to month', body: 'Management is optional. Cancel anytime and keep running the workflow yourself.' },
];

/* ---------- Inquiry ---------- */
export const INQUIRY_HINTS = ['What your business does and who is involved', 'The workflow as it runs today, step by step', 'Where it slows down, breaks or gets missed', 'The apps involved, such as your CRM, email or QuickBooks', 'What you would like to happen instead'];

/* ---------- FAQ ---------- */
export const SERVICE_FAQS: Faq[] = [
  { q: 'What exactly are MetaWurks custom automation services?', a: 'A project where our team designs and builds an automation for a specific process in your business. We connect the apps you already use, such as web forms, CRMs, email, spreadsheets and QuickBooks, and add AI steps where they help, for example reading receipts. You get a tested, documented workflow on your own accounts, for one fixed setup price paid at go-live.' },
  { q: 'How are custom automation services different from the MetaWurks product?', a: 'The [MetaWurks workspace](/pricing) is software: a private AI workspace your team signs in to and uses every day, on a monthly subscription. Custom automation services are a separate offering: we build one workflow around your process and hand it over. A services project is scoped and priced on its own, using the prices on this page.' },
  { q: 'What business processes can be automated?', a: 'Repetitive processes that move information between apps on a predictable pattern: a web form that feeds a CRM and alerts the team; leads from three sources going into one CRM with a follow-up email; emailed receipts read by AI and posted in QuickBooks; or connected intake, contract, billing, CRM and reporting steps delivered in phases.' },
  { q: 'Is every business process suitable for automation?', a: 'No. Automation suits steps that repeat and follow clear rules. Work that needs judgement on every case, processes that change each time they run, or apps that offer no way to connect may not be a good fit. We tell you on the discovery call which parts we would automate and which we would leave with your team.' },
  { q: 'Can you work with our existing applications?', a: 'Wherever they can be connected, the workflow is built around the apps you already have. We check every app on the discovery call and confirm the approach in the written scope, before you commit. A connector tool such as Make (about $11/mo) or Zapier (from $30/mo) is added only if one of your apps needs one.' },
  { q: 'Can you assess a workflow before recommending a solution?', a: 'Yes. Every project starts with a discovery call about how the process runs today. The recommendation comes back as a written scope with one fixed price, and nothing is built until you agree it.' },
  { q: 'Do we need to know which technology to use?', a: 'No. Describe the process and the apps involved, and we choose the approach. Builds run on Claude Code, or Kimi Code on request.' },
  { q: 'How are the project cost and timeline determined?', a: 'By the written scope agreed after discovery. Each package sets the range: **Basic** $300–400 (2 to 4 days), **Standard** $400–700 (about 1 week), **Advanced AI** $700–1,000 (1 to 2 weeks) and **Automation System** $1,000+ per phase (1 to 2 weeks per phase).' },
  { q: 'When do we pay, and what will it cost each month?', a: 'The setup is paid at go-live, not before. Platform and AI usage are paid directly to the providers, from about $20/mo for Basic up to $60 to $290/mo for an Automation System, confirmed in discovery. Management is optional, $50 or $100/mo per automation.' },
  { q: 'What information should we prepare before the first discussion?', a: 'A short description of the process as it runs today, the apps involved, where it slows down or gets missed, and what you would like to happen instead. If the process uses documents, have an example or two to hand. You do not need a technical specification.' },
  { q: 'What happens after implementation?', a: 'After 30 days of free fixes you can run it yourself (help from $15/hr when needed), or add **Care** ($50/mo) to have us monitor it, fix breakages and apply updates, or **Managed** ($100/mo) for small changes and tuning as well. Care or Managed is required when AI handles every job.' },
];
