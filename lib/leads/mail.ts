// Outgoing email (the ROI results email). Same Gmail API setup as the feat/lead-emails-gmail branch: on Cloud Run the
// runtime service account signs a domain-wide-delegation grant for LEAD_MAILER_SERVICE_ACCOUNT, so no key file or
// password is stored anywhere. The transport is chosen by env:
//   LEAD_MAIL_TRANSPORT unset or "gmail"  needs LEAD_MAIL_SENDER (the Workspace mailbox it sends as) and
//                                         LEAD_MAILER_SERVICE_ACCOUNT (the delegated service account's email).
//   LEAD_MAIL_TRANSPORT=mock              POSTs each message as JSON to LEAD_MAIL_MOCK_URL, for local tests. Loopback
//                                         addresses only, so a misconfiguration can never ship mail to an outside host.
// Anything else, or a missing setting, means email isn't configured: getMailer() returns null and callers say so.
// Errors carry a step and an HTTP status only: never response bodies, tokens, addresses or message contents.

export type Mail = { to: string; subject: string; text: string; html: string; replyTo?: string };
/** Resolves with the provider's message id once the provider has accepted the message; rejects otherwise. */
export type Mailer = { name: string; send: (mail: Mail) => Promise<string> };

const TIMEOUT_MS = 10_000;
const SCOPE = 'https://www.googleapis.com/auth/gmail.send';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const METADATA_TOKEN_URL = 'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token';
const SIGN_URL = (sa: string) => `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(sa)}:signJwt`;
const SEND_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

export class MailError extends Error {
  step: string;
  status?: number;
  constructor(step: string, status?: number) {
    // "Sending the email failed (HTTP 500)", or a step that already says what went wrong ("…: timed out")
    super(status ? `${step} failed (HTTP ${status})` : step.includes(':') ? step : `${step} failed`);
    this.name = 'MailError';
    this.step = step;
    this.status = status;
  }
}

async function call(step: string, url: string, init: RequestInit): Promise<Record<string, unknown>> {
  let res: Response;
  try {
    res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (e) {
    throw new MailError(`${step}: ${e instanceof Error && e.name === 'TimeoutError' ? 'timed out' : 'network error'}`);
  }
  if (!res.ok) { await res.body?.cancel(); throw new MailError(step, res.status); }
  try { return await res.json() as Record<string, unknown>; } catch { throw new MailError(`${step}: unreadable response`, res.status); }
}

/* ---------- MIME ---------- */
const oneLine = (v: string) => v.replace(/[\r\n]+/g, ' ').trim();
const encodedWord = (v: string) => (/^[\x20-\x7E]*$/.test(v) ? v : `=?UTF-8?B?${Buffer.from(v, 'utf8').toString('base64')}?=`);
const base64Body = (v: string) => Buffer.from(v, 'utf8').toString('base64').replace(/.{76}/g, '$&\r\n');

export function buildMime(from: string, mail: Mail, boundary: string): string {
  return [
    `From: ${oneLine(from)}`,
    `To: ${oneLine(mail.to)}`,
    ...(mail.replyTo ? [`Reply-To: ${oneLine(mail.replyTo)}`] : []),
    `Subject: ${encodedWord(oneLine(mail.subject))}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    base64Body(mail.text),
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    base64Body(mail.html),
    `--${boundary}--`,
    '',
  ].join('\r\n');
}

/* ---------- Gmail API (Cloud Run identity + domain-wide delegation) ---------- */
function gmailMailer(sender: string, delegate: string): Mailer {
  let cached: { token: string; expires: number } | null = null;
  let pending: Promise<string> | null = null;

  async function fetchToken(): Promise<string> {
    const runtime = await call('Reading the runtime token', METADATA_TOKEN_URL, { headers: { 'Metadata-Flavor': 'Google' } });
    const now = Math.floor(Date.now() / 1000);
    const payload = JSON.stringify({ iss: delegate, sub: sender, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 600 });
    const signed = await call('Signing the mail grant', SIGN_URL(delegate), {
      method: 'POST',
      headers: { authorization: `Bearer ${runtime.access_token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ payload }),
    });
    const grant = await call('Exchanging the mail grant', TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: String(signed.signedJwt) }),
    });
    if (typeof grant.access_token !== 'string') throw new MailError('Exchanging the mail grant: no token');
    cached = { token: grant.access_token, expires: Date.now() + Number(grant.expires_in || 0) * 1000 };
    return cached.token;
  }
  const token = () => {
    if (cached && cached.expires > Date.now() + 60_000) return Promise.resolve(cached.token);
    pending ??= fetchToken().finally(() => { pending = null; });
    return pending;
  };

  return {
    name: 'gmail',
    async send(mail) {
      const raw = Buffer.from(buildMime(`MetaWurks <${sender}>`, mail, `mw-${crypto.randomUUID()}`), 'utf8').toString('base64url');
      const sent = await call('Sending the email', SEND_URL, {
        method: 'POST',
        headers: { authorization: `Bearer ${await token()}`, 'content-type': 'application/json' },
        body: JSON.stringify({ raw }),
      });
      if (typeof sent.id !== 'string' || !sent.id) throw new MailError('Sending the email: no message id');
      return sent.id;
    },
  };
}

/* ---------- Local mock (tests) ---------- */
function isLoopback(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    return (protocol === 'http:' || protocol === 'https:') && ['127.0.0.1', 'localhost', '[::1]'].includes(hostname);
  } catch { return false; }
}

function mockMailer(url: string): Mailer {
  return {
    name: 'mock',
    async send(mail) {
      const res = await call('Sending the email (mock)', url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(mail) });
      if (typeof res.id !== 'string' || !res.id) throw new MailError('Sending the email (mock): no message id');
      return res.id;
    },
  };
}

let memo: { key: string; mailer: Mailer | null } | null = null;

/** The configured mailer, or null when email delivery isn't set up. */
export function getMailer(): Mailer | null {
  const env = process.env;
  const key = [env.LEAD_MAIL_TRANSPORT, env.LEAD_MAIL_SENDER, env.LEAD_MAILER_SERVICE_ACCOUNT, env.LEAD_MAIL_MOCK_URL].join('|');
  if (memo?.key === key) return memo.mailer;
  let mailer: Mailer | null = null;
  const transport = env.LEAD_MAIL_TRANSPORT || 'gmail';
  if (transport === 'gmail' && env.LEAD_MAIL_SENDER && env.LEAD_MAILER_SERVICE_ACCOUNT) mailer = gmailMailer(env.LEAD_MAIL_SENDER, env.LEAD_MAILER_SERVICE_ACCOUNT);
  else if (transport === 'mock' && env.LEAD_MAIL_MOCK_URL && isLoopback(env.LEAD_MAIL_MOCK_URL)) mailer = mockMailer(env.LEAD_MAIL_MOCK_URL);
  memo = { key, mailer };
  return mailer;
}
