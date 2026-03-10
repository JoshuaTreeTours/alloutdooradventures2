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

  const vm = mapViatorToEngine5Tour(
    record,
    engine5ViatorApiFallbackByProductCode[record.productCode]
  );

  return {
    id: vm.page.productCode,
    engine: "engine4",
    bookingProvider: "viator",
    bookingUrl: vm.page.bookingUrl,
    sourceCitySlug: record.destination.citySlug,
    slug: `${vm.page.slug}-${vm.page.productCode.toLowerCase()}`,
    name: vm.page.title,
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
      title: vm.page.title,
      description: vm.page.content.overview,
      canonicalPath: vm.page.canonicalPath,
      ogImage: vm.page.primaryImage ?? vm.page.heroImage ?? undefined,
    },
    content: {
      experienceText: vm.page.content.overview,
      overview: vm.page.content.overview,
      highlights: vm.page.content.highlights,
      faqs: vm.page.content.faqs,
      meetingPoint: {
        address: vm.page.facts.meetingPointFull,
      },
      duration: vm.page.facts.duration,
      cancellationPolicy: vm.page.facts.cancellationPolicy,
    },
    images: {
      hero: vm.page.heroImage,
      gallery: vm.page.galleryImages,
    },
    booking: {
      bookingUrl: vm.page.bookingUrl,
    },
    pricing: {
      price: vm.page.facts.priceFrom,
      currency: "USD",
    },
    viatorRatingValue: vm.page.facts.ratingValue ?? null,
    viatorReviewCount: vm.page.facts.reviewCount ?? null,
  };
};
