import type { Engine6Tour } from "./types";
import { ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS } from "./viatorPublicAvailability";

export type Engine6InventoryHealthCommercialFields = {
  bookingUrl: boolean;
  image: boolean;
  price: boolean;
  rating: boolean;
  reviewCount: boolean;
};

export type Engine6InventoryHealthRecommendation = {
  productCode: string;
  title: string;
  route: string;
  score: number;
  commercialFieldsPresent: Engine6InventoryHealthCommercialFields;
};

export type Engine6InventoryHealthFinding = {
  unhealthyProductCode: string;
  unhealthyTitle: string;
  unhealthyRoute: string;
  reasons: string[];
  recommendedReplacement: Engine6InventoryHealthRecommendation | null;
  commercialFieldsPresent: Engine6InventoryHealthCommercialFields;
};

export type Engine6InventoryHealthReport = {
  generatedAt: string;
  auditedSurfaceProductCodes: string[];
  findings: Engine6InventoryHealthFinding[];
  pass: boolean;
};

export type BuildEngine6InventoryHealthReportArgs = {
  tours: readonly Engine6Tour[];
  surfacedProductCodes?: readonly string[];
  unavailableProductCodes?: readonly string[];
  excludedReplacementProductCodes?: readonly string[];
  motivatingProductCodes?: readonly string[];
  generatedAt?: string;
};

const DEFAULT_MOTIVATING_PRODUCT_CODES = ["447486P2"];

const normalizeProductCode = (value: string | null | undefined) =>
  value?.trim().toUpperCase() ?? "";

const hasText = (value: string | null | undefined) => Boolean(value?.trim());

export const resolveEngine6InventoryCommercialFields = (
  tour: Engine6Tour
): Engine6InventoryHealthCommercialFields => ({
  bookingUrl: hasText(tour.bookingUrl),
  image: hasText(tour.heroImageUrl) || hasText(tour.resolvedImageUrl),
  price: typeof tour.priceAmount === "number" && Number.isFinite(tour.priceAmount),
  rating:
    typeof tour.aggregateRating === "number" && Number.isFinite(tour.aggregateRating),
  reviewCount:
    typeof tour.reviewCount === "number" && Number.isFinite(tour.reviewCount),
});

const missingCommercialFieldReasons = (
  fields: Engine6InventoryHealthCommercialFields
) =>
  Object.entries(fields)
    .filter(([, present]) => !present)
    .map(([field]) => `missing governed commercial field: ${field}`);

const hasRequiredReplacementCommercialFields = (
  fields: Engine6InventoryHealthCommercialFields
) =>
  fields.bookingUrl && fields.image && fields.price && fields.rating && fields.reviewCount;

const isActiveViatorTour = (
  tour: Engine6Tour,
  unavailableProductCodes: ReadonlySet<string>
) =>
  tour.diagnostics.source !== "legacy-fh-migrated" &&
  tour.ownership.ctaOwner === "viator" &&
  !unavailableProductCodes.has(normalizeProductCode(tour.productCode));

const sharedCategoryScore = (target: Engine6Tour, candidate: Engine6Tour) => {
  const targetCategories = new Set([
    ...target.categories,
    ...target.activityCategories.map(category => category.slug),
    target.primaryCategory ?? "",
    target.primaryDisplayCategory ?? "",
  ].map(value => value.toLowerCase()).filter(Boolean));

  const candidateCategories = [
    ...candidate.categories,
    ...candidate.activityCategories.map(category => category.slug),
    candidate.primaryCategory ?? "",
    candidate.primaryDisplayCategory ?? "",
  ].map(value => value.toLowerCase()).filter(Boolean);

  return candidateCategories.some(category => targetCategories.has(category)) ? 100 : 0;
};

const toRecommendation = (
  candidate: Engine6Tour,
  target: Engine6Tour,
  surfacedReplacementCodes: ReadonlySet<string>
): Engine6InventoryHealthRecommendation => {
  const commercialFieldsPresent = resolveEngine6InventoryCommercialFields(candidate);
  const score =
    1000 +
    sharedCategoryScore(target, candidate) +
    (candidate.primaryCategory === target.primaryCategory ? 50 : 0) +
    (!surfacedReplacementCodes.has(normalizeProductCode(candidate.productCode)) ? 25 : 0) +
    (commercialFieldsPresent.bookingUrl ? 10 : 0) +
    (commercialFieldsPresent.image ? 10 : 0) +
    (commercialFieldsPresent.price ? 10 : 0) +
    (commercialFieldsPresent.rating ? 10 : 0) +
    (commercialFieldsPresent.reviewCount ? 10 : 0) +
    Math.min(candidate.reviewCount ?? 0, 1000) / 1000;

  return {
    productCode: candidate.productCode,
    title: candidate.title,
    route: candidate.canonicalPath,
    score,
    commercialFieldsPresent,
  };
};

export const recommendEngine6ReplacementCandidate = (args: {
  unhealthyTour: Engine6Tour;
  tours: readonly Engine6Tour[];
  unavailableProductCodes: ReadonlySet<string>;
  excludedReplacementProductCodes: ReadonlySet<string>;
}) => {
  const target = args.unhealthyTour;
  const targetCode = normalizeProductCode(target.productCode);

  const candidates = args.tours
    .filter(candidate => normalizeProductCode(candidate.productCode) !== targetCode)
    .filter(candidate => candidate.city === target.city && candidate.state === target.state)
    .filter(candidate => isActiveViatorTour(candidate, args.unavailableProductCodes))
    .filter(candidate =>
      !args.excludedReplacementProductCodes.has(normalizeProductCode(candidate.productCode))
    )
    .filter(candidate =>
      hasRequiredReplacementCommercialFields(
        resolveEngine6InventoryCommercialFields(candidate)
      )
    )
    .map(candidate =>
      toRecommendation(candidate, target, args.excludedReplacementProductCodes)
    )
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title));

  return candidates[0] ?? null;
};

export const buildEngine6InventoryHealthReplacementReport = (
  args: BuildEngine6InventoryHealthReportArgs
): Engine6InventoryHealthReport => {
  const unavailableProductCodes = new Set(
    (args.unavailableProductCodes ?? Object.keys(ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS)).map(
      normalizeProductCode
    )
  );
  const surfacedProductCodes = new Set(
    (args.surfacedProductCodes ?? args.tours.map(tour => tour.productCode)).map(
      normalizeProductCode
    )
  );
  const motivatingProductCodes = new Set(
    (args.motivatingProductCodes ?? DEFAULT_MOTIVATING_PRODUCT_CODES).map(
      normalizeProductCode
    )
  );
  const excludedReplacementProductCodes = new Set(
    (args.excludedReplacementProductCodes ?? []).map(normalizeProductCode)
  );

  const findings: Engine6InventoryHealthFinding[] = [];

  for (const tour of args.tours) {
    const productCode = normalizeProductCode(tour.productCode);
    if (!surfacedProductCodes.has(productCode)) {
      continue;
    }

    const commercialFieldsPresent = resolveEngine6InventoryCommercialFields(tour);
    const reasons = [
      ...missingCommercialFieldReasons(commercialFieldsPresent),
      ...(unavailableProductCodes.has(productCode)
        ? ["current Engine6/Viator source marks product retired or unavailable"]
        : []),
      ...(motivatingProductCodes.has(productCode) && !isActiveViatorTour(tour, unavailableProductCodes)
        ? ["motivating inventory-health case is still surfaced"]
        : []),
    ];

    if (reasons.length === 0) {
      continue;
    }

    findings.push({
      unhealthyProductCode: tour.productCode,
      unhealthyTitle: tour.title,
      unhealthyRoute: tour.canonicalPath,
      reasons,
      recommendedReplacement: recommendEngine6ReplacementCandidate({
        unhealthyTour: tour,
        tours: args.tours,
        unavailableProductCodes,
        excludedReplacementProductCodes: new Set([
          ...excludedReplacementProductCodes,
          productCode,
        ]),
      }),
      commercialFieldsPresent,
    });
  }

  return {
    generatedAt: args.generatedAt ?? new Date().toISOString(),
    auditedSurfaceProductCodes: [...surfacedProductCodes].sort(),
    findings: findings.sort((left, right) =>
      left.unhealthyProductCode.localeCompare(right.unhealthyProductCode)
    ),
    pass: findings.length === 0,
  };
};

export const formatEngine6InventoryHealthReplacementReport = (
  report: Engine6InventoryHealthReport
) => {
  const fieldSummary = (fields: Engine6InventoryHealthCommercialFields) =>
    Object.entries(fields)
      .map(([field, present]) => `${field}:${present ? "yes" : "no"}`)
      .join(", ");
  const escapeCell = (value: string | number | null | undefined) =>
    String(value ?? "")
      .replace(/\|/g, "\\|")
      .replace(/\n/g, " ");

  const lines = [
    "# Engine6 Inventory Health Replacement Recommendations",
    "",
    "Warning-only governance report. This audit does not replace products automatically; every replacement remains manual approval.",
    "",
    `Generated: ${report.generatedAt}`,
    `Passed: ${report.pass}`,
    `Audited surfaced products: ${report.auditedSurfaceProductCodes.length}`,
    `Unhealthy surfaced products: ${report.findings.length}`,
    "",
  ];

  if (report.findings.length === 0) {
    lines.push("No unhealthy surfaced Engine6 products detected.", "");
    return lines.join("\n");
  }

  lines.push(
    "| Unhealthy product | Route | Reason | Recommended replacement | Replacement route | Replacement commercial fields |",
    "| --- | --- | --- | --- | --- | --- |"
  );

  for (const finding of report.findings) {
    const replacement = finding.recommendedReplacement;
    lines.push(
      `| ${escapeCell(`${finding.unhealthyProductCode} / ${finding.unhealthyTitle}`)} | ${escapeCell(finding.unhealthyRoute)} | ${escapeCell(finding.reasons.join("; "))} | ${escapeCell(replacement ? `${replacement.productCode} / ${replacement.title}` : "none found")} | ${escapeCell(replacement?.route ?? "")} | ${escapeCell(replacement ? fieldSummary(replacement.commercialFieldsPresent) : "")} |`
    );
  }

  lines.push("");
  return lines.join("\n");
};
