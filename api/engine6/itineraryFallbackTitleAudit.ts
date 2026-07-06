export type Engine6ItineraryFallbackAuditItem = {
  productCode: string;
  productTitle: string;
  itineraryIndex: number;
  title: string;
  path?: string;
  titleSource?: string;
};

type Engine6TourLike = {
  productCode?: string | null;
  title?: string | null;
  canonicalPath?: string | null;
  path?: string | null;
  itinerary?: Array<{ title?: string | null; titleSource?: string | null }>;
};

const NEUTRAL_FALLBACK_TITLE_PATTERN = /^(?:itinerary\s+stop\s+\d+|stop\s+\d+|stop)$/i;

export const isEngine6NeutralFallbackItineraryTitle = (
  title: string | null | undefined
): boolean => {
  const normalized = title?.trim().replace(/\s+/g, " ") ?? "";
  return NEUTRAL_FALLBACK_TITLE_PATTERN.test(normalized);
};

export const auditEngine6NeutralFallbackItineraryTitles = (
  tours: readonly Engine6TourLike[]
): Engine6ItineraryFallbackAuditItem[] =>
  tours.flatMap(tour =>
    (tour.itinerary ?? []).flatMap((item, index) => {
      const title = item.title?.trim() ?? "";
      if (!isEngine6NeutralFallbackItineraryTitle(title)) return [];

      return [
        {
          productCode: tour.productCode?.trim() || "UNKNOWN",
          productTitle: tour.title?.trim() || "Untitled Engine6 product",
          itineraryIndex: index + 1,
          title,
          ...(tour.canonicalPath || tour.path
            ? { path: (tour.canonicalPath ?? tour.path) as string }
            : {}),
          ...(item.titleSource ? { titleSource: item.titleSource } : {}),
        },
      ];
    })
  );
