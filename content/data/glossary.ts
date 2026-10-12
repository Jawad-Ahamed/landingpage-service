import type { GlossaryTerm } from './types';

// Short, neutral definitions written to be quoted. First sentence = the definition.
export const GLOSSARY: GlossaryTerm[] = [
  {
    slug: 'irc-7216', term: 'IRC Section 7216',
    short: 'IRC Section 7216 is the US federal law that makes it a crime for tax return preparers to use or disclose taxpayers\' return information without the taxpayer\'s consent, except as the regulations allow.',
    body: [
      'Section 7216 of the Internal Revenue Code, with its regulations at 26 CFR 301.7216, applies to anyone in the business of preparing tax returns or providing services in connection with them. "Tax return information" is broad: it covers anything a client gives you for the purpose of preparing a return, plus what you compute from it.',
      'Some uses are allowed without consent, such as using the information to prepare the return itself. Others, including many disclosures to third parties, require a written consent that meets specific format rules. Penalties can be civil and criminal.',
      'For firms evaluating AI tools, the practical questions are where client data goes, who can access it, whether it is used for anything beyond preparing the return, and whether your consent process covers the tool. Your firm\'s own policy and legal advice should answer those questions.',
    ],
    related: ['aba-formal-opinion-512', 'human-in-the-loop'],
    seeAlso: [{ label: 'AI for accounting & tax firms', href: '/solutions/accounting-tax' }, { label: 'Tax prep with AI', href: '/use-cases/tax-prep' }],
  },
  {
    slug: 'mcp', term: 'Model Context Protocol (MCP)',
    short: 'The Model Context Protocol (MCP) is an open standard that lets AI applications connect to external tools and data sources through a common interface, instead of a custom integration for each one.',
    body: [
      'MCP was introduced by Anthropic in 2024 and is now supported by many AI applications and tools. An "MCP server" exposes a tool\'s data and actions; an AI application acting as an "MCP client" can then use them with the user\'s permission.',
      'For firms, MCP matters because it widens what an AI workspace can work with: a practice-management or document system that offers an MCP server can be connected without waiting for a bespoke integration.',
    ],
    related: ['irc-7216'],
    seeAlso: [{ label: 'Custom MCP connector', href: '/integrations/mcp' }],
  },
];

export const glossaryTerm = (slug: string) => GLOSSARY.find(g => g.slug === slug);
