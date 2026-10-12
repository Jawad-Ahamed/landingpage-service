// Industry software by profession. These are NOT listed as built-in integrations: they connect through a
// Custom MCP connector or by syncing exports into Drive/OneDrive, and availability is confirmed per firm.
// Shown with monogram tiles (no third-party logos). Claim id: 'industry-connectors' (pending).
export type IndustryTool = { name: string; what: string; mono: string; color: string };
export type IndustryLane = { id: 'legal' | 'acct' | 'health'; label: string; tag: 'legal' | 'acct' | 'health'; tools: IndustryTool[] };

export const INDUSTRY_LANES: IndustryLane[] = [
  {
    id: 'legal', label: 'Law firms', tag: 'legal', tools: [
      { name: 'Clio', what: 'Practice management', mono: 'Cl', color: '#0B6CB8' },
      { name: 'MyCase', what: 'Practice management', mono: 'Mc', color: '#2D7D9A' },
      { name: 'NetDocuments', what: 'Document management', mono: 'Nd', color: '#1F3A93' },
      { name: 'iManage', what: 'Document management', mono: 'iM', color: '#0E6E73' },
      { name: 'Filevine', what: 'Case management', mono: 'Fv', color: '#5B3FC4' },
      { name: 'DocuSign', what: 'E-signature', mono: 'Ds', color: '#C2410C' },
    ],
  },
  {
    id: 'acct', label: 'Accounting & tax', tag: 'acct', tools: [
      { name: 'Karbon', what: 'Practice management', mono: 'Kb', color: '#1E7A57' },
      { name: 'TaxDome', what: 'Client portal & workflow', mono: 'Td', color: '#2440BB' },
      { name: 'Canopy', what: 'Practice management', mono: 'Cn', color: '#0F766E' },
      { name: 'UltraTax CS', what: 'Tax preparation', mono: 'Ut', color: '#B45309' },
      { name: 'Drake Tax', what: 'Tax preparation', mono: 'Dr', color: '#9F1239' },
      { name: 'Gusto', what: 'Payroll', mono: 'Gu', color: '#D9480F' },
    ],
  },
  {
    id: 'health', label: 'Healthcare practices', tag: 'health', tools: [
      { name: 'Epic', what: 'EHR', mono: 'Ep', color: '#7A1F3D' },
      { name: 'athenahealth', what: 'EHR & billing', mono: 'at', color: '#4D7C0F' },
      { name: 'eClinicalWorks', what: 'EHR', mono: 'eC', color: '#1D4ED8' },
      { name: 'Tebra', what: 'Practice management', mono: 'Tb', color: '#6D28D9' },
      { name: 'Availity', what: 'Payer portal', mono: 'Av', color: '#0E7490' },
      { name: 'CoverMyMeds', what: 'Prior authorization', mono: 'Cm', color: '#BE185D' },
    ],
  },
];
