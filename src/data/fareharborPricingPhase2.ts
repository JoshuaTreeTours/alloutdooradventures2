export type FareharborPhase2PriceEntry = {
  startingPrice: number;
  currency: string;
  source: "fareharbor-price-preview-v2";
  confidence: "medium";
  basis: "standard-traveler";
  basisLabel: string;
  lastUpdated: string;
};

// Phase 2 shadow cohort. Generated for review; not imported by production pricing.
export const fareharborPricingPhase2: Record<string, FareharborPhase2PriceEntry> = {};
