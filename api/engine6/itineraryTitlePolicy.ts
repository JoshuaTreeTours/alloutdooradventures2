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

export const readEngine6ViatorItineraryItemSourceTitle = (
  value: unknown
): string | null => {
  if (typeof value !== "string") return null;
  if (value.length === 0) return null;
  if (!/\S/.test(value)) return null;
  return value;
};

export type ResolveEngine6ItinerarySourceTitleResult = {
  title: string | null;
  sourceTitleFieldPath: string | null;
  usedConfirmedTitleOverride: boolean;
};

export const resolveEngine6ItinerarySourceTitle = (args: {
  sourceTitle: string | null;
  sourceTitleFieldPath: string;
  confirmedTitleOverride?: string | null;
}): ResolveEngine6ItinerarySourceTitleResult => {
  if (args.sourceTitle !== null) {
    return {
      title: args.sourceTitle,
      sourceTitleFieldPath: args.sourceTitleFieldPath,
      usedConfirmedTitleOverride: false,
    };
  }

  const confirmedTitleOverride =
    typeof args.confirmedTitleOverride === "string" &&
    /\S/.test(args.confirmedTitleOverride)
      ? args.confirmedTitleOverride
      : null;

  if (confirmedTitleOverride) {
    return {
      title: confirmedTitleOverride,
      sourceTitleFieldPath: null,
      usedConfirmedTitleOverride: true,
    };
  }

  return {
    title: null,
    sourceTitleFieldPath: null,
    usedConfirmedTitleOverride: false,
  };
};
