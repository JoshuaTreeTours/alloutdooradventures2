import type { Tour } from "../data/tours.types";
import { isExcludedProductCode } from "../data/excludedProductCodes";
import merchantFeedCommercialSnapshot from "../../data/merchantFeed-commercial-snapshot.json";
import { isUSStateName } from "../constants/usStates";
import { toEngine6Card } from "./cards";
import { getEngine6TourRatingSourceOfTruth } from "./ratingSourceOfTruth";
import { legacyFhMigratedTours } from "./legacyFh/registry";
import { ENGINE6_SPECIMEN_PRODUCT_CODE } from "./routes";
import { engine6ResolvedTours } from "./registry";
import {
  resolveToursWithMerchantFeedCommercialSnapshot,
  type MerchantFeedCommercialSnapshot,
} from "./merchantFeedCommercialSnapshot";
import {
  resolveEngine6CityDisplayHeroes,
  resolveEngine6DisplayHero,
} from "./displayHero";
import { resolveEngine6ListingPriceFields } from "./priceCurrency";
import type { Engine6Tour } from "./types";

// Viator bookable experiences routed under /tours despite supplier titles that
// include "Rental" without a guided/tour keyword for detectRental().
const ENGINE6_LISTING_TOUR_TYPE_OVERRIDES: Record<string, "tour"> = {
  "422984P2": "tour",
  "86313P1": "tour",
};

const ENGINE6_CANONICAL_TOUR_PATH =
  /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/;

const resolveEngine6ListingCountry = (tour: Engine6Tour, stateSlug: string) => {
  if (isUSStateName(tour.state) || stateSlug === "united-states") {
    return "United States";
  }

  if (stateSlug === "scotland") {
    return "United Kingdom";
  }

  if (stateSlug === "mexico") {
    return "Mexico";
  }

  if (stateSlug === "peru") {
    return "Peru";
  }

  if (stateSlug === "brazil") {
    return "Brazil";
  }

  if (stateSlug === "japan") {
    return "Japan";
  }

  if (stateSlug === "thailand") {
    return "Thailand";
  }

  if (stateSlug === "singapore") {
    return "Singapore";
  }

  if (stateSlug === "indonesia") {
    return "Indonesia";
  }

  return tour.state;
};

const getEngine6ActivitySlugs = (tour: Engine6Tour) => {
  const primaryActivitySlug = tour.activityCategories[0]?.slug;
  if (primaryActivitySlug) {
    return primaryActivitySlug === "paddle-sports"
      ? ["paddle-sports", "canoeing"]
      : [primaryActivitySlug];
  }

  const normalizedPrimaryCategory = tour.primaryCategory?.toLowerCase();
  const slugs = new Set<string>();

  if (
    normalizedPrimaryCategory === "bike-tour" ||
    normalizedPrimaryCategory === "cycling"
  ) {
    slugs.add("cycling");
    slugs.add("bike-tours");
  }

  if (
    normalizedPrimaryCategory === "hiking-tour" ||
    normalizedPrimaryCategory === "hiking"
  ) {
    slugs.add("hiking");
  }

  if (
    normalizedPrimaryCategory === "paddle-tour" ||
    normalizedPrimaryCategory === "paddle-sports" ||
    normalizedPrimaryCategory === "boat-tour" ||
    normalizedPrimaryCategory === "sailing" ||
    normalizedPrimaryCategory === "water-sports" ||
    normalizedPrimaryCategory === "snorkeling-tour"
  ) {
    slugs.add("canoeing");
  }

  if (normalizedPrimaryCategory === "adventure-tour") {
    slugs.add("adventure");
  }

  return slugs.size > 0 ? Array.from(slugs) : ["adventure"];
};

const toEngine6ListingTour = (
  tour: Engine6Tour,
  governedHeroImageUrl?: string
): Tour => {
  const [, stateSlug = "", citySlug = "", slug = ""] =
    ENGINE6_CANONICAL_TOUR_PATH.exec(tour.canonicalPath) ?? [];
  const card = toEngine6Card(tour);
  const ratingSourceOfTruth = getEngine6TourRatingSourceOfTruth(tour);
  const listingPrice = resolveEngine6ListingPriceFields(tour);
  const heroImageUrl =
    governedHeroImageUrl ??
    resolveEngine6DisplayHero({
      productCode: tour.productCode,
      productHeroUrl: tour.heroImageUrl,
      stateSlug,
      citySlug,
    });

  return {
    id: `engine6-${tour.productCode}`,
    engine: "engine6",
    type: ENGINE6_LISTING_TOUR_TYPE_OVERRIDES[tour.productCode],
    productCode: tour.productCode,
    slug,
    title: tour.title,
    shortDescription: card.description,
    categories: tour.categories,
    primaryCategory: tour.primaryCategory ?? undefined,
    primaryDisplayCategory: tour.primaryDisplayCategory ?? undefined,
    activityCategories: tour.activityCategories,
    destination: {
      country: resolveEngine6ListingCountry(tour, stateSlug),
      ...(stateSlug === "scotland"
        ? { countryCode: "GB", countrySlug: "united-kingdom" }
        : stateSlug === "mexico"
          ? { countryCode: "MX", countrySlug: "mexico" }
          : stateSlug === "peru"
            ? { countryCode: "PE", countrySlug: "peru" }
            : stateSlug === "brazil"
              ? { countryCode: "BR", countrySlug: "brazil" }
              : stateSlug === "japan"
                ? { countryCode: "JP", countrySlug: "japan" }
                : stateSlug === "thailand"
                  ? { countryCode: "TH", countrySlug: "thailand" }
                  : stateSlug === "singapore"
                    ? { countryCode: "SG", countrySlug: "singapore" }
                    : stateSlug === "indonesia"
                      ? { countryCode: "ID", countrySlug: "indonesia" }
                    : {}),
      state: tour.state,
      stateSlug,
      city: tour.city,
      citySlug,
    },
    heroImage: heroImageUrl,
    resolvedImageUrl: tour.heroImageUrl || null,
    primaryImageUrl: tour.heroImageUrl || undefined,
    badges: {
      rating: ratingSourceOfTruth.aggregateRating ?? undefined,
      reviewCount: ratingSourceOfTruth.reviewCount ?? undefined,
      priceFrom: listingPrice.priceFrom,
    },
    startingPrice: listingPrice.startingPrice,
    currency: listingPrice.currency,
    tagPills: tour.primaryDisplayCategory
      ? [tour.primaryDisplayCategory]
      : tour.categoryLabel
        ? [tour.categoryLabel]
        : undefined,
    activitySlugs: getEngine6ActivitySlugs(tour),
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

const groupEngine6ToursByCity = (tours: Engine6Tour[]) => {
  const groups = new Map<string, Engine6Tour[]>();

  for (const tour of tours) {
    const [, stateSlug = "", citySlug = ""] =
      ENGINE6_CANONICAL_TOUR_PATH.exec(tour.canonicalPath) ?? [];
    const key = `${stateSlug}/${citySlug}`;
    groups.set(key, [...(groups.get(key) ?? []), tour]);
  }

  return groups;
};

const toGovernedEngine6ListingTours = (tours: Engine6Tour[]) => {
  const governedHeroesByProductCode = new Map<string, string>();

  for (const [key, cityTours] of Array.from(groupEngine6ToursByCity(tours))) {
    const [stateSlug, citySlug] = key.split("/");
    const cityHeroes = resolveEngine6CityDisplayHeroes({
      tours: cityTours,
      stateSlug,
      citySlug,
    });

    for (const [productCode, hero] of Array.from(cityHeroes)) {
      governedHeroesByProductCode.set(productCode, hero);
    }
  }

  return tours.map(tour =>
    toEngine6ListingTour(
      tour,
      governedHeroesByProductCode.get(tour.productCode)
    )
  );
};

export const engine6ListingTours: Tour[] = toGovernedEngine6ListingTours(
  resolveToursWithMerchantFeedCommercialSnapshot(
    dedupeEngine6ToursByCanonicalPath([
      ...engine6ResolvedTours,
      ...legacyFhMigratedTours,
    ]).filter(tour => !isExcludedProductCode(tour.productCode)),
    merchantFeedCommercialSnapshot as MerchantFeedCommercialSnapshot
  )
);
