import { validateEngine6CreationContract } from "./creationValidation.js";
import {
  normalizeEngine6ItineraryComparisonText,
  rewriteEngine6ItineraryDescription,
} from "./itineraryGovernance.js";
import { classifyEngine6EditorialFindingSeverity } from "./engine6ParagonBuildScopeGovernance.js";
import type { Engine6Tour, Engine6ItineraryItem } from "./types.js";
import type { Engine6ValidationFixture } from "./validationFixtures.js";

export const ENGINE6_CREATION_SELF_HEALING_MODULE_ID =
  "engine6-creation-self-healing" as const;

export type Engine6CreationSelfHealingRepairKind =
  | "itinerary-summary-only"
  | "itinerary-stop-description-rewrite";

export type Engine6CreationSelfHealingRepair = {
  kind: Engine6CreationSelfHealingRepairKind;
  stopIndex?: number;
  detail: string;
  requiresHumanApproval: boolean;
};

export type Engine6CreationSelfHealingViolation = {
  message: string;
  severity: "blocking" | "warning" | "informational";
  repaired: boolean;
};

export type Engine6CreationSelfHealingReport = {
  moduleId: typeof ENGINE6_CREATION_SELF_HEALING_MODULE_ID;
  generatedAt: string;
  productCode: string;
  pass: boolean;
  initialViolations: Engine6CreationSelfHealingViolation[];
  repairs: Engine6CreationSelfHealingRepair[];
  remainingViolations: Engine6CreationSelfHealingViolation[];
  humanApprovalRequired: boolean;
  humanApprovalReasons: string[];
  idempotent: boolean;
};

type SourceItineraryStop = {
  title: string;
  description: string | null;
};

const structuredStopCountFromPayload = (
  rawPayload: Record<string, unknown>
) => {
  const product = (rawPayload.product ?? rawPayload) as Record<string, unknown>;
  const itineraryItems = Array.isArray(product.itineraryItems)
    ? (product.itineraryItems as unknown[])
    : Array.isArray(
          (product.itinerary as Record<string, unknown> | undefined)
            ?.itineraryItems
        )
      ? ((product.itinerary as Record<string, unknown>)
          .itineraryItems as unknown[])
      : [];

  return itineraryItems.filter(item => {
    if (!item || typeof item !== "object") {
      return false;
    }
    const row = item as Record<string, unknown>;
    return typeof row.title === "string" || typeof row.name === "string";
  }).length;
};

const getSourceItineraryStops = (
  rawPayload: Record<string, unknown>
): SourceItineraryStop[] => {
  const product = (rawPayload.product ?? rawPayload) as Record<string, unknown>;
  const itineraryItems = Array.isArray(product.itineraryItems)
    ? (product.itineraryItems as unknown[])
    : Array.isArray(
          (product.itinerary as Record<string, unknown> | undefined)
            ?.itineraryItems
        )
      ? ((product.itinerary as Record<string, unknown>)
          .itineraryItems as unknown[])
      : [];

  return itineraryItems
    .map(item => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const title =
        (typeof row.title === "string" && row.title.trim()) ||
        (typeof row.name === "string" && row.name.trim()) ||
        (typeof row.label === "string" && row.label.trim()) ||
        "";
      if (!title) return null;
      const description =
        typeof row.description === "string" && row.description.trim().length > 0
          ? row.description.trim()
          : null;
      return { title, description } satisfies SourceItineraryStop;
    })
    .filter((item): item is SourceItineraryStop => Boolean(item));
};

const parseDurationMinutes = (value: string | null | undefined) => {
  if (!value) return null;
  const compact = value.toLowerCase();
  const hourMatch = compact.match(/(\d+(?:\.\d+)?)\s*hour/);
  const minuteMatch = compact.match(/(\d+)\s*min/);
  const hours = hourMatch ? Number(hourMatch[1]) : 0;
  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
  const total = Math.round(hours * 60 + minutes);
  return Number.isFinite(total) && total > 0 ? total : null;
};

const isSimpleExperienceProfile = (tour: Engine6Tour) => {
  const durationMinutes = parseDurationMinutes(tour.durationText ?? null);
  const title = tour.title.toLowerCase();
  const category = (tour.primaryCategory ?? "").toString().toLowerCase();
  const simpleKeyword =
    /\b(short|cruise|catamaran|ferry|ride|sightseeing|boat|panoramic|scenic)\b/.test(
      `${title} ${category}`
    );
  const shortDuration =
    durationMinutes !== null ? durationMinutes <= 120 : false;
  return simpleKeyword || shortDuration;
};

const classifyCreationViolation = (
  message: string
): Engine6CreationSelfHealingViolation["severity"] =>
  classifyEngine6EditorialFindingSeverity(message);

const isItineraryRenderingViolation = (message: string) =>
  /timeline rendered without sufficient structured stop data|structured itinerary degraded|summary-only itinerary missing/i.test(
    message
  );

const isItineraryOriginalityViolation = (message: string) =>
  /itinerary originality validation failed|description matches viator text|closely mirrors viator/i.test(
    message
  );

const isNonMechanicalViolation = (message: string) =>
  /wrong destination|cross-destination|destination bleed|contradiction|claims activity|not in source|json-ld.*mismatch|merchant feed|governed description|missing commercial|unavailable|removed|blocked|misleading hero|published destination|route ownership drifted|parent city tours route|breadcrumb.*drifted|hero provenance|resolved engine6 hero/i.test(
    message
  );

const cloneTour = (tour: Engine6Tour): Engine6Tour =>
  JSON.parse(JSON.stringify(tour)) as Engine6Tour;

const governedFieldsSnapshot = (tour: Engine6Tour) => ({
  title: tour.title,
  heroImageUrl: tour.heroImageUrl,
  priceAmount: tour.priceAmount,
  priceFormatted: tour.priceFormatted,
  aggregateRating: tour.aggregateRating,
  reviewCount: tour.reviewCount,
  description: tour.description,
  overviewText: tour.overviewText,
  canonicalPath: tour.canonicalPath,
  city: tour.city,
  state: tour.state,
  bookingUrl: tour.bookingUrl,
});

export const applyEngine6ItinerarySummaryOnlyRepair = (args: {
  tour: Engine6Tour;
  rawPayload: Record<string, unknown>;
}): {
  tour: Engine6Tour;
  applied: boolean;
  detail: string;
} => {
  const structuredStopCount = structuredStopCountFromPayload(args.rawPayload);
  const simpleItineraryEligible = isSimpleExperienceProfile(args.tour);

  if (
    structuredStopCount >= 2 ||
    simpleItineraryEligible ||
    !args.tour.itinerarySummaryText?.trim()
  ) {
    return {
      tour: args.tour,
      applied: false,
      detail: "summary-only repair not applicable",
    };
  }

  const repairedTour = cloneTour(args.tour);
  repairedTour.itinerary = [];

  return {
    tour: repairedTour,
    applied: true,
    detail:
      "switched weak itinerary to summary-only rendering because mapped stop count is below timeline threshold",
  };
};

export const applyEngine6ItineraryOriginalityRepairs = (args: {
  tour: Engine6Tour;
  rawPayload: Record<string, unknown>;
}): {
  tour: Engine6Tour;
  repairs: Engine6CreationSelfHealingRepair[];
} => {
  const sourceStops = getSourceItineraryStops(args.rawPayload);
  const repairedTour = cloneTour(args.tour);
  const repairs: Engine6CreationSelfHealingRepair[] = [];

  sourceStops.forEach((sourceStop, index) => {
    const targetStop = repairedTour.itinerary[index];
    if (!targetStop || !sourceStop.description?.trim()) {
      return;
    }

    const targetDescription = targetStop.description?.trim() ?? "";
    const sourceDescription = sourceStop.description.trim();
    const matchesSource =
      normalizeEngine6ItineraryComparisonText(sourceDescription) ===
      normalizeEngine6ItineraryComparisonText(targetDescription);

    if (!matchesSource) {
      return;
    }

    const rewrittenDescription = rewriteEngine6ItineraryDescription({
      item: targetStop,
      index,
    });

    if (
      normalizeEngine6ItineraryComparisonText(rewrittenDescription) ===
      normalizeEngine6ItineraryComparisonText(sourceDescription)
    ) {
      repairs.push({
        kind: "itinerary-stop-description-rewrite",
        stopIndex: index,
        detail: `stop ${index + 1} (${sourceStop.title}) rewrite still mirrors source; human approval required`,
        requiresHumanApproval: true,
      });
      return;
    }

    const preservedFields: Pick<
      Engine6ItineraryItem,
      "title" | "stopType" | "duration" | "admissionNote" | "sectionLabel"
    > = {
      title: targetStop.title,
      stopType: targetStop.stopType,
      duration: targetStop.duration,
      admissionNote: targetStop.admissionNote,
      sectionLabel: targetStop.sectionLabel,
    };

    repairedTour.itinerary[index] = {
      ...targetStop,
      ...preservedFields,
      description: rewrittenDescription,
    };

    repairs.push({
      kind: "itinerary-stop-description-rewrite",
      stopIndex: index,
      detail: `rewrote stop ${index + 1} (${sourceStop.title}) description to restore itinerary originality`,
      requiresHumanApproval: false,
    });
  });

  return { tour: repairedTour, repairs };
};

export const runEngine6CreationSelfHealing = (args: {
  tour: Engine6Tour;
  rawPayload: Record<string, unknown>;
  fixture?: Engine6ValidationFixture;
  generatedAt?: string;
}): {
  tour: Engine6Tour;
  report: Engine6CreationSelfHealingReport;
} => {
  const beforeSnapshot = governedFieldsSnapshot(args.tour);
  const initialValidation = validateEngine6CreationContract({
    tour: args.tour,
    rawPayload: args.rawPayload,
    fixture: args.fixture,
  });

  const initialViolations: Engine6CreationSelfHealingViolation[] =
    initialValidation.violations.map(message => ({
      message,
      severity: classifyCreationViolation(message),
      repaired: false,
    }));

  let workingTour = cloneTour(args.tour);
  const repairs: Engine6CreationSelfHealingRepair[] = [];
  const humanApprovalReasons: string[] = [];

  const mechanicalViolations = initialValidation.violations.filter(
    message => !isNonMechanicalViolation(message)
  );

  const hasRenderingIssue = mechanicalViolations.some(isItineraryRenderingViolation);
  const hasOriginalityIssue = mechanicalViolations.some(
    isItineraryOriginalityViolation
  );

  if (hasRenderingIssue) {
    const renderingRepair = applyEngine6ItinerarySummaryOnlyRepair({
      tour: workingTour,
      rawPayload: args.rawPayload,
    });
    if (renderingRepair.applied) {
      workingTour = renderingRepair.tour;
      repairs.push({
        kind: "itinerary-summary-only",
        detail: renderingRepair.detail,
        requiresHumanApproval: false,
      });
    }
  }

  if (hasOriginalityIssue) {
    const originalityRepair = applyEngine6ItineraryOriginalityRepairs({
      tour: workingTour,
      rawPayload: args.rawPayload,
    });
    workingTour = originalityRepair.tour;
    repairs.push(...originalityRepair.repairs);
    for (const repair of originalityRepair.repairs) {
      if (repair.requiresHumanApproval) {
        humanApprovalReasons.push(repair.detail);
      }
    }
  }

  for (const violation of initialValidation.violations.filter(
    isNonMechanicalViolation
  )) {
    humanApprovalReasons.push(violation);
  }

  const afterSnapshot = governedFieldsSnapshot(workingTour);
  const governedFieldsUnchanged =
    beforeSnapshot.title === afterSnapshot.title &&
    beforeSnapshot.heroImageUrl === afterSnapshot.heroImageUrl &&
    beforeSnapshot.priceAmount === afterSnapshot.priceAmount &&
    beforeSnapshot.priceFormatted === afterSnapshot.priceFormatted &&
    beforeSnapshot.aggregateRating === afterSnapshot.aggregateRating &&
    beforeSnapshot.reviewCount === afterSnapshot.reviewCount &&
    beforeSnapshot.description === afterSnapshot.description &&
    beforeSnapshot.overviewText === afterSnapshot.overviewText &&
    beforeSnapshot.canonicalPath === afterSnapshot.canonicalPath &&
    beforeSnapshot.city === afterSnapshot.city &&
    beforeSnapshot.state === afterSnapshot.state &&
    beforeSnapshot.bookingUrl === afterSnapshot.bookingUrl;

  const finalValidation = validateEngine6CreationContract({
    tour: workingTour,
    rawPayload: args.rawPayload,
    fixture: args.fixture,
  });

  const repairedMessages = new Set(
    initialValidation.violations.filter(message => {
      return !finalValidation.violations.includes(message);
    })
  );

  const remainingViolations: Engine6CreationSelfHealingViolation[] =
    finalValidation.violations.map(message => ({
      message,
      severity: classifyCreationViolation(message),
      repaired: false,
    }));

  const updatedInitialViolations = initialViolations.map(violation => ({
    ...violation,
    repaired: repairedMessages.has(violation.message),
  }));

  const blockingRemaining = remainingViolations.filter(
    violation => violation.severity === "blocking"
  );

  const idempotent =
    repairs.length === 0 ||
    JSON.stringify(workingTour.itinerary) === JSON.stringify(args.tour.itinerary);

  const report: Engine6CreationSelfHealingReport = {
    moduleId: ENGINE6_CREATION_SELF_HEALING_MODULE_ID,
    generatedAt: args.generatedAt ?? new Date().toISOString(),
    productCode: args.tour.productCode,
    pass: blockingRemaining.length === 0 && governedFieldsUnchanged,
    initialViolations: updatedInitialViolations,
    repairs,
    remainingViolations,
    humanApprovalRequired: humanApprovalReasons.length > 0,
    humanApprovalReasons,
    idempotent,
  };

  return { tour: workingTour, report };
};

export const formatEngine6CreationSelfHealingReport = (
  report: Engine6CreationSelfHealingReport
) => {
  const lines = [
    `# Engine6 Creation Self-Healing`,
    ``,
    `Generated: ${report.generatedAt}`,
    `Product: ${report.productCode}`,
    `Pass: ${report.pass ? "yes" : "no"}`,
    `Idempotent: ${report.idempotent ? "yes" : "no"}`,
    `Human approval required: ${report.humanApprovalRequired ? "yes" : "no"}`,
    ``,
    `## Initial violations (${report.initialViolations.length})`,
    ...report.initialViolations.map(
      violation =>
        `- [${violation.severity}]${violation.repaired ? " (repaired)" : ""} ${violation.message}`
    ),
    ``,
    `## Repairs (${report.repairs.length})`,
    ...report.repairs.map(
      repair =>
        `- [${repair.kind}]${repair.requiresHumanApproval ? " (human approval)" : ""} ${repair.detail}`
    ),
    ``,
    `## Remaining violations (${report.remainingViolations.length})`,
    ...report.remainingViolations.map(
      violation => `- [${violation.severity}] ${violation.message}`
    ),
    ``,
    `## Human approval reasons`,
    ...(report.humanApprovalReasons.length > 0
      ? report.humanApprovalReasons.map(reason => `- ${reason}`)
      : ["- none"]),
  ];

  return lines.join("\n");
};
