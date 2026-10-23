# Privacy Policy audit — `/privacy-policy`

Internal working document. Not legal advice and not published on the site. Audited 2026-10-17 against this
repository (the marketing site, `metawurks-landingpage-replica`, branch `main` at `0a29b61` plus uncommitted work).

**Status of the policy:** no counsel approval and no effective date yet.

**2026-10-22 update (business request):** the visible draft banner, the "Status: Draft, not in effect" line, the
amber on-page review notes and the on-page pending-claims footnote were removed from `/privacy-policy`, and a
"Does MetaWurks provide privacy and security for clients' confidential data?" short answer and FAQ were added.
The open questions those notes carried are **not resolved**; they are tracked only in the table below. Still in place:
the page is `noindex` and `CLAIMS_MODE=launch` builds keep failing until the `legal-privacy` claim in
`content/data/claims.ts` is set to `confirmed`. Note that `noindex` also keeps the new FAQ out of search results until
then; deciding to lift it is part of approving the policy.

## Evidence base and its limits

| Source | What it can prove |
|---|---|
| This repo's source (`app/`, `components/`, `lib/`, `styles/`, `next.config.ts`) | Website behaviour only: scripts, storage, cookies, forms, headers. |
| `content/data/claims.ts` (claims registry) | Statements the business has marked `confirmed` in writing. Not independently verifiable here. |
| `.github/workflows/*.yml` | Deployment target (Google Cloud Run). Not whether deploys are enabled, nor runtime settings (`RUNTIME_ENV_VARS` is a GitHub variable not visible here). |
| `lib/leads/mail.ts` | How ROI results emails would be sent (Gmail API). Not whether production is configured. |
| **Not available** | The app's source (apps.metawurks.com), infrastructure/IAM, provider contracts (AI, hosting, Google Workspace, Calendly), retention settings, incident procedures. |

Absence of code in this repo is **not** treated as proof that the app does or doesn't do something.

## Claim verification

Verdicts: **V** verified from implementation or authoritative documentation · **P** partially verified · **U** unverified, owner confirmation required · **X** contradicted.

| # | Claim | Verdict | Evidence | What would resolve it |
|---|---|---|---|---|
| 1 | Website uses no analytics, ad pixels or tracking cookies | **V** | No third-party `<script>`, `<link>`, `<img>` or CSS `url()` to external hosts in source; no analytics/pixel/tag-manager code; no `document.cookie`; responses had no `Set-Cookie` on `/` and `/contact` (prior session) | — Re-check whenever a tag manager, chat widget or embed is added |
| 2 | Website stores only `mw-theme` in local storage | **V** | `app/layout.tsx` (BOOT script reads it), `components/chrome/ThemeToggle.tsx` (writes it); no other `localStorage`/`sessionStorage`/`indexedDB` use | — |
| 3 | Fonts, images and video are self-hosted | **V** | `next/font/google` self-hosts Geist at build; all assets under `/public/assets`; no external asset URLs | — |
| 4 | Calendly is only linked, nothing loads from it on our pages | **V** | `bookHref()` builds plain links; no Calendly embed/script | — |
| 5 | Form submissions don't carry the visitor's IP address | **V** | `LeadSchema` / `Lead` in `lib/leads/index.ts` have no IP field; `app/actions/lead.ts` passes form data only | — |
| 6 | Spam filtering is a honeypot + minimum fill time, no third-party CAPTCHA | **V** | `lib/leads/submit.ts` | — |
| 7 | ROI calculator runs in the browser; inputs are sent only when the visitor asks for the email | **V** | `components/forms/RoiCalculator.tsx` (client-side `useMemo`), submission only via `LeadForm` | — |
| 8 | ROI results are emailed by "our email provider" | **P** | Code sends via Gmail API with domain-wide delegation (`lib/leads/mail.ts`) | Ops: confirm `LEAD_MAIL_SENDER` / `LEAD_MAILER_SERVICE_ACCOUNT` in production; legal: list Google Workspace as a subprocessor if so |
| 9 | Form submissions go to "a service that receives them on our behalf" | **U** | `LEAD_SINK` = webhook/console; production value unknown. Without it, production forms report "not sent" | Ops: confirm `LEAD_SINK` and the webhook destination (e.g. CRM/Zapier) |
| 10 | Website served over HTTPS with security headers | **V** | `next.config.ts` sets HSTS, nosniff, Referrer-Policy, X-Frame-Options; live `https://metawurks.com` asset fetched over HTTPS | — |
| 11 | Hosted on Google Cloud | **P** | Deploy workflows target Cloud Run; claim `gcp` is **pending** (region, encryption at rest) | Engineering: confirm hosting region(s) and encryption at rest; keep out of policy text until then |
| 12 | OAuth connections; MetaWurks never stores users' passwords | **P** | Claims registry `oauth` = confirmed; repeated on /security and home. App code not available | Engineering sign-off against app code (owner already confirmed in registry) |
| 13 | Access tokens stored encrypted | **U** | Stated on `/security` ("access tokens are stored encrypted") and home page, **but not in the claims registry**; no app code here | Engineering: confirm token storage and key management; then add a registry claim or remove the statement from /security |
| 14 | Each person's connected accounts are their own (isolation) | **P** | Stated on /security, home, solutions copy; not a registry claim; no app code | Engineering: confirm per-user token scoping and who can see what |
| 15 | Disconnecting a tool revokes its access token | **P** | Registry `revoke` = confirmed; no app code | Engineering sign-off |
| 16 | Private mode sends nothing to an outside AI provider | **U** | Re-checked 2026-10-23 (see "Private mode verification" below): no app or backend source is available; the registry entry was the only evidence and is now `pending`; `mw-main-website` (`/docs`, privacy policy) never mentions Private mode | Engineering: document and sign off the Private mode data path (model hosting, network egress, storage/logging, server-side enforcement of the mode) |
| 17 | Outside Private mode, third-party AI model providers process requests | **P** | Implied by registry `model-providers` (pending list) and Auto model routing on the home page | Business: final provider list; legal: provider data-use/training terms (`model-training` pending) |
| 18 | Email drafts require approval before sending | **P** | Registry `drafts-wait` = confirmed; no app code | Engineering sign-off |
| 19 | Uploaded documents and customer information are protected appropriately | **U** | Only general statements on /security; encryption claim pending (`gcp`) | Security review of the app; then specific, provable wording |
| 20 | MetaWurks does not sell personal information | **P** | Registry `never-sold` = confirmed (business commitment, not technically provable) | Legal: align wording with CCPA "sell/share" definitions if US state law applies |
| 21 | Locked projects keep sensitive work apart | **U** | Stated on /security and home; not in the registry | Product/engineering: confirm what "locked" restricts |
| 22 | Deleting an account deletes its data | **U** | Registry `delete` = **pending** (timelines, backups) | Engineering + legal: deletion timelines and backup retention |
| 23 | Patient identifiers masked at intake | **U** | Registry `phi-masking` = **pending** | Moot until the PHI/BAA position is settled; keep out of policy text |
| 24 | HIPAA compliant / signs BAAs | **Blocked** (not claimed) | Registry `hipaa`, `baa` = blocked; policy and /security say so explicitly | Legal + security: only revisit after an audit and a signed BAA position |

No claim was found to be **contradicted** by the available evidence.

### Changes made to the policy text because of this table
- Removed "access tokens are stored encrypted" and "sensitive work can sit in locked projects" from the Security section (rows 13, 21): they are not in the claims registry and can't be checked here. They are now review notes.
- Removed the phrase "the app" from the HTTPS sentence (row 10 proves the website only).
- Added verified website facts (rows 3–7) and the ROI-email processing that now exists in code (rows 7–8).
- Healthcare removed from the opening positioning sentence; the PHI caution stays in section 4.

### 2026-10-22, second update: negative disclaimers removed (business request)
Customer-facing "we don't claim HIPAA compliance", "BAA position isn't settled", "no SOC 2 report yet", "no online
service can guarantee absolute security" and the /security "What we don't claim yet" section were removed or
rewritten across the replica (privacy, security, terms, home, prior-auth agent, llms.txt, two blog posts).
Healthcare copy now says practices "talk to us first" and that we "confirm in writing what's appropriate" before PHI
comes in; the Terms keep that as a use condition. Nothing claims HIPAA compliance, a BAA, SOC 2 or any audit;
`hipaa`, `baa` and `soc2` stay **blocked** in the claims registry and `npm run check:claims` still guards the phrasing.
**For counsel:** (1) confirm that dropping the explicit "not HIPAA compliant / no BAA" statements is acceptable for
the healthcare audience; (2) confirm "confirm in writing what's appropriate" does not read as an offer to sign a BAA.

### 2026-10-23: Private mode verification (claim 16)

**Question:** does the real app route Private mode requests to a MetaWurks-hosted model only, and does the backend
enforce that? **Evidence available:** none from implementation. This repo is the marketing site: its only server
routes are `/api/lead`, `/health` and `/llms.txt`, and it references no AI provider, model endpoint or API key. The
other MetaWurks folders on this machine (`mw-main-website`, `mw-landingpage`) are also marketing sites.
`mw-main-website`'s `/docs` lists six outside providers (OpenAI, Anthropic, Google, xAI, DeepSeek, Perplexity) and
its privacy policy says "file content used for vectorization is stored … in our database/vector store"; neither
mentions Private mode, an own model or incognito. The `/ask` composer in this repo is a browser-only preview; its
mode switch is UI state and proves nothing about the app.

**Not verifiable here:** which model serves Private mode; whether Private mode calls any outside provider; whether
prompts, document contents or responses are stored, logged or retained (in either mode); whether storage, retention
or access differ by mode; what happens to already-uploaded content after a mode switch; whether the backend enforces
the mode or can reject a misrouted request.

**Changes made:** registry `private-mode` set to `pending` (so `CLAIMS_MODE=launch` builds fail until engineering
signs off). Statements that Private mode "runs on" MetaWurks' model or that nothing "is sent" to an outside provider
were reworded to "designed to", with "we're confirming in writing how that's enforced" where the context is security
or privacy: `/security` (tile, Private mode explainer and table), `/privacy-policy` (safeguards summary, FAQ,
section 4, security section), `/ask` dialog, `llms.txt`, home (Private mode section, model router, security tile,
stat) and the pricing comparison row. The UI warning and its three actions are unchanged. **Open:** the existence of
a MetaWurks Private LLM itself is stated on the home page ("Plus Our Own Private LLM") and is unverified too; and
the document check is implemented only in this repo's preview, not confirmed in the real app.

## Unresolved decisions (no longer shown on the page since 2026-10-22; still open)

The FAQ's opening "Yes." rests on rows 12, 14, 15, 16, 18 and 20 above (registry-confirmed or partially verified);
it makes no encryption, certification, audit, access-control or retention claim. Before approval, confirm that
counsel is comfortable with "Yes." as the first word of that answer.

Risk: **H** high (legal exposure or a false statement if published) · **M** medium · **L** low. Owners are roles; no named people are recorded in the repo.

| Section | Open item | Risk | Decision needed | Owner |
|---|---|---|---|---|
| 1 Who we are | Legal entity (repo is under Quanterian-LLC org) and notice address (16192 Coastal Hwy, Lewes DE looks like a registered-agent address) | H | Name the controller and the address for legal notices | Business + legal counsel |
| 1 / 4 | Controller vs processor (service provider) role for client data in the app; DPA offered? | H | Data-processing roles and whether a DPA is available | Legal counsel |
| 2 | Full list of personal data the app processes; app analytics/cookies | M | Inventory from the app | Engineering |
| 2 / 5 / 6 | Hosting provider and server-log retention | M | Name provider, region, log retention | Engineering / ops |
| 3 | Legal bases (GDPR/UK GDPR) per purpose; newsletter consent step | H | Decide applicable laws and bases | Legal counsel |
| 4 | AI model providers' retention/training terms; provider list behind Auto | H | Written terms per provider | Legal + business |
| 4 | Staff access to customer data (support access) | M | Access policy and logging | Security / engineering |
| 4 | PHI masking scope | L (until PHI allowed) | Only after HIPAA/BAA decision | Security + legal |
| 5 | Subprocessor list and change notifications (hosting, form destination, Google Workspace if used, AI providers) | H | Publish list and notification process | Legal + ops |
| 5 | Merger/acquisition transfers | L | Standard clause wording | Legal counsel |
| 6 | Retention periods: form submissions, sent emails (Gmail API sends are kept in the sender's Sent folder), call notes, logs; account deletion timeline; backup retention | H | Set retention schedule | Business + engineering + legal |
| 7 | Token/app-data encryption, hosting region; locked projects; incident notification process and timelines | H | Security controls statement; incident response commitments | Security / engineering + legal |
| 8 | Applicable laws (GDPR, UK GDPR, CCPA/other US states) and required rights statements; verification, response times, appeals; handling requests from firms' clients; one-click unsubscribe | H | Rights-request procedure | Legal counsel + ops |
| 9 Children | Minimum age (16 or 18) | M | Set minimum age, align with Terms | Legal counsel |
| 10 International | Storage/processing locations; transfer safeguards (SCCs/UK IDTA) | H | Transfer mechanism | Legal counsel + engineering |
| 11 Changes | How and when customers are told about material changes | M | Notice method and period | Legal + business |
| Whole page | Effective date; counsel approval; whether to publish without a draft notice before approval (done in the replica on 2026-10-22 at the business's request) | H | Approve, then set `legal-privacy` to `confirmed` (lifts `noindex` and the launch gate) | Legal counsel + business |

## Other findings

- **Indexing (fixed for this page):** production builds set `NEXT_PUBLIC_INDEXABLE=true`, so the draft would have been `index,follow`. The page now sets `robots: noindex` while `legal-privacy` is pending. **`/terms-of-service` has the same problem and was not changed** (out of scope). The page is still listed in `sitemap.xml`; Search Console may warn about a noindexed URL in the sitemap.
- **H1 / breadcrumb text ran together sitewide (fixed):** `PageHero` rendered "PrivacyPolicy." and "Privacy policyLegal · Draft" as extracted text. Invisible spaces were added between the breadcrumb, eyebrow and the two headline lines (all 31 `PageHero` pages benefit).
- **Table of contents missing on tablets/phones (fixed):** the sticky rail is hidden below 1000px; an inline Contents list now shows there (shared legal template, so Terms gets it too).
- **Logo alt text:** the header and footer logo links have `aria-label="MetaWurks home"` and their four lockup images use `alt=""` (two are hidden per theme). That is correct; if a tool reports "image image", it is listing the decorative images, not a missing name. No change made.
- **Footer:** "X · Instagram · LinkedIn" is plain text with no links, and no verified profile URLs exist in the repo (`organization()` schema has no `sameAs`). Left unchanged; needs real URLs or removal (business decision). The "Concept mock for internal review" footer note is also still present sitewide.
- **Title tag:** now "Privacy Policy · MetaWurks" (site convention is " · MetaWurks", not " | MetaWurks"). Draft status is stated on the page and in the meta description.
