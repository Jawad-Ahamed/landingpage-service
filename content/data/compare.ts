import type { Compare } from './types';

// Statements about other products must cite a public source and the date it was checked.
const UPDATED = '2026-10-06';

export const COMPARE: Compare[] = [
  {
    slug: 'chatgpt',
    name: 'ChatGPT',
    kind: 'tool',
    headline: ['MetaWurks vs ChatGPT', 'for professional firms.'],
    lede: 'ChatGPT is a brilliant general assistant. MetaWurks is built for firms that handle confidential client files: it works inside your ledger, inbox and folders, cites every answer and never sends anything without your approval.',
    answer: { question: 'What is the difference between MetaWurks and ChatGPT for a firm?', updated: UPDATED,
      answer: 'ChatGPT is a general-purpose assistant you bring files to. MetaWurks connects to the firm\'s own tools (QuickBooks, Xero, Gmail, Drive) through OAuth, answers from your documents with citations, runs agents built for tax prep, close and collections, and holds every outgoing email for approval. Many firms use both: ChatGPT for general writing, MetaWurks for client work.' },
    rows: [
      { label: 'Built for', them: 'Everyone, for any task', us: 'Accounting, law and healthcare firms' },
      { label: 'Works with your tools', them: 'Connectors and file uploads, configured per user', us: 'QuickBooks, Xero, Gmail, Outlook, Drive and more through OAuth, per person' },
      { label: 'Answers cite your sources', them: 'Can cite web or uploaded files, varies by mode', us: 'Every answer cites the file, page or ledger record' },
      { label: 'Agents for firm work', them: 'General agents you set up yourself', us: 'Tax prep, month-end close, collections and finance agents built in' },
      { label: 'Emails wait for approval', them: 'Depends on how you set it up', us: 'Always: drafts are never sent without your OK' },
      { label: 'Locked client projects', them: 'Projects for organizing chats', us: 'Private, locked projects per client or matter' },
      { label: 'Choice of AI models', them: 'OpenAI models', us: 'Auto picks across several model providers per task' },
    ],
    whenThem: ['You want a general assistant for writing, research and brainstorming', 'You don\'t need answers grounded in your firm\'s ledger and client folders'],
    whenUs: ['You want AI to do client prep inside QuickBooks, Xero, Gmail and Drive', 'You need every number traceable to its source', 'You want nothing sent to a client without approval'],
    sources: [{ label: 'OpenAI, ChatGPT product pages', url: 'https://openai.com/chatgpt/', checked: UPDATED }],
    faqs: [
      { q: 'Can I keep using ChatGPT alongside MetaWurks?', a: 'Yes. Many firms keep a general assistant for writing and use MetaWurks for client work that needs their own data, sources and approvals.' },
      { q: 'Is it safe to paste client files into a chatbot?', a: 'It depends on the product\'s terms and your firm\'s obligations, such as IRC 7216 or ABA Formal Opinion 512. A workspace that connects through OAuth, cites sources and keeps per-person access gives you more control. Check with your compliance adviser.' },
    ],
  },
];

export const compare = (slug: string) => COMPARE.find(c => c.slug === slug);
