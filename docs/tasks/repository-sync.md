# Repository synchronization

Created: 2026-11-12

## Goal and acceptance

Publish the latest local prototype to `MK-priv33/doroboty-ai` on its default `main` branch, preserving remote history and all existing candidate-card work. Verify the complete project gate, review the diff separately before integration, and confirm the remote commit matches the local result. Do not include dependencies, generated artifacts, browser-local scenario data or unrelated vault content.

## Comparison and review

Fetched the new origin and confirmed its default branch is `main` at `81682a81c186e9065ec8fab4d7bd368556fdfe6a`, identical to the local task branch's base. The unpublished changes implement the candidate experience card and its documented follow-ups. Reviewed the model, route role guard, shared reader, application attachment, historical-state compatibility, immutable submitted snapshots, scoped styling and focused unit/browser coverage. No conflicting remote changes were found. FEATURES.md already describes the card behavior; synchronization itself introduces no additional product behavior. README now links the current repository and explains the card and browser-local data boundary.

## Validation and publication

`PLAYWRIGHT_CHANNEL=chrome ./scripts/verify` passed: formatting, design-system integrity and six kit tests, lint, TypeScript, 34 unit tests, baseline packet validation, static build and all 42 browser journeys. Browser coverage includes responsive widths from 320 to 1280 px, example loading, draft persistence, attachment consent and immutable employer copies. The first restricted run could not bind the local preview port; the permitted rerun completed successfully using existing Chrome without installing browser binaries. The build reports its existing large-bundle advisory.

The synchronization record and README additions receive a final formatting/diff check before commit. Publication targets `main` through a fast-forward integration; the resulting commit is recorded in the owning project's log after remote verification. No deployment or human research outcome is implied.
