# Engine6 Itinerary Governance Policy v2

## Purpose

Ensure itinerary titles and descriptions remain accurate, aligned, human-readable, and resistant to live/native merge corruption.

This policy applies only to itinerary construction, rendering, title authority, description quality, and merge behavior.

---

## 1. Itinerary Title Authority

Use the highest available authority in this order:

1. Product-specific reviewed override
2. Public JSON-LD itinerary names
3. `pointOfInterestLocation.locationName`
4. Other structured POI/location fields
5. Explicit itinerary title/name/label
6. Neutral fallback title

Description-derived titles are prohibited.

Implementation: `api/engine6/itineraryTitlePolicy.ts` → `resolveEngine6DivergedItineraryTitle`.

---

## 2. No Prose Title Rule

Titles identify stops. Descriptions explain stops.

Reject titles that:

- Read as sentences
- Contain narrative prose
- Contain multiple clauses
- Exceed reasonable title length
- Substantially duplicate description text

Preferred title length: 2–8 words. Maximum: 12 words.

Flag for review:

- More than 80 characters
- Multiple sentences
- Narrative phrasing

Implementation: `api/engine6/divergedItineraryTitle.ts` → `isEngine6ProseItineraryTitle`, `src/engine6/itineraryTitleIntegrityAudit.ts`, `src/engine6/itineraryGovernanceAudit.ts`.

---

## 3. No Verbatim Description Rule

Descriptions must not substantially duplicate supplier itinerary prose or titles.

Implementation: `src/engine6/itineraryGovernance.ts` → `isEngine6SupplierMirroredItineraryText`, `validateEngine6GovernedItinerary`.

---

## 4. Title–Description Alignment Rule

Every itinerary row must describe the same POI in both title and description.

Implementation: `src/engine6/itineraryGovernanceAudit.ts` → `auditEngine6ItineraryTitleDescriptionAlignment`.

---

## 5. Diverged Merge Protection

When native itinerary row count ≠ live itinerary row count, or authoritative titles diverge at a shared index, the system must never combine:

- Native title + live description
- Live title + native description

Allowed:

- Native itinerary only
- Live itinerary only
- Reviewed override itinerary

Forbidden:

- Mixed-source itinerary rows

Correctness outranks completeness. The Portland `378720P1` failure is the canonical regression example.

Implementation: `src/engine6/mergeEngine6LiveItinerary.ts` → `pickEngine6DivergedItineraryContentSource`, `mergeEngine6NativeItineraryWithLiveDiverged`.

---

## 6. Description Quality Standards

Descriptions should explain the stop, preserve factual accuracy, and read naturally.

Preferred length: 20–120 words.

Implementation: `src/engine6/itineraryGovernance.ts` → `rewriteEngine6ItineraryDescription`, `validateEngine6GovernedItinerary`.

---

## 7. Automated Audit Rules

Flag:

- Prose titles
- Narrative titles
- Verbatim supplier descriptions
- Title/description duplication
- Title/description semantic mismatch
- Excessive title length
- Generic titles
- Placeholder titles
- Row-shifted itineraries
- Mixed-source itinerary rows

Audit runs in report-only mode via `scripts/audit-engine6-itinerary-governance.ts`.

---

## 8. Regression Test Set

Permanent governance test products are defined in `src/engine6/itineraryGovernanceRegressionProducts.ts` and covered by `src/engine6/itineraryGovernanceRegression.test.ts`.

No future itinerary change may reintroduce failures on these products.

---

## 9. Acceptance Criteria

A tour passes itinerary governance when:

- Titles identify actual stops
- No prose titles exist
- Descriptions are rewritten in natural language
- No verbatim supplier descriptions remain
- Title and description describe the same POI
- No mixed-source itinerary rows exist
- Regression tests pass
- Audit reports contain no critical findings

Governance priority: **Accuracy > Alignment > Readability > Completeness**
