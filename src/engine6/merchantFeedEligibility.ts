import { isMerchantFeedExcludedProductCode } from "../data/excludedProductCodes";
import { engine6ResolvedTours } from "./registry";
import type { Engine6Tour } from "./types";

export const isMerchantFeedEligibleTour = (tour: Engine6Tour) =>
  !isMerchantFeedExcludedProductCode(tour.productCode);

export const merchantFeedEligibleTours = engine6ResolvedTours.filter(
  isMerchantFeedEligibleTour
);
