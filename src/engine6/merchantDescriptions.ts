import { resolveEngine6GovernedProductDescription } from "./governedEditorialDescriptions";
import { engine6ResolvedTours } from "./registry";
import type { Engine6Tour } from "./types";

export const resolveMerchantDescription = (args: {
  productCode: string;
  title: string;
  city: string;
  state?: string | null;
  categoryLabel?: string | null;
  productOverviewDescription?: string | null;
  pageMetadataDescription?: string | null;
  jsonLdProductDescription?: string | null;
  viatorApiDescription?: string | null;
  itineraryStops?: Engine6Tour["itinerary"];
  highlights?: string[];
  included?: string[];
  durationText?: string | null;
}) => {
  const tour = engine6ResolvedTours.find(
    candidate => candidate.productCode === args.productCode
  );

  if (tour) {
    return resolveEngine6GovernedProductDescription(tour);
  }

  throw new Error(
    `Unable to resolve governed merchant description for unknown product code ${args.productCode}.`
  );
};

/** @deprecated Legacy merchant-approved map retained only for historical audit references. */
export const MERCHANT_APPROVED_DESCRIPTIONS: Record<string, string> = {};
