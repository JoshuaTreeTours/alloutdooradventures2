import { toEngine6Card } from "./cards.js";
import {
  inferEngine6PrincipalExperienceTypeFromProduct,
  type Engine6PrincipalExperienceType,
} from "./engine6PrincipalExperienceType.js";
import {
  buildEngine6CardDescription,
  resolveEngine6GovernedProductDescription,
  resolveEngine6SchemaProductDescription,
} from "./governedEditorialDescriptions.js";
import { getEngine6TourRatingSourceOfTruth } from "./ratingSourceOfTruth.js";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph.js";
import {
  compareMerchantFeedRowToProductSchema,
  type MerchantFeedParityRow,
} from "./merchantFeedParity.js";
import type { Engine6Tour } from "./types.js";

export type Engine6RenderingSurface =
  | "listing-card"
  | "detail-page"
  | "merchant-feed"
  | "product-json-ld"
  | "destination-page";

export type Engine6RenderingParityField =
  | "product-title"
  | "product-code"
  | "price"
  | "rating"
  | "review-count"
  | "duration"
  | "principal-experience-type"
  | "hero-image"
  | "overview-description"
  | "destination-route";

export type Engine6RenderingParityFinding = {
  productCode: string;
  field: Engine6RenderingParityField;
  surfaces: Engine6RenderingSurface[];
  detail: string;
};

export type Engine6RenderingParityProductAudit = {
  productCode: string;
  passed: boolean;
  findings: Engine6RenderingParityFinding[];
};

export type Engine6RenderingParityGovernanceReport = {
  generatedAt: string;
  productsAudited: number;
  productsPassed: number;
  productsFailed: number;
  findings: Engine6RenderingParityFinding[];
  passed: boolean;
};

const normalizeText = (value: string | null | undefined) =>
  (value ?? "")
    .toLowerCase()
    .replace(/<[^>]+>/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const activityKeywordsForExperienceType = (
  experienceType: Engine6PrincipalExperienceType
): RegExp[] => {
  switch (experienceType) {
    case "rafting":
      return [/\braft(?:ing|s)?\b/i, /\bwhite[- ]?water\b/i];
    case "scenic-float":
      return [/\bfloat\b/i, /\bscenic float\b/i];
    case "driving-tour":
      return [
        /\bdriving tour\b/i,
        /\bvan tour\b/i,
        /\bred bus\b/i,
        /\bgoing-to-the-sun\b/i,
        /\bscenic drive\b/i,
      ];
    case "hiking":
      return [/\bhike\b/i, /\bhiking\b/i, /\btrek\b/i];
    case "wildlife-tour":
      return [/\bwildlife\b/i, /\bbear\b/i, /\bmoose\b/i];
    case "bike-tour":
      return [/\bbike\b/i, /\bcycl/i, /\be-?bike\b/i];
    case "kayak-rental":
      return [/\bkayak\b/i, /\bpaddleboard\b/i, /\bcanoe\b/i];
    case "helicopter-tour":
      return [/\bhelicopter\b/i, /\bflightseeing\b/i];
    case "food-wine-cultural-tour":
      return [/\bfood tour\b/i, /\bwine\b/i, /\bcultural\b/i];
    case "boat-tour":
      return [/\bboat\b/i, /\bcruise\b/i, /\bferry\b/i];
    default:
      return [];
  }
};

const unrelatedActivityKeywords = (
  experienceType: Engine6PrincipalExperienceType
): RegExp[] => {
  const allTypes: Engine6PrincipalExperienceType[] = [
    "rafting",
    "scenic-float",
    "driving-tour",
    "hiking",
    "wildlife-tour",
    "bike-tour",
    "kayak-rental",
    "helicopter-tour",
    "food-wine-cultural-tour",
    "boat-tour",
  ];

  return allTypes
    .filter(type => type !== experienceType)
    .flatMap(type => activityKeywordsForExperienceType(type));
};

export const auditEngine6DescriptionExperienceAlignment = (args: {
  productCode: string;
  experienceType: Engine6PrincipalExperienceType;
  texts: Array<{ surface: Engine6RenderingSurface; text: string }>;
}): Engine6RenderingParityFinding[] => {
  const findings: Engine6RenderingParityFinding[] = [];
  const unrelatedPatterns = unrelatedActivityKeywords(args.experienceType);

  if (unrelatedPatterns.length === 0) {
    return findings;
  }

  for (const entry of args.texts) {
    const normalized = normalizeText(entry.text);
    if (!normalized) {
      continue;
    }

    for (const pattern of unrelatedPatterns) {
      if (pattern.test(entry.text)) {
        findings.push({
          productCode: args.productCode,
          field: "overview-description",
          surfaces: [entry.surface],
          detail: `description references unrelated activity (${pattern}) for ${args.experienceType} product`,
        });
        break;
      }
    }
  }

  return findings;
};

export const auditEngine6TourRenderingParity = (args: {
  tour: Engine6Tour;
  merchantFeedRow?: MerchantFeedParityRow | null;
  listingHeroImage?: string | null;
  listingTitle?: string | null;
  principalExperienceType?: Engine6PrincipalExperienceType;
}): Engine6RenderingParityProductAudit => {
  const findings: Engine6RenderingParityFinding[] = [];
  const tour = args.tour;
  const card = toEngine6Card(tour);
  const schema = buildEngine6SchemaGraph(tour);
  const graph = schema["@graph"] as Array<Record<string, unknown>>;
  const productNode = graph.find(node => node["@type"] === "Product");
  const offerNode = graph.find(node => node["@type"] === "Offer");
  const aggregateRatingNode = graph.find(
    node => node["@type"] === "AggregateRating"
  );
  const ratingSource = getEngine6TourRatingSourceOfTruth(tour);
  const principalExperienceType =
    args.principalExperienceType ??
    inferEngine6PrincipalExperienceTypeFromProduct({
      experienceType: tour.primaryCategory ?? tour.categoryLabel,
      title: tour.title,
      categoryLabel: tour.categoryLabel,
      categories: tour.categories.map(String),
    });

  const schemaDescription = resolveEngine6SchemaProductDescription(tour);
  const cardDescription = buildEngine6CardDescription(tour);
  const governedDescription = resolveEngine6GovernedProductDescription(tour);

  if (card.title !== tour.title) {
    findings.push({
      productCode: tour.productCode,
      field: "product-title",
      surfaces: ["listing-card", "detail-page"],
      detail: `listing card title "${card.title}" diverged from detail title "${tour.title}"`,
    });
  }

  if (args.listingTitle && args.listingTitle !== tour.title) {
    findings.push({
      productCode: tour.productCode,
      field: "product-title",
      surfaces: ["listing-card", "destination-page"],
      detail: `destination listing title "${args.listingTitle}" diverged from tour title "${tour.title}"`,
    });
  }

  if (card.imageUrl !== tour.heroImageUrl) {
    findings.push({
      productCode: tour.productCode,
      field: "hero-image",
      surfaces: ["listing-card", "detail-page"],
      detail: "listing card hero diverged from detail page hero",
    });
  }

  if (
    args.listingHeroImage &&
    tour.heroImageUrl &&
    args.listingHeroImage !== tour.heroImageUrl
  ) {
    findings.push({
      productCode: tour.productCode,
      field: "hero-image",
      surfaces: ["listing-card", "destination-page"],
      detail: "destination listing hero diverged from detail page hero",
    });
  }

  const schemaImage =
    typeof productNode?.image === "string" ? productNode.image : null;
  if (schemaImage && tour.heroImageUrl && schemaImage !== tour.heroImageUrl) {
    findings.push({
      productCode: tour.productCode,
      field: "hero-image",
      surfaces: ["detail-page", "product-json-ld"],
      detail: "Product JSON-LD image diverged from detail hero",
    });
  }

  const schemaPrice =
    typeof offerNode?.price === "number" ? offerNode.price : null;
  if (schemaPrice !== tour.priceAmount) {
    findings.push({
      productCode: tour.productCode,
      field: "price",
      surfaces: ["detail-page", "product-json-ld"],
      detail: `Offer.price ${schemaPrice ?? "null"} diverged from tour price ${tour.priceAmount ?? "null"}`,
    });
  }

  const schemaRating =
    typeof aggregateRatingNode?.ratingValue === "number"
      ? aggregateRatingNode.ratingValue
      : null;
  if (schemaRating !== ratingSource.aggregateRating) {
    findings.push({
      productCode: tour.productCode,
      field: "rating",
      surfaces: ["detail-page", "product-json-ld"],
      detail: `AggregateRating.ratingValue ${schemaRating ?? "null"} diverged from source-of-truth ${ratingSource.aggregateRating ?? "null"}`,
    });
  }

  const schemaReviewCount =
    typeof aggregateRatingNode?.reviewCount === "number"
      ? aggregateRatingNode.reviewCount
      : null;
  if (schemaReviewCount !== ratingSource.reviewCount) {
    findings.push({
      productCode: tour.productCode,
      field: "review-count",
      surfaces: ["detail-page", "product-json-ld"],
      detail: `AggregateRating.reviewCount ${schemaReviewCount ?? "null"} diverged from source-of-truth ${ratingSource.reviewCount ?? "null"}`,
    });
  }

  if (args.merchantFeedRow) {
    const merchantParity = compareMerchantFeedRowToProductSchema(
      tour,
      args.merchantFeedRow
    );
    if (!merchantParity.pass) {
      for (const mismatch of merchantParity.mismatches) {
        const field: Engine6RenderingParityField = mismatch.includes(".title:")
          ? "product-title"
          : mismatch.includes(".image_link:")
            ? "hero-image"
            : mismatch.includes(".price:")
              ? "price"
              : mismatch.includes(".average_rating:")
                ? "rating"
                : mismatch.includes(".review_count:") ||
                    mismatch.includes(".rating_count:")
                  ? "review-count"
                  : mismatch.includes(".id:")
                    ? "product-code"
                    : "overview-description";

        findings.push({
          productCode: tour.productCode,
          field,
          surfaces: ["merchant-feed", "product-json-ld"],
          detail: mismatch,
        });
      }
    }
  }

  if (!tour.canonicalPath.startsWith("/destinations/")) {
    findings.push({
      productCode: tour.productCode,
      field: "destination-route",
      surfaces: ["detail-page"],
      detail: "canonical path is not a destination route",
    });
  }

  findings.push(
    ...auditEngine6DescriptionExperienceAlignment({
      productCode: tour.productCode,
      experienceType: principalExperienceType,
      texts: [
        { surface: "detail-page", text: tour.overviewText ?? tour.description },
        { surface: "listing-card", text: cardDescription },
        { surface: "product-json-ld", text: schemaDescription },
        { surface: "merchant-feed", text: governedDescription },
      ],
    })
  );

  return {
    productCode: tour.productCode,
    passed: findings.length === 0,
    findings,
  };
};

export const runEngine6RenderingParityGovernance = (args: {
  tours: Engine6Tour[];
  merchantFeedRowsByProductCode?: Map<string, MerchantFeedParityRow>;
  listingSnapshotsByProductCode?: Map<
    string,
    { heroImage?: string | null; title?: string | null }
  >;
  principalExperienceTypesByProductCode?: Map<
    string,
    Engine6PrincipalExperienceType
  >;
  generatedAt?: string;
}): Engine6RenderingParityGovernanceReport => {
  const findings: Engine6RenderingParityFinding[] = [];
  let productsPassed = 0;

  for (const tour of args.tours) {
    const audit = auditEngine6TourRenderingParity({
      tour,
      merchantFeedRow:
        args.merchantFeedRowsByProductCode?.get(tour.productCode) ?? null,
      listingHeroImage:
        args.listingSnapshotsByProductCode?.get(tour.productCode)?.heroImage,
      listingTitle:
        args.listingSnapshotsByProductCode?.get(tour.productCode)?.title,
      principalExperienceType: args.principalExperienceTypesByProductCode?.get(
        tour.productCode
      ),
    });

    if (audit.passed) {
      productsPassed += 1;
    } else {
      findings.push(...audit.findings);
    }
  }

  return {
    generatedAt: args.generatedAt ?? new Date().toISOString(),
    productsAudited: args.tours.length,
    productsPassed,
    productsFailed: args.tours.length - productsPassed,
    findings,
    passed: findings.length === 0,
  };
};

export const formatEngine6RenderingParityGovernanceReport = (
  report: Engine6RenderingParityGovernanceReport
) => {
  const lines = [
    `Engine6 rendering parity governance (${report.generatedAt})`,
    "",
    "## Summary",
    `- Products audited: ${report.productsAudited}`,
    `- Products passed: ${report.productsPassed}`,
    `- Products failed: ${report.productsFailed}`,
    `- Passed: ${report.passed}`,
  ];

  if (report.findings.length > 0) {
    lines.push("", "## Findings");
    for (const finding of report.findings.slice(0, 50)) {
      lines.push(
        `- ${finding.productCode}.${finding.field} [${finding.surfaces.join(", ")}]: ${finding.detail}`
      );
    }
    if (report.findings.length > 50) {
      lines.push(`- ...and ${report.findings.length - 50} additional finding(s).`);
    }
  }

  return lines.join("\n");
};
