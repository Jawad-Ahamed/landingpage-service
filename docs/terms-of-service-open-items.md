# Terms of Service: open items — `/terms-of-service`

Internal working document. Not legal advice and not published on the site.

**Status of the terms:** no counsel approval and no effective date yet.

**2026-10-23 (business request):** the visible "Draft for legal review · not in effect" banner, the draft status and
effective-date lines, the "(draft)" title and the amber on-page "Review note · to confirm" boxes were removed from
`/terms-of-service`, as was done for the privacy policy on 2026-10-22. The page now shows only the plain-English terms.
The open questions those notes carried are **not resolved**; they are tracked only here. Still in place:

- the page is `noindex` until the `legal-terms` claim in `content/data/claims.ts` is set to `confirmed`;
- `CLAIMS_MODE=launch` builds keep failing until then (`legal-terms`, `token-allowances`).

## Changes made to the page text

- **Disclaimers and limits on liability** (which held only review notes) became **Service availability and AI output**:
  a plain statement that no online service can be guaranteed uninterrupted or error-free, that AI output can be
  incomplete or wrong, and that customers review output before relying on it. It sets **no** warranty disclaimer,
  liability cap or indemnity; those still need counsel.
- **Governing law and disputes** (which held only a review note) was removed from the page. Terms without a governing-law
  clause are weaker; counsel should add one before the terms take effect.

## Open questions for the business and counsel

| Section | Open item | Owner |
|---|---|---|
| About these terms | The legal name of the company that provides the Service and is party to these terms. | Legal counsel |
| About these terms | Whether Enterprise customers sign a separate agreement or order form, and which document wins if they conflict. | Business + legal |
| Who can use MetaWurks | The minimum age to use the Service, and any countries where it is not offered. | Legal counsel |
| Plans, trial and billing | How payment is collected (payment processor), and whether prices include taxes. | Business |
| Plans, trial and billing | When a cancellation or downgrade takes effect, and whether any refunds or credits apply. | Business + legal |
| Plans, trial and billing | How much notice customers get before a price change. | Business + legal |
| Plans, trial and billing | Per-plan token and storage allowances, and what happens when an allowance runs out. | Business |
| Plans, trial and billing | What happens at the end of the free trial if no plan is chosen. | Business |
| Your data | The final wording of the license customers grant MetaWurks, including any use of aggregated or de-identified data. | Legal counsel |
| Your data | How customers can export their data, and how long it is kept after an account is closed. | Engineering + legal |
| Connected tools | How far MetaWurks is responsible for a connected tool's outages, changes or errors. | Legal counsel |
| Suspension and cancellation | Notice before suspension (except in emergencies), and access to data after cancellation or suspension. | Business + legal |
| Liability | Warranty disclaimer wording. | Legal counsel |
| Liability | Limitation of liability, including any cap and excluded types of damages. | Legal counsel |
| Liability | Whether either party gives an indemnity. | Legal counsel |
| Governing law | Governing law, courts or venue, and any dispute-resolution process. | Legal counsel |
| Changes to these terms | How and how far in advance customers are told about material changes. | Business + legal |
