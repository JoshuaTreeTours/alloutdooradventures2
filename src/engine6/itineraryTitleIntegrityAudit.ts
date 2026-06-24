import type { Engine6ItineraryItem, Engine6Tour } from "./types";

export type Engine6ItineraryTitleSuspiciousReason =
  | "missing-or-too-short"
  | "single-generic-word"
  | "generic-description-start"
  | "more-than-eight-words"
  | "more-than-twelve-words"
  | "more-than-eighty-characters"
  | "sentence-punctuation"
  | "matches-description-first-sentence"
  | "visit-prefix-matches-description"
  | "supplier-marketing-prose";

export type Engine6ItineraryTitleAuditRow = {
  productId: string;
  route: string;
  tourTitle: string;
  itineraryIndex: number;
  renderedTitle: string | null;
  renderedDescription: string | null;
  titleSource: string | null;
  duration: string | null;
  admissionStatus: string | null;
  suspiciousReasons: Engine6ItineraryTitleSuspiciousReason[];
};

export type Engine6ItineraryTitleAuditReport = {
  generatedAt: string;
  totals: {
    engine6ToursAudited: number;
    itineraryRowsAudited: number;
    suspiciousRows: number;
    affectedTours: number;
  };
  topSuspiciousPatterns: Array<{
    reason: Engine6ItineraryTitleSuspiciousReason;
    count: number;
  }>;
  affectedProducts: Array<{
    productId: string;
    route: string;
    tourTitle: string;
    suspiciousRowCount: number;
    examples: string[];
  }>;
  rows: Engine6ItineraryTitleAuditRow[];
};

const SINGLE_GENERIC_WORDS = new Set([
  "then",
  "pass",
  "view",
  "visit",
  "stop",
  "continue",
  "next",
]);

const GENERIC_START_WORDS = [
  "your",
  "at",
  "visit",
  "enjoy",
  "explore",
  "discover",
  "continue",
  "pass",
  "view",
  "see",
  "learn",
  "ride",
  "travel",
];

const MARKETING_PROSE_TERMS = [
  "unforgettable",
  "adventure",
  "guided",
  "includes",
  "you'll",
  "you will",
  "youll",
  "treated to",
  "keep an eye",
  "journey through",
  "stunning",
  "complete with",
  "commentary",
];

const normalizeComparableText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[“”"'’.,;:!?()\[\]-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getWordCount = (value: string) =>
  value.trim().split(/\s+/).filter(Boolean).length;

const getFirstSentence = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  if (!trimmed) return "";
  const match = trimmed.match(/^.+?(?:[.!?](?=\s|$)|$)/);
  return match?.[0]?.trim() ?? trimmed;
};

const nearlyMatches = (title: string, firstSentence: string) => {
  const normalizedTitle = normalizeComparableText(title);
  const normalizedSentence = normalizeComparableText(firstSentence);
  if (!normalizedTitle || !normalizedSentence) return false;
  if (normalizedTitle === normalizedSentence) return true;
  if (normalizedSentence.startsWith(normalizedTitle)) {
    return normalizedTitle.length >= Math.min(20, normalizedSentence.length);
  }
  if (normalizedTitle.startsWith(normalizedSentence)) {
    return normalizedSentence.length >= Math.min(20, normalizedTitle.length);
  }
  return false;
};

export const auditEngine6ItineraryTitle = (args: {
  title: string | null | undefined;
  description?: string | null;
}): Engine6ItineraryTitleSuspiciousReason[] => {
  const title = args.title?.trim() ?? "";
  const description = args.description?.trim() ?? "";
  const reasons: Engine6ItineraryTitleSuspiciousReason[] = [];

  if (title.length < 3) reasons.push("missing-or-too-short");

  const normalizedTitle = normalizeComparableText(title);
  if (SINGLE_GENERIC_WORDS.has(normalizedTitle)) {
    reasons.push("single-generic-word");
  }

  const firstWord = normalizedTitle.split(" ")[0] ?? "";
  if (GENERIC_START_WORDS.includes(firstWord)) {
    reasons.push("generic-description-start");
  }

  if (getWordCount(title) > 8) reasons.push("more-than-eight-words");
  if (getWordCount(title) > 12) reasons.push("more-than-twelve-words");
  if (title.length > 80) reasons.push("more-than-eighty-characters");
  const titleWithoutCommonAbbreviationPeriods = title.replace(
    /\b(?:St|Mt|Dr|Mr|Mrs|Ms)\./g,
    match => match.slice(0, -1)
  );
  if (/[,.;"“”!]/.test(titleWithoutCommonAbbreviationPeriods)) {
    reasons.push("sentence-punctuation");
  }

  const firstSentence = getFirstSentence(description);
  if (firstSentence && nearlyMatches(title, firstSentence)) {
    reasons.push("matches-description-first-sentence");
  }

  if (
    normalizedTitle.startsWith("visit ") &&
    normalizeComparableText(description).startsWith(
      normalizedTitle.replace(/^visit\s+/, "")
    )
  ) {
    reasons.push("visit-prefix-matches-description");
  }

  const lowerTitle = title.toLowerCase();
  if (
    getWordCount(title) >= 7 &&
    MARKETING_PROSE_TERMS.some(term => lowerTitle.includes(term))
  ) {
    reasons.push("supplier-marketing-prose");
  }

  return Array.from(new Set(reasons));
};

const toRow = (
  tour: Engine6Tour,
  item: Engine6ItineraryItem,
  index: number
): Engine6ItineraryTitleAuditRow => ({
  productId: tour.productCode,
  route: tour.canonicalPath,
  tourTitle: tour.title,
  itineraryIndex: index,
  renderedTitle: item.title?.trim() || null,
  renderedDescription: item.description?.trim() || null,
  titleSource: item.titleSource ?? null,
  duration: item.duration ?? null,
  admissionStatus: item.admissionNote ?? null,
  suspiciousReasons: auditEngine6ItineraryTitle({
    title: item.title,
    description: item.description,
  }),
});

export const buildEngine6ItineraryTitleIntegrityAudit = (
  tours: Engine6Tour[],
  generatedAt = new Date().toISOString()
): Engine6ItineraryTitleAuditReport => {
  const allRows = tours.flatMap(tour =>
    tour.itinerary.map((item, index) => toRow(tour, item, index))
  );
  const rows = allRows.filter(row => row.suspiciousReasons.length > 0);
  const reasonCounts = new Map<Engine6ItineraryTitleSuspiciousReason, number>();

  rows.forEach(row => {
    row.suspiciousReasons.forEach(reason => {
      reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1);
    });
  });

  const affectedProductMap = new Map<
    string,
    Engine6ItineraryTitleAuditReport["affectedProducts"][number]
  >();
  rows.forEach(row => {
    const existing = affectedProductMap.get(row.productId) ?? {
      productId: row.productId,
      route: row.route,
      tourTitle: row.tourTitle,
      suspiciousRowCount: 0,
      examples: [],
    };
    existing.suspiciousRowCount += 1;
    if (existing.examples.length < 3 && row.renderedTitle) {
      existing.examples.push(row.renderedTitle);
    }
    affectedProductMap.set(row.productId, existing);
  });

  return {
    generatedAt,
    totals: {
      engine6ToursAudited: tours.length,
      itineraryRowsAudited: allRows.length,
      suspiciousRows: rows.length,
      affectedTours: affectedProductMap.size,
    },
    topSuspiciousPatterns: Array.from(reasonCounts.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason)),
    affectedProducts: Array.from(affectedProductMap.values()).sort(
      (a, b) =>
        b.suspiciousRowCount - a.suspiciousRowCount ||
        a.productId.localeCompare(b.productId)
    ),
    rows,
  };
};
