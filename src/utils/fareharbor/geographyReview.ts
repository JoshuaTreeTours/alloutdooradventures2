import { FAREHARBOR_GEOGRAPHY_REVIEW_IDS } from "./geographyReview.generated";

const normalizeProductId = (value?: string | null) => {
  const normalized = (value ?? "").trim().replace(/^engine2-/, "");
  return normalized.match(/(\d+)$/)?.[1] ?? normalized;
};

export const isFareHarborGeographyReview = (
  value?: string | null
): boolean => FAREHARBOR_GEOGRAPHY_REVIEW_IDS.has(normalizeProductId(value));

export {
  FAREHARBOR_GEOGRAPHY_REVIEW_IDS,
  fareHarborGeographyReviewEntries,
} from "./geographyReview.generated";
