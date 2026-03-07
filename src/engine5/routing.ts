import type { Engine2Tour } from "../engine2/data/loadEngine2";
import { buildEngine5TourPath } from "./buildEngine5TourPath";
import {
  engine5ViatorApiFallbackByProductCode,
  engine5ViatorTours,
} from "./data/viatorTours";
import { mapViatorToEngine5Tour } from "./viator/mapViatorToEngine5Tour";

export const getEngine5TourBySlugs = (
  stateSlug: string,
  citySlug: string,
  tourSlug: string
): Engine2Tour | null => {
  const path = `/destinations/${stateSlug}/${citySlug}/tours/${tourSlug}`;
  const record = engine5ViatorTours.find(
    tour => buildEngine5TourPath(tour) === path
  );

  if (!record) {
    return null;
  }

  const vm = mapViatorToEngine5Tour({
    record,
    apiTour: engine5ViatorApiFallbackByProductCode[record.productCode],
  });

  return {
    id: vm.productCode,
    engine: "engine5",
    bookingProvider: "viator",
    bookingUrl: vm.bookingUrl,
    sourceCitySlug: record.destination.citySlug,
    slug: vm.slug,
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
      ogImage: vm.primaryImage,
    },
    content: {
      experienceText: vm.content.overview,
      overview: vm.content.overview,
      highlights: vm.content.highlights,
      inclusions: vm.content.inclusions,
      exclusions: vm.content.exclusions,
      faqs: vm.content.faqs,
      itinerary: vm.content.itinerary,
      meetingPoint: { address: vm.facts.meetingPoint },
      duration: vm.facts.duration,
      cancellationPolicy: vm.facts.cancellationPolicy,
    },
    images: {
      hero: vm.primaryImage,
      gallery: [vm.primaryImage],
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
