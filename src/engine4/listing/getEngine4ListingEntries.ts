import type { Tour } from "../../data/tours.types";
import { buildEngine4TourPath } from "../buildEngine4TourPath";
import {
  engine4ViatorApiFallbackByProductCode,
  engine4ViatorTours,
} from "../data/viatorTours";
import { mapViatorToEngine4Tour } from "../viator/mapViatorToEngine4Tour";

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
        tour.destination.state === stateSlug &&
        tour.destination.city === citySlug
    )
    .map(record => {
      const vm = mapViatorToEngine4Tour({
        record,
        apiTour:
          engine4ViatorApiFallbackByProductCode[record.viator.productCode],
      });
      const href = buildEngine4TourPath(record);

      return {
        href,
        tour: {
          id: `engine4-${record.viator.productCode}`,
          engine: "engine4",
          productCode: record.viator.productCode,
          slug: href.split("/").at(-1) ?? "",
          title: vm.title,
          shortDescription: vm.highlights[0],
          categories: ["hiking"],
          primaryCategory: "hiking",
          destination: {
            country: "United States",
            state: "Colorado",
            stateSlug,
            city: "Aspen",
            citySlug,
          },
          heroImage: vm.heroImage,
          primaryImageUrl: vm.heroImage,
          galleryImages: vm.galleryImages,
          badges: {
            rating: vm.rating,
            reviewCount: vm.reviewCount,
            duration: vm.duration,
            priceFrom: vm.fromPrice,
          },
          activitySlugs: ["hiking"],
          bookingProvider: "viator",
          bookingUrl: vm.bookingUrl,
          longDescription: vm.overview,
          startingPrice:
            Number(vm.fromPrice?.replace(/[^0-9.]/g, "")) || undefined,
          currency: "USD",
        },
      } satisfies Engine4ListingEntry;
    });
