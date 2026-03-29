import type { Tour } from "../data/tours.types";
import { toEngine6Card } from "./cards";
import { ENGINE6_SPECIMEN_PRODUCT_CODE } from "./routes";
import { engine6ResolvedTours } from "./registry";
import type { Engine6Tour } from "./types";

const ENGINE6_CANONICAL_TOUR_PATH =
  /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/;

const toEngine6ListingTour = (tour: Engine6Tour): Tour => {
  const [, stateSlug = "", citySlug = "", slug = ""] =
    ENGINE6_CANONICAL_TOUR_PATH.exec(tour.canonicalPath) ?? [];
  const card = toEngine6Card(tour);

  return {
    id: `engine6-${tour.productCode}`,
    engine: "engine6",
    productCode: tour.productCode,
    slug,
    title: tour.title,
    shortDescription: card.description,
    categories: tour.categories,
    primaryCategory: tour.primaryCategory ?? undefined,
    destination: {
      country: "United States",
      state: tour.state,
      stateSlug,
      city: tour.city,
      citySlug,
    },
    heroImage: tour.resolvedImageUrl ?? "",
    resolvedImageUrl: tour.resolvedImageUrl,
    primaryImageUrl: tour.resolvedImageUrl ?? undefined,
    badges: {
      rating: tour.aggregateRating ?? undefined,
      reviewCount: tour.reviewCount ?? undefined,
      priceFrom: tour.priceFormatted,
    },
    startingPrice: tour.priceAmount ?? undefined,
    currency: "USD",
    tagPills: tour.categoryLabel ? [tour.categoryLabel] : undefined,
    activitySlugs: ["bike-tours"],
    bookingProvider: "viator",
    bookingUrl: tour.bookingUrl,
    longDescription: tour.overviewText ?? card.description,
  };
};

const specimenTour =
  engine6ResolvedTours.find(
    tour => tour.productCode === ENGINE6_SPECIMEN_PRODUCT_CODE
  ) ?? engine6ResolvedTours[0];

export const ENGINE6_63657P1_CARD_IMAGE_URL = specimenTour?.resolvedImageUrl ?? "";

export const engine6SpecimenTour = specimenTour!;

export const engine6ListingTours: Tour[] = engine6ResolvedTours.map(
  toEngine6ListingTour
);
