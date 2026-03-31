import { resolveLegacyFhCommercialConfidenceReason } from "./legacyFh/commercialConfidence";
import type { LegacyFhMigratedProductRecord } from "./legacyFh/types";
import type { Engine6OwnershipPolicy } from "./types";

type CommercialFieldSet = {
  priceAmount: number | null;
  aggregateRating: number | null;
  reviewCount: number | null;
};

export type LegacyFhDedupeResolution = {
  ownership: Engine6OwnershipPolicy;
  commercial: CommercialFieldSet;
  diagnostics: {
    commercialConfidenceReason:
      | "product-code-match"
      | "high-confidence-heuristic"
      | "no-confident-match";
    viatorCommercialFieldsUsed: boolean;
    commercialSourceWinner: "fareharbor" | "viator";
    commercialPriceFieldPath: string;
    ratingFieldPath: string;
    reviewCountFieldPath: string;
  };
};

const resolveCommercialFallbackReason = ({
  confidentMatch,
  usedAnyViatorField,
}: {
  confidentMatch: boolean;
  usedAnyViatorField: boolean;
}): Engine6OwnershipPolicy["commercialFallbackReason"] => {
  if (usedAnyViatorField) {
    return "none";
  }

  return confidentMatch
    ? "viator-commercial-unavailable"
    : "no-confident-viator-match";
};

export const resolveLegacyFhDedupeConstitution = (
  record: LegacyFhMigratedProductRecord
): LegacyFhDedupeResolution => {
  const confidenceReason =
    record.matchedViatorCommercial?.confidenceReason ??
    resolveLegacyFhCommercialConfidenceReason(
      record.matchedViatorCommercial?.confidenceSignals
    );
  const confidentMatch = confidenceReason !== "no-confident-match";
  const matchedProductCode = record.matchedViatorCommercial?.productCode ?? "unknown";

  const viatorPriceAmount = record.matchedViatorCommercial?.priceAmount ?? null;
  const viatorAggregateRating =
    record.matchedViatorCommercial?.aggregateRating ?? null;
  const viatorReviewCount = record.matchedViatorCommercial?.reviewCount ?? null;

  const useViatorPrice = confidentMatch && typeof viatorPriceAmount === "number";
  const useViatorRating =
    confidentMatch && typeof viatorAggregateRating === "number";
  const useViatorReviewCount =
    confidentMatch && typeof viatorReviewCount === "number";
  const usedAnyViatorField =
    useViatorPrice || useViatorRating || useViatorReviewCount;

  return {
    ownership: {
      routeOwner: "fareharbor",
      ctaOwner: "fareharbor",
      presentationOwner: "engine6",
      commercialOwner: usedAnyViatorField ? "viator" : "fareharbor",
      commercialFallbackReason: resolveCommercialFallbackReason({
        confidentMatch,
        usedAnyViatorField,
      }),
    },
    commercial: {
      priceAmount: useViatorPrice
        ? viatorPriceAmount
        : record.priceSnapshot.amount ?? null,
      aggregateRating: useViatorRating
        ? viatorAggregateRating
        : record.ratingSnapshot.rating,
      reviewCount: useViatorReviewCount
        ? viatorReviewCount
        : record.ratingSnapshot.reviewCount,
    },
    diagnostics: {
      commercialConfidenceReason: confidenceReason,
      viatorCommercialFieldsUsed: usedAnyViatorField,
      commercialSourceWinner: usedAnyViatorField ? "viator" : "fareharbor",
      commercialPriceFieldPath: useViatorPrice
        ? `matchedViatorCommercial.priceAmount:${matchedProductCode}`
        : "legacy.price",
      ratingFieldPath: useViatorRating
        ? `matchedViatorCommercial.aggregateRating:${matchedProductCode}`
        : "legacy.rating",
      reviewCountFieldPath: useViatorReviewCount
        ? `matchedViatorCommercial.reviewCount:${matchedProductCode}`
        : "legacy.reviewCount",
    },
  };
};
