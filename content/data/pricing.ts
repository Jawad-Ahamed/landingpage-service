import type { Faq, Plan } from './types';

export const PLANS: Plan[] = [
  { name: 'Starter', price: 19, for: 'Solo practitioners trying AI on real client work.', cta: 'Start my free month',
    features: ['3M AI tokens', '1 GB document storage', 'Cited answers from your own files', 'Email support'] },
  { name: 'Professional', price: 39, for: 'Small firms handing off client prep every week.', cta: 'Start my free month', featured: true,
    features: ['6M AI tokens', '5 GB document storage', 'Priority email support', 'Everything in Starter'] },
  { name: 'Enterprise', price: 99, for: 'Busy firms with heavy seasons and big document sets.', cta: 'Book a 1:1 call',
    features: ['10M AI tokens', '15 GB document storage', 'Priority support', 'Setup help on a 1:1 call'] },
];

// Rows for the full comparison table (true = included).
export const PLAN_MATRIX: { group: string; rows: { label: string; v: [string | boolean, string | boolean, string | boolean] }[] }[] = [
  { group: 'Usage', rows: [
    { label: 'AI tokens', v: ['3M', '6M', '10M'] },
    { label: 'Document storage', v: ['1 GB', '5 GB', '15 GB'] },
  ] },
  { group: 'Workspace', rows: [
    { label: 'Chat with cited answers', v: [true, true, true] },
    { label: 'Built-in agents (tax prep, close, collections)', v: [true, true, true] },
    { label: 'Describe your own agents', v: [true, true, true] },
    { label: 'Locked private projects', v: [true, true, true] },
    { label: 'Integrations through OAuth', v: [true, true, true] },
  ] },
  { group: 'Support', rows: [
    { label: 'Email support', v: [true, 'Priority', 'Priority'] },
    { label: 'Setup help on a 1:1 call', v: [false, false, true] },
  ] },
];

export const PRICING_FAQS: Faq[] = [
  { q: 'Is the first month really free?', a: 'Every plan starts with your first month free. Final terms are being confirmed before launch and will be stated plainly at sign-up.' },
  { q: 'What is an AI token?', a: 'A token is a small piece of text (roughly ¾ of a word) that AI models read and write. Your plan\'s allowance covers the questions you ask and the work agents do.' },
  { q: 'What happens if we use up our tokens?', a: 'You\'ll see your usage in the workspace and can move to a bigger plan anytime. Ask on a 1:1 call about seasonal peaks.' },
  { q: 'Can we change or cancel plans?', a: 'Yes. Plans are billed monthly in USD, and you can change or cancel anytime.' },
  { q: 'Do you offer custom plans?', a: 'Yes. If you need dedicated infrastructure or 24/7 support, ask about Custom on a 1:1 call.' },
];

export const PRICING_CLAIMS = ['first-month-free', 'token-allowances', 'support-tiers', 'no-it'];
