import type { Tour } from "../data/tours.types";
import {
  formatEngine6PriceLabel,
  getEngine6CommercialSnapshot,
} from "./commercial";
import { toEngine6Card } from "./cards";
import { ENGINE6_SPECIMEN_PRODUCT_CODE } from "./routes";
import { engine6ResolvedTours } from "./registry";
import type { Engine6Tour } from "./types";

const ENGINE6_CANONICAL_TOUR_PATH =
  /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/;

export const toEngine6ListingTour = (tour: Engine6Tour): Tour => {
  const [, stateSlug = "", citySlug = "", slug = ""] =
    ENGINE6_CANONICAL_TOUR_PATH.exec(tour.canonicalPath) ?? [];
  const card = toEngine6Card(tour);
  const commercial = getEngine6CommercialSnapshot(tour);

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
    heroImage: tour.heroImageUrl,
    resolvedImageUrl: tour.heroImageUrl || null,
    primaryImageUrl: tour.heroImageUrl,
    badges: {
      rating: commercial.rating ?? undefined,
      reviewCount: commercial.reviewCount ?? undefined,
      priceFrom: formatEngine6PriceLabel(commercial.priceAmount) ?? undefined,
    },
    startingPrice: commercial.priceAmount ?? undefined,
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

export const ENGINE6_63657P1_CARD_IMAGE_URL = specimenTour?.heroImageUrl ?? "";

export const engine6SpecimenTour = specimenTour!;

export const engine6ListingTours: Tour[] = engine6ResolvedTours.map(
  toEngine6ListingTour
);
