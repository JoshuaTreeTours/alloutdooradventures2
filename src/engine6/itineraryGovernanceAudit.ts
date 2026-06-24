import { isEngine6ProseItineraryTitle } from "../../api/engine6/divergedItineraryTitle";
import {
  fuzzyMatchEngine6ItineraryStopTitles,
  pickEngine6DivergedItineraryContentSource,
} from "./mergeEngine6LiveItinerary";
import {
  auditEngine6ItineraryTitle,
  type Engine6ItineraryTitleAuditReport,
  type Engine6ItineraryTitleAuditRow,
  type Engine6ItineraryTitleSuspiciousReason,
  buildEngine6ItineraryTitleIntegrityAudit,
} from "./itineraryTitleIntegrityAudit";
import {
  isEngine6SupplierMirroredItineraryText,
  normalizeEngine6ItineraryComparisonText,
} from "./itineraryGovernance";
import type { Engine6ItineraryItem, Engine6Tour } from "./types";
import type { Engine6ItineraryTitleSource } from "../../api/engine6/itineraryTitlePolicy";

export type Engine6ItineraryGovernanceFindingSeverity = "critical" | "review";

export type Engine6ItineraryGovernanceFindingReason =
  | Engine6ItineraryTitleSuspiciousReason
  | "prose-title"
  | "more-than-twelve-words"
  | "title-description-semantic-mismatch"
  | "title-equals-description"
  | "verbatim-supplier-description"
  | "mixed-source-itinerary-row";

export type Engine6ItineraryGovernanceAuditRow = Engine6ItineraryTitleAuditRow & {
  findings: Array<{
    reason: Engine6ItineraryGovernanceFindingReason;
    severity: Engine6ItineraryGovernanceFindingSeverity;
  }>;
};

export type Engine6ItineraryGovernanceAuditReport = Omit<
  Engine6ItineraryTitleAuditReport,
  "rows" | "topSuspiciousPatterns"
> & {
  totals: Engine6ItineraryTitleAuditReport["totals"] & {
    criticalRows: number;
    reviewRows: number;
  };
  topFindings: Array<{
    reason: Engine6ItineraryGovernanceFindingReason;
    severity: Engine6ItineraryGovernanceFindingSeverity;
    count: number;
  }>;
  rows: Engine6ItineraryGovernanceAuditRow[];
};

const CRITICAL_FINDINGS = new Set<Engine6ItineraryGovernanceFindingReason>([
  "prose-title",
  "more-than-twelve-words",
  "title-description-semantic-mismatch",
  "title-equals-description",
  "verbatim-supplier-description",
  "mixed-source-itinerary-row",
  "matches-description-first-sentence",
  "visit-prefix-matches-description",
  "supplier-marketing-prose",
]);

const getWordCount = (value: string) =>
  value.trim().split(/\s+/).filter(Boolean).length;

const normalizeText = (value: string) =>
  normalizeEngine6ItineraryComparisonText(value);

const wordTokens = (value: string) =>
  normalizeText(value)
    .split(" ")
    .filter(token => token.length > 2);

const OPERATIONAL_TITLE_PATTERN =
  /\b(?:departure|pickup|return|drop[- ]?off|boarding|briefing|check[- ]?in|launch and safety|preflight|launch area|hotel pickup|afternoon hotel)\b/i;

export const auditEngine6ItineraryTitleDescriptionAlignment = (args: {
  title: string | null | undefined;
  description?: string | null;
}): Engine6ItineraryGovernanceFindingReason[] => {
  const title = args.title?.trim() ?? "";
  const description = args.description?.trim() ?? "";
  if (!title || !description) return [];

  const reasons: Engine6ItineraryGovernanceFindingReason[] = [];
  const normalizedTitle = normalizeText(title);
  const normalizedDescription = normalizeText(description);

  if (normalizedTitle && normalizedTitle === normalizedDescription) {
    reasons.push("title-equals-description");
    return reasons;
  }

  if (OPERATIONAL_TITLE_PATTERN.test(title)) {
    return reasons;
  }

  if (fuzzyMatchEngine6ItineraryStopTitles(title, description)) {
    return reasons;
  }

  const descriptionTokens = new Set(wordTokens(description));
  if (wordTokens(title).some(token => descriptionTokens.has(token))) {
    return reasons;
  }

  reasons.push("title-description-semantic-mismatch");
  return reasons;
};

export const auditEngine6ItineraryMixedSourceRow = (args: {
  title: string;
  titleSource?: Engine6ItineraryTitleSource | null;
  nativeItem?: Pick<Engine6ItineraryItem, "title" | "description">;
  liveItem?: Pick<Engine6ItineraryItem, "title" | "description">;
  renderedDescription?: string | null;
}): boolean => {
  const renderedDescription = args.renderedDescription?.trim();
  if (!renderedDescription || !args.nativeItem || !args.liveItem) {
    return false;
  }

  const nativeDescription = args.nativeItem.description?.trim() ?? "";
  const liveDescription = args.liveItem.description?.trim() ?? "";
  if (!nativeDescription || !liveDescription) {
    return false;
  }

  if (normalizeText(nativeDescription) === normalizeText(liveDescription)) {
    return false;
  }

  const expectedSource = pickEngine6DivergedItineraryContentSource({
    resolvedTitle: args.title,
    titleSource: args.titleSource ?? "description-inferred",
    nativeItem: args.nativeItem,
    liveItem: args.liveItem,
  });
  const expectedDescription =
    expectedSource === "native" ? nativeDescription : liveDescription;

  return (
    normalizeText(renderedDescription) !== normalizeText(expectedDescription)
  );
};

export const auditEngine6ItineraryGovernanceRow = (args: {
  item: Engine6ItineraryItem;
  index: number;
  sourceDescription?: string | null;
  nativeItem?: Engine6ItineraryItem;
  liveItem?: Engine6ItineraryItem;
}): Engine6ItineraryGovernanceAuditRow["findings"] => {
  const title = args.item.title?.trim() ?? "";
  const description = args.item.description?.trim() ?? "";
  const findings: Engine6ItineraryGovernanceAuditRow["findings"] = [];

  const addFinding = (
    reason: Engine6ItineraryGovernanceFindingReason,
    severity: Engine6ItineraryGovernanceFindingSeverity
  ) => {
    findings.push({ reason, severity });
  };

  for (const reason of auditEngine6ItineraryTitle({
    title,
    description,
  })) {
    addFinding(
      reason,
      CRITICAL_FINDINGS.has(reason) ? "critical" : "review"
    );
  }

  if (title && isEngine6ProseItineraryTitle(title)) {
    addFinding("prose-title", "critical");
  }

  if (getWordCount(title) > 12) {
    addFinding("more-than-twelve-words", "critical");
  }

  for (const reason of auditEngine6ItineraryTitleDescriptionAlignment({
    title,
    description,
  })) {
    addFinding(reason, "critical");
  }

  const sourceDescription = args.sourceDescription?.trim();
  if (
    sourceDescription &&
    description &&
    isEngine6SupplierMirroredItineraryText({
      source: sourceDescription,
      target: description,
    })
  ) {
    addFinding("verbatim-supplier-description", "critical");
  }

  if (
    args.nativeItem &&
    args.liveItem &&
    auditEngine6ItineraryMixedSourceRow({
      title,
      titleSource: args.item.titleSource,
      nativeItem: args.nativeItem,
      liveItem: args.liveItem,
      renderedDescription: description,
    })
  ) {
    addFinding("mixed-source-itinerary-row", "critical");
  }

  const deduped = new Map<
    Engine6ItineraryGovernanceFindingReason,
    Engine6ItineraryGovernanceAuditRow["findings"][number]
  >();
  for (const finding of findings) {
    const existing = deduped.get(finding.reason);
    if (!existing || finding.severity === "critical") {
      deduped.set(finding.reason, finding);
    }
  }

  return Array.from(deduped.values());
};

export const buildEngine6ItineraryGovernanceAudit = (
  tours: Engine6Tour[],
  generatedAt = new Date().toISOString()
): Engine6ItineraryGovernanceAuditReport => {
  const titleAudit = buildEngine6ItineraryTitleIntegrityAudit(
    tours,
    generatedAt
  );
  const rows = tours.flatMap(tour =>
    tour.itinerary.map((item, index) => {
      const suspiciousReasons = auditEngine6ItineraryTitle({
        title: item.title,
        description: item.description,
      });
      const findings = auditEngine6ItineraryGovernanceRow({
        item,
        index,
      });

      return {
        productId: tour.productCode,
        route: tour.canonicalPath,
        tourTitle: tour.title,
        itineraryIndex: index,
        renderedTitle: item.title?.trim() || null,
        renderedDescription: item.description?.trim() || null,
        titleSource: item.titleSource ?? null,
        duration: item.duration ?? null,
        admissionStatus: item.admissionNote ?? null,
        suspiciousReasons,
        findings,
      };
    })
  );

  const flaggedRows = rows.filter(row => row.findings.length > 0);
  const findingCounts = new Map<
    string,
    { reason: Engine6ItineraryGovernanceFindingReason; severity: Engine6ItineraryGovernanceFindingSeverity; count: number }
  >();

  flaggedRows.forEach(row => {
    row.findings.forEach(finding => {
      const key = `${finding.severity}:${finding.reason}`;
      const existing = findingCounts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        findingCounts.set(key, { ...finding, count: 1 });
      }
    });
  });

  const criticalRows = flaggedRows.filter(row =>
    row.findings.some(finding => finding.severity === "critical")
  ).length;
  const reviewRows = flaggedRows.filter(
    row =>
      row.findings.some(finding => finding.severity === "review") &&
      !row.findings.some(finding => finding.severity === "critical")
  ).length;

  return {
    generatedAt,
    totals: {
      ...titleAudit.totals,
      criticalRows,
      reviewRows,
    },
    topFindings: Array.from(findingCounts.values()).sort(
      (a, b) =>
        (a.severity === "critical" ? 0 : 1) -
          (b.severity === "critical" ? 0 : 1) ||
        b.count - a.count ||
        a.reason.localeCompare(b.reason)
    ),
    affectedProducts: titleAudit.affectedProducts,
    rows: flaggedRows,
  };
};
