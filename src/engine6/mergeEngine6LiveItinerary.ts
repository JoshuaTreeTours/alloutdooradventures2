import type { Engine6ItineraryTitleSource } from "../../api/engine6/itineraryTitlePolicy";
import type { Engine6ItineraryItem } from "./types";

export type Engine6LiveItineraryItem = Engine6ItineraryItem & {
  titleSource?: Engine6ItineraryTitleSource;
};

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

export const mergeEngine6NativeItineraryWithLive = (
  nativeItinerary: Engine6ItineraryItem[],
  liveItinerary: Engine6LiveItineraryItem[]
): Engine6ItineraryItem[] => {
  if (!liveItinerary.length) {
    return nativeItinerary;
  }

  return liveItinerary.map((liveItem, index) => {
    const nativeItem = nativeItinerary[index];
    const { titleSource: _titleSource, ...liveFields } = liveItem;

    return {
      ...(nativeItem ?? {}),
      ...liveFields,
      title: resolveEngine6MergedItineraryTitle(nativeItem, liveItem),
    };
  });
};
