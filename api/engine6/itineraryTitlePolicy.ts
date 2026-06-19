export type Engine6ItineraryTitleSource =
  | "json-ld"
  | "explicit"
  | "product-override"
  | "description-inferred";

type RecordLike = Record<string, unknown>;

const asRecord = (value: unknown): RecordLike | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordLike)
    : null;

const asNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

/**
 * Authoritative Viator JSON-LD itinerary stop name:
 * product.itinerary.itemListElement[n].item.name
 */
export const getEngine6ItineraryJsonLdTitle = (
  product: RecordLike | null | undefined,
  rowIndex: number
): string | null => {
  if (!product || rowIndex < 0) return null;

  const itemListElement = asRecord(product.itinerary)?.itemListElement;
  if (!Array.isArray(itemListElement)) return null;

  const listItem = asRecord(itemListElement[rowIndex]);
  if (!listItem) return null;

  const item = asRecord(listItem.item);
  return asNonEmptyString(item?.name);
};
