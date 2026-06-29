type Engine6ItineraryRowGovernanceInput = {
  productCode: string | null;
  rowIndex: number;
  currentTitle?: string | null;
};

type ItineraryRowSuppressionRule = {
  /** Exact rendered row title confirmed by product-level review as malformed. */
  title: string;
};

/**
 * Explicit Engine6 itinerary rendering governance.
 *
 * Suppression is intentionally product- and row-scoped so governance can remove
 * confirmed malformed rendered rows without introducing broad heuristics that
 * might hide legitimate itinerary stops on unrelated products or rows.
 */
const PRODUCT_ROW_SUPPRESSIONS: Record<
  string,
  Record<number, readonly ItineraryRowSuppressionRule[]>
> = {
  "6508TAHOE": {
    6: [{ title: "inspiration point for photos" }],
    7: [{ title: "This" }],
  },
};

const normalizeRenderedTitleForGovernance = (
  value: string | null | undefined
): string => (value ?? "").replace(/\s+/g, " ").trim().toLowerCase();

export const shouldSuppressEngine6ItineraryRow = ({
  productCode,
  rowIndex,
  currentTitle,
}: Engine6ItineraryRowGovernanceInput): boolean => {
  const normalizedProductCode = productCode?.trim().toUpperCase();
  if (!normalizedProductCode) {
    return false;
  }

  const suppressions =
    PRODUCT_ROW_SUPPRESSIONS[normalizedProductCode]?.[rowIndex];
  if (!suppressions?.length) {
    return false;
  }

  const normalizedCurrentTitle =
    normalizeRenderedTitleForGovernance(currentTitle);
  return suppressions.some(
    suppression =>
      normalizedCurrentTitle ===
      normalizeRenderedTitleForGovernance(suppression.title)
  );
};
