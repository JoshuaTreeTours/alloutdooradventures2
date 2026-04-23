import type { Tour } from "../../data/tours.types";
import { buildEngine4TourPath } from "../buildEngine4TourPath";
import {
  engine4ViatorApiFallbackByProductCode,
  engine4ViatorTours,
} from "../data/viatorTours";
import { mapViatorToEngine4Tour } from "../viator/mapViatorToEngine4Tour";
import { isExcludedProductCode } from "../../data/excludedProductCodes";

type Engine4ListingEntry = {
  tour: Tour;
  href: string;
};

export const getEngine4ListingEntries = (
  stateSlug: string,
  citySlug: string
): Engine4ListingEntry[] =>
  engine4ViatorTours
    .filter(
      tour =>
        tour.destination.stateSlug === stateSlug &&
        tour.destination.citySlug === citySlug &&
        !isExcludedProductCode(tour.productCode)
    )
    .map(record => {
      const vm = mapViatorToEngine4Tour({
        record,
        apiTour: engine4ViatorApiFallbackByProductCode[record.productCode],
      });
      const href = buildEngine4TourPath(record);

      return {
        href,
        tour: {
          id: `engine4-${record.productCode}`,
          engine: "engine4",
          productCode: record.productCode,
          slug: href.split("/").at(-1) ?? "",
          title: vm.title,
          shortDescription: vm.content.highlights[0],
          categories: ["hiking"],
          primaryCategory: "hiking",
          destination: {
            country: record.destination.country,
            state: record.destination.state,
            stateSlug: record.destination.stateSlug,
            city: record.destination.city,
            citySlug: record.destination.citySlug,
          },
          heroImage: vm.primaryImage ?? vm.heroImage ?? undefined,
          primaryImageUrl: vm.primaryImage ?? vm.heroImage ?? undefined,
          galleryImages: vm.galleryImages,
          badges: {
            rating: vm.facts.ratingValue,
            reviewCount: vm.facts.reviewCount,
            duration: vm.facts.duration,
            priceFrom: vm.facts.priceFrom,
          },
          activitySlugs: ["hiking"],
          bookingProvider: "viator",
          bookingUrl: vm.bookingUrl,
          longDescription: vm.content.overview,
          startingPrice:
            Number(vm.facts.priceFrom?.replace(/[^0-9.]/g, "")) || undefined,
          currency: "USD",
          content: {
            overview: vm.content.overview,
            highlights: vm.content.highlights,
          },
        },
      } satisfies Engine4ListingEntry;
    });
