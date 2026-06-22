import { getEngine6ItineraryTitleOverride } from "./itineraryTitleOverrides.js";
import {
  extractEngine6ConciseItineraryTitleFromProse,
  getEngine6PartnerItineraryRowExplicitFieldTitle,
  getEngine6PartnerItineraryRowOtherStructuredTitle,
  getEngine6PartnerItineraryRowPoiLocationName,
  isEngine6ProseItineraryTitle,
} from "./divergedItineraryTitle.js";

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
  "233384P2": [
    "City Hall Park",
    "Brooklyn Bridge",
    "Brooklyn Heights",
    "Brooklyn Heights Promenade",
    "Brooklyn Bridge Park",
    "DUMBO",
    "Manhattan Bridge",
    "John V. Lindsay East River Park",
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

export const getEngine6PartnerItineraryRowPoiTitle = (
  product: RecordLike | null | undefined,
  rowIndex: number
): string | null =>
  getEngine6PartnerItineraryRowPoiLocationName(product, rowIndex);

const isAuthoritativeExtractedItineraryTitleSource = (
  source: Engine6ItineraryTitleSource | undefined
): boolean =>
  source === "json-ld" ||
  source === "public-json-ld" ||
  source === "explicit" ||
  source === "product-override";

/**
 * Title authority for diverged itinerary merges only.
 * Order: product override > public/partner JSON-LD >
 * pointOfInterestLocation.locationName > other structured POI/location fields >
 * explicit itinerary row fields > live explicit extraction >
 * prose-derived concise POI/location > live authoritative extraction >
 * description-inferred.
 */
const NEUTRAL_ITINERARY_STOP_TITLE_PATTERN = /^itinerary stop \d+$/i;

const isNeutralItineraryStopTitle = (value: string | null | undefined): boolean => {
  const normalized = asNonEmptyString(value)?.replace(/\s+/g, " ");
  if (!normalized) return false;
  return NEUTRAL_ITINERARY_STOP_TITLE_PATTERN.test(normalized);
};

const getEngine6PartnerRowStructuredTitleFromProducts = (
  products: Array<RecordLike | null | undefined>,
  rowIndex: number,
  reader: (
    product: RecordLike | null | undefined,
    rowIndex: number
  ) => { title: string; source: "explicit" } | string | null
): { title: string; titleSource: "explicit" } | null => {
  for (const product of products) {
    const resolved = reader(product, rowIndex);
    if (!resolved) continue;
    if (typeof resolved === "string") {
      return { title: resolved, titleSource: "explicit" };
    }
    return { title: resolved.title, titleSource: resolved.source };
  }
  return null;
};

export const resolveEngine6DivergedItineraryTitle = (args: {
  productCode: string | null | undefined;
  rawProduct?: RecordLike | null;
  bundledRawProduct?: RecordLike | null;
  rowIndex: number;
  rowCount: number;
  liveTitle?: string | null;
  liveDescription?: string | null;
  liveTitleSource?: Engine6ItineraryTitleSource;
}): Engine6DivergedItineraryTitleResolution => {
  const { productCode, rawProduct, bundledRawProduct, rowIndex, rowCount } = args;
  const liveTitle = asNonEmptyString(args.liveTitle);
  const liveDescription = asNonEmptyString(args.liveDescription);
  const structuredProducts = [bundledRawProduct ?? null, rawProduct ?? null];

  const productOverride = getEngine6ItineraryTitleOverride({
    productCode: productCode ?? null,
    rowIndex,
    currentTitle: liveTitle,
  });
  if (productOverride) {
    return { title: productOverride, titleSource: "product-override" };
  }

  const publicJsonLdTitle = getEngine6AlignedPublicJsonLdItineraryTitle({
    productCode,
    rowIndex,
    rowCount,
  });
  if (publicJsonLdTitle) {
    return { title: publicJsonLdTitle, titleSource: "public-json-ld" };
  }

  const bundledJsonLdTitle = getEngine6ItineraryJsonLdTitle(
    bundledRawProduct ?? null,
    rowIndex
  );
  if (bundledJsonLdTitle) {
    return { title: bundledJsonLdTitle, titleSource: "json-ld" };
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

  const poiLocationName = getEngine6PartnerRowStructuredTitleFromProducts(
    structuredProducts,
    rowIndex,
    getEngine6PartnerItineraryRowPoiLocationName
  );
  if (poiLocationName) {
    return poiLocationName;
  }

  const otherStructuredTitle = getEngine6PartnerRowStructuredTitleFromProducts(
    structuredProducts,
    rowIndex,
    getEngine6PartnerItineraryRowOtherStructuredTitle
  );
  if (otherStructuredTitle) {
    return otherStructuredTitle;
  }

  const explicitRowFieldTitle = getEngine6PartnerRowStructuredTitleFromProducts(
    structuredProducts,
    rowIndex,
    getEngine6PartnerItineraryRowExplicitFieldTitle
  );
  if (explicitRowFieldTitle) {
    return explicitRowFieldTitle;
  }

  if (
    args.liveTitleSource === "explicit" &&
    liveTitle &&
    !isEngine6ProseItineraryTitle(liveTitle) &&
    !isNeutralItineraryStopTitle(liveTitle)
  ) {
    return { title: liveTitle, titleSource: "explicit" };
  }

  const conciseProseTitle = extractEngine6ConciseItineraryTitleFromProse({
    title: liveTitle,
    description: liveDescription,
  });
  if (conciseProseTitle) {
    return {
      title: conciseProseTitle.title,
      titleSource: conciseProseTitle.source,
    };
  }

  if (
    isAuthoritativeExtractedItineraryTitleSource(args.liveTitleSource) &&
    liveTitle &&
    !isEngine6ProseItineraryTitle(liveTitle)
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
