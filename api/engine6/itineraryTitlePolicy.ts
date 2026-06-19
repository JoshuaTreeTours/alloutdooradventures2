export const ENGINE6_VIATOR_ITINERARY_ITEM_TITLE_FIELD = "title" as const;

export const buildEngine6ItineraryItemTitleFieldPath = (
  itineraryFieldPath: string,
  rowIndex: number
) =>
  `${itineraryFieldPath}[${rowIndex}].${ENGINE6_VIATOR_ITINERARY_ITEM_TITLE_FIELD}`;

export const buildEngine6ItinerarySourceTitleFieldPattern = (
  itineraryFieldPath: string
) =>
  `${itineraryFieldPath}[].${ENGINE6_VIATOR_ITINERARY_ITEM_TITLE_FIELD}`;

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

export type Engine6ItineraryNamingField = {
  value: string | null | undefined;
  fieldPath: string;
};

export type ResolveEngine6ItineraryTitleResult = {
  title: string;
  usedSourceTitleField: boolean;
  usedNamingField: boolean;
  usedTitleOverride: boolean;
  usedNeutralFallback: boolean;
  missingSourceTitleFieldPath: string | null;
};

export const resolveEngine6ItineraryFallbackTitle = (
  stopType: Engine6ItineraryTitleStopType
): string => {
  if (stopType === "pass-by") return "Pass By";
  if (stopType === "stop") return "Stop";
  return "Itinerary Item";
};

export const resolveEngine6ItineraryTitle = (args: {
  sourceTitle?: string | null;
  sourceTitleFieldPath: string;
  namingFields?: Engine6ItineraryNamingField[];
  titleOverride?: string | null;
  stopType?: Engine6ItineraryTitleStopType;
}): ResolveEngine6ItineraryTitleResult => {
  const trimmedSourceTitle = args.sourceTitle?.trim() ?? "";
  const sourceTitleFieldAbsent = trimmedSourceTitle.length === 0;

  if (!isGenericEngine6ItineraryTitle(trimmedSourceTitle)) {
    return {
      title: trimmedSourceTitle,
      usedSourceTitleField: true,
      usedNamingField: false,
      usedTitleOverride: false,
      usedNeutralFallback: false,
      missingSourceTitleFieldPath: null,
    };
  }

  if (sourceTitleFieldAbsent) {
    for (const field of args.namingFields ?? []) {
      if (!isGenericEngine6ItineraryTitle(field.value)) {
        return {
          title: field.value!.trim(),
          usedNamingField: true,
          usedSourceTitleField: false,
          usedTitleOverride: false,
          usedNeutralFallback: false,
          missingSourceTitleFieldPath: null,
        };
      }
    }

    if (!isGenericEngine6ItineraryTitle(args.titleOverride)) {
      return {
        title: args.titleOverride!.trim(),
        usedTitleOverride: true,
        usedSourceTitleField: false,
        usedNamingField: false,
        usedNeutralFallback: false,
        missingSourceTitleFieldPath: null,
      };
    }

    return {
      title: resolveEngine6ItineraryFallbackTitle(args.stopType),
      usedNeutralFallback: true,
      usedSourceTitleField: false,
      usedNamingField: false,
      usedTitleOverride: false,
      missingSourceTitleFieldPath: args.sourceTitleFieldPath,
    };
  }

  return {
    title: resolveEngine6ItineraryFallbackTitle(args.stopType),
    usedNeutralFallback: true,
    usedSourceTitleField: false,
    usedNamingField: false,
    usedTitleOverride: false,
    missingSourceTitleFieldPath: null,
  };
};
