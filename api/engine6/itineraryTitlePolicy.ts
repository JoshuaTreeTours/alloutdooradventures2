export type Engine6ItineraryTitleSource =
  | "json-ld"
  | "public-json-ld"
  | "explicit"
  | "product-override"
  | "description-inferred";

type RecordLike = Record<string, unknown>;

const asRecord = (value: unknown): RecordLike | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordLike)
    : null;

const PUBLIC_JSON_LD_ITINERARY_NAMES_BY_PRODUCT_CODE: Record<
  string,
  readonly string[]
> = {
  "163975P1": [
    "Stearns Wharf",
    "East Beach",
    "Andrée Clark Bird Refuge",
    "Butterfly Beach",
    "Santa Barbara Museum of Natural History",
    "Old Mission Santa Barbara",
    "Santa Barbara County Courthouse",
    "El Presidio de Santa Barbara State Historic Park",
    "Santa Barbara Harbor",
  ],
};

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

export const getEngine6AlignedPublicJsonLdItineraryTitle = (args: {
  productCode: string | null | undefined;
  rowIndex: number;
  rowCount: number;
}): string | null => {
  const productCode = asNonEmptyString(args.productCode)?.toUpperCase();
  if (!productCode || args.rowIndex < 0 || args.rowCount < 1) return null;

  const publicJsonLdNames =
    PUBLIC_JSON_LD_ITINERARY_NAMES_BY_PRODUCT_CODE[productCode];
  if (!publicJsonLdNames || publicJsonLdNames.length !== args.rowCount) {
    return null;
  }

  return asNonEmptyString(publicJsonLdNames[args.rowIndex]);
};

export const getEngine6AlignedItineraryJsonLdTitle = (args: {
  product: RecordLike | null | undefined;
  productCode: string | null | undefined;
  rowIndex: number;
  rowCount: number;
}): { title: string; source: "json-ld" | "public-json-ld" } | null => {
  const publicJsonLdTitle = getEngine6AlignedPublicJsonLdItineraryTitle(args);
  if (publicJsonLdTitle) {
    return { title: publicJsonLdTitle, source: "public-json-ld" };
  }

  const itemListElement = asRecord(args.product?.itinerary)?.itemListElement;
  if (
    !Array.isArray(itemListElement) ||
    itemListElement.length !== args.rowCount
  ) {
    return null;
  }

  const title = getEngine6ItineraryJsonLdTitle(args.product, args.rowIndex);
  return title ? { title, source: "json-ld" } : null;
};
