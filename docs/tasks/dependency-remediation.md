# Dependency remediation

## Intent

Resolve the twelve npm audit findings requested by the owner without downgrading the component tooling or suppressing advisories.

## Approved scope and approach

The owner requested resolving these warnings. The installed shadcn CLI/registry JavaScript is not invoked by app source or scripts; only shadcn/tailwind.css is imported. Preserve that stylesheet byte-for-byte with its MIT license and provenance, remove the CLI dependency and its unused vulnerable deepmerge/ts-morph tree. Scope a minimatch 11.0.1 override to TypeScript ESLint typescript-estree; its installed consumers use the exported Minimatch class. Node 24 meets the patched package requirements. Keep the override until upstream requires a patched version, then remove it after verification.

## Acceptance criteria

- npm audit reports zero findings, including development dependencies.
- The copied stylesheet and license match installed shadcn 4.23.0; generated app CSS remains byte-identical to the baseline SHA-256 8e5ef1f13150fd8bd55fd56e07b7f2497a51c40fc3a4995d9cbae5081eecb385.
- No upstream theme/reference files are modified. Existing React/Base UI controls remain in place.
- Clean isolated npm ci succeeds with the updated lockfile; full verification, including browser journeys, passes.
- FEATURES.md reviewed: this dependency repair has no intended product behavior change; existing writer-lock behavior from the previous repair remains.
- Refresh the readiness evidence and record unresolved hosting requirements.

## Sources

- https://github.com/advisories/GHSA-gcqx-w48m-w2h4 (deepmerge, no patched release)
- https://github.com/advisories/GHSA-g3hv-75wg-m249 (minimatch, patched in 11.0.1)
- npm view: current TypeScript ESLint 8.72.2 still depends on minimatch ^10.2.2; deepmerge latest 4.3.1; shadcn latest 4.23.0.

## Implementation and separate review

Removed shadcn from devDependencies and retained its exact 4.23.0 stylesheet/license under src/app/vendor. Changed the CSS import to that local snapshot. Added a scoped typescript-estree → minimatch 11.0.1 override and regenerated package-lock with scripts disabled. npm install removed 178 packages and reported zero vulnerabilities. Reviewed package/scripts/source imports: no generator executable is used; no behavior register change is needed. The copied license and stylesheet are excluded from formatting to preserve upstream bytes.

Review focuses on the consumer's Minimatch class API and the complete lint/type/browser gate. This targeted override crosses the nested dependency's declared major range; it is documented explicitly rather than presented as an ordinary compatible update. No global override, forced downgrade or ignored advisory is used.
