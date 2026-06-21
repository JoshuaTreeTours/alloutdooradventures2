import {
  resolveEngine6DivergedItineraryTitle,
  type Engine6ItineraryTitleSource,
} from "../../api/engine6/itineraryTitlePolicy";
import type { Engine6ItineraryItem } from "./types";

export type Engine6LiveItineraryItem = Engine6ItineraryItem & {
  titleSource?: Engine6ItineraryTitleSource;
};

export type Engine6ItineraryMergeContext = {
  productCode?: string | null;
  rawProduct?: Record<string, unknown> | null;
};

export type Engine6ItineraryMergeMode = "aligned" | "diverged";

export type Engine6ItineraryCompositionDivergence = {
  diverged: boolean;
  reasons: string[];
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "at",
  "by",
  "for",
  "from",
  "in",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
]);

const normalizeTitleSource = (
  value: unknown
): Engine6ItineraryTitleSource | undefined => {
  if (
    value === "json-ld" ||
    value === "public-json-ld" ||
    value === "explicit" ||
    value === "product-override" ||
    value === "description-inferred"
  ) {
    return value;
  }
  return undefined;
};

export const readEngine6LiveItineraryTitleSource = (
  record: Record<string, unknown>
): Engine6ItineraryTitleSource | undefined =>
  normalizeTitleSource(record.titleSource);

export const normalizeItineraryTitleForComparison = (
  value: string | null | undefined
): string =>
  (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenizeItineraryTitleForComparison = (value: string): string[] =>
  normalizeItineraryTitleForComparison(value)
    .split(" ")
    .filter(token => token.length > 1 && !STOP_WORDS.has(token));

export const fuzzyMatchEngine6ItineraryStopTitles = (
  left: string | null | undefined,
  right: string | null | undefined
): boolean => {
  const normalizedLeft = normalizeItineraryTitleForComparison(left);
  const normalizedRight = normalizeItineraryTitleForComparison(right);
  if (!normalizedLeft || !normalizedRight) {
    return false;
  }
  if (normalizedLeft === normalizedRight) {
    return true;
  }
  if (
    normalizedLeft.includes(normalizedRight) ||
    normalizedRight.includes(normalizedLeft)
  ) {
    return true;
  }

  const leftTokens = tokenizeItineraryTitleForComparison(normalizedLeft);
  const rightTokens = tokenizeItineraryTitleForComparison(normalizedRight);
  if (!leftTokens.length || !rightTokens.length) {
    return false;
  }

  const overlap = leftTokens.filter(token => rightTokens.includes(token));
  if (overlap.length >= 2) {
    return true;
  }
  if (
    overlap.length >= 1 &&
    (leftTokens.length === 1 || rightTokens.length === 1)
  ) {
    return true;
  }

  const union = new Set([...leftTokens, ...rightTokens]).size;
  return union > 0 && overlap.length / union >= 0.5;
};

const isAuthoritativeLiveItineraryTitleSource = (
  source: Engine6ItineraryTitleSource | undefined
): boolean =>
  source === "json-ld" ||
  source === "public-json-ld" ||
  source === "explicit" ||
  source === "product-override";

const stopsAlignAtSharedIndex = (
  nativeItem: Engine6ItineraryItem | undefined,
  liveItem: Engine6LiveItineraryItem
): boolean => {
  if (!isAuthoritativeLiveItineraryTitleSource(liveItem.titleSource)) {
    return true;
  }

  return (
    fuzzyMatchEngine6ItineraryStopTitles(
      nativeItem?.title,
      liveItem.title
    ) ||
    fuzzyMatchEngine6ItineraryStopTitles(
      nativeItem?.title,
      liveItem.description
    )
  );
};

export const detectEngine6ItineraryCompositionDivergence = (
  nativeItinerary: Engine6ItineraryItem[],
  liveItinerary: Engine6LiveItineraryItem[]
): Engine6ItineraryCompositionDivergence => {
  const reasons: string[] = [];

  if (!liveItinerary.length) {
    return { diverged: false, reasons };
  }

  if (nativeItinerary.length !== liveItinerary.length) {
    reasons.push(
      `itinerary-length-mismatch:native=${nativeItinerary.length},live=${liveItinerary.length}`
    );
    return { diverged: true, reasons };
  }

  liveItinerary.forEach((liveItem, index) => {
    if (
      stopsAlignAtSharedIndex(nativeItinerary[index], liveItem)
    ) {
      return;
    }

    reasons.push(`authoritative-title-mismatch:index=${index}`);
  });

  return {
    diverged: reasons.length > 0,
    reasons,
  };
};

export const getEngine6ItineraryMergeMode = (
  nativeItinerary: Engine6ItineraryItem[],
  liveItinerary: Engine6LiveItineraryItem[]
): Engine6ItineraryMergeMode =>
  detectEngine6ItineraryCompositionDivergence(nativeItinerary, liveItinerary)
    .diverged
    ? "diverged"
    : "aligned";

/**
 * Native/bundled titles win whenever present. Live titles apply only when
 * the native stop has no title, using live confidence priority:
 * json-ld/public-json-ld > explicit/product-override > description-inferred.
 */
export const resolveEngine6MergedItineraryTitle = (
  nativeItem: Engine6ItineraryItem | undefined,
  liveItem: Pick<Engine6LiveItineraryItem, "title" | "titleSource">
): string => {
  const nativeTitle = nativeItem?.title?.trim();
  if (nativeTitle && liveItem.titleSource === "description-inferred") {
    return nativeTitle;
  }
  if (nativeTitle) {
    return nativeTitle;
  }

  const liveTitle = liveItem.title?.trim();
  if (!liveTitle) {
    return "This stop";
  }

  return liveTitle;
};

const isHighConfidenceLiveItineraryTitleSource = (
  source: Engine6ItineraryTitleSource | undefined
): boolean => isAuthoritativeLiveItineraryTitleSource(source);

export type Engine6DivergedMergedItineraryTitleContext = {
  productCode?: string | null;
  rawProduct?: Record<string, unknown> | null;
  rowIndex: number;
  rowCount: number;
};

/**
 * Diverged composition merge keeps live row structure and resolves titles via
 * the diverged title authority ladder when product context is available.
 */
export const resolveEngine6DivergedMergedItineraryTitle = (
  nativeItem: Engine6ItineraryItem | undefined,
  liveItem: Pick<
    Engine6LiveItineraryItem,
    "title" | "titleSource" | "description"
  >,
  context?: Engine6DivergedMergedItineraryTitleContext
): string => {
  if (
    context?.productCode &&
    context.rowIndex >= 0 &&
    context.rowCount > 0
  ) {
    return resolveEngine6DivergedItineraryTitle({
      productCode: context.productCode,
      rawProduct: context.rawProduct ?? null,
      rowIndex: context.rowIndex,
      rowCount: context.rowCount,
      liveTitle: liveItem.title,
      liveTitleSource: liveItem.titleSource,
    }).title;
  }

  const nativeTitle = nativeItem?.title?.trim();
  const liveTitle = liveItem.title?.trim();

  if (
    nativeTitle &&
    liveTitle &&
    fuzzyMatchEngine6ItineraryStopTitles(nativeTitle, liveTitle)
  ) {
    return nativeTitle;
  }

  if (isHighConfidenceLiveItineraryTitleSource(liveItem.titleSource)) {
    if (liveTitle) {
      return liveTitle;
    }
    if (nativeTitle) {
      return nativeTitle;
    }
    return "This stop";
  }

  if (liveTitle) {
    return liveTitle;
  }

  if (nativeTitle) {
    return nativeTitle;
  }

  return "This stop";
};

const mergeEngine6NativeItineraryWithLiveAligned = (
  nativeItinerary: Engine6ItineraryItem[],
  liveItinerary: Engine6LiveItineraryItem[]
): Engine6ItineraryItem[] =>
  liveItinerary.map((liveItem, index) => {
    const nativeItem = nativeItinerary[index];
    const { titleSource: _titleSource, ...liveFields } = liveItem;

    return {
      ...(nativeItem ?? {}),
      ...liveFields,
      title: resolveEngine6MergedItineraryTitle(nativeItem, liveItem),
    };
  });

const mergeEngine6NativeItineraryWithLiveDiverged = (
  nativeItinerary: Engine6ItineraryItem[],
  liveItinerary: Engine6LiveItineraryItem[],
  mergeContext?: Engine6ItineraryMergeContext
): Engine6ItineraryItem[] =>
  liveItinerary.map((liveItem, index) => {
    const nativeItem = nativeItinerary[index];
    const { titleSource: _titleSource, ...liveFields } = liveItem;

    return {
      ...(nativeItem ?? {}),
      ...liveFields,
      title: resolveEngine6DivergedMergedItineraryTitle(nativeItem, liveItem, {
        productCode: mergeContext?.productCode,
        rawProduct: mergeContext?.rawProduct,
        rowIndex: index,
        rowCount: liveItinerary.length,
      }),
    };
  });

export const mergeEngine6NativeItineraryWithLive = (
  nativeItinerary: Engine6ItineraryItem[],
  liveItinerary: Engine6LiveItineraryItem[],
  mergeContext?: Engine6ItineraryMergeContext
): Engine6ItineraryItem[] => {
  if (!liveItinerary.length) {
    return nativeItinerary;
  }

  const mergeMode = getEngine6ItineraryMergeMode(
    nativeItinerary,
    liveItinerary
  );

  if (mergeMode === "diverged") {
    return mergeEngine6NativeItineraryWithLiveDiverged(
      nativeItinerary,
      liveItinerary,
      mergeContext
    );
  }

  return mergeEngine6NativeItineraryWithLiveAligned(
    nativeItinerary,
    liveItinerary
  );
};
