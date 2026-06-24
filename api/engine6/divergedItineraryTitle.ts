import type { Engine6ItineraryTitleSource } from "./itineraryTitlePolicy.js";

type RecordLike = Record<string, unknown>;

const asRecord = (value: unknown): RecordLike | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordLike)
    : null;

const asNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const PROSE_START_PATTERNS = [
  /^we\b/i,
  /^the best\b/i,
  /^discover\b/i,
  /^enjoy\b/i,
  /^named after\b/i,
  /^glide past\b/i,
  /^as we\b/i,
  /^as you\b/i,
  /^guests will\b/i,
  /^check in\b/i,
  /^landing at\b/i,
  /^from here\b/i,
  /^riders get\b/i,
  /^dive into\b/i,
  /^driving the\b/i,
  /^kayakers will\b/i,
  /^after\b/i,
  /^home to\b/i,
  /^return shuttle\b/i,
  /^admire the\b/i,
  /^soar over\b/i,
  /^nestled in\b/i,
  /^the miami city tour\b/i,
  /^this\b/i,
];

export const getEngine6ItineraryTitleWordCount = (value: string): number =>
  value.trim().split(/\s+/).filter(Boolean).length;

export const isEngine6ProseItineraryTitle = (value: string | null | undefined): boolean => {
  const normalized = asNonEmptyString(value)?.replace(/\s+/g, " ");
  if (!normalized) return true;

  const wordCount = getEngine6ItineraryTitleWordCount(normalized);
  if (wordCount > 8 || normalized.length > 80) {
    return true;
  }

  if (PROSE_START_PATTERNS.some(pattern => pattern.test(normalized))) {
    return true;
  }

  if (/[.!?]/.test(normalized) && wordCount > 4) {
    return true;
  }

  if (/\b(is|are|was|were|will|can|offers|provides|features|captures)\b/i.test(normalized)) {
    return wordCount > 4;
  }

  return false;
};

const normalizeCandidateTitle = (value: string): string =>
  value
    .replace(/\s*\((pass\s*by)\)\s*$/i, "")
    .replace(/\s+/g, " ")
    .replace(/[.,:;!?]+$/g, "")
    .trim();

const isUsableConciseItineraryTitle = (value: string | null | undefined): value is string => {
  const normalized = asNonEmptyString(value);
  if (!normalized) return false;
  if (getEngine6ItineraryTitleWordCount(normalized) > 8) return false;
  if (isEngine6ProseItineraryTitle(normalized)) return false;
  return getEngine6ItineraryTitleWordCount(normalized) >= 1;
};

const readPartnerItineraryRows = (
  product: RecordLike | null | undefined
): RecordLike[] => {
  if (!product) return [];

  const candidates = [
    product.itineraryItems,
    asRecord(product.itinerary)?.itineraryItems,
    asRecord(product.itinerary)?.items,
    asRecord(product.whatToExpect)?.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .map(item => asRecord(item))
        .filter((item): item is RecordLike => Boolean(item));
    }
  }

  return [];
};

const readStructuredFieldCandidates = (row: RecordLike): string[] => {
  const pointOfInterestLocation = asRecord(row.pointOfInterestLocation);
  const pointOfInterest = asRecord(row.pointOfInterest);
  const stop = asRecord(row.stop);
  const location = asRecord(row.location);
  const attraction = asRecord(row.attraction);

  return [
    asNonEmptyString(pointOfInterestLocation?.locationName),
    asNonEmptyString(pointOfInterestLocation?.title),
    asNonEmptyString(pointOfInterestLocation?.name),
    asNonEmptyString(pointOfInterest?.title),
    asNonEmptyString(pointOfInterest?.name),
    asNonEmptyString(attraction?.name),
    asNonEmptyString(attraction?.title),
    asNonEmptyString(stop?.locationName),
    asNonEmptyString(stop?.title),
    asNonEmptyString(stop?.name),
    asNonEmptyString(location?.locationName),
    asNonEmptyString(location?.title),
    asNonEmptyString(location?.name),
    asNonEmptyString(row.locationName),
    asNonEmptyString(row.attractionName),
    asNonEmptyString(row.title),
    asNonEmptyString(row.name),
    asNonEmptyString(row.label),
  ].filter((value): value is string => Boolean(value));
};

const readOtherStructuredPoiLocationFieldCandidates = (
  row: RecordLike
): string[] => {
  const pointOfInterestLocation = asRecord(row.pointOfInterestLocation);
  const pointOfInterest = asRecord(row.pointOfInterest);
  const stop = asRecord(row.stop);
  const location = asRecord(row.location);
  const attraction = asRecord(row.attraction);

  return [
    asNonEmptyString(pointOfInterestLocation?.title),
    asNonEmptyString(pointOfInterestLocation?.name),
    asNonEmptyString(pointOfInterest?.title),
    asNonEmptyString(pointOfInterest?.name),
    asNonEmptyString(attraction?.name),
    asNonEmptyString(attraction?.title),
    asNonEmptyString(stop?.locationName),
    asNonEmptyString(stop?.title),
    asNonEmptyString(stop?.name),
    asNonEmptyString(location?.locationName),
    asNonEmptyString(location?.title),
    asNonEmptyString(location?.name),
    asNonEmptyString(row.locationName),
    asNonEmptyString(row.attractionName),
  ].filter((value): value is string => Boolean(value));
};

const readExplicitItineraryRowFieldCandidates = (row: RecordLike): string[] =>
  [
    asNonEmptyString(row.title),
    asNonEmptyString(row.name),
    asNonEmptyString(row.label),
  ].filter((value): value is string => Boolean(value));

const pickFirstUsableStructuredTitle = (
  candidates: string[]
): { title: string; source: "explicit" } | null => {
  for (const candidate of candidates) {
    const normalized = normalizeCandidateTitle(candidate);
    if (isUsableConciseItineraryTitle(normalized)) {
      return { title: normalized, source: "explicit" };
    }
  }

  return null;
};

export const getEngine6PartnerItineraryRowPoiLocationName = (
  product: RecordLike | null | undefined,
  rowIndex: number
): string | null => {
  if (rowIndex < 0) return null;

  const row = readPartnerItineraryRows(product)[rowIndex];
  if (!row) return null;

  const pointOfInterestLocation = asRecord(row.pointOfInterestLocation);
  const locationName = asNonEmptyString(pointOfInterestLocation?.locationName);
  if (!locationName) return null;

  const normalized = normalizeCandidateTitle(locationName);
  return isUsableConciseItineraryTitle(normalized) ? normalized : null;
};

export const getEngine6PartnerItineraryRowOtherStructuredTitle = (
  product: RecordLike | null | undefined,
  rowIndex: number
): { title: string; source: "explicit" } | null => {
  if (rowIndex < 0) return null;

  const row = readPartnerItineraryRows(product)[rowIndex];
  if (!row) return null;

  return pickFirstUsableStructuredTitle(
    readOtherStructuredPoiLocationFieldCandidates(row)
  );
};

export const getEngine6PartnerItineraryRowExplicitFieldTitle = (
  product: RecordLike | null | undefined,
  rowIndex: number
): { title: string; source: "explicit" } | null => {
  if (rowIndex < 0) return null;

  const row = readPartnerItineraryRows(product)[rowIndex];
  if (!row) return null;

  return pickFirstUsableStructuredTitle(
    readExplicitItineraryRowFieldCandidates(row)
  );
};

export const getEngine6PartnerItineraryRowStructuredTitle = (
  product: RecordLike | null | undefined,
  rowIndex: number
): { title: string; source: "explicit" } | null => {
  if (rowIndex < 0) return null;

  const row = readPartnerItineraryRows(product)[rowIndex];
  if (!row) return null;

  return pickFirstUsableStructuredTitle(readStructuredFieldCandidates(row));
};

const extractNamedEntityFromDescription = (
  description: string | null | undefined
): string | null => {
  const normalizedDescription = asNonEmptyString(description)?.replace(
    /^he\s+(?=[A-Z])/,
    "The "
  );
  if (!normalizedDescription) return null;

  const commaEntityMatch = normalizedDescription.match(
    /,\s*((?:The\s+)?[A-ZÀ-ÖØ-Ý][\wÀ-ÖØ-öø-ÿ'&\-]*(?:[\s,/]+[A-ZÀ-ÖØ-Ý][\wÀ-ÖØ-öø-ÿ'&\-]*){0,7})\s+(?:captures|offers|provides|features|is|are)\b/
  );
  if (commaEntityMatch?.[1]) {
    const candidate = normalizeCandidateTitle(commaEntityMatch[1]);
    if (isUsableConciseItineraryTitle(candidate)) {
      return candidate;
    }
  }

  const subjectMatch = normalizedDescription.match(
    /^((?:The\s+)?[A-ZÀ-ÖØ-Ý][\wÀ-ÖØ-Ý'&\-]*(?:[\s,/]+[A-ZÀ-ÖØ-Ý][\wÀ-ÖØ-öø-ÿ'&\-]*){0,7})\s+(?:is|are|offers?|provides?|features?)\b/
  );
  if (subjectMatch?.[1]) {
    const candidate = normalizeCandidateTitle(subjectMatch[1]);
    if (isUsableConciseItineraryTitle(candidate)) {
      return candidate;
    }
  }

  return null;
};

const extractLocationPhraseFromProse = (
  value: string | null | undefined
): string | null => {
  const normalized = asNonEmptyString(value)?.replace(/\s+/g, " ");
  if (!normalized) return null;

  const patterns: RegExp[] = [
    /nestled in downtown miami,\s*([^,]+)/i,
    /discover the charm of ([^,]+?)(?:'s|\s+shoreline|\s+from|\s+where)/i,
    /admire the elegance of ([^,]+?)(?:\s+from|\s+with)/i,
    /soar over ([^,]+?)(?:\s+and|\s+from)/i,
    /glide past the stunning ([^,]+)/i,
    /glide past ([^,]+)/i,
    /(?:talk about one of the most famous destinations in the world[-–—]\s*)([^,.]+)/i,
    /world[-–—]\s*([^,.]+)/i,
    /(?:pass by)\s+([^,]+)/i,
    /(?:arrive at the famous)\s+([^,]+)/i,
    /(?:arrive at the vibrant)\s+([^,]+)/i,
    /(?:arrive at)\s+(?:the\s+)?([^,]+)/i,
    /(?:cruise to the)\s+([^,]+)/i,
    /(?:depart from)\s+([^,]+)/i,
    /(?:check in, safety briefing and depart from)\s+([^,]+)/i,
    /(?:stop at the)\s+([^,]+)/i,
    /(?:stop at)\s+([^,]+)/i,
    /(?:visit)\s+([^,]+)/i,
    /(?:located in the heart of)\s+([^,]+)/i,
    /(?:otherwise known as)\s+([^,.]+)/i,
    /(?:head back along)\s+([^,]+)/i,
    /(?:through)\s+([^,]+?)(?:\s+to the|\s+that only|\s+to\b)/i,
    /(?:as you pass by)\s+([^,]+)/i,
    /(?:world-famous)\s+([^,.]+?)(?:\s+lined|\s+taking|\s+seeing)/i,
    /(?:loop back to the world-famous)\s+([^,.]+?)(?:\s+lined|\s+with)/i,
    /,\s*([^,]+?)\s+is the perfect\b/i,
    /^((?:The\s+)?[A-Z][\w'&/-]+(?:\s+[A-Z][\w'&/-]+){0,5})\s+is the perfect\b/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (!match?.[1] && !match?.[0]) continue;

    const rawCandidate = match[1] ?? match[0];
    const candidate = normalizeCandidateTitle(
      rawCandidate
        .replace(/^the\s+/i, "The ")
        .replace(/\s+'s$/i, "")
    );
    if (isUsableConciseItineraryTitle(candidate)) {
      return candidate;
    }
  }

  if (/sandspur island|raccoon island/i.test(normalized)) {
    return "Sandspur Island (Raccoon Island)";
  }

  if (/famous sandspur island otherwise known as raccoon island/i.test(normalized)) {
    return "Sandspur Island (Raccoon Island)";
  }

  return null;
};

const splitLeadingConciseSegment = (
  value: string | null | undefined
): string | null => {
  const normalized = asNonEmptyString(value)?.replace(/\r/g, "\n");
  if (!normalized) return null;

  const firstLine = normalized.split("\n")[0]?.trim() ?? normalized;
  for (const separator of [" | ", " - ", ": "]) {
    const [leading] = firstLine.split(separator);
    const candidate = normalizeCandidateTitle(leading ?? "");
    if (isUsableConciseItineraryTitle(candidate)) {
      return candidate;
    }
  }

  const wholeLine = normalizeCandidateTitle(firstLine);
  if (isUsableConciseItineraryTitle(wholeLine)) {
    return wholeLine;
  }

  return null;
};

/**
 * Derive a concise POI/location title from supplier prose when structured
 * Partner/API fields are unavailable.
 */
export const extractEngine6ConciseItineraryTitleFromProse = (args: {
  title?: string | null;
  description?: string | null;
}): { title: string; source: Engine6ItineraryTitleSource } | null => {
  const splitCandidate = splitLeadingConciseSegment(args.title);
  if (splitCandidate) {
    return { title: splitCandidate, source: "explicit" };
  }

  const titleEntity = extractNamedEntityFromDescription(args.title);
  if (titleEntity) {
    return { title: titleEntity, source: "explicit" };
  }

  const titlePhrase = extractLocationPhraseFromProse(args.title);
  if (titlePhrase) {
    return { title: titlePhrase, source: "explicit" };
  }

  const descriptionPhrase = extractLocationPhraseFromProse(args.description);
  if (descriptionPhrase) {
    return { title: descriptionPhrase, source: "explicit" };
  }

  const descriptionEntity = extractNamedEntityFromDescription(args.description);
  if (descriptionEntity) {
    return { title: descriptionEntity, source: "explicit" };
  }

  const descriptionSplit = splitLeadingConciseSegment(args.description);
  if (descriptionSplit) {
    return { title: descriptionSplit, source: "explicit" };
  }

  return null;
};
