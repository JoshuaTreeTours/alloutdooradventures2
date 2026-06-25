import type { MerchantFeedRowFromProductSchema } from "./merchantFeedFromProductSchema";
import {
  buildMerchantFeedRowFromProductSchema,
  resolveMerchantFeedProductSchemaSnapshot,
  type MerchantFeedProductSchemaSnapshot,
} from "./merchantFeedFromProductSchema";
import { getEngine6TourRatingSourceOfTruth } from "./ratingSourceOfTruth";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import type { Engine6Tour } from "./types";
import { formatMerchantPrice } from "../utils/merchantPricing";

export const MERCHANT_FEED_PRODUCT_SCHEMA_PARITY_FIELDS = [
  "title",
  "description",
  "link",
  "image_link",
  "availability",
  "price",
  "average_rating",
  "rating_count",
  "review_count",
] as const;

export type MerchantFeedProductSchemaParityField =
  (typeof MERCHANT_FEED_PRODUCT_SCHEMA_PARITY_FIELDS)[number];

export type MerchantFeedParityRow = Partial<
  Record<MerchantFeedProductSchemaParityField | "id", string>
>;

export type MerchantFeedSchemaParityResult = {
  snapshot: MerchantFeedProductSchemaSnapshot;
  mismatches: string[];
  pass: boolean;
};

const snapshotValueForMerchantField = (
  snapshot: MerchantFeedProductSchemaSnapshot,
  field: MerchantFeedProductSchemaParityField
) => {
  switch (field) {
    case "title":
      return snapshot.title;
    case "description":
      return snapshot.description;
    case "link":
      return snapshot.link;
    case "image_link":
      return snapshot.imageLink;
    case "availability":
      return snapshot.availability;
    case "price":
      return snapshot.price;
    case "average_rating":
      return snapshot.averageRating;
    case "rating_count":
      return snapshot.ratingCount;
    case "review_count":
      return snapshot.reviewCount;
    default:
      return "";
  }
};

export const MERCHANT_FEED_COMMERCIAL_PARITY_FIELDS = [
  "price",
  "average_rating",
  "rating_count",
  "review_count",
] as const;

export type MerchantFeedCommercialParityField =
  (typeof MERCHANT_FEED_COMMERCIAL_PARITY_FIELDS)[number];

export type MerchantFeedCommercialParityResult = {
  snapshot: MerchantFeedProductSchemaSnapshot;
  mismatches: string[];
  mismatchCounts: {
    price: number;
    rating: number;
    reviewCount: number;
  };
  pass: boolean;
};

export type MerchantFeedCommercialParityAuditReport = {
  totalRowsAudited: number;
  priceMismatches: number;
  ratingMismatches: number;
  reviewCountMismatches: number;
  pass: boolean;
  failures: string[];
};

const emptyCommercialMismatchCounts = () => ({
  price: 0,
  rating: 0,
  reviewCount: 0,
});

const formatMerchantRating = (value: number) => value.toFixed(1);

const formatMerchantCount = (value: number) => String(Math.trunc(value));

const commercialValuesEqual = (left: unknown, right: unknown) => {
  if (left == null && right == null) {
    return true;
  }

  return left === right;
};

export const auditEngine6CommercialFieldParity = (
  tour: Engine6Tour,
  row: MerchantFeedParityRow
): MerchantFeedCommercialParityResult => {
  const snapshot = resolveMerchantFeedProductSchemaSnapshot(tour);
  const graph = buildEngine6SchemaGraph(tour)["@graph"] as Array<
    Record<string, unknown>
  >;
  const offerNode = graph.find(node => node["@type"] === "Offer");
  const aggregateRatingNode = graph.find(
    node => node["@type"] === "AggregateRating"
  );
  const ratingSourceOfTruth = getEngine6TourRatingSourceOfTruth(tour);
  const mismatches: string[] = [];
  const mismatchCounts = emptyCommercialMismatchCounts();

  const offerPrice =
    typeof offerNode?.price === "number" ? offerNode.price : null;
  const offerCurrency =
    typeof offerNode?.priceCurrency === "string"
      ? offerNode.priceCurrency
      : "USD";
  const schemaPrice = formatMerchantPrice(offerPrice, offerCurrency);
  const schemaRating =
    typeof aggregateRatingNode?.ratingValue === "number"
      ? formatMerchantRating(aggregateRatingNode.ratingValue)
      : "";
  const schemaReviewCount =
    typeof aggregateRatingNode?.reviewCount === "number"
      ? formatMerchantCount(aggregateRatingNode.reviewCount)
      : "";

  if (!commercialValuesEqual(tour.priceAmount, offerPrice)) {
    mismatchCounts.price += 1;
    mismatches.push(
      `${tour.productCode}.tourPage.priceAmount: expected Offer.price ${offerPrice ?? "null"}, got ${tour.priceAmount ?? "null"}`
    );
  }

  if (
    !commercialValuesEqual(
      ratingSourceOfTruth.aggregateRating,
      aggregateRatingNode?.ratingValue
    )
  ) {
    mismatchCounts.rating += 1;
    mismatches.push(
      `${tour.productCode}.tourPage.aggregateRating: expected ${aggregateRatingNode?.ratingValue ?? "null"}, got ${ratingSourceOfTruth.aggregateRating ?? "null"}`
    );
  }

  if (
    !commercialValuesEqual(
      ratingSourceOfTruth.reviewCount,
      aggregateRatingNode?.reviewCount
    )
  ) {
    mismatchCounts.reviewCount += 1;
    mismatches.push(
      `${tour.productCode}.tourPage.reviewCount: expected AggregateRating.reviewCount ${aggregateRatingNode?.reviewCount ?? "null"}, got ${ratingSourceOfTruth.reviewCount ?? "null"}`
    );
  }

  for (const field of MERCHANT_FEED_COMMERCIAL_PARITY_FIELDS) {
    const merchantValue = row[field]?.trim() ?? "";
    const expected =
      field === "price"
        ? schemaPrice
        : field === "average_rating"
          ? schemaRating
          : schemaReviewCount;

    if (merchantValue !== expected) {
      if (field === "price") {
        mismatchCounts.price += 1;
      } else if (field === "average_rating") {
        mismatchCounts.rating += 1;
      } else {
        mismatchCounts.reviewCount += 1;
      }

      mismatches.push(
        `${tour.productCode}.merchantFeed.${field}: expected "${expected}", got "${merchantValue}"`
      );
    }
  }

  return {
    snapshot,
    mismatches,
    mismatchCounts,
    pass: mismatches.length === 0,
  };
};

export const auditEngine6MerchantFeedCommercialParity = (
  tours: Engine6Tour[],
  rowsByProductCode: Map<string, MerchantFeedParityRow>
): MerchantFeedCommercialParityAuditReport => {
  const failures: string[] = [];
  let priceMismatches = 0;
  let ratingMismatches = 0;
  let reviewCountMismatches = 0;
  let totalRowsAudited = 0;

  for (const tour of tours) {
    const row = rowsByProductCode.get(tour.productCode);
    if (!row) {
      failures.push(`${tour.productCode}: missing merchant feed row`);
      continue;
    }

    totalRowsAudited += 1;
    const commercialParity = auditEngine6CommercialFieldParity(tour, row);
    priceMismatches += commercialParity.mismatchCounts.price;
    ratingMismatches += commercialParity.mismatchCounts.rating;
    reviewCountMismatches += commercialParity.mismatchCounts.reviewCount;

    if (!commercialParity.pass) {
      failures.push(...commercialParity.mismatches);
    }
  }

  return {
    totalRowsAudited,
    priceMismatches,
    ratingMismatches,
    reviewCountMismatches,
    pass: failures.length === 0,
    failures,
  };
};

export const formatMerchantFeedCommercialParityAuditReport = (
  report: MerchantFeedCommercialParityAuditReport,
  blankRequiredFieldRows = 0
) =>
  [
    "Commercial parity audit:",
    `- total rows audited: ${report.totalRowsAudited}`,
    `- price mismatches: ${report.priceMismatches}`,
    `- rating mismatches: ${report.ratingMismatches}`,
    `- review_count mismatches: ${report.reviewCountMismatches}`,
    `- required blank fields: ${blankRequiredFieldRows}`,
  ].join("\n");

export const compareMerchantFeedRowToProductSchema = (
  tour: Engine6Tour,
  row: MerchantFeedParityRow
): MerchantFeedSchemaParityResult => {
  const snapshot = resolveMerchantFeedProductSchemaSnapshot(tour);
  const mismatches: string[] = [];

  if ((row.id ?? "").trim() !== tour.productCode) {
    mismatches.push(
      `${tour.productCode}.id: expected "${tour.productCode}", got "${row.id ?? ""}"`
    );
  }

  for (const field of MERCHANT_FEED_PRODUCT_SCHEMA_PARITY_FIELDS) {
    const actual = row[field]?.trim() ?? "";
    const expected = snapshotValueForMerchantField(snapshot, field);

    if (actual !== expected) {
      mismatches.push(
        `${tour.productCode}.${field}: expected "${expected}", got "${actual}"`
      );
    }
  }

  if (!snapshot.bookingUrl) {
    mismatches.push(`${tour.productCode}.bookingUrl: missing Product.offers.url`);
  }

  return {
    snapshot,
    mismatches,
    pass: mismatches.length === 0,
  };
};

export const auditEngine6MerchantFeedSchemaParity = (
  tours: Engine6Tour[],
  rowsByProductCode: Map<string, MerchantFeedParityRow>
) => {
  const failures: string[] = [];

  for (const tour of tours) {
    const row = rowsByProductCode.get(tour.productCode);
    if (!row) {
      failures.push(`${tour.productCode}: missing merchant feed row`);
      continue;
    }

    const generatedRow = buildMerchantFeedRowFromProductSchema(tour);
    const generatedParity = compareMerchantFeedRowToProductSchema(
      tour,
      generatedRow
    );
    if (!generatedParity.pass) {
      failures.push(
        `${tour.productCode}: generated merchant row diverged from Product JSON-LD (${generatedParity.mismatches.join("; ")})`
      );
    }

    const csvParity = compareMerchantFeedRowToProductSchema(tour, row);
    if (!csvParity.pass) {
      failures.push(...csvParity.mismatches);
    }
  }

  return {
    pass: failures.length === 0,
    failures,
  };
};

export const buildExpectedMerchantFeedRowFromProductSchema = (
  tour: Engine6Tour
): MerchantFeedRowFromProductSchema =>
  buildMerchantFeedRowFromProductSchema(tour);
