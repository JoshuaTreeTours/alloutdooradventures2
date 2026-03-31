export const LEGACY_FH_COMMERCIAL_TITLE_SIMILARITY_THRESHOLD = 0.4;

export type CommercialConfidenceReason =
  | "product-code-match"
  | "high-confidence-heuristic"
  | "no-confident-match";

export type LegacyFhCommercialMatchSignals = {
  productCodeMatched?: boolean;
  titleSimilarity?: number | null;
  meetingPointMatched?: boolean;
  priceWithinDelta?: boolean;
};

export const resolveLegacyFhCommercialConfidenceReason = (
  matchSignals: LegacyFhCommercialMatchSignals | null | undefined
): CommercialConfidenceReason => {
  if (matchSignals?.productCodeMatched === true) {
    return "product-code-match";
  }

  const titlePassed =
    typeof matchSignals?.titleSimilarity === "number" &&
    matchSignals.titleSimilarity >= LEGACY_FH_COMMERCIAL_TITLE_SIMILARITY_THRESHOLD;
  const meetingPointPassed = matchSignals?.meetingPointMatched === true;
  const pricePassed = matchSignals?.priceWithinDelta === true;

  if (titlePassed && meetingPointPassed && pricePassed) {
    return "high-confidence-heuristic";
  }

  return "no-confident-match";
};
