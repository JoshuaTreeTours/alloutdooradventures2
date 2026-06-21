import { getEngine6ItineraryTitleOverride } from "./itineraryTitleOverrides.js";

export type Engine6ItineraryTitleSource =
  | "json-ld"
  | "public-json-ld"
  | "explicit"
  | "product-override"
  | "description-inferred";

type RecordLike = Record<string, unknown>;

export type Engine6DivergedItineraryTitleResolution = {
  title: string;
  titleSource: Engine6ItineraryTitleSource;
};

const asRecord = (value: unknown): RecordLike | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordLike)
    : null;

const PUBLIC_JSON_LD_ITINERARY_NAMES_BY_PRODUCT_CODE: Record<
  string,
  readonly string[]
> = {
  "117409P1": ["Santa Ynez Valley"],
  "191303P1": ["Coronado Island"],
  "2335P1": ["San Andreas Fault"],
  "447486P4": ["Santa Barbara Maritime Museum"],
  "67760P2": [
    "Santa Monica Pier",
    "The Original Farmers Market",
    "Griffith Observatory",
    "Hollywood Walk of Fame",
  ],
  "170119P1": [
    "Santa Monica Pier",
    "Venice Beach",
    "Venice Canals",
    "Beverly Hills and Rodeo Drive",
    "Original Farmers Market",
    "The Grove",
    "Hollywood Boulevard",
    "Hollywood Sign Viewpoint",
  ],
  "70058P145": [
    "Griffith Observatory",
    "Hollywood Walk of Fame",
    "Rodeo Drive",
    "Hollywood Sign",
    "The Original Farmers Market",
  ],
  "3885GRINDEL_ZUR": [
    "Zurich",
    "Interlaken",
    "Grindelwald",
    "Lauterbrunnen Valley Waterfalls",
    "Zurich",
  ],
  "3885SW303BS": [
    "Zurich",
    "Luzern Altstadt",
    "Titlis",
    "Titlis Cliff Walk",
    "Zurich",
  ],
  "163975P1": [
    "Stearns Wharf",
    "East Beach",
    "Andrée Clark Bird Refuge",
    "Butterfly Beach",
    "Natural History Museum",
    "Old Mission Santa Barbara",
    "Santa Barbara County Courthouse",
    "El Presidio State Park",
    "Santa Barbara Harbor",
  ],
  "411138P3": [
    "Downtown Anchorage",
    "Beluga Point",
    "Alaska Wildlife Conservation Center",
    "Turnagain Arm",
    "Girdwood",
    "Explorer Glacier",
    "Byron Glacier Trail",
    "Chugach State Park",
    "Potter Marsh Bird Sanctuary",
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

const readPartnerItineraryRows = (
  product: RecordLike | null | undefined
): RecordLike[] => {
  if (!product) return [];

  const candidates = [
    product.itineraryItems,
    asRecord(product.itinerary)?.itineraryItems,
    asRecord(product.itinerary)?.items,
    asRecord(product.whatToExpect)?.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .map(item => asRecord(item))
        .filter((item): item is RecordLike => Boolean(item));
    }
  }

  return [];
};

export const getEngine6PartnerItineraryRowPoiTitle = (
  product: RecordLike | null | undefined,
  rowIndex: number
): string | null => {
  if (rowIndex < 0) return null;

  const row = readPartnerItineraryRows(product)[rowIndex];
  if (!row) return null;

  const pointOfInterestLocation = asRecord(row.pointOfInterestLocation);
  const pointOfInterest = asRecord(row.pointOfInterest);
  const stop = asRecord(row.stop);
  const location = asRecord(row.location);

  return (
    asNonEmptyString(pointOfInterestLocation?.locationName) ??
    asNonEmptyString(pointOfInterestLocation?.title) ??
    asNonEmptyString(pointOfInterestLocation?.name) ??
    asNonEmptyString(pointOfInterest?.title) ??
    asNonEmptyString(pointOfInterest?.name) ??
    asNonEmptyString(stop?.locationName) ??
    asNonEmptyString(stop?.title) ??
    asNonEmptyString(stop?.name) ??
    asNonEmptyString(location?.locationName) ??
    asNonEmptyString(location?.title) ??
    asNonEmptyString(location?.name) ??
    asNonEmptyString(row.locationName)
  );
};

const isAuthoritativeExtractedItineraryTitleSource = (
  source: Engine6ItineraryTitleSource | undefined
): boolean =>
  source === "json-ld" ||
  source === "public-json-ld" ||
  source === "explicit" ||
  source === "product-override";

/**
 * Title authority for diverged itinerary merges only.
 * Order: public JSON-LD > partner JSON-LD > explicit > product override >
 * partner POI/location > live authoritative extraction > description-inferred.
 */
export const resolveEngine6DivergedItineraryTitle = (args: {
  productCode: string | null | undefined;
  rawProduct?: RecordLike | null;
  rowIndex: number;
  rowCount: number;
  liveTitle?: string | null;
  liveTitleSource?: Engine6ItineraryTitleSource;
}): Engine6DivergedItineraryTitleResolution => {
  const { productCode, rawProduct, rowIndex, rowCount } = args;
  const liveTitle = asNonEmptyString(args.liveTitle);

  const publicJsonLdTitle = getEngine6AlignedPublicJsonLdItineraryTitle({
    productCode,
    rowIndex,
    rowCount,
  });
  if (publicJsonLdTitle) {
    return { title: publicJsonLdTitle, titleSource: "public-json-ld" };
  }

  const itemListElement = asRecord(rawProduct?.itinerary)?.itemListElement;
  if (Array.isArray(itemListElement) && itemListElement.length === rowCount) {
    const partnerJsonLdTitle = getEngine6ItineraryJsonLdTitle(
      rawProduct ?? null,
      rowIndex
    );
    if (partnerJsonLdTitle) {
      return { title: partnerJsonLdTitle, titleSource: "json-ld" };
    }
  }

  if (args.liveTitleSource === "explicit" && liveTitle) {
    return { title: liveTitle, titleSource: "explicit" };
  }

  const productOverride = getEngine6ItineraryTitleOverride({
    productCode,
    rowIndex,
    currentTitle: liveTitle,
  });
  if (productOverride) {
    return { title: productOverride, titleSource: "product-override" };
  }

  const partnerPoiTitle = getEngine6PartnerItineraryRowPoiTitle(
    rawProduct ?? null,
    rowIndex
  );
  if (partnerPoiTitle) {
    return { title: partnerPoiTitle, titleSource: "explicit" };
  }

  if (
    isAuthoritativeExtractedItineraryTitleSource(args.liveTitleSource) &&
    liveTitle
  ) {
    return {
      title: liveTitle,
      titleSource: args.liveTitleSource ?? "explicit",
    };
  }

  if (liveTitle) {
    return { title: liveTitle, titleSource: "description-inferred" };
  }

  return { title: "This stop", titleSource: "description-inferred" };
};
