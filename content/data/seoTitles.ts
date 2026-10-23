// Search-result titles (the HTML <title>) tuned per page, keyed by path. Each string is the exact final title,
// brand included, so lib/seo.ts renders it as an absolute title and the layout's " · MetaWurks" template is never
// added twice. Open Graph and Twitter titles keep the page's own title. Pages not listed here are unaffected.
export const SEO_TITLES: Record<string, string> = {
  // High priority
  '/blog': 'The MetaWurks Journal: AI & Compliance for Firms',
  '/agents': 'AI Agents for Tax Prep, Month-End Close & More · MetaWurks',

  // Medium priority
  '/blog/month-end-close-checklist': 'Month-End Close Checklist: What to Hand Off to AI · MetaWurks',
  '/blog/ai-for-cpa-firms-irc-7216': 'AI for CPA Firms: Staying Within IRC Section 7216 · MetaWurks',
  '/integrations': 'Integrations: QuickBooks, Xero, Gmail & More · MetaWurks',
  '/services': 'Custom Business Automation Services for Small Businesses · MetaWurks',
  '/security': 'Security & AI Data Privacy: How We Protect Client Data · MetaWurks',
  '/blog/prior-authorization-where-the-hours-go': 'Prior Authorization: Where the Hours Actually Go · MetaWurks',
  '/resources/ai-vendor-due-diligence-checklist': 'Free AI Vendor Due-Diligence Checklist for Firms · MetaWurks',
  '/integrations/mcp': 'Custom MCP Connector: Add Any MCP-Enabled Tool · MetaWurks',
  '/resources/month-end-and-tax-season-checklist': 'Free Month-End Close & Tax-Season Checklist · MetaWurks',
  '/compare/chatgpt': 'MetaWurks vs ChatGPT: Which Is Right for Your Firm?',
  '/agents/daily-briefing': 'AI Daily Briefing: Meetings, Emails & Deadlines · MetaWurks',

  // Low priority
  '/resources': 'Free Resources: Checklists, Templates & ROI Tool · MetaWurks',
  '/glossary/mcp': 'What Is Model Context Protocol (MCP)? · MetaWurks',
  '/blog/chatgpt-vs-private-ai-workspace': 'ChatGPT vs Private AI Workspace: How Firms Decide · MetaWurks',
  '/pricing': 'Pricing & Plans: Start with a Free Month · MetaWurks',
  '/agents/prior-auth': 'AI Intake & Prior Authorization Agent · MetaWurks',
  '/agents/tax-prep': 'AI Tax Prep Agent for Accounting & Tax Firms · MetaWurks',
  '/resources/roi-calculator': 'Free Admin Hours ROI Calculator for Firms · MetaWurks',
  '/resources/firm-ai-use-policy-template': 'Free AI-Use Policy Template for Firms · MetaWurks',
  '/agents/matter-summary': 'AI Matter Summary Agent for Law Firms · MetaWurks',
  '/agents/finance-analyst': 'AI Finance Analyst for QuickBooks & Xero · MetaWurks',
};
