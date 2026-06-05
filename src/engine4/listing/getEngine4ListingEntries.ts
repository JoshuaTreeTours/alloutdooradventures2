import type { Tour } from "../../data/tours.types";
import { classifyTourCategories } from "../../lib/tourCategoryClassifier";
import { buildEngine4TourPath } from "../buildEngine4TourPath";
import {
  engine4ViatorApiFallbackByProductCode,
  engine4ViatorTours,
} from "../data/viatorTours";
import { mapViatorToEngine4Tour } from "../viator/mapViatorToEngine4Tour";
import { isExcludedProductCode } from "../../data/excludedProductCodes";

export type Engine4ListingEntry = {
  tour: Tour;
  href: string;
};

const toEngine4ListingEntry = (
  record: (typeof engine4ViatorTours)[number]
): Engine4ListingEntry => {
  const vm = mapViatorToEngine4Tour({
    record,
    apiTour: engine4ViatorApiFallbackByProductCode[record.productCode],
  });
  const href = buildEngine4TourPath(record);
  const classification = classifyTourCategories({
    title: vm.title,
    overview: vm.content.overview,
    description: vm.content.overview,
    highlights: vm.content.highlights,
    categories: ["hiking"],
  });

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
      primaryDisplayCategory:
        classification.primaryDisplayCategory ?? undefined,
      activityCategories: classification.activityCategories,
      destination: {
        country: record.destination.country,
        state: record.destination.state,
        stateSlug: record.destination.stateSlug,
        city: record.destination.city,
        citySlug: record.destination.citySlug,
      },
      heroImage: vm.primaryImage ?? vm.heroImage ?? "",
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
};

export const getAllEngine4ListingEntries = (): Engine4ListingEntry[] =>
  engine4ViatorTours
    .filter(tour => !isExcludedProductCode(tour.productCode))
    .map(toEngine4ListingEntry);

export const getEngine4ListingEntries = (
  stateSlug: string,
  citySlug: string
): Engine4ListingEntry[] =>
  getAllEngine4ListingEntries().filter(
    entry =>
      entry.tour.destination.stateSlug === stateSlug &&
      entry.tour.destination.citySlug === citySlug
  );
