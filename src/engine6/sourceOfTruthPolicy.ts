import type { Engine6ValidationFixture } from "./validationFixtures";

export const ENGINE6_SOURCE_OF_TRUTH_API_DRIVEN = "api-driven" as const;
export const ENGINE6_SOURCE_OF_TRUTH_FIXTURE_AUTHORED =
  "fixture-authored" as const;

export type Engine6SourceOfTruthMode =
  | typeof ENGINE6_SOURCE_OF_TRUTH_API_DRIVEN
  | typeof ENGINE6_SOURCE_OF_TRUTH_FIXTURE_AUTHORED;

const FORBIDDEN_API_DRIVEN_FIELDS = [
  "title",
  "description",
  "overview",
  "price",
  "duration",
  "aggregateRating",
  "reviewCount",
  "itinerary",
  "stops",
  "route",
  "meetingPoint",
  "pickup",
  "highlights",
  "inclusions",
  "exclusions",
  "importantInfo",
  "categories",
  "tags",
] as const;

const hasAuthoredValue = (value: unknown): boolean => {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
};

const collectForbiddenFixtureFields = (record: Record<string, unknown>) =>
  FORBIDDEN_API_DRIVEN_FIELDS.filter(field => hasAuthoredValue(record[field]));

export const getEngine6SourceOfTruthMode = (
  fixture: Engine6ValidationFixture
): Engine6SourceOfTruthMode => fixture.sourceOfTruth.mode;

export const validateEngine6FixtureSourceOfTruth = (
  fixture: Engine6ValidationFixture
): string[] => {
  if (getEngine6SourceOfTruthMode(fixture) !== ENGINE6_SOURCE_OF_TRUTH_API_DRIVEN) {
    return [];
  }

  const topLevelForbiddenFields = collectForbiddenFixtureFields(
    fixture as unknown as Record<string, unknown>
  );
  const authoredForbiddenFields = collectForbiddenFixtureFields(
    fixture.sourceOfTruth.authoredNonHeroContent ?? {}
  );

  const forbiddenFields = [
    ...new Set([...topLevelForbiddenFields, ...authoredForbiddenFields]),
  ];

  if (forbiddenFields.length === 0) {
    return [];
  }

  return [
    `Engine6 source-of-truth violation for ${fixture.productCode}: API-driven specimen fixtures cannot include authored non-hero content fields (${forbiddenFields.join(", ")}).`,
    "Viator API is required as source of truth for non-hero content; only deterministic hero override metadata is allowed.",
  ];
};

export const assertEngine6FixtureSourceOfTruth = (
  fixture: Engine6ValidationFixture
) => {
  const violations = validateEngine6FixtureSourceOfTruth(fixture);
  if (violations.length > 0) {
    throw new Error(violations.join(" "));
  }
};
