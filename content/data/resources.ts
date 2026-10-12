// Lead magnets. `gated: true` = the download is unlocked by the form (destination set via LEAD_SINK);
// the ROI calculator itself is free to use, only emailing the results asks for an address.
export type Resource = {
  slug: string;
  title: string;
  kind: 'Checklist' | 'Calculator' | 'Template' | 'Guide';
  format: string;
  blurb: string;
  outcome: string[];            // what you get
  audience: string;
  gated: boolean;
  file?: string;                // path under /public/downloads, served from the thanks page
  status: 'ready' | 'coming-soon';
};

export const RESOURCES: Resource[] = [
  {
    slug: 'roi-calculator', title: 'Admin Hours ROI Calculator', kind: 'Calculator', format: 'Interactive',
    blurb: 'See how many billable hours your firm loses to admin each month, and what handing it off is worth.',
    outcome: ['Hours lost to admin per month, per person and firm-wide', 'What those hours are worth at your billing rate', 'The plan that fits your firm, and its payback'],
    audience: 'Owners and managing partners of accounting, law and healthcare practices',
    gated: false, status: 'ready',
  },
  {
    slug: 'ai-vendor-due-diligence-checklist', title: 'AI Vendor Due-Diligence Checklist for Firms', kind: 'Checklist', format: 'PDF · 4 pages',
    blurb: 'The 25 questions to ask any AI tool before client data goes near it: training, retention, access, PHI, IRC 7216 and ABA Opinion 512.',
    outcome: ['25 questions grouped by data, access, accuracy and exit', 'What a good answer sounds like, and red flags', 'A one-page scorecard to compare vendors'],
    audience: 'Partners, compliance leads and practice managers',
    gated: true, file: '/downloads/ai-vendor-due-diligence-checklist.pdf', status: 'coming-soon',
  },
  {
    slug: 'firm-ai-use-policy-template', title: 'Firm AI-Use Policy Template', kind: 'Template', format: 'DOCX + PDF',
    blurb: 'A plain-English AI-use policy you can adapt in an afternoon, with versions for CPA firms, law firms and medical practices.',
    outcome: ['Approved tools, permitted uses and red lines', 'Client consent and confidentiality clauses', 'Review and sign-off rules for AI-drafted work'],
    audience: 'Firm owners, ops leads and compliance',
    gated: true, file: '/downloads/firm-ai-use-policy-template.docx', status: 'coming-soon',
  },
  {
    slug: 'month-end-and-tax-season-checklist', title: 'Month-End Close & Tax-Season Checklist', kind: 'Checklist', format: 'PDF · 3 pages',
    blurb: 'Every step of the month-end close and tax-season prep, with the steps an AI agent can take off your plate marked.',
    outcome: ['A close checklist you can adopt as-is', 'A tax-season document-chase sequence', 'Which steps to automate first'],
    audience: 'Accounting and bookkeeping firms',
    gated: true, file: '/downloads/month-end-and-tax-season-checklist.pdf', status: 'coming-soon',
  },
];

export const resource = (slug: string) => RESOURCES.find(r => r.slug === slug);
