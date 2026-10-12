// Claims registry. Every product promise that is not yet confirmed in writing lives here as 'pending':
// pages that rely on one show a † and list it in a "Pending confirmation" note. Before launch, run
// `CLAIMS_MODE=launch npm run build` — the build fails while any page still uses a pending claim.
// 'blocked' claims must never be made (scripts/check-claims.mjs also greps for their phrasing).

export type ClaimStatus = 'confirmed' | 'pending' | 'blocked';
export type Claim = { id: string; text: string; status: ClaimStatus; note?: string };

export const CLAIMS: Claim[] = [
  { id: 'never-sold', text: 'Your data is never sold.', status: 'confirmed' },
  { id: 'oauth', text: 'Apps connect through OAuth; MetaWurks never stores your passwords.', status: 'confirmed' },
  { id: 'drafts-wait', text: 'Email drafts wait for your approval before anything is sent.', status: 'confirmed' },
  { id: 'cited', text: 'Every answer cites the file or record it came from.', status: 'confirmed' },
  { id: 'revoke', text: 'Disconnecting a tool revokes its access token.', status: 'confirmed' },
  { id: 'delete', text: 'Deleting your account deletes its associated data.', status: 'pending', note: 'deletion timelines and backup retention period' },
  { id: 'gcp', text: 'Hosted on Google Cloud; data encrypted in transit and at rest.', status: 'pending', note: 'hosting region(s) and encryption-at-rest details' },
  { id: 'phi-masking', text: 'Patient identifiers are masked at intake.', status: 'pending', note: 'scope of PHI masking (which identifiers, which file types)' },
  { id: 'model-training', text: 'Model providers do not train on your data.', status: 'pending', note: 'written no-training terms for every model provider behind Auto' },
  { id: 'subprocessors', text: 'Current list of subprocessors.', status: 'pending', note: 'the subprocessor list and notification policy' },
  { id: 'first-month-free', text: 'Your first month is free on any plan.', status: 'pending', note: 'first-month-free terms' },
  { id: 'token-allowances', text: 'Per-plan AI token allowances.', status: 'pending', note: 'per-plan AI token allowances and periods' },
  { id: 'support-tiers', text: 'Priority support and setup-call details.', status: 'pending', note: 'priority support and setup-call details' },
  { id: 'no-it', text: 'No IT team needed.', status: 'pending', note: 'the "no IT team needed" promise' },
  { id: 'integration-depth', text: 'Per-integration capabilities as described.', status: 'pending', note: 'the exact read/write capabilities listed for each integration' },
  { id: 'mcp-custom', text: 'Custom MCP connectors for tools not listed.', status: 'pending', note: 'Custom MCP connector availability by plan' },
  { id: 'baa', text: 'MetaWurks signs a Business Associate Agreement.', status: 'blocked', note: 'BAA position is not settled; never claim it' },
  { id: 'hipaa', text: 'HIPAA compliant.', status: 'blocked', note: 'no HIPAA compliance claim until audited' },
  { id: 'soc2', text: 'SOC 2 certified.', status: 'blocked', note: 'no SOC 2 claim until a report exists' },
];

export const claim = (id: string) => {
  const c = CLAIMS.find(x => x.id === id);
  if (!c) throw new Error(`Unknown claim id: ${id}`);
  if (c.status === 'blocked') throw new Error(`Claim "${id}" is blocked and must not be used: ${c.note}`);
  if (c.status === 'pending' && process.env.CLAIMS_MODE === 'launch') throw new Error(`Claim "${id}" is still pending (${c.note}). Confirm it in content/data/claims.ts before launch.`);
  return c;
};

export const pendingNotes = (ids: string[] = []) =>
  [...new Set(ids)].map(claim).filter(c => c.status === 'pending').map(c => c.note || c.text);
