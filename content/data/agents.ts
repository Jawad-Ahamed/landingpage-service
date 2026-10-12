import type { Agent } from './types';

// Run examples use fictional sample firms (Harbor & Pine LLC, Cedar Row Co., Alvarez v. Coastline Freight).
const UPDATED = '2026-10-06';

export const AGENTS: Agent[] = [
  {
    slug: 'tax-prep',
    name: 'Tax Prep Agent',
    kind: 'Built-in',
    area: 'Accounting & tax',
    icon: 'calc',
    blurb: 'Pulls the books, matches 1099s to deposits, flags missing receipts and drafts the organizer and workpapers for your review.',
    answer: {
      question: 'What does the MetaWurks Tax Prep Agent do?',
      answer: 'The Tax Prep Agent pulls a client\'s P&L and balance sheet from QuickBooks or Xero, matches 1099s to bank deposits, flags missing receipts as "Needs review" and drafts the client document request, organizer and workpapers. Nothing is filed or sent: a preparer reviews every item first.',
      updated: UPDATED,
    },
    asks: ['Which client?', 'Which tax year?', 'QuickBooks or Xero?'],
    reads: ['quickbooks', 'xero', 'gmail', 'google-drive'],
    run: {
      title: 'Tax Prep Agent', app: 'QuickBooks', done: 'Ready for your review',
      steps: [
        { label: 'Pulled P&L and balance sheet from QuickBooks' },
        { label: 'Matched 1099s to bank deposits', pill: { text: 'Matched', tone: 'grn' } },
        { label: '3 missing receipts', pill: { text: 'Needs review', tone: 'amb' }, flag: true },
        { label: 'Client document request drafted in Gmail', pill: { text: 'Not sent', tone: 'cob' } },
        { label: 'Tax organizer and workpapers drafted' },
      ],
    },
    reviews: ['Every flagged gap ("Needs review")', 'The client document request before it is sent', 'The organizer and workpapers before anything is filed'],
    faqs: [
      { q: 'Does the Tax Prep Agent file returns?', a: 'No. It prepares: it gathers the numbers, matches documents and drafts the organizer and workpapers. Filing stays in your tax software and with your preparer.' },
      { q: 'Which ledgers does it read?', a: 'QuickBooks Online and Xero, through each app\'s own OAuth sign-in. It can also read client documents you keep in Google Drive or OneDrive.' },
      { q: 'Will it email my client on its own?', a: 'No. It drafts the document request in Gmail and marks it "Not sent". You edit, approve or delete it.' },
      { q: 'How does this fit IRC Section 7216?', a: 'Your firm sets its own client-consent policy under Section 7216. MetaWurks gives you controls that help (private connections, locked projects, cited answers and drafts you approve). Check with your compliance adviser.' },
    ],
  },
  {
    slug: 'month-end-close',
    name: 'Month-end close assistant',
    kind: 'Built-in',
    area: 'Finance',
    icon: 'calendar',
    blurb: 'Works your close checklist, reconciles payouts, flags exceptions and tells you exactly what\'s left.',
    answer: {
      question: 'What does the month-end close assistant do?',
      answer: 'It works through your close checklist: pulls the trial balance from Xero or QuickBooks, reconciles Stripe payouts to bank deposits, flags uncategorized expenses for review, hands overdue invoices to the Collections Assistant and drafts variance notes against last month, ready for your sign-off.',
      updated: UPDATED,
    },
    asks: ['Which entity?', 'Which period?', 'Which ledger?'],
    reads: ['xero', 'quickbooks', 'stripe'],
    run: {
      title: 'Month-end close assistant', app: 'Xero', done: 'Close pack drafted',
      steps: [
        { label: 'Pulled the January trial balance from Xero' },
        { label: 'Reconciled Stripe payouts to bank deposits', pill: { text: '214 matched', tone: 'grn' } },
        { label: '4 uncategorized expenses', pill: { text: 'Needs review', tone: 'amb' }, flag: true },
        { label: 'Collections Assistant drafted 5 overdue reminders', pill: { text: 'Not sent', tone: 'cob' } },
        { label: 'Variance notes drafted vs. December' },
      ],
    },
    reviews: ['Exceptions and uncategorized items', 'Variance notes before the close pack goes out', 'Any reminder drafted for a client'],
    faqs: [
      { q: 'Does it post journal entries?', a: 'It drafts and flags; it does not post to your ledger on its own. You decide what gets booked.' },
      { q: 'Can it follow our own close checklist?', a: 'Yes. Describe your checklist in plain English and the assistant works through it in that order, telling you exactly what is left.' },
      { q: 'Which payment platforms can it reconcile?', a: 'Stripe payouts against bank deposits in Xero or QuickBooks today. Ask on a 1:1 call about others.' },
    ],
  },
  {
    slug: 'collections',
    name: 'Collections Assistant',
    kind: 'Built-in',
    area: 'Finance',
    icon: 'receipt',
    blurb: 'Finds overdue invoices and drafts polite, firm reminders. Nothing goes to a client until you approve it.',
    answer: {
      question: 'What does the MetaWurks Collections Assistant do?',
      answer: 'The Collections Assistant finds overdue invoices in QuickBooks or Xero, groups them by how late they are and drafts a reminder for each client in Gmail or Outlook, friendly or firm. Every draft waits for your approval; nothing is sent to a client automatically.',
      updated: UPDATED,
    },
    asks: ['How many days overdue?', 'Friendly or firm?'],
    reads: ['quickbooks', 'xero', 'gmail', 'outlook'],
    run: {
      title: 'Collections Assistant', app: 'QuickBooks', done: '5 drafts waiting for your OK',
      steps: [
        { label: 'Found 9 invoices more than 30 days overdue' },
        { label: 'Grouped by client and days overdue', pill: { text: '6 clients', tone: 'gray' } },
        { label: '2 invoices already disputed by email', pill: { text: 'Needs review', tone: 'amb' }, flag: true },
        { label: 'Drafted 5 reminders in Gmail', pill: { text: 'Not sent', tone: 'cob' } },
        { label: 'Summary of $18,420 outstanding drafted' },
      ],
    },
    reviews: ['Every reminder before it is sent', 'Invoices with an open dispute', 'Tone for key clients'],
    faqs: [
      { q: 'Can it send reminders automatically?', a: 'No. Every reminder is a draft that waits for your approval. You can edit the wording, approve it or delete it.' },
      { q: 'Does it know when a client has already replied?', a: 'It checks the connected inbox for recent replies and flags invoices that look disputed or already discussed, so you do not chase a client twice.' },
    ],
  },
  {
    slug: 'finance-analyst',
    name: 'Finance Analyst',
    kind: 'Built-in',
    area: 'Finance',
    icon: 'chart',
    blurb: 'Answers "Why did margin dip in August?" with real numbers from your ledger, and shows the source.',
    answer: {
      question: 'What does the MetaWurks Finance Analyst do?',
      answer: 'The Finance Analyst answers plain-English questions about your numbers ("Why did margin dip in August?") using your own ledger in QuickBooks or Xero and payments in Stripe. Every figure links to the report or record it came from, so you can check it in seconds.',
      updated: UPDATED,
    },
    asks: ['Which metric?', 'Which period?'],
    reads: ['quickbooks', 'xero', 'stripe'],
    run: {
      title: 'Finance Analyst', app: 'Xero', done: 'Answered from 3 sources',
      steps: [
        { label: 'Read the August and July P&L from Xero' },
        { label: 'Gross margin fell from 41% to 36%', pill: { text: '−5 pts', tone: 'gray' } },
        { label: 'Contractor costs up $12,300 on one project', pill: { text: 'Cited', tone: 'cob' } },
        { label: 'One refund booked to the wrong month', pill: { text: 'Needs review', tone: 'amb' }, flag: true },
        { label: 'Summary drafted with sources' },
      ],
    },
    reviews: ['Anything it flags as a likely booking error', 'The summary before you share it'],
    faqs: [
      { q: 'Where do the numbers come from?', a: 'From your connected ledger and payment tools, never from the model\'s memory. Each figure cites the report or record it came from.' },
      { q: 'Can it build charts?', a: 'It returns the numbers behind each answer and a simple chart where it helps. Ask for the breakdown you need.' },
    ],
  },
  {
    slug: 'daily-briefing',
    name: 'Daily briefing',
    kind: 'Skill',
    area: 'Everyday',
    icon: 'bolt',
    blurb: 'Today\'s meetings, priority emails and deadlines in one short note, ready before your first coffee.',
    answer: {
      question: 'What is the MetaWurks daily briefing?',
      answer: 'The daily briefing is a short note, ready each morning, with today\'s meetings from your calendar, the emails that need a reply and the deadlines coming up. It reads only the accounts you connect, and it drafts replies for your approval rather than sending anything.',
      updated: UPDATED,
    },
    asks: ['Which inbox?', 'What time?'],
    reads: ['google-calendar', 'gmail', 'outlook', 'slack'],
    run: {
      title: 'Daily briefing', app: 'Calendar', done: 'Briefing ready at 7:30',
      steps: [
        { label: '4 meetings today, first at 9:00' },
        { label: '6 emails need a reply', pill: { text: '2 urgent', tone: 'amb' }, flag: true },
        { label: 'Q3 estimated tax deadline in 3 days', pill: { text: 'Deadline', tone: 'cob' } },
        { label: 'Replies drafted for the 2 urgent emails', pill: { text: 'Not sent', tone: 'cob' } },
        { label: 'Briefing note ready' },
      ],
    },
    reviews: ['Any drafted reply', 'What counts as "priority" for you'],
    faqs: [
      { q: 'Can I choose what goes into the briefing?', a: 'Yes. Tell it which inbox, calendar and channels to read and what counts as a priority, and it keeps the note short.' },
    ],
  },
  {
    slug: 'matter-summary',
    name: 'Matter Summary Agent',
    kind: 'Example',
    area: 'Legal',
    icon: 'scale',
    blurb: 'Turns a matter folder into a cited summary report you can check line by line.',
    answer: {
      question: 'What does a matter summary agent do in MetaWurks?',
      answer: 'A matter summary agent reads every file in a matter folder in Google Drive or OneDrive, drafts a case overview, maps the key dates and builds an exhibit list where every line cites its source page. It flags gaps, such as an exhibit cited in the complaint but missing from the folder.',
      updated: UPDATED,
    },
    asks: ['Which matter?', 'Which folder?'],
    reads: ['google-drive', 'onedrive', 'outlook'],
    run: {
      title: 'Matter Summary Agent', app: 'Drive', done: 'Cited report ready',
      steps: [
        { label: 'Read 42 files in the matter folder', pill: { text: '42 files', tone: 'gray' } },
        { label: 'Drafted the case overview' },
        { label: 'Key dates mapped', pill: { text: 'Mar 2023 → Jun 2025', tone: 'cob' } },
        { label: 'Exhibit list built with source cites', pill: { text: 'Cited', tone: 'cob' } },
        { label: 'Exhibit C cited in complaint, not found in folder', pill: { text: 'Needs review', tone: 'amb' }, flag: true },
      ],
    },
    reviews: ['Every flagged gap', 'The overview before it reaches a client or the court', 'Privilege calls'],
    faqs: [
      { q: 'Is this a built-in agent?', a: 'It is an example of an agent a firm describes in plain English. You brief it like a new associate and rerun it on any matter.' },
      { q: 'How does this fit ABA Formal Opinion 512?', a: 'Your professional duties stay yours. MetaWurks helps with competence and supervision: every line is cited so you can verify it, and nothing leaves the workspace without your approval. Check with your ethics adviser.' },
    ],
  },
  {
    slug: 'prior-auth',
    name: 'Intake & Prior Auth Agent',
    kind: 'Example',
    area: 'Healthcare',
    icon: 'pulse',
    blurb: 'Reads intake and chart notes with identifiers masked, then assembles a prior-auth packet for clinician sign-off.',
    answer: {
      question: 'What does a prior authorization agent do in MetaWurks?',
      answer: 'A prior authorization agent reads intake and chart notes, matches the CPT and ICD-10 codes against the payer\'s criteria, assembles the packet and flags anything missing, such as a referring provider NPI. A clinician reviews and signs off; talk to us before processing PHI.',
      updated: UPDATED,
    },
    asks: ['Which patient?', 'Which payer?', 'Which procedure?'],
    reads: ['google-drive', 'onedrive', 'outlook'],
    run: {
      title: 'Intake & Prior Auth Agent', app: 'Drive', done: 'Packet ready for clinician review',
      steps: [
        { label: 'Patient intake read', pill: { text: 'PHI masked', tone: 'grn' } },
        { label: 'Pulled PT notes and imaging history' },
        { label: 'Matched CPT 72148 to ICD-10 M54.16', pill: { text: 'MRI lumbar', tone: 'gray' } },
        { label: 'Checked payer criteria: 6+ weeks of conservative care', pill: { text: 'Met', tone: 'grn' } },
        { label: 'Referring provider NPI missing', pill: { text: 'Needs review', tone: 'amb' }, flag: true },
      ],
    },
    reviews: ['The packet before submission', 'Clinical judgment calls', 'Anything flagged missing'],
    faqs: [
      { q: 'Can we use this with patient information today?', a: 'Talk to us before uploading patient records. We don\'t claim HIPAA compliance today and will state our BAA position plainly on a 1:1 call. Don\'t process PHI until that is settled in writing.' },
    ],
  },
];

export const agent = (slug: string) => AGENTS.find(a => a.slug === slug);
