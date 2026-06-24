# Engine6 Overview Governance Policy

## Purpose

Ensure tour overviews for newly created Engine6 products use original travel-guide prose while preserving factual content, named locations, and destination context from supplier source material.

This policy applies only to overview construction and validation for new Engine6 builds. Existing tours remain unchanged unless explicitly requested.

---

## 1. Original Wording Requirement

Overviews must not copy supplier descriptions verbatim. Each overview should be a unique summary with original wording while remaining factually equivalent to the source content.

Implementation: `src/engine6/overviewGovernance.ts` → `rewriteEngine6Overview`, `isEngine6SupplierMirroredOverviewText`.

---

## 2. Named Location Preservation

Preserve the names of attractions, landmarks, points of interest, parks, museums, viewpoints, waterfalls, neighborhoods, markets, and other named locations that exist in the source material.

Implementation: `src/engine6/overviewGovernance.ts` → `extractEngine6OverviewNamedLocations`, `validateEngine6GovernedOverview`.

---

## 3. Destination-First Opening

Do not begin the overview with pickup instructions, meeting instructions, clothing requirements, guide instructions, transportation logistics, or operational procedures.

Implementation: `src/engine6/overviewGovernance.ts` → `isEngine6OperationalOverviewOpener`, `rewriteEngine6Overview`.

---

## 4. Professional Travel-Guide Tone

Use a professional travel-publication tone. Prefer descriptive observations over emotional promises. Do not use humor, jokes, slang, sarcasm, first-person narration, conversational banter, emojis, or promotional exaggeration.

Implementation: `src/engine6/overviewGovernance.ts` → `ENGINE6_OVERVIEW_BANNED_VOICE_PATTERNS`, `validateEngine6GovernedOverview`.

---

## 5. Factual Integrity

Do not invent attractions, historical facts, experiences, wildlife, events, tour inclusions, or other factual content. Preserve key attractions, duration, transportation method, highlights, and unique selling points from the source description.

Implementation: `src/engine6/overviewGovernance.ts` → `rewriteEngine6Overview`, `validateEngine6GovernedOverview`.

---

## 6. Operational Exclusions

Exclude licensing notices, legal disclaimers, operator credentials, booking instructions, cancellation policies, administrative information, and other operational details from the overview. Never reference internal discounts, military discounts, senior discounts, pricing policies, promotional offers, or booking incentives unless explicitly included as a formal tour inclusion.

Implementation: `src/engine6/overviewGovernance.ts` → `isEngine6ExcludedOverviewSentence`.

---

## 7. Length Target

Target approximately 120–250 words.

Implementation: `src/engine6/overviewGovernance.ts` → `ENGINE6_OVERVIEW_MIN_WORDS`, `ENGINE6_OVERVIEW_MAX_WORDS`.

---

## 8. Scope

- Apply only to newly created Engine6 tours identified by `isEngine6NewBuildProductCode`.
- New fixtures for products outside the original merchant-approved set receive `itineraryOriginalityForNewBuilds: true` automatically in `validationFixtures.ts`.
- Reviewed product-specific overview overrides in `mapViatorToEngine6Tour.ts` take precedence and are excluded from automated rewrite and validation.
- Existing tours without the new-build flag remain unchanged.

---

## 9. Acceptance Criteria

A new-build tour passes overview governance when:

- Overview is materially different from supplier wording
- Overview remains factually equivalent to the source content
- Named attractions and POIs from the source material are preserved when available
- No hallucinated attractions, experiences, facts, or inclusions are introduced
- Professional travel-publication tone is maintained
- Overview does not begin with operational or logistical instructions
- Overview passes duplicate-content review
- Overview passes factual-content review

Validation runs via `validateEngine6GovernedOverview` in `src/engine6/creationValidation.tsx` for new-build products without reviewed overview overrides.
