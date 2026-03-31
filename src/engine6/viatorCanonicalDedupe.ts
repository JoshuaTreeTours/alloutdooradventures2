export type ViatorCanonicalDedupeEntry = {
  productCode: string;
  canonicalPath: string;
  canonicalTourSlug: string;
  ctaOwner: "fareharbor";
  rationale: string;
};

const VIATOR_CANONICAL_DEDUPE_ENTRIES: ViatorCanonicalDedupeEntry[] = [
  {
    productCode: "5356P12",
    canonicalPath:
      "/destinations/california/san-diego/tours/art-of-balboa-park-walking-tour-651385",
    canonicalTourSlug: "art-of-balboa-park-walking-tour-651385",
    ctaOwner: "fareharbor",
    rationale:
      "Existing FareHarbor canonical page already owns this tour intent; keep FH monetization and suppress competing Viator page creation.",
  },
];

const VIATOR_CANONICAL_DEDUPE_BY_PRODUCT_CODE: Record<
  string,
  ViatorCanonicalDedupeEntry
> = Object.fromEntries(
  VIATOR_CANONICAL_DEDUPE_ENTRIES.map(entry => [entry.productCode, entry])
);

export const resolveViatorCanonicalDedupe = (productCode: string) =>
  VIATOR_CANONICAL_DEDUPE_BY_PRODUCT_CODE[productCode.toUpperCase()] ?? null;

export const viatorCanonicalDedupeEntries = VIATOR_CANONICAL_DEDUPE_ENTRIES;
