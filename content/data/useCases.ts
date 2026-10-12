import type { UseCase } from './types';
import { agent } from './agents';

const UPDATED = '2026-10-06';

export const USE_CASES: UseCase[] = [
  {
    slug: 'tax-prep',
    name: 'Tax prep',
    verticals: ['acct'],
    headline: ['Tax prep,', 'prepped for you.'],
    lede: 'Busy season shouldn\'t mean late nights chasing receipts and re-keying bank statements. The Tax Prep Agent gathers the numbers, chases the gaps and drafts the organizer and workpapers, then waits for your review.',
    answer: { question: 'How do you automate tax prep with AI?', updated: UPDATED,
      answer: 'Connect the client\'s ledger (QuickBooks or Xero), inbox and document folders, then let an agent pull the P&L and balance sheet, match 1099s to deposits, flag missing receipts and draft the document request and workpapers. Keep a preparer in the loop: nothing is filed or sent without review.' },
    before: ['Hunting receipts across three inboxes at 11pm', 'Re-keying bank statements into workpapers', 'Writing the same document-request email for every client'],
    after: ['Missing receipts flagged and the client request drafted, waiting for your OK', '1099s matched to deposits, with mismatches flagged', 'Organizer and workpapers drafted for review'],
    howto: [
      { name: 'Connect the ledger', text: 'Sign in to QuickBooks or Xero on the app\'s own screen. MetaWurks receives an encrypted token, never your password.' },
      { name: 'Connect where documents arrive', text: 'Connect Gmail or Outlook and the client\'s Drive or OneDrive folder.' },
      { name: 'Run the Tax Prep Agent', text: 'Choose the client and tax year. The agent pulls the books, matches 1099s to deposits and lists what\'s missing.' },
      { name: 'Review the flags', text: 'Check every item marked "Needs review" against its cited source.' },
      { name: 'Approve the client request', text: 'Edit and approve the drafted document request. It is sent from your inbox only after you approve it.' },
    ],
    run: agent('tax-prep')!.run,
    agents: ['tax-prep', 'collections'],
    integrations: ['quickbooks', 'xero', 'gmail', 'google-drive', 'outlook'],
    faqs: [
      { q: 'Can AI prepare a tax return?', a: 'AI can do much of the preparation: gathering numbers, matching documents and drafting workpapers. A qualified preparer should review the work and sign the return. MetaWurks prepares; it does not file.' },
      { q: 'What does "Needs review" mean?', a: 'It marks anything the agent could not confirm, such as a 1099 with no matching deposit or a missing receipt. Each flag links to its source so you can resolve it quickly.' },
      { q: 'Which documents can it read?', a: 'PDF statements, 1099s, receipts and spreadsheets in the folders you connect, plus attachments from the emails you bring into the task.' },
    ],
  },
];

export const useCase = (slug: string) => USE_CASES.find(u => u.slug === slug);
