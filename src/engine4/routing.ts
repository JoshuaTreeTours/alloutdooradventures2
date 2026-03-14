import type { Engine2Tour } from "../engine2/data/loadEngine2";
import { buildEngine4TourPath } from "./buildEngine4TourPath";
import {
  engine4ViatorApiFallbackByProductCode,
  engine4ViatorTours,
} from "./data/viatorTours";
import { mapViatorToEngine4Tour } from "./viator/mapViatorToEngine4Tour";
import {
  peekEngine4ViatorApiTour,
  requestEngine4ViatorApiTour,
} from "./viator/viatorApiCache";

export const getEngine4TourBySlugs = (
  stateSlug: string,
  citySlug: string,
  tourSlug: string
): Engine2Tour | null => {
  const path = `/destinations/${stateSlug}/${citySlug}/tours/${tourSlug}`;
  const record = engine4ViatorTours.find(
    tour => buildEngine4TourPath(tour) === path
  );

  if (!record) {
    return null;
  }

  const productCode = record.productCode;
  const apiTour =
    peekEngine4ViatorApiTour(productCode) ??
    engine4ViatorApiFallbackByProductCode[productCode];

  if (typeof window !== "undefined") {
    void requestEngine4ViatorApiTour(productCode);
  }

  const vm = mapViatorToEngine4Tour({
    record,
    apiTour,
  });

  return {
    id: vm.productCode,
    engine: "engine4",
    bookingProvider: "viator",
    bookingUrl: vm.bookingUrl,
    sourceCitySlug: record.destination.citySlug,
    slug: `${record.slug}-${record.productCode.toLowerCase()}`,
    name: vm.title,
    provider: {
      name: "Viator",
      shortName: "viator",
    },
    geo: {
      country: record.destination.country,
      region: record.destination.state,
      city: record.destination.city,
      lat: null,
      lng: null,
    },
    seo: {
      title: vm.title,
      description: vm.content.overview,
      canonicalPath: vm.canonicalPath,
      ogImage: vm.primaryImage ?? vm.heroImage ?? undefined,
    },
    content: {
      experienceText: vm.content.overview,
      overview: vm.content.overview,
      highlights: vm.content.highlights,
      faqs: vm.content.faqs,
      meetingPoint: {
        address: vm.facts.meetingPointFull,
      },
      duration: vm.facts.duration,
      cancellationPolicy: vm.facts.cancellationPolicy,
    },
    images: {
      hero: vm.heroImage,
      gallery: vm.galleryImages,
    },
    booking: {
      bookingUrl: vm.bookingUrl,
    },
    pricing: {
      price: vm.facts.priceFrom,
      currency: "USD",
    },
    viatorRatingValue: vm.facts.ratingValue ?? null,
    viatorReviewCount: vm.facts.reviewCount ?? null,
  };
};
