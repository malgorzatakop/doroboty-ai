# Teaching prototype release and recovery

## Scope and decisions

- Audience: approximately five users, confirmed by the project owner on 2026-11-12.
- Data: synthetic examples only; no real CVs, accounts, candidate information or production services.
- Owner/contact: the project owner, contacted directly using the channel through which the prototype was shared. The owner confirmed this reporting route; read-only Vercel panel inspection on 2026-11-12 confirmed the owner role for workspace MK (mk-c47e).
- Target: a static Vercel deployment, not yet created. The repository root on GitHub is the app directory; do not set the vault-relative path as the Vercel Root Directory.
- Owner-confirmed limits (2026-11-12): maximum 0 PLN/month, no automatic paid-plan upgrade; the exercise may move to the following day during an outage. Verify account/plan eligibility and limits before publication; a zero budget does not establish free hosting eligibility.
- Export before and after each session. The owner accepted recovery from the last export and possible loss of work since that export (2026-11-12). This is a recovery limit, not an automatic backup guarantee.

## Build the recorded sources

Use Node 24 and npm, the committed package-lock.json and a clean isolated checkout of the reviewed source revision. Record its commit and any uncommitted source fingerprint; do not label a dirty tree with only its base commit. Run npm ci, the existing verify gate (PLAYWRIGHT_CHANNEL=chrome ./scripts/verify can use installed Chrome), then retain dist and its file checksums with the release record. Do not install browser/system dependencies automatically.

vercel.json declares the Vite build, npm ci and dist output. package.json selects Node 24.x. There are no app environment variables, API keys, database migrations or functions. Hash routing needs no SPA rewrite. Only dist is public output; inspect it before publication, including the baseline dataset and local PDF examples. Never publish instructor sources, Git history, the whole source repository or exports as static assets.

A local check is not proof that Vercel can install all dependencies with the owner's registry/access settings. Verify the first hosting build and record its configuration and deployment ID. The workspace plan and owner access were inspected before deployment; recheck the actual project/account binding when creating the deployment.

## Smoke check and release stop condition

Use a separate browser context with synthetic data, and use the exact deployment address/version. Record the result, date, source/configuration identity and person performing it.

1. Load the home page and listing; confirm fonts, illustrations and the example CV download load over HTTPS.
2. Select Anna, open an offer, save it, draft and submit an application; reload and verify the submitted snapshot remains readable.
3. Switch to the appropriate employer and record a recruiting decision. Return to the candidate and read the updated history.
4. Export the scenario and import into a separate browser context under the same test deployment. Compare profile, application and stage history. Test an invalid import: it must leave the existing scenario intact.
5. Open the app in two same-origin tabs. The first writer persists changes; the other shows a notice and can export local edits. Close the first: a stale second tab must request export/reload rather than overwrite data. Test settings reset/import as well as ordinary edits.
6. Check a copied hash deep link, a 390px screen and keyboard operation. Use a newly opened tab and verify the expected build rather than relying on a cached session.

Stop sharing the release if assets do not load, the main journey fails, a write overwrites another tab, synthetic-only boundaries fail or scenario recovery fails. Keep the last working version and notify the owner. First release: if there is no prior verified deployment, withhold the participant link and provide the local baseline package while the issue is investigated.

## Rollback and data compatibility

Before the next release, record the last verified Vercel deployment ID/address, source identity and configuration. Confirm the owner has permission to restore that deployment. Read Vercel's current rollback guidance at release time; use its rollback action to restore the recorded verified version rather than guessing which build is safe. An account/plan restriction must be resolved before promising rollback.

The browser data remains version 1. Rolling back static files does not restore browser-local data. First export the scenario, close all tabs, and test that the previous version can import the new export in an isolated browser context. If incompatible, keep the export and withhold the rollback until a data-safe recovery path is reviewed; never reset the participant's browser to make a rollback appear successful. No schema migration is introduced by the current writer protection.

When upgrading from an old app version, tell participants to export and close all old tabs before reopening: old JavaScript does not use the new writer lock. Multiple addresses have separate browser storage; moving the deployment URL requires export/import to move a scenario.

The local preparation rehearsal uses actual immutable prior/current dist artifacts at one isolated origin, a controlled HTTP 503, unchanged browser state and a full backup import into a separate context. It does not establish a successful Vercel rollback. Verify provider restoration separately before admitting users; do not mark preparation waiting merely because the production address is not created.

## Diagnose and recover an incident

1. The participant contacts the project owner directly and includes URL, time, browser and steps. Do not request their answers, CV, scenario JSON or private text. The Settings screen contains the same instructions.
2. Ask them to export local work before reload. If a saved scenario is unreadable, download the original first. Keep browser data intact while investigating.
3. The owner checks whether the same URL fails in a clean browser. Inspect the browser's Network/Console locally for asset failures and the Vercel deployment/build status using the owner's account. Avoid copying free text or tokens into logs or messages. Compare the actual deployment with the recorded release identity.
4. For one affected browser: close other tabs, reload after export, import a known valid copy into a separate context, then verify the main journey. Restore the participant's copy only with their explicit choice; reset is the last resort and asks for confirmation.
5. For a broken release: stop sharing the link, verify the previous release and follow rollback/data compatibility above. Tell participants what is affected, how to preserve their work and when the next update will be given; confirm that timing with the owner.
6. After recovery, repeat the smoke check, record the outcome and notify participants through the agreed direct channel. There are no automated alerts or remote collector. Download local diagnostics before reload, send the diagnostic file explicitly to the owner and retain scenario exports privately. Actual deployed error capture and delivery to the owner still require a separate check.

## Dependency remediation on 2026-11-12

The initial audit found 12 developer-tool warnings from two underlying advisories: vulnerable minimatch via TypeScript ESLint/ts-morph, and deepmerge via shadcn registry tooling. The deepmerge advisory had no patched release. A compatible TypeScript ESLint update alone did not resolve them.

The app used only shadcn's stylesheet. That exact shadcn 4.23.0 CSS and its MIT license now live in src/app/vendor; the unused CLI/registry dependency was removed. Source provenance and checksums are in src/app/vendor/README.md. No generator executable is installed. Existing React/Base UI components remain local source; review future generator use separately.

A scoped npm override selects minimatch 11.0.1 only for @typescript-eslint/typescript-estree. Node 24 meets its engine requirement. Keep the override while upstream requires the vulnerable v10 range; remove it once a supported upstream version includes the patched dependency, after running lint, audit and the full verification gate. Other minimatch versions used by ESLint are left at their supported ranges.

The resulting npm install --ignore-scripts reported zero vulnerabilities across 239 packages. npm audit and a clean isolated installation/build are the release checks; zero known advisories is not a security certification. Do not use npm audit fix --force to downgrade shadcn or suppress advisories.

## Sources checked

- https://vercel.com/docs/builds
- https://vercel.com/docs/functions/runtimes/node-js/node-js-versions
- https://vercel.com/docs/deployments/rollback-production-deployment
- https://vite.dev/guide/static-deploy
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API

Provider settings and permissions must be checked again when the actual deployment is created.

Dependency advisory sources: https://github.com/advisories/GHSA-gcqx-w48m-w2h4 and https://github.com/advisories/GHSA-g3hv-75wg-m249.

## Vercel account inspection before deployment

Read-only browser inspection on 2026-11-12: workspace MK (mk-c47e) has an active Hobby plan; the signed-in owner has the Owner role. Billing shows no payment method, AI auto-reload Off and optional paid add-ons disabled. Usage shows 0 B transfer and 0 CDN requests for the displayed Oct 13–Nov 12 period. Allocation: 100 GB Fast Data Transfer, 10 GB Fast Origin Transfer and 1,000,000 CDN requests. This is an account/configuration observation, not production traffic evidence.

Source pages: https://vercel.com/mk-c47e/~/settings/billing , https://vercel.com/mk-c47e/~/settings/members , https://vercel.com/mk-c47e/~/usage . No credentials, private contact details or payment details are retained in the report. The Vercel connector is disabled by the administrator, so inspection used the browser after the owner signed in manually. No deployment, invite, upgrade or account-setting change was made.

The 0 PLN/month scope is a personal, non-commercial educational prototype. Hobby's published policy restricts use accordingly; re-evaluate the plan before using the app as a business portal. On Hobby, exceeding quotas may pause service, often until 30 days have elapsed; do not promise next-day hosting recovery. Keep the verified local participant package as the exercise fallback within the agreed ability to postpone a session. Do not add a card, trial/paid upgrade, paid domain or paid add-on automatically. Check Usage before each session and when a participant reports failures; if allocation is exhausted, stop sharing the hosted link and use the local fallback or obtain a new explicit decision. Five participants are an expected workload, not a guarantee against public traffic spikes.

Sources: https://vercel.com/docs/plans/hobby and https://vercel.com/docs/spend-management . Spend Management is a Pro feature; a missing budget control on Hobby is expected, not evidence that a zero-dollar Pro budget was configured.

## Local diagnostic procedure

1. Before reload, use Settings → Informacje o błędach → Pobierz diagnostykę, or the same action on the recovery screen.
2. The file has version, buildId and at most 20 fixed code/time events. Codes distinguish render errors, recoverable render errors, runtime/rejection/resource failures, failed storage read/write and rejected state parsing. It contains no error text, stack, URL or scenario data. It is memory-only; reload clears it. The owner accepts files through the agreed direct channel and keeps them local for diagnosis, deleting them when the issue is closed.
3. The owner compares buildId with the recorded dist/release.json and the deployment's /release.json, checks the event code/time and reproduces the steps locally. The build ID hashes runtime inputs; it is not a Git commit or proof that any URL serves those inputs.
4. A render crash preserves the latest complete in-memory scenario for explicit export. Pobierz ostatni zapis separately retains the raw persisted version, including an unreadable save. Keep both scenario files private; send only diagnostics and non-sensitive steps to the owner. Do not reset data to make a failure disappear.
5. Initial missing JS or an unavailable host cannot execute this logger. Check the HTTP response, asset loads and hosting/build status in the smoke plan. Verify logging and delivery on the real address later; this app has no remote automatic alerting.

## Repeatable local recovery rehearsal

Before changing a verified release, preserve its full dist plus a per-file SHA-256 manifest and original source identity in artifacts/recovery-rehearsal/baseline and baseline.json. Never substitute the new build for a missing prior baseline. The artifacts are ignored and deliberately excluded from participant distributions.

After building the new release, PLAYWRIGHT_CHANNEL=chrome npm run test:recovery serves both real artifacts on a disposable localhost origin in isolated browser contexts. It creates synthetic work, exports it, switches to the new build, checks five concurrent independent participants, simulates HTTP 503, restores the old artifact on the same origin and compares the entire browser save. It then imports the export into another clean context and compares every scenario field. Evidence is written to artifacts/recovery-rehearsal/evidence.json with origin, version/artifact hashes and steps; no real user data is involved.

Preparation can pass on this local evidence. Provider rollback, target-domain backup recovery, configured hosting identity and delivered alerts remain deployment checks. After any schema change, replace assumptions with a compatibility/migration trial before considering rollback safe.

## Portable dependency lock

Two public packages installed through the owner's corporate registry had private resolved URLs. Their lockfile URLs were replaced with public npm dist URLs only after matching the exact SHA-512 integrity values for the same versions. No global npm configuration or credential was changed. The isolated publication-copy installation uses the public registry and no personal npm settings; it verifies cloud-build portability for these public dependencies.
