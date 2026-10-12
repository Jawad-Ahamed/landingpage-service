import type { Solution } from './types';
import { agent } from './agents';

const UPDATED = '2026-10-06';

export const SOLUTIONS: Solution[] = [
  {
    slug: 'accounting-tax',
    name: 'Accounting & tax firms',
    short: 'Accounting & tax',
    tag: 'acct',
    headline: ['Busy season,', 'without the 11pm receipt hunt.'],
    lede: 'MetaWurks connects QuickBooks, Xero, Gmail and Drive, then agents pull the books, match 1099s, chase missing documents and draft workpapers. Your preparers review finished prep instead of assembling it.',
    answer: { question: 'How can an accounting or tax firm use AI safely?', updated: UPDATED,
      answer: 'Use AI that works inside the tools you already have, cites the source of every number and never sends anything without approval. MetaWurks connects QuickBooks, Xero, Gmail and Drive through OAuth, prepares tax files, closes and collections for review, and never sells client data. Your firm keeps its 7216 consent process.' },
    pains: [
      { title: 'Receipts at 11pm', body: 'Busy season means chasing receipts across three inboxes, while finding qualified staff ranks as most CPA firms\' #1 issue.', source: 'AICPA PCPS Top Issues Survey, 2024' },
      { title: 'Re-keying between systems', body: 'Bank statements, 1099s and the ledger live in different places, so someone copies numbers by hand and checks them twice.' },
      { title: 'Chatbots with client data', body: 'Pasting client files into a general chatbot puts confidentiality at risk and gives answers you can\'t trace to a source.' },
    ],
    jobs: [
      { title: 'Tax prep', body: 'Pull the P&L and balance sheet, match 1099s to deposits, flag missing receipts and draft the organizer and workpapers.' },
      { title: 'Client document requests', body: 'Know exactly what each client still owes you and send a polite, specific request, after you approve it.' },
      { title: 'Month-end close', body: 'Reconcile payouts, flag uncategorized expenses and draft variance notes for client advisory work.' },
      { title: 'Collections', body: 'Find overdue invoices and draft reminders in your voice, friendly or firm.' },
    ],
    compliance: { title: 'IRC Section 7216 and client consent',
      body: 'Your professional duties stay yours, and your firm sets its own client-consent policy under Section 7216. MetaWurks gives you controls that help: private, per-person connections, locked projects, cited answers and email drafts you approve. Check with your compliance adviser.' },
    run: agent('tax-prep')!.run,
    agents: ['tax-prep', 'month-end-close', 'collections', 'finance-analyst'],
    useCases: ['tax-prep', 'client-document-requests', 'month-end-close', 'collections'],
    integrations: ['quickbooks', 'xero', 'gmail', 'outlook', 'google-drive', 'stripe', 'double'],
    faqs: [
      { q: 'Do we have to replace QuickBooks, Xero or our tax software?', a: 'No. MetaWurks works on top of the tools you already use. Connecting one is a sign-in, not a migration, and filing stays in your tax software.' },
      { q: 'Is client data used to train AI models?', a: 'We never sell your data. Whether a model provider can learn from your data depends on its terms; we\'re confirming those terms in writing for every provider behind Auto and will walk you through them on your call.' },
      { q: 'What if the AI gets a number wrong?', a: 'It can. That\'s why every answer cites the report or document it came from and agents flag gaps as "Needs review". Treat the output as prep for your professional judgment.' },
      { q: 'How long does setup take?', a: 'Connecting QuickBooks, Gmail and Drive takes minutes through each app\'s own sign-in. Book a 1:1 call and we\'ll set up your first agent on your own workflow.' },
    ],
    claims: ['oauth', 'drafts-wait', 'cited', 'never-sold', 'model-training'],
  },
];

export const solution = (slug: string) => SOLUTIONS.find(s => s.slug === slug);
