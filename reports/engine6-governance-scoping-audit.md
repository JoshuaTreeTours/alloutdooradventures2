# Engine6 Governance Scoping Audit Report

Generated as part of branch `engine6-governance-scoping-audit`.

## Executive summary

Engine6 Stage 2 governance now uses a single environment-controlled posture via `ENGINE6_GOVERNANCE_MODE`:

| Mode | Blocking | Warnings | Legacy catalog drift |
| --- | --- | --- | --- |
| `audit` | Never exits | Reported | Reported |
| `warn` (CI default) | Deploy-scoped products only | Reported, non-blocking | Reported, non-blocking |
| `strict` | All findings | Blocking in strict | Blocking in strict |

Legacy env vars remain supported: `ENGINE6_LIVE_VIATOR_VALIDATION_MODE=pr-scoped` maps to `warn`; `strict` maps to `strict`.

Full-catalog validation requires both `ENGINE6_GOVERNANCE_MODE=strict` and `ENGINE6_GOVERNANCE_FULL_AUDIT=1` (scheduled/manual workflow only).

## Check matrix

| Check area | Scope | Warn/default CI | Strict/full audit | Notes |
| --- | --- | --- | --- | --- |
| **Live Viator validation** | Deploy-scoped product codes from git diff | Blocking for scoped products | Full catalog when `ENGINE6_GOVERNANCE_FULL_AUDIT=1` | Skips locally without credentials; fails CI/production when credentials required but missing |
| **Product selection / portfolio** | Current destination build cohort | Blocking for scoped destination portfolio | Full destination build gate | Inactive/removed/unavailable/reassigned products remain hard-rejected |
| **Product-code blocklist** | Global | Always blocking (except audit mode) | Always blocking | Never weakened for known-unavailable Viator products |
| **Product-selection blocklist** | Global configured catalog | Always blocking (except audit mode) | Always blocking | Permanent blocklist hits fail even outside deploy scope |
| **Merchant feed commercial refresh** | Deploy-scoped rows | Blocking for new/modified commercial rows | Full catalog | Clear parity failure strings preserved from merchant feed audits |
| **Merchant feed image** | Deploy-scoped Engine6 rows | Fatal for scoped rows; legacy rows report-only | Full catalog | Fatal: missing hero, broken URL, no valid replacement. Warning: usable fallback image selected |
| **Description / title / JSON-LD** | Deploy-scoped products | Blocking for scoped products | Full catalog | Forbidden template phrases, governed description parity |
| **Itinerary title** | Deploy-scoped products | Blocking for scoped critical findings | Full catalog | Uses itinerary governance audit reasons |
| **Route / sitemap / merchant-feed parity** | Deploy-scoped eligible tours | Blocking for scoped products | Full catalog | Missing CSV row, sitemap path, JSON-LD mismatch messages |
| **Destination cohort consistency** | Changed destination cohorts only | Blocking within scoped cohort labels | All cohorts when full-site audit | Legacy cities are not evaluated on unrelated destination branches |

## Environment variables

| Variable | Purpose |
| --- | --- |
| `ENGINE6_GOVERNANCE_MODE` | `audit` \| `warn` \| `strict` |
| `ENGINE6_GOVERNANCE_FULL_AUDIT` | `1` enables full-catalog/cohort validation in strict runs |
| `ENGINE6_GOVERNANCE_BASE_REF` | Git base ref for deploy scope detection |
| `ENGINE6_LIVE_VIATOR_VALIDATION_BASE_REF` | Legacy alias for governance base ref |
| `ENGINE6_STAGE2_GOVERNANCE_HEAD_REF` | Head ref for stage-2 audit (default `HEAD`) |

## CI behavior

Pull requests and main pushes:

- `ENGINE6_GOVERNANCE_MODE=warn`
- Strict blocking limited to changed Engine6 destination/product artifacts
- Stage 2 audit + live Viator validation run in the same workflow

Manual / scheduled workflow dispatch:

- Choose `audit`, `warn`, or `strict`
- Enable `full_site_audit` for production-style full-catalog strict validation

## Modules added / updated

- `src/engine6/engine6GovernanceMode.ts` — mode resolution, credential policy, exit policy
- `src/engine6/resolveEngine6GovernanceScope.ts` — git-scoped product codes + destination cohort labels
- `src/engine6/engine6DestinationValidationCohorts.ts` — shared cohort definitions
- `src/engine6/engine6Stage2GovernanceAudit.ts` — scoped findings, warning severity, blocklist hardening
- `src/engine6/merchantFeedImageGovernance.ts` — fatal vs fallback warning classification
- `src/engine6/engine6LiveViatorProductionValidation.ts` — credential-aware skip/fail behavior
- `.github/workflows/engine6-live-viator-validation.yml` — governance mode wiring

## Verification commands

```bash
npm run test -- src/engine6/engine6GovernanceMode.test.ts src/engine6/resolveEngine6GovernanceScope.test.ts src/engine6/engine6Stage2GovernanceAudit.test.ts src/engine6/engine6LiveViatorProductionValidation.test.ts

ENGINE6_GOVERNANCE_MODE=audit npm run audit:engine6-stage2-governance -- --skip-live-viator

ENGINE6_GOVERNANCE_MODE=warn npm run audit:engine6-stage2-governance -- --skip-live-viator
```

## Requirement traceability

1. **No unrelated legacy city failures** — deploy-scoped severity + destination cohort filtering
2. **Destination branches validate current cohort only** — `resolveEngine6DestinationValidationCohortsForScope`
3. **Live Viator credential behavior** — `resolveEngine6GovernanceCredentialPolicy`
4. **Image fatal vs warning** — `failureReason` + `warnings` in merchant feed image governance
5. **Clear failure reasons** — preserved/enriched messages across merchant feed, sitemap, routes, JSON-LD, fixtures, images
6. **Environment modes** — `ENGINE6_GOVERNANCE_MODE=audit|warn|strict`
7. **CI strict scoping** — warn by default; full strict only with workflow dispatch + `full_site_audit`
8. **Unavailable product rules not weakened** — global blocklist enforcement remains blocking in warn/strict
