# Predeployment diagnostics and recovery rehearsal

## Intent and authorized scope

The owner requested verifying preparation before deployment and authorized implementing local error diagnostics plus a recovery/rollback rehearsal. No external telemetry, paid service, deployment, account change or message sending is authorized. Vercel integration discovery returned DISABLED_BY_ADMIN / NOT_AVAILABLE. The owner confirmed an existing account; account access/plan still requires actual panel evidence.

## Acceptance criteria

- Capture stable error codes, time and a deterministic production build ID in a bounded memory-only buffer; never capture messages, stacks, route/query strings, scenario state, answers or tokens in diagnostics.
- Catch render crashes with an accessible recovery screen. Preserve the latest in-memory scenario separately for explicit export, including when storage writes failed. No automatic reset or transmission.
- Settings and the recovery screen can download diagnostic JSON for the owner. Browser error/rejection and recoverable render events are handled with fixed codes.
- Rehearse using the actual prior verified static release and the new build under one isolated local origin. Preserve browser data, simulate a failed release, restore the prior bundle, and verify state compatibility and backup import in a second context.
- Keep prior deployment/account claims unverified; local rehearsal is preparation evidence only. No fixed browser-data migration is introduced.
- Run focused privacy/recovery tests and the complete verification gate, refresh the readiness report and record real evidence.

## UI integration

Compose the existing prototype-section / prototype-panel / prototype-form recipes and Base UI Button. Recovery screen: heading, explanatory copy, export and diagnostic actions followed by explicit reload. Settings: a short diagnostics section. No new visual tokens or changes to marketplace composition. C19 status semantics and existing type/surface/control roles apply. Check keyboard and 390/320px wrapping.

## Rehearsal baseline

Copied the previously verified clean dist into artifacts/recovery-rehearsal/baseline after comparing every file checksum with the current dist. baseline.json records the original source fingerprint/audit and file hashes. These ignored local artifacts are not participant source or production output. Their absence must cause the explicit rehearsal command to fail rather than inventing a baseline.

## Review and preliminary evidence

The focused diagnostics tests passed after correcting test selectors and the deliberate fault trigger. The real prior/current artifact rehearsal passed: new build, controlled HTTP 503, prior artifact restored with all browser state preserved, backup imported in a clean context, and five concurrent isolated participants exercised the static app. These are local preparation results; the final gate and fresh-copy reproduction are recorded in the report.

Read-only Vercel inspection confirmed active Hobby, Owner, no card, AI auto-reload Off, paid add-ons disabled and zero displayed CDN/transfer usage. Hobby quota exhaustion may pause service longer than the next day, so the verified local package is the exercise fallback; no new service promise is inferred. Personal educational scope and 0 PLN remain the agreed bounds. No external account configuration was changed.

A separate review checked allowlisted diagnostics, absence of message/stack/URL/state logging, preservation of unsaved and raw state, explicit reload, lock cleanup after provider unmount, immutable baseline hash verification, same-origin artifact switching, fresh-context restore and packaging of the explicit rehearsal config. Two lockfile resolved URLs were made portable after verifying matching public artifact integrity; versions were preserved. React error callbacks are implemented without raw error logging. Existing company-page findings remain out of scope.
