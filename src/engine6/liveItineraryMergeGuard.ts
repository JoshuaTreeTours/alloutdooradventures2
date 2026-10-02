import type { Engine6ItineraryItem, Engine6Tour } from "./types";

const WEAK_EXACT_TITLES = new Set([
  "this",
  "stop",
  "pass by",
  "attraction",
  "location",
  "point of interest",
]);

const normalizeText = (value: string | null | undefined) =>
  (value ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

const words = (value: string | null | undefined) =>
  normalizeText(value).split(" ").filter(Boolean);

const hasMeaningfulTitle = (item: Engine6ItineraryItem) => {
  const title = item.title?.trim() ?? "";
  const normalizedTitle = normalizeText(title);
  const description = item.description?.trim() ?? "";
  const normalizedDescription = normalizeText(description);
  const titleWords = words(title);

  if (!normalizedTitle) return false;
  if (WEAK_EXACT_TITLES.has(normalizedTitle)) return false;
  if (titleWords.length > 12) return false;

  if (normalizedDescription) {
    if (normalizedTitle === normalizedDescription) return false;

    const descriptionWords = words(description);
    const titleWordSet = new Set(titleWords);
    const sharedWords = descriptionWords.filter(word => titleWordSet.has(word));
    const overlapRatio =
      titleWords.length > 0 ? sharedWords.length / titleWords.length : 0;

    if (titleWords.length >= 5 && overlapRatio >= 0.8) return false;
    if (
      /^(this|filled|pedal|ride|walk|drive|travel|head|continue|pass|stop|visit|see|explore|enjoy)\b/i.test(
        title
      )
    ) {
      return false;
    }
  }

  return true;
};

export const hasMeaningfulEngine6ItineraryTitles = (
  itinerary: Engine6ItineraryItem[] | null | undefined
) =>
  Boolean(itinerary?.length) &&
  itinerary!.length >= 2 &&
  itinerary!.every(hasMeaningfulTitle);

export const hasWeakEngine6ItineraryTitles = (
  itinerary: Engine6ItineraryItem[] | null | undefined
) =>
  Boolean(itinerary?.length) &&
  itinerary!.some(item => !hasMeaningfulTitle(item));

export const preserveEngine6BaselineItineraryWhenStronger = ({
  baselineTour,
  liveTour,
}: {
  baselineTour: Engine6Tour | null | undefined;
  liveTour: Engine6Tour;
}): Engine6Tour => {
  if (!baselineTour) return liveTour;

  const baselineIsStrong = hasMeaningfulEngine6ItineraryTitles(
    baselineTour.itinerary
  );
  const liveIsWeak = hasWeakEngine6ItineraryTitles(liveTour.itinerary);

  if (!baselineIsStrong || !liveIsWeak) {
    return liveTour;
  }

  return {
    ...liveTour,
    itinerary: baselineTour.itinerary,
    itinerarySummaryText:
      baselineTour.itinerarySummaryText ?? liveTour.itinerarySummaryText,
    diagnostics: {
      ...liveTour.diagnostics,
      itineraryFieldPath: baselineTour.diagnostics.itineraryFieldPath,
      itineraryItemCount: baselineTour.itinerary.length,
      itinerarySourceUsed: baselineTour.diagnostics.itinerarySourceUsed,
      itineraryStructuredSourceUsed:
        baselineTour.diagnostics.itineraryStructuredSourceUsed,
      itineraryFallbackSummaryUsed:
        baselineTour.diagnostics.itineraryFallbackSummaryUsed,
    },
  };
};
