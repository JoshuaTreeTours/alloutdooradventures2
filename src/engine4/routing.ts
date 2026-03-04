import type { Engine2Tour } from "../engine2/data/loadEngine2";
import { buildEngine4TourPath } from "./buildEngine4TourPath";
import { engine4ViatorApiFallbackByProductCode, engine4ViatorTours } from "./data/viatorTours";
import { mapViatorToEngine4Tour } from "./viator/mapViatorToEngine4Tour";

export const getEngine4TourBySlugs = (
  stateSlug: string,
  citySlug: string,
  tourSlug: string
): Engine2Tour | null => {
  const path = `/destinations/${stateSlug}/${citySlug}/tours/${tourSlug}`;
  const record = engine4ViatorTours.find(tour => buildEngine4TourPath(tour) === path);

  if (!record) {
    return null;
  }

  const vm = mapViatorToEngine4Tour({
    record,
    apiTour: engine4ViatorApiFallbackByProductCode[record.viator.productCode],
  });

  return {
    id: vm.productCode,
    engine: "engine4",
    bookingProvider: "viator",
    bookingUrl: vm.bookingUrl,
    sourceCitySlug: record.destination.city,
    slug: `${record.slug}-${record.viator.productCode.toLowerCase()}`,
    name: vm.title,
    provider: {
      name: "Viator",
      shortName: "viator",
    },
    geo: {
      country: "United States",
      region: "Colorado",
      city: "Aspen",
      lat: null,
      lng: null,
    },
    seo: {
      title: vm.title,
      description: vm.overview,
      canonicalPath: vm.canonicalPath,
      ogImage: vm.heroImage,
    },
    content: {
      experienceText: vm.overview,
      overview: vm.overview,
      highlights: vm.highlights,
      faqs: vm.faqs,
      meetingPoint: {
        address: vm.meetingPoint,
      },
      duration: vm.duration,
      cancellationPolicy: vm.cancellationPolicy,
    },
    images: {
      hero: vm.heroImage,
      gallery: vm.galleryImages,
    },
    booking: {
      bookingUrl: vm.bookingUrl,
    },
    pricing: {
      price: vm.fromPrice,
      currency: "USD",
    },
    viatorRatingValue: vm.rating ?? null,
    viatorReviewCount: vm.reviewCount ?? null,
  };
};
