export type FareharborPhase3PriceEntry = {
  startingPrice: number;
  currency: string;
  source: "fareharbor-price-preview-v2";
  confidence: "medium";
  basis:
    | "standard-traveler-consensus"
    | "structured-adult"
    | "standard-ticket";
  basisLabels: string[];
  lastUpdated: string;
};

// Phase 3 shadow cohort. Generated for review; not imported by production pricing.
export const fareharborPricingPhase3: Record<string, FareharborPhase3PriceEntry> = {};
