import { isEngine6ProseItineraryTitle } from "./divergedItineraryTitle.js";
import type { Engine6ItineraryTitleSource } from "./itineraryTitlePolicy.js";

const GENERIC_TITLE_FRAGMENTS = new Set([
  "this",
  "this stop",
  "then",
  "pass",
  "view",
  "visit",
  "stop",
  "continue",
  "next",
  "filled with shops",
]);

export const buildEngine6NeutralItineraryStopTitle = (rowIndex: number): string =>
  `Itinerary Stop ${rowIndex + 1}`;

export const isEngine6GenericItineraryTitleFragment = (
  value: string | null | undefined
): boolean => {
  const normalized = value?.trim().replace(/\s+/g, " ").toLowerCase() ?? "";
  if (!normalized || normalized.length < 2) return true;
  if (GENERIC_TITLE_FRAGMENTS.has(normalized)) return true;
  return /^this\b/i.test(normalized);
};

export const isEngine6DescriptionDerivedItineraryTitleSource = (
  source: Engine6ItineraryTitleSource | undefined
): boolean => source === "description-inferred";

/**
 * Final itinerary stop title gate for Engine6 builds and merges.
 * Accepts structured/authoritative titles only; rejects description-derived,
 * prose, and generic fragments in favor of a neutral numbered fallback.
 */
export const governEngine6ItineraryStopTitle = (args: {
  candidateTitle?: string | null;
  titleSource?: Engine6ItineraryTitleSource;
  rowIndex: number;
}): { title: string; titleSource: Engine6ItineraryTitleSource } => {
  const candidate = args.candidateTitle?.trim().replace(/\s+/g, " ") ?? "";
  const titleSource = args.titleSource ?? "explicit";

  if (
    candidate &&
    !isEngine6DescriptionDerivedItineraryTitleSource(titleSource) &&
    !isEngine6ProseItineraryTitle(candidate) &&
    !isEngine6GenericItineraryTitleFragment(candidate)
  ) {
    return { title: candidate, titleSource };
  }

  return {
    title: buildEngine6NeutralItineraryStopTitle(args.rowIndex),
    titleSource: "explicit",
  };
};
