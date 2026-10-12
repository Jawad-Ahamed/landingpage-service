import type { Faq, Plan } from './types';

// Free Trial → Professional $39 → Firm $99 → Enterprise (custom). Prices and the trial are confirmed by the
// founder; paid-plan token and storage allowances stay pending (claim 'token-allowances').
export const PLANS: Plan[] = [
  { name: 'Free Trial', price: 0, period: 'for 1 month', badge: 'Start here', for: 'Try MetaWurks on real client work before you pay anything.', cta: 'Start my free trial',
    features: ['1M AI tokens for your first month', 'Every model, including Private mode', 'Built-in agents and integrations', 'Cited answers from your own files'] },
  { name: 'Professional', price: 39, period: '/ month', for: 'Solo practitioners and small firms handing off prep every week.', cta: 'Choose Professional', featured: true,
    features: ['6M AI tokens', '5 GB document storage', 'Every model, including Private mode', 'Email support'] },
  { name: 'Firm', price: 99, period: '/ month', for: 'Busy firms with heavy seasons and big document sets.', cta: 'Choose Firm',
    features: ['10M AI tokens', '15 GB document storage', 'Priority email support', 'Everything in Professional'] },
  { name: 'Enterprise', price: null, period: 'Custom', for: 'Larger firms and teams that need custom limits and a direct line.', cta: 'Talk to us',
    features: ['Custom token and storage limits', 'Priority support', 'Your own MCP connectors, set up for you', 'Onboarding on a 1:1 call'] },
];

export const priceLabel = (p: Plan) => (p.price === null ? 'Custom' : p.price === 0 ? 'Free' : `$${p.price}`);

// Rows for the full comparison table (true = included).
export const PLAN_MATRIX: { group: string; rows: { label: string; v: (string | boolean)[] }[] }[] = [
  { group: 'Usage', rows: [
    { label: 'AI tokens', v: ['1M (one month)', '6M / month', '10M / month', 'Custom'] },
    { label: 'Document storage', v: ['1 GB', '5 GB', '15 GB', 'Custom'] },
  ] },
  { group: 'Workspace', rows: [
    { label: 'Chat with cited answers', v: [true, true, true, true] },
    { label: 'Every leading AI model, plus Auto', v: [true, true, true, true] },
    { label: 'Private mode (our own model, our own servers)', v: [true, true, true, true] },
    { label: 'Built-in agents (tax prep, close, matter summary)', v: [true, true, true, true] },
    { label: 'Describe your own agents', v: [true, true, true, true] },
    { label: 'Locked private projects', v: [true, true, true, true] },
  ] },
  { group: 'Integrations', rows: [
    { label: '15+ ready-made integrations (OAuth)', v: [true, true, true, true] },
    { label: 'Any MCP-enabled tool added in 24–48 hours', v: [true, true, true, 'Set up for you'] },
  ] },
  { group: 'Support', rows: [
    { label: 'Email support', v: [true, true, 'Priority', 'Priority'] },
    { label: 'Onboarding on a 1:1 call', v: [false, false, false, true] },
  ] },
];

export const PRICING_FAQS: Faq[] = [
  { q: 'How does the free trial work?', a: 'Your first month is free and includes 1M AI tokens, with every model (Private mode included), the built-in agents and the integrations. When the month ends, choose Professional, Firm or Enterprise to keep going.' },
  { q: 'What is an AI token?', a: 'A token is a small piece of text (roughly ¾ of a word) that AI models read and write. Your plan\'s allowance covers the questions you ask and the work agents do.' },
  { q: 'What happens if we use up our tokens?', a: 'You\'ll see your usage in the workspace and can move to a bigger plan anytime. Ask on a 1:1 call about seasonal peaks.' },
  { q: 'Can we change or cancel plans?', a: 'Yes. Plans are billed monthly in USD, and you can change or cancel anytime.' },
  { q: 'What does Enterprise include?', a: 'Enterprise is priced for your firm: custom token and storage limits, priority support, onboarding on a 1:1 call, and your own MCP connectors set up for you. Talk to us for a quote.' },
  { q: 'Can you connect a tool that isn\'t on your list?', a: 'Yes. If the platform your firm uses offers an MCP connection, we can add it to your workspace within 24–48 hours.' },
];

export const PRICING_CLAIMS = ['token-allowances', 'support-tiers', 'no-it'];
