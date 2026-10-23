# MetaWurks V2 — Landing page mock

## Run and deploy (Next.js)

- **Local:** `npm install`, then `npm run dev` (http://localhost:3000). `npm run check` runs the type check and the claims check.
- **Container:** `Dockerfile` builds a Next.js standalone server on port 8080 with a `/health` probe. CI (`.github/workflows/validate.yml`) type-checks, builds, smoke-tests and Trivy-scans it; `dev.yml` / `prod.yml` push to Artifact Registry and deploy to Cloud Run.
- **Build-time settings:** `NEXT_PUBLIC_SITE_URL` (canonical origin) and `NEXT_PUBLIC_INDEXABLE` are baked in when the image is built (`--build-arg`). One image is promoted dev → prod, so they apply to both.
- **Runtime settings:** `LEAD_SINK=webhook` + `LEAD_WEBHOOK_URL` send form leads to a webhook; `LEAD_SINK=console` only logs them to the server log. Unset, development logs to the console, but production has no sink: forms tell visitors their message was not sent (and the server logs `[lead] no delivery configured`) instead of showing a false success.
- **ROI results email:** the calculator's "Email me these results" sends the visitor their results through the Gmail API (`lib/leads/mail.ts`). Set `LEAD_MAIL_SENDER` (the Workspace mailbox to send as) and `LEAD_MAILER_SERVICE_ACCOUNT` (a service account with domain-wide delegation for `gmail.send`, which the Cloud Run runtime service account may sign JWTs for). Without them the form says the email could not be sent and the server logs `[roi] results email not sent`. For local tests only, `LEAD_MAIL_TRANSPORT=mock` + `LEAD_MAIL_MOCK_URL` (loopback addresses only) posts each message to a mock receiver.
- `legacy/` holds the old static page for reference; it is not served.


A static, dependency-free concept mock of the new MetaWurks marketing site, built for internal review. It ships in light and dark themes.

```
index.html                    the page
assets/styles.css             theme tokens (light + dark), layout, animation
assets/app.js                 interactions + theme switch (vanilla JS, no libraries)
assets/brand/                 the client's MetaWurks logo files (mark, wordmark, full lockup, 64px icon)
                              + *-dark.png recolours of the same artwork for the dark theme
assets/logos/                 integration logos (Gmail, Calendar, Drive, Outlook, Teams, OneDrive, Slack, QuickBooks, Xero, Stripe, Double, Fireflies, LinkedIn, Facebook, Figma, MCP)
assets/metawurks-usecases.mp4 use-case video, re-encoded for web (3.6 MB, 1600px, muted)
assets/metawurks-poster.jpg   video poster frame
tools/bundle.py               builds the single-file shareable preview
tools/serve.mjs               local preview server with HTTP Range support (needed to seek the video)
video/                        title cards (HTML) + scripts that build the walkthrough video
```

**Run it:** `node tools/serve.mjs` and visit http://localhost:5180. (Python's `http.server` works too, but it can't seek the video, so the chapter buttons won't jump.)

**Share it as one file:** `python3 tools/bundle.py` writes `~/Downloads/MetaWurks landing page (current build).html` with the CSS, JS, logos, poster and video inlined. Pass a path to write somewhere else. It never overwrites the client's reference file.

## Design system ("Ledger & Signal" redesign, 2026-10-04)

Matched to the client's reference file `MetaWurks landing page_ redesign preview.html`.

| Role | Light | Dark | Notes |
|---|---|---|---|
| Type | **Geist** for headings, body and labels | same | Headlines bold 700, tracking −0.045em (h1) / −0.035em (h2); body 17px; buttons 16.5px |
| Labels | Geist caps, 13px, 600, +0.07em | same | Eyebrows, tags, demo and source labels, footer headings |
| Ink | Vault Ink `#0E1B33` | `#EDF1F8` | Softer than pure black |
| Ground | White, alternate sections `#F2F5FE` | Dashboard slate `#0B101C` / `#0F1522` | Sections fade white → soft cobalt tint |
| Cobalt (one blue) | `#2440BB`, hover `#1B3299` | `#9DAEF7` text, `#3B57D6` fills | Every button, links, highlighted words. White on `#2440BB` is 8.3:1 |
| Signal Amber | `#E9A23B` | same | "Needs review" only |
| Verified | Green `#1E7A57` | `#4CC192` | Completed / verified states |

**Gradients (light theme)**

- **Hero:** four soft brand-hue glows (cobalt, teal `#19B5B0`, violet `#8B6CFF`, peach `#F4A47E`) drift slowly on white. They stay still when the visitor has reduced motion turned on.
- **Product shots:** the hero dashboard and the walkthrough video sit on a macOS-style wallpaper (indigo, violet and teal, with a peach corner).
- **Sections:** sections fade from white to `#F2F5FE`, each with one soft glow.
- **Ink panels:** the "Create your own" card, the final CTA and the activity log are deep navy with a cobalt aurora. The final CTA's main button turns white with ink text.
- **Stat numbers:** a gradient in the logo's blue range.

## Light and dark themes

- **Toggle:** the sun/moon button in the nav. The first visit follows the OS setting; a manual choice is saved (`localStorage: mw-theme`) and wins on later visits. With no saved choice the page follows OS changes live.
- **No flash:** a tiny inline script in `<head>` sets `data-theme` before first paint. With JavaScript off, the same dark palette applies through `@media (prefers-color-scheme: dark)` and the toggle hides itself.
- **Switch animation:** a circular reveal expands from the toggle (View Transitions API). Browsers without it get a soft cross-fade, and reduced motion switches instantly.
- **How it's built:** every component reads semantic tokens (`--surface`, `--solid`, `--accent-fill`, `--cta-bg`, `--review`, pattern and shadow tokens…). Dark mode is one token set, written once for `[data-theme="dark"]` and once for the no-JS `prefers-color-scheme` fallback.
- **Matches the product:** the dark ground and cards are sampled from the live V2 dashboard (slate `#0B101C`, cards `#171F2E`), and the recreated app screens keep its exact colours.
- **Logo:** the client's artwork is untouched in light mode. Dark mode uses a recolour of the same artwork matching the dashboard's dark logo: white "Meta", blue → cyan "Wurks" and ring (`assets/brand/*-dark.png`). The laptop lid and boot screen keep the original because they sit on light surfaces.

### Colour psychology by audience

| Choice | Why it fits these buyers |
|---|---|
| White ground with soft cobalt tints (dark: slate-navy, never pure black) | Navy reads as trust, stability and confidentiality to accounting, legal and finance buyers. Pure black feels harsh and cold to healthcare audiences. It's also the product's own dark canvas, so the site and app feel like one system. |
| One cobalt for every action | Blue signals trust, competence and security, and matches the logo. |
| Green = reconciled / verified | Accountants' "tied-out" colour. It's used only for completed or verified states, and is the accounting tag. |
| Amber = needs your judgment | The audit-review flag colour, used only for "needs review" now that every button is cobalt. |
| Oxblood for law firms | Tradition and authority. Used as small chips, the tab dot and the run-card accent. |
| Teal for healthcare | Calm, clinical care. Same small-scale use. |
| Cobalt for finance teams | Institutional security. |
| Red only for alerts | Only on the unread badges in the "too many systems" illustration, where it marks the pain state. |

The vertical hues show up as the dots in the hero "For" badge, the tinted pain-card icons, the industry tab dots, and the accent bar plus ambient glow on each industry's agent-run card.

## Page flow and motion

| # | Section | Headline | Motion |
|---|---|---|---|
| 1 | Hero (static) | Rotating: "Stop Switching Tabs. Let Private AI Work." → "Private AI workspace for your firm's busywork." → "Private AI for accounting, legal & healthcare." | Soft blur-and-fade crossfade every ~5s (holds on hover, off-screen and in hidden tabs; first headline only with reduced motion); the real V2 dashboard (recreated, sample data) sits in a browser frame on first view, with typed prompts and a rolling model picker |
| 2 | Integrations | Works with the tools your firm already runs on | Infinite marquee with a pause control |
| 3 | Problem | Too many systems. Too much admin. Too few hands. | Six jittering app windows collapse into one workspace (toggle) |
| 4 | How it works | From eight tabs to finished prep in three steps. | Steps reveal with a cobalt progress rule |
| 5 | Connect | The tools you already use. No passwords shared. | Hub diagram: spokes draw in, pulses travel to the MetaWurks core |
| 6 | Ask your documents | Ask your own documents. Get real numbers, with sources. | Live chat demo: files attach, question types, answer streams, chart/timeline/criteria animate, citations pop in (3 scenarios) |
| 7 | Industries | Built for firms where every number gets checked. | Auto-advancing tabs (pausable); each agent run ticks off its steps, flags one item, then hands back |
| 8 | Agents & skills | The chores that eat your week, handed off. | Bento cards with cursor spotlight |
| 9 | Watch it work | Every client, matter and patient. One workspace. | The walkthrough plays quietly, greyed and at reduced opacity, behind a centred **Watch** button; clicking it restarts the video at full clarity, then the button returns as Pause on hover / Play when paused (a click on the picture also toggles). Chapter rail below jumps to each workflow |
| 10 | Security | Your clients' data stays your clients' data. | Sample agent-activity feed streams in |
| 11 | Outcome | Spend your time on judgment, not grunt work. | Before / with comparison, outcome ticks |
| 12 | Pricing | Simple pricing. Your first month is on us. | — |
| 13 | FAQ | The questions you should ask any AI vendor. | Animated accordion |
| 14 | Final CTA | Book a 1:1 call for your firm's exact setup. | Dotted globe on Ink, amber button |


Everything respects `prefers-reduced-motion` (no word rise, video paused with a play control).

## Walkthrough video

`assets/metawurks-usecases.mp4` is the original 70s use-case video with three dark title cards added, in the style of Juno.tax's hero video: a deep navy aurora, a glowing horizon arc, and blur-in Geist type. The product footage itself is unchanged.

| When | Card | Content |
|---|---|---|
| 0–4.4s | Intro | "Meet" → MetaWurks logo → "Private AI for accounting, legal & healthcare firms." The horizon glow then floods to white into the footage |
| 32.0s | Mid (3s) | "Now watch the agents work." with Tax prep · Case files · Prior auth chips. Replaces the blur between "Ask" and the agent runs |
| 75.6s | End (5s) | Logo → "Stop Switching Tabs. / Let Private AI Work." → "Book your 1:1 call" · metawurks.com. Dips to black so the loop restarts cleanly on the intro |

The total is 80.6s. Joins are 0.25–0.6s crossfades. The web copy is 1600×900 with AAC 128k audio (5.4 MB); the 1080p master is `video/build/metawurks-usecases-1080p.mp4`.

**Soundtrack.** The video uses "Corporate Motivational" (the version without the piano melody) by BlueTreeAudio, in `video/audio/music/` with its license note. **Its free license covers non-commercial YouTube/Facebook/Instagram use only, so a commercial license must be bought from bluetreeaudio.com before this goes on the live website.** `mux_audio.sh` edits it to the picture. The song is 125 BPM with a 4-bar loop. It starts 0.64 s in, so a phrase lands on the mid card, then jumps exactly 36 bars on that downbeat, so the outro arrives with the "1:1 call" scene and winds down under the end card. The sound design and UI foley from `video/audio/score.mjs` sit 5.5 LU under it, retuned to the song's key (`TRANSPOSE=2`, F→G). `MUSIC=generated bash video/mux_audio.sh` brings back the original generated score (v3, warm, modelled on the Combinely film).

| Section | What plays |
|---|---|
| Intro | A pad swells; the logo lands on a sub boom with a shimmer; taps on the tagline; a riser into a hit on the first frame |
| Footage | The groove, plus **UI foley synced to what's on screen** (below) |
| Mid card | A riser and hit; taps on the words, pops on the chips; a riser back into the beat |
| End card | A gentle build into the final hit; taps on the title, a pop on the button, a shimmer, then a fade as it dips to black |

**UI foley** (the `FOOTAGE_EVENTS` list in `score.mjs`, in source seconds; about 120 events read off 4 fps frame grids, with ticks verified at 30 fps):

- Soft "tock" mouse **clicks**: "Agents & Skills", both **Run** buttons, and Send.
- **Typing**: the question, "Harbor & Pine LLC / 2025", and the matter brief.
- **Pops**: cards, file chips, integration nodes, timeline dots and the CTA button.
- **Taps** as each phrase of text appears.
- Soft, in-key **ticks** (rounded plucks, not beeps) for every checkbox and "Connected" badge.
- A rising **success** chime when a run finishes.
- A soft two-note **flag** for "Needs review".
- **Tab clicks** as app windows flick past in the opening.

The mix is mastered to -16 LUFS / -1.5 dBTP. To use a licensed track instead, run `MUSIC=track.mp3 bash video/mux_audio.sh`: it keeps the hits and risers on top and only re-muxes, without re-rendering the picture. On the page the preview plays muted; **Watch** turns the sound on, and the speaker button in the chapter rail mutes or unmutes.

**Edit and rebuild:**

1. Edit `video/cards/*.html` (timing lives in the CSS animation delays).
2. `cd video && npm install` once.
3. `node render_cards.mjs --stills 1,2.5` for quick review stills.
4. `npm run build` renders all frames and runs `build_video.sh`. That script cuts the footage, crossfades, and writes the web video and poster.

If a card length or cut changes, update the chapter `data-t` values in `index.html`. The mapping is printed by the build and listed at the bottom of `build_video.sh`.

## What the research found

- **metawurks.com today** sells document Q&A ("AI That Answers Questions From Your Own Business Documents"). It has no Security, Integrations or Industries pages, no healthcare, no V2 agents or integrations, and no compliance certifications. The mock repositions to the V2 agent workspace.
- **dev-apps.metawurks.com** exposes only a sign-in page ("Orchestrate your work.", dotted globe). The mock recreates the app home from your screenshots.
- **Juno (juno.tax)** pattern borrowed: audience-first hero → integration strip → named problem → stepwise product proof → testimonials → repeated CTA. MetaWurks goes further with a live product stage, multi-vertical tabs and security on the homepage.
- **Peers** (Basis, Hebbia, Harvey, Rogo, Filed, Black Ore, Digits, Writer, Glean, TaxDome): name the audience in the hero, show the agent working rather than describe it, keep humans in the loop, put trust controls in plain English, and never show unearned badges.

## Claims to confirm before launch (one † note under Pricing, one in Security)

- First-month-free terms and how they relate to the current Free plan; per-plan token periods and Enterprise support details.
- PHI masking at intake, the healthcare headline ("without exposing patient data"), and the HIPAA/BAA position. The page claims no HIPAA compliance.
- Approve-before-send scope beyond the "Draft and send an email" skill (Tax Prep request, Collections reminders, payer submissions).
- Model-provider training terms behind Auto (FAQ avoids "never used to train").
- Who can open a locked project; per-user connections in multi-user workspaces.
- Whether "Matter Summary Agent" and "Intake & Prior Auth Agent" are built-in, templates or custom.
- Data deletion on account deletion for V2.
- Third-party stats (AICPA 2024, Clio Legal Trends, AMA 2024): verify each against the primary source.

All client, matter, patient and run figures in the demos are fictional sample data, labelled on the page. Gmail, Google Drive, Calendar, Slack, Figma, LinkedIn, Facebook and Stripe use their published marks. The Microsoft, QuickBooks, Xero, Fireflies and Double icons are faithful redraws; swap in each vendor's official brand-kit files before launch.

## Pre-launch hygiene found during the audit

- `www.metawurks.com` does not resolve.
- Terms of Service still contain the `[Your Jurisdiction]` placeholder.
- Current CTAs point to `apps.metawurks.com/early-access`, which renders an empty shell.
