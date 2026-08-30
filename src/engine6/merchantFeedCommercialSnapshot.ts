import {
  parseMerchantPriceCurrency,
  parsePrice,
} from "../utils/merchantPricing";
import { resolveEngine6TourForProductSchema } from "./resolveEngine6TourForProductSchema";
import type { Engine6Tour } from "./types";

export const MERCHANT_FEED_COMMERCIAL_SNAPSHOT_PATH =
  "data/merchantFeed-commercial-snapshot.json";

export type MerchantFeedCommercialSnapshotRow = {
  productCode: string;
  price: string;
  averageRating: string;
  ratingCount: string;
  reviewCount: string;
};

export type MerchantFeedCommercialSnapshot = {
  generatedAt: string;
  source: string;
  rows: MerchantFeedCommercialSnapshotRow[];
};

type MerchantCommercialRow = {
  id: string;
  price: string;
  average_rating: string;
  rating_count: string;
  review_count: string;
};

const parseNumber = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseCount = (value: string) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

export const buildMerchantFeedCommercialSnapshot = (
  rows: MerchantCommercialRow[],
  generatedAt = new Date().toISOString()
): MerchantFeedCommercialSnapshot => ({
  generatedAt,
  source:
    "merchant feed generation using shared Engine6 commercial resolver snapshot",
  rows: rows.map(row => ({
    productCode: row.id,
    price: row.price,
    averageRating: row.average_rating,
    ratingCount: row.rating_count,
    reviewCount: row.review_count,
  })),
});

export const resolveToursWithMerchantFeedCommercialSnapshot = (
  tours: Engine6Tour[],
  snapshot: MerchantFeedCommercialSnapshot
): Engine6Tour[] => {
  const snapshotRowsByProductCode = new Map(
    snapshot.rows.map(row => [row.productCode.trim().toUpperCase(), row])
  );

  return tours.map(tour => {
    const snapshotRow = snapshotRowsByProductCode.get(
      tour.productCode.trim().toUpperCase()
    );

    if (!snapshotRow) {
      return tour;
    }

    const snapshotCurrency = parseMerchantPriceCurrency(snapshotRow.price);
    if (snapshotCurrency && snapshotCurrency !== "USD") {
      return tour;
    }

    const snapshotPriceAmount = parsePrice(snapshotRow.price);

    return resolveEngine6TourForProductSchema(tour, {
      priceAmount: snapshotPriceAmount,
      priceFormatted:
        typeof snapshotPriceAmount === "number"
          ? `From $${snapshotPriceAmount.toFixed(2)}`
          : null,
      priceCurrency: "USD",
      aggregateRating: parseNumber(snapshotRow.averageRating),
      reviewCount: parseCount(
        snapshotRow.reviewCount || snapshotRow.ratingCount
      ),
    });
  });
};
