# Candidate experience card

Slug: `candidate-experience-card`
Created: 2026-11-07

## Goal

Implement the user's Supersprint v5 card: three required answers, project stage inside question 1, two optional answers. Make the saved card reusable across applications and readable by the employer.

## Context

Source: the owning vault's `experiments/e01-card-template.md`, v5, 2026-11-07. Implementation is a prototype, not evidence of improved hiring or completion. Preserve existing applications, CVs, answers, legacy fields and scenario scores.

## Plan

- [x] Review project, Supersprint and relevant design-system contracts.
- [x] Add backward-compatible card draft, complete-card validation and immutable submission snapshot.
- [x] Compose profile editor/preview, explicit application attachment and shared submitted reader.
- [x] Verify persistence, required/optional fields, consent, role boundaries and snapshot continuity.
- [x] Run project gate and separately review desktop/mobile UI.

## Acceptance Criteria

- [x] Questions match v5; no extra required title, dates or tags. The later user-requested length limit is recorded below.
- [x] Three answers plus stage complete the card; optional sections may stay empty.
- [x] Partial drafts survive reload; current card is reused, submitted copies never change.
- [x] Existing v1 saves/import/export and applications without a card remain usable.
- [x] Candidate explicitly controls inclusion; employer sees only the submitted card.
- [x] Existing Base UI controls, RecordSheet, Geist Serif 400 and paper/white/ink/pink remain; immutable kit unchanged.
- [x] `./scripts/verify` passes, or actual environment blockers are recorded.

## Files / Areas

Profile/card route, ApplyPage, ApplicationRecord, model/storage, feature register and focused tests. C01 actions, C02 labeled inputs/help, C03 stage selection, C04 inclusion, C19 status and C22 reading sections. Reuse shared primitives/outlined surfaces, no global token changes.

## Risks

Optional attachment preserves the original application flow. No upload service: example work is text with an optional HTTP(S) link. Draft cards can be incomplete; submitted cards must pass the shared complete schema. Existing scores are unchanged and do not assess the card.

## Handoff Notes

New card composition is a documented host extension, not a new reference-kit variant. Branch: `feat/candidate-experience-card`; no commit or remote publication.

Validation: `PLAYWRIGHT_CHANNEL=chrome ./scripts/verify` passed: format, 67-file kit integrity and 6 kit tests, lint, types, 33 unit tests, baseline packet, static build and all 40 browser journeys. A subsequent focused run passed all 6 card journeys after adding opt-out persistence, candidate-view assertions and screenshots. Existing Google Chrome was used; no browser binaries or OS dependencies were installed. The PDF network assertion now distinguishes actual external HTTP(S) requests from Chrome's built-in PDF viewer resources.

Separate review: inspected domain/role/snapshot diff and rendered desktop/mobile captures. Compared the local source catalog on port 8952 and shared source typography, contours, action roles and reading anatomy. Editor checked at 1280/850/600/390/320 px with long Polish content and optional fields; no clipped controls/headings. Axe found no serious/critical violations on the expanded editor. Complete-card-only submission, empty optional sections, safe links, rejected partial attachment, old-state compatibility and snapshot immutability have focused coverage.

Evidence (ignored artifacts): `artifacts/candidate-experience-card/editor-{width}.png`, `employer-card.png`; local gate log `/tmp/doroboty-card-verify.log`. The test screenshot uses synthetic examples; the user's visible profile editor remains empty for their own review.

Remaining boundaries: examples are text/links, not file uploads. Existing scenario scores are not recalculated from the card. No human E01 session, hiring-effect claim, complete accessibility audit, merge or deployment. Existing unrelated company-page findings remain open.

## Follow-up: card form clarity (2026-11-07)

User requested more space around the project-stage arrow, a more visible optional-section header and both optional fields expanded by default. Acceptance: native select behavior and values preserved; 16px arrow inset with reserved text space; prominent pink secondary header; fields 4/5 visible on initial load/reload and still optional. Existing disclosure remains keyboard-operable. Scoped to card CSS/initial state; no schema or data change. `PLAYWRIGHT_CHANNEL=chrome ./scripts/verify` passed (33 unit tests, 40 browser journeys). Updated existing assertions cover default visibility at 1280/850/600/390/320px and successful completion with optional answers empty. Separate UI review confirmed the inset arrow and visible expanded section; focused capture is in `artifacts/candidate-card-clarity/optional-390.png`.

## Follow-up: encouraging lead (2026-11-07)

User requested light original copy explaining the card's usefulness to a recruiter and possible invitation to a conversation. Replaced only the lead, preserving the one-project prompt and concise/nonconfidential-answer guidance. The invitation is framed as a possibility, not a measured benefit or guarantee. FEATURES.md reviewed: no behavior-register update needed for this prose-only change. No new tests required; existing gate checks the running UI and responsive layouts.

## Follow-up: answer lengths and optional-section copy (2026-11-07)

User requested visible maximum lengths and asked whether they are standard, then requested removing the optional header's pink fill and explaining its possible recruiting benefit. Chosen prototype limit: 1000 characters per each of the five text answers, including internal spaces, excluding surrounding whitespace. This is a provisional product choice, not a universal standard or a tested completion threshold. Reference: https://design-system.service.gov.uk/components/character-count/ recommends justified limits, visible feedback and preserving pasted text for editing.

Acceptance: visible limit plus live visual count, field-associated descriptions and over-limit guidance; no silent truncation; partial drafts can exceed the limit while complete-card save/submission enforce it. Historical submitted snapshots/imports remain readable without retroactive truncation. Optional fields still accept empty values. The header retains its size, outline and default expansion but uses the normal white secondary surface. Copy describes a possible benefit without claiming demonstrated hiring outcomes. Final `PLAYWRIGHT_CHANNEL=chrome ./scripts/verify` passed: 34 unit tests, 41 browser journeys, formatting, kit integrity, lint, types, packet and build. The first counter test initially expected the length error before filling other required fields; its setup was corrected and the full gate rerun successfully. Reviewed rendered 390px counter and white optional header, with snapshots in `artifacts/candidate-card-counts/`.

## Follow-up: example in another browser (2026-11-07)

User sees an empty card in Chrome/Safari while Codex's browser holds Anna's saved example. Cause: separate browser-local scenario storage, not a failing preview. Only the in-app browser is available to automation. Add a clearly fictional, explicit load-example action for Anna when all card fields are empty. The action saves only her card through the existing domain operation, then opens preview. Never replace nonempty answers, other people, applications or the full scenario. Acceptance: loading from a fresh browser works, survives reload and is unavailable for nonempty cards/Marek. No change to preview validation, snapshots or import/export.

Validation for example loading: `PLAYWRIGHT_CHANNEL=chrome ./scripts/verify` passed (34 unit tests, 42 browser journeys, remaining project checks). Fresh-browser test loads the sample, opens preview, verifies persistence after reload, hides the action after any own answer and excludes Marek. Existing browser data in Codex was left intact; the external browser remains a user-operated final step because it is not connected to automation.
