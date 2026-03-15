import type {
  Engine6ListingItem,
  Engine6ProductRecord,
  Engine6ResolvedTourPageData,
} from "../types";
import { mapViatorToEngine6PageData } from "./mapViatorToEngine6PageData";

const toSnippet = (text: string, maxChars = 150): string => {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (!normalized) return "";

  const firstSentence =
    normalized.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? normalized;
  if (firstSentence.length <= maxChars) {
    return firstSentence;
  }

  const clipped = firstSentence.slice(0, maxChars);
  const lastWordBoundary = clipped.lastIndexOf(" ");
  const snippet =
    lastWordBoundary > maxChars * 0.6
      ? clipped.slice(0, lastWordBoundary)
      : clipped;

  return `${snippet.trim()}…`;
};

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
  shortDescription: toSnippet(page.overview, 150),
  heroImage: page.heroImage,
  fromPriceText:
    typeof page.fromPrice === "number" && page.fromPrice > 0
      ? `$${Math.round(page.fromPrice)}`
      : page.fromPriceText,
  ratingValue:
    typeof page.ratingValue === "number" && page.ratingValue > 0
      ? page.ratingValue
      : undefined,
  reviewCount:
    typeof page.reviewCount === "number" && page.reviewCount > 0
      ? page.reviewCount
      : undefined,
  href: page.canonicalPath,
});
