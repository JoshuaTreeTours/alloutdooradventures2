import type {
  Engine6ListingItem,
  Engine6ProductRecord,
  Engine6ResolvedTourPageData,
} from "../types";
import { mapViatorToEngine6PageData } from "./mapViatorToEngine6PageData";

export const getEngine6ViatorTourData = async (
  record: Engine6ProductRecord
): Promise<Engine6ResolvedTourPageData> => {
  const response = await fetch(
    `/api/engine6/viator-product?productCode=${encodeURIComponent(record.productCode)}`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Engine6 Viator request failed for ${record.productCode}: ${response.status} ${text}`
    );
  }

  const payload = (await response.json()) as Record<string, unknown>;
  return mapViatorToEngine6PageData({ record, payload });
};

export const mapEngine6PageToListingItem = (
  page: Engine6ResolvedTourPageData
): Engine6ListingItem => ({
  id: `engine6-${page.productCode}`,
  title: page.title,
  shortDescription: page.overview.slice(0, 180),
  heroImage: page.heroImage,
  fromPriceText:
    typeof page.fromPrice === "number" && page.fromPrice > 0
      ? `$${Math.round(page.fromPrice)}`
      : page.fromPriceText,
  ratingValue: page.ratingValue,
  reviewCount: page.reviewCount,
  href: page.canonicalPath,
});
