# Architecture

One React/TypeScript application is built by Vite into static files. HashRouter renders routes under /#/; route parameters created in the browser require no hosting rewrites. The running app currently uses local CSS tokens, Timeless font and Base UI primitives. New and changed UI must follow the accepted Poster People [design system](design-system/README.md), adapted into the existing stack; installing its reference did not convert runtime styles. There is no server data/API layer.

## Data flow

JSON marketplace/person fixtures → initialState → PrototypeProvider → feature views. Local operations go through transition with shared Zod schemas and explicit role/ownership/transition checks for coherent simulation. All roles still have access to the same browser data; these checks are not security.

Candidate source notes, generated draft and approved application are distinct fields. Submission snapshots CV, candidate name, job title, scenario score and summary. Employer stage events are appended, with private-in-the-UI notes. Profile/job edits do not rewrite submitted records.

Storage uses one versioned localStorage key. Import validates schema/version, unique IDs, cross-references and stage history before replacing state. Unreadable/incompatible saves are protected against automatic overwrite; settings can download the original raw save, import a valid file or explicitly reset. Failed/quota-limited persistence leaves the in-memory app usable and offers export. Import/export is capped at 2 MB; no binary CV storage.

## Features

src/features/prototype owns model/storage/state and page compositions. src/features/jobs retains reusable presentation/filter/description logic; src/components/ui owns Base UI controls. Keep changes small.

LocalStorage is origin-specific. Reload preserves state; another browser/device/port starts separately. No cross-tab live synchronization is provided. An exclusive Web Lock permits one same-origin tab to persist changes; other tabs remain memory-only and can export their work. The next writer compares its loaded raw save with storage before writing: stale state cannot overwrite newer data and requires export/reload. Missing/failed Web Locks leaves edits exportable in memory without unsafe writes. Closing/reloading the writer releases the browser-managed lock. Old open versions do not participate in this protocol: close all prototype tabs when upgrading. Hash links reference records in the receiving browser, not transferred records.

## Evidence and distribution

The baseline historical CSV and JSON are separate from interactive state. Future evidence must arrive in a separately reviewed package. package:participant copies only explicit allowed files/directories, including the complete docs/design-system guide/kit, and omits docs/source, historical task notes, agent run history and .git. A packet verifier checks the baseline data; packaging also verifies a pristine file/hash manifest. Ordinary checks permit participants to edit code and generate build/test output without invalidating a distribution fingerprint. Instructor repository history is never participant-safe.

## Checks

npm run check and ./scripts/verify run formatting, design-system reference integrity/example checks, lint, types, unit tests, build and Playwright against the static preview. Playwright checks external requests, complete workflows, error/recovery behavior, keyboard controls and mobile layout. No test starts system services. npm run dev only starts Vite.

## Local error diagnostics and recovery

main.tsx installs fixed-code error/rejection/resource listeners and React root error callbacks. A RecoveryBoundary replaces a failed React tree with explicit scenario export, last-save download, diagnostics and reload actions. The store retains its latest complete scenario separately in memory so unpersisted work remains exportable after the provider unmounts. This is not a second persistent store or a log.

diagnostics.ts accepts only an allowlist of codes and retains at most 20 code/time records in memory. JSON exports include a deterministic build ID and no error messages, stacks, URLs, route parameters, free text or scenario data. There is no automatic transmission, third-party SDK, telemetry key or durable logging. Diagnostics disappear on reload; participants must download first and contact the owner directly. The initial missing-JS failure remains a hosting smoke-check concern.

Vite hashes sorted runtime source/fixture/asset files and build configuration without machine paths or secrets. The same build ID is embedded in the app and dist/release.json. The wider readiness source fingerprint remains distinct from this runtime input identity. A clean-copy build must reproduce the same release identity and assets.
