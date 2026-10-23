// Claims registry. Every product promise that is not yet confirmed in writing lives here as 'pending':
// pages register the claims they rely on through <ClaimNotes> (it renders nothing; pending claims are kept off the
// page or reworded instead of being footnoted). Before launch, run
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
  { id: 'first-month-free', text: 'A one-month free trial with 1M AI tokens.', status: 'confirmed', note: 'free-trial terms' },
  { id: 'token-allowances', text: 'Per-plan AI token allowances.', status: 'pending', note: 'per-plan AI token allowances and periods' },
  { id: 'support-tiers', text: 'Priority support and setup-call details.', status: 'pending', note: 'priority support and setup-call details' },
  { id: 'no-it', text: 'No IT team needed.', status: 'pending', note: 'the "no IT team needed" promise' },
  { id: 'integration-depth', text: 'Per-integration capabilities as described.', status: 'pending', note: 'the exact read/write capabilities listed for each integration' },
  { id: 'industry-connectors', text: 'Industry software connects through Custom MCP connectors or synced exports.', status: 'pending', note: 'which industry tools (Clio, Epic, TaxDome…) connect today, and how' },
  { id: 'model-providers', text: 'Six AI model providers, chosen per task by Auto.', status: 'pending', note: 'the current list of model providers behind Auto' },
  { id: 'mcp-custom', text: 'Any MCP-enabled platform can be added within 24–48 hours.', status: 'confirmed', note: 'MCP onboarding turnaround' },
  { id: 'private-mode', text: 'Private mode runs on MetaWurks\' own model and servers; nothing is sent to an outside AI provider.', status: 'pending', note: 'engineering sign-off on the Private mode data path (model hosting, no outside-provider calls, storage and logging, server-side enforcement); no app source was available to verify it (docs/privacy-policy-audit.md, claim 16)' },
  { id: 'legal-privacy', text: 'The privacy policy is final and reviewed by counsel.', status: 'pending', note: 'counsel review of the privacy policy draft (operating entity, retention periods, rights process, effective date)' },
  { id: 'legal-terms', text: 'The terms of service are final and reviewed by counsel.', status: 'pending', note: 'counsel review of the terms of service draft (operating entity, governing law, billing and refund terms, effective date)' },
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
