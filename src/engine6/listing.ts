import type { Tour } from "../data/tours.types";
import { isUSStateName } from "../constants/usStates";
import { toEngine6Card } from "./cards";
import { legacyFhMigratedTours } from "./legacyFh/registry";
import { ENGINE6_SPECIMEN_PRODUCT_CODE } from "./routes";
import { engine6ResolvedTours } from "./registry";
import type { Engine6Tour } from "./types";

const ENGINE6_CANONICAL_TOUR_PATH =
  /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/;

const resolveEngine6ListingCountry = (tour: Engine6Tour, stateSlug: string) => {
  if (isUSStateName(tour.state) || stateSlug === "united-states") {
    return "United States";
  }

  return tour.state;
};

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
      country: resolveEngine6ListingCountry(tour, stateSlug),
      state: tour.state,
      stateSlug,
      city: tour.city,
      citySlug,
    },
    heroImage: tour.heroImageUrl,
    resolvedImageUrl: tour.heroImageUrl || null,
    primaryImageUrl: tour.heroImageUrl,
    badges: {
      rating: tour.aggregateRating ?? undefined,
      reviewCount: tour.reviewCount ?? undefined,
      priceFrom: tour.priceFormatted,
    },
    startingPrice: tour.priceAmount ?? undefined,
    currency: "USD",
    tagPills: tour.categoryLabel ? [tour.categoryLabel] : undefined,
    activitySlugs: ["bike-tours"],
    bookingProvider: tour.ownership.ctaOwner,
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

const dedupeEngine6ToursByCanonicalPath = (tours: Engine6Tour[]) => {
  const byPath = new Map<string, Engine6Tour>();

  for (const tour of tours) {
    const existing = byPath.get(tour.canonicalPath);
    if (!existing || tour.diagnostics.source !== "legacy-fh-migrated") {
      byPath.set(tour.canonicalPath, tour);
    }
  }

  return Array.from(byPath.values());
};

export const engine6ListingTours: Tour[] = dedupeEngine6ToursByCanonicalPath([
  ...engine6ResolvedTours,
  ...legacyFhMigratedTours,
]).map(toEngine6ListingTour);
