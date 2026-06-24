import { formatMerchantPrice } from "../utils/merchantPricing";
import { resolveEngine6PathForProductCode } from "./routes";
import { getEngine6TourRatingSourceOfTruth } from "./ratingSourceOfTruth";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import type { Engine6Tour } from "./types";

const DOMAIN = "https://www.alloutdooradventures.com";

export const MERCHANT_FEED_CANONICAL_COMMERCIAL_FIELDS = [
  "title",
  "link",
  "price",
  "average_rating",
  "rating_count",
  "review_count",
] as const;

export type MerchantFeedCanonicalCommercialField =
  (typeof MERCHANT_FEED_CANONICAL_COMMERCIAL_FIELDS)[number];

export type MerchantFeedCanonicalCommercialExpectation = Record<
  MerchantFeedCanonicalCommercialField,
  string
> & {
  id: string;
  bookingUrl: string | null;
  schemaOfferPrice: number | null;
  schemaRatingValue: number | null;
  schemaReviewCount: number | null;
};

export type MerchantFeedParityRow = Partial<
  Record<MerchantFeedCanonicalCommercialField | "id", string>
>;

const formatMerchantRating = (value: number) => value.toFixed(1);

const formatMerchantCount = (value: number) => String(Math.trunc(value));

const resolveCanonicalPriceAmount = (
  tour: Engine6Tour,
  priceAmount: number | null | undefined = tour.priceAmount
) =>
  typeof priceAmount === "number" &&
  Number.isFinite(priceAmount) &&
  priceAmount > 0
    ? priceAmount
    : null;

export const buildMerchantFeedCanonicalCommercialExpectation = (
  tour: Engine6Tour,
  priceAmount: number | null | undefined = tour.priceAmount
): MerchantFeedCanonicalCommercialExpectation => {
  const canonicalPath =
    resolveEngine6PathForProductCode(tour.productCode) ?? tour.canonicalPath;
  const rating = getEngine6TourRatingSourceOfTruth(tour);
  const graph = buildEngine6SchemaGraph(tour)["@graph"] as Array<
    Record<string, unknown>
  >;
  const aggregateRatingNode = graph.find(
    node => node["@type"] === "AggregateRating"
  );
  const offerNode = graph.find(node => node["@type"] === "Offer");
  const resolvedPriceAmount = resolveCanonicalPriceAmount(tour, priceAmount);

  return {
    id: tour.productCode,
    title: tour.title,
    link: `${DOMAIN}${canonicalPath}`,
    price: formatMerchantPrice(resolvedPriceAmount, "USD"),
    average_rating:
      rating.aggregateRating !== null
        ? formatMerchantRating(rating.aggregateRating)
        : "",
    rating_count:
      rating.reviewCount !== null
        ? formatMerchantCount(rating.reviewCount)
        : "",
    review_count:
      rating.reviewCount !== null
        ? formatMerchantCount(rating.reviewCount)
        : "",
    bookingUrl:
      typeof offerNode?.url === "string"
        ? offerNode.url
        : (tour.bookingUrl ?? null),
    schemaOfferPrice:
      typeof offerNode?.price === "number" ? offerNode.price : null,
    schemaRatingValue:
      typeof aggregateRatingNode?.ratingValue === "number"
        ? aggregateRatingNode.ratingValue
        : null,
    schemaReviewCount:
      typeof aggregateRatingNode?.reviewCount === "number"
        ? aggregateRatingNode.reviewCount
        : null,
  };
};

export const compareMerchantFeedRowToCanonical = (
  tour: Engine6Tour,
  row: MerchantFeedParityRow,
  priceAmount: number | null | undefined = tour.priceAmount
) => {
  const expected = buildMerchantFeedCanonicalCommercialExpectation(
    tour,
    priceAmount
  );
  const mismatches: string[] = [];

  if ((row.id ?? "").trim() !== tour.productCode) {
    mismatches.push(
      `${tour.productCode}.id: expected "${tour.productCode}", got "${row.id ?? ""}"`
    );
  }

  for (const field of MERCHANT_FEED_CANONICAL_COMMERCIAL_FIELDS) {
    const actual = row[field]?.trim() ?? "";
    const canonical = expected[field];
    if (actual !== canonical) {
      mismatches.push(
        `${tour.productCode}.${field}: expected "${canonical}", got "${actual}"`
      );
    }
  }

  return {
    expected,
    mismatches,
    pass: mismatches.length === 0,
  };
};

export const auditEngine6MerchantFeedParity = (
  tours: Engine6Tour[],
  rowsByProductCode: Map<string, MerchantFeedParityRow>,
  resolvePriceAmount: (
    tour: Engine6Tour
  ) => number | null | undefined = tour => tour.priceAmount
) => {
  const failures: string[] = [];

  for (const tour of tours) {
    const row = rowsByProductCode.get(tour.productCode);
    if (!row) {
      failures.push(`${tour.productCode}: missing merchant feed row`);
      continue;
    }

    const parity = compareMerchantFeedRowToCanonical(
      tour,
      row,
      resolvePriceAmount(tour)
    );
    if (!parity.pass) {
      failures.push(...parity.mismatches);
    }
  }

  return {
    pass: failures.length === 0,
    failures,
  };
};
