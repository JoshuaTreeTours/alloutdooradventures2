import type { Engine6Tour } from "../src/engine6/types";
import {
  buildEngine6ParagonProductSelectionConfig,
  prepareEngine6ParagonDownstreamStageFromResolvedTours,
  requireEngine6ParagonProductSelectionGate,
} from "./engine6ParagonGovernancePipeline";

export const requireEngine6ParagonMerchantFeedGate = async (args: {
  destinationLabel: string;
  destinationCitySlug: string;
  viatorDestinationSlug?: string;
  productCodes: readonly string[];
  resolvedTours: Engine6Tour[];
}) => {
  const tours = args.productCodes.map(productCode => {
    const tour = args.resolvedTours.find(entry => entry.productCode === productCode);
    if (!tour) {
      throw new Error(`Missing resolved Engine6 tour for ${productCode}`);
    }
    return tour;
  });

  await prepareEngine6ParagonDownstreamStageFromResolvedTours({
    destinationLabel: args.destinationLabel,
    destinationCitySlug: args.destinationCitySlug,
    viatorDestinationSlug: args.viatorDestinationSlug,
    stage: "merchant-feed",
    tours: tours.map(tour => ({
      productCode: tour.productCode,
      bookingUrl: tour.bookingUrl,
      title: tour.title,
      priceAmount: tour.priceAmount,
      categories: tour.categories,
    })),
  });

  return tours;
};

export const requireEngine6ParagonSitemapGate = async (args: {
  destinationLabel: string;
  destinationCitySlug: string;
  viatorDestinationSlug?: string;
  catalog: Array<{
    productCode: string;
    productUrl: string;
    title: string;
    priceFrom?: number;
  }>;
}) => {
  await requireEngine6ParagonProductSelectionGate({
    config: buildEngine6ParagonProductSelectionConfig({
      destinationLabel: args.destinationLabel,
      destinationCitySlug: args.destinationCitySlug,
      viatorDestinationSlug: args.viatorDestinationSlug,
      tours: args.catalog.map(entry => ({
        productCode: entry.productCode,
        productUrl: entry.productUrl,
        title: entry.title,
        priceFrom: entry.priceFrom ?? 1,
      })),
    }),
    stage: "sitemap",
  });
};
