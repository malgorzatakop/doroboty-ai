# Production readiness audit

## Intent

Assess preparation of the synthetic-data teaching prototype for later static hosting on Vercel. No deployment is authorized in this audit.

## Acceptance criteria

- Evaluate the baseline and preserve evidence in docs/production-readiness.html.
- Distinguish source inspection from executed checks and future deployment verification.
- Report unavailable tooling, unresolved decisions and concrete next steps.

## Findings

The user confirmed synthetic-data teaching use and future Vercel hosting; no deployment address exists. The local verify command exited 127 because npm was unavailable; node was also unavailable. No dependencies or tools were installed. Source inspection found browser-local persistence, validated import/export and no cross-tab synchronization.

## Behavior register

FEATURES.md reviewed; this audit changes no application behavior. No update required.

## Validation

The report is generated and validated using the skill renderer. Build and browser checks remain unverified until Node/npm are available.

## Tooling follow-up

Node v24.22.3 and npm 11.19.1 are now available. The generated report is excluded from Prettier to preserve renderer-owned output. Application behavior remains unchanged.

## Executed checks after installation

Node v24.22.3 / npm 11.19.1 confirmed. Formatting, design-system checks (6 tests), lint, types, 34 unit tests, baseline packet validation and production build passed. Browser tests: 42 passed in 21.1 seconds using PLAYWRIGHT_CHANNEL=chrome. The sandbox initially blocked the local preview port; the approved retry used installed Chrome because the default Playwright browser was unavailable. Build reported a nonfatal chunk-size warning (648.21 kB JS, 213.11 kB gzip). These results do not establish deployment readiness for unresolved operational requirements.

## Approved repair package

The user approved local write-conflict protection, dependency/secret inspection and compatible fixes, release/smoke/rollback instructions, checks and a refreshed report. Audience: about five users; incidents reported directly to the project owner. Hosting budget and acceptable outage remain unconfirmed.

### Acceptance criteria for repairs

- One same-origin tab holds an exclusive Web Lock before writing the scenario.
- Other tabs retain local edits for export without overwriting stored data, including import/reset.
- Releasing the writer does not let a stale tab overwrite a newer save; reload is required after exporting its local work.
- Without Web Locks, editing/export remains usable but persistent writes are disabled.
- Existing data version and synchronous domain action API remain intact; no remote telemetry or data service is introduced.
- Verify two-tab and unsupported-lock behavior plus existing journeys. Document future Vercel settings, smoke/recovery procedures and remaining human decisions.

### UI integration

Reuse the existing Shell Notice/status and Settings panels/buttons. Copy explains save ownership and export/reload recovery. No new component family or visual tokens. Reference: host guide and C19 feedback; preserve the current Base UI controls.

## Repair implementation

Implemented an exclusive browser-managed Web Lock with compare-before-write protection. Secondary/unsupported tabs remain exportable in memory; a stale tab cannot overwrite storage after writer release. Import and reset obey the same guard. Existing Shell Notice and Settings panels provide feedback and direct support guidance. Added two focused browser tests; both passed on installed Chrome.

Added docs/RELEASE.md and static Vercel build configuration, aligned engines to Node 24.x, and included the runbook/config in participant packaging. The owner confirmed five users and direct incident reporting. Budget, outage and loss tolerances remain open. npm audit reported 12 developer-tool findings; production dependency audit reported zero. Compatible typescript-eslint update resolved none; no forced downgrade was applied.

### Separate review

Reviewed all modified persistence paths (ordinary actions, import, reset), lock cleanup under StrictMode, stale writer acquisition, unavailable Web Locks and preservation of the original corrupt save. Checked the participant allowlist includes new linked release documentation/configuration. All roles still share synthetic local state; no remote authentication, data service or telemetry was added. FEATURE SYS-10 now describes the actual writer behavior. Prior company-page design/a11y findings remain outside this repair and are not claimed resolved.

## Final repair verification

Full PLAYWRIGHT_CHANNEL=chrome ./scripts/verify passed: formatting, design-system checks, lint, types, 34 unit tests, baseline packet validation, build and 44 browser tests. The source participant package was generated and its pristine manifest passed. The two new tests cover writer release/stale state, export, import/reset guard and unavailable Web Locks.

The owner confirmed a 0 PLN/month ceiling, no automatic paid upgrade, recovery from the last export and deferring the exercise until the next day during an outage. Hosting eligibility, actual account permissions and deployed recovery are still unverified. Pattern scan of current sources/build found no matching private-key/API-key patterns or .env files; it does not prove exhaustive detection. Dependency findings remain open rather than being force-fixed.
