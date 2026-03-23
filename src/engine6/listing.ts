import type { Tour } from "../data/tours.types";

import { toEngine6Card } from "./cards";
import {
  ENGINE6_BUNDLED_RAW_PRODUCTS,
  getBundledEngine6Tour,
} from "./bundledProducts";
import { getEngine6RouteSpecByProductCode } from "./routes";

export const ENGINE6_163873P16_CARD_IMAGE_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-360x240/12/26/61/64.jpg";

const buildEngine6ListingTour = (productCode: string): Tour | null => {
  const tour = getBundledEngine6Tour(productCode);
  const routeSpec = getEngine6RouteSpecByProductCode(productCode);

  if (!tour || !routeSpec) {
    return null;
  }

  const card = toEngine6Card(tour);

  const listingImage =
    productCode === "163873P16"
      ? ENGINE6_163873P16_CARD_IMAGE_URL
      : tour.cardImageUrl;

  return {
    id: routeSpec.listingId,
    engine: "engine6",
    productCode: tour.productCode,
    slug: tour.pagePath.split("/").filter(Boolean).pop() ?? card.href,
    title: tour.title,
    shortDescription: card.description,
    categories: tour.categories,
    primaryCategory: tour.primaryCategory ?? undefined,
    destination: {
      country: "United States",
      state: tour.state,
      stateSlug: routeSpec.stateSlug,
      city: tour.city,
      citySlug: routeSpec.citySlug,
    },
    heroImage: listingImage,
    primaryImageUrl: listingImage,
    galleryImages: tour.galleryImageUrls,
    badges: {
      rating: tour.aggregateRating ?? undefined,
      reviewCount: tour.reviewCount ?? undefined,
      priceFrom: tour.priceFormatted,
    },
    startingPrice: tour.priceAmount ?? undefined,
    currency: "USD",
    tagPills: tour.categoryLabel ? [tour.categoryLabel] : undefined,
    activitySlugs: routeSpec.activitySlugs,
    bookingProvider: "viator",
    bookingUrl: tour.bookingUrl,
    longDescription: tour.overviewText ?? card.description,
    operator: tour.operatorName ?? undefined,
  };
};

export const engine6SpecimenTour = {
  ...getBundledEngine6Tour("163873P16")!,
  cardImageUrl: ENGINE6_163873P16_CARD_IMAGE_URL,
  galleryImageUrls: [
    ENGINE6_163873P16_CARD_IMAGE_URL,
    ...getBundledEngine6Tour("163873P16")!.galleryImageUrls.filter(
      imageUrl => imageUrl !== ENGINE6_163873P16_CARD_IMAGE_URL
    ),
  ],
};

export const engine6ListingTours: Tour[] = Object.keys(
  ENGINE6_BUNDLED_RAW_PRODUCTS
)
  .map(buildEngine6ListingTour)
  .filter((tour): tour is Tour => Boolean(tour));
