import { isMerchantFeedExcludedProductCode } from "../data/excludedProductCodes";
import { engine6ResolvedTours } from "./registry";
import { hasEngine6GovernedRatingAndReviewCount } from "./surfacingEligibility";
import type { Engine6Tour } from "./types";

export const isMerchantFeedEligibleTour = (tour: Engine6Tour) =>
  !isMerchantFeedExcludedProductCode(tour.productCode) &&
  hasEngine6GovernedRatingAndReviewCount(tour);

export const merchantFeedEligibleTours = engine6ResolvedTours.filter(
  isMerchantFeedEligibleTour
);
