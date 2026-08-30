# Engine6 Destination Infrastructure Validation

Destination: Osaka
Slug: osaka
Route prefix: /destinations/japan/osaka/tours/
Pass: yes

## Checks

- [x] **state-registry**: State registry includes japan
- [x] **city-registry**: City registry includes osaka
- [x] **tours-state-selector**: Tours page state selector includes japan
- [x] **tours-city-selector**: Tours page city selector includes osaka
- [x] **route-prefix**: Route prefix registered (20 tour route(s))
- [x] **governance-scope**: Governance scope mapping resolves for osaka
- [x] **canonical-hero-fallback**: Canonical city hero fallback resolves
- [x] **validation-cohort**: Validation cohort registered (Osaka)
- [x] **fixture-target-path**: Fixture generation target paths are deploy-scoped to the destination route prefix