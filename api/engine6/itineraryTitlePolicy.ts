export const GENERIC_ENGINE6_ITINERARY_TITLES = new Set([
  "this",
  "stop",
  "pass by",
  "attraction",
  "location",
  "point of interest",
  "itinerary",
  "item",
]);

export const normalizeEngine6ItineraryTitleForComparison = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

export const isGenericEngine6ItineraryTitle = (
  value: string | null | undefined
): boolean => {
  if (!value?.trim()) return true;
  return GENERIC_ENGINE6_ITINERARY_TITLES.has(
    normalizeEngine6ItineraryTitleForComparison(value)
  );
};

export type Engine6ItineraryTitleStopType = "stop" | "pass-by" | undefined;

export const resolveEngine6ItineraryFallbackTitle = (
  stopType: Engine6ItineraryTitleStopType
): string => {
  if (stopType === "pass-by") return "Pass By";
  if (stopType === "stop") return "Stop";
  return "Itinerary Item";
};

export const resolveEngine6ItineraryTitle = (args: {
  sourceTitleFields?: Array<string | null | undefined>;
  namingFields?: Array<string | null | undefined>;
  titleOverride?: string | null;
  stopType?: Engine6ItineraryTitleStopType;
}): string => {
  for (const field of args.sourceTitleFields ?? []) {
    if (!isGenericEngine6ItineraryTitle(field)) {
      return field!.trim();
    }
  }

  for (const field of args.namingFields ?? []) {
    if (!isGenericEngine6ItineraryTitle(field)) {
      return field!.trim();
    }
  }

  if (!isGenericEngine6ItineraryTitle(args.titleOverride)) {
    return args.titleOverride!.trim();
  }

  return resolveEngine6ItineraryFallbackTitle(args.stopType);
};
