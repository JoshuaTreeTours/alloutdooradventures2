import type { Tour } from "../../data/tours.types";
import { buildEngine5TourPath } from "../buildEngine5TourPath";
import {
  engine5ViatorApiFallbackByProductCode,
  engine5ViatorTours,
} from "../data/viatorTours";
import { mapViatorToEngine5Tour } from "../viator/mapViatorToEngine5Tour";

type Engine5ListingEntry = {
  tour: Tour;
  href: string;
};

export const getEngine5ListingEntries = (
  stateSlug: string,
  citySlug: string
): Engine5ListingEntry[] =>
  engine5ViatorTours
    .filter(
      entry =>
        entry.destination.stateSlug === stateSlug &&
        entry.destination.citySlug === citySlug
    )
    .map(record => {
      const vm = mapViatorToEngine5Tour({
        record,
        apiTour: engine5ViatorApiFallbackByProductCode[record.productCode],
      });
      const href = buildEngine5TourPath(record);

      return {
        href,
        tour: {
          id: `engine5-${record.productCode}`,
          engine: "engine5",
          productCode: record.productCode,
          slug: vm.slug,
          title: vm.title,
          shortDescription: vm.content.highlights[0] ?? vm.content.overview,
          categories: ["hiking"],
          primaryCategory: "hiking",
          destination: {
            country: record.destination.country,
            state: record.destination.state,
            stateSlug: record.destination.stateSlug,
            city: record.destination.city,
            citySlug: record.destination.citySlug,
          },
          heroImage: vm.primaryImage,
          primaryImageUrl: vm.primaryImage,
          galleryImages: [vm.primaryImage],
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
      } satisfies Engine5ListingEntry;
    });
