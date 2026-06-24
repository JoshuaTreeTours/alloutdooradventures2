import type { MerchantFeedRowFromProductSchema } from "./merchantFeedFromProductSchema";
import {
  buildMerchantFeedRowFromProductSchema,
  resolveMerchantFeedProductSchemaSnapshot,
  type MerchantFeedProductSchemaSnapshot,
} from "./merchantFeedFromProductSchema";
import type { Engine6Tour } from "./types";

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
