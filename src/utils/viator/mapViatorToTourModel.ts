import type { ViatorParsedTour, ViatorTourTemplateModel } from "./types";

const FALLBACK_IMAGE = "/hero.jpg";

export function mapViatorToTourModel(input: {
  parsed: ViatorParsedTour;
  derived: {
    highlights: string[];
    description: string;
  };
  viatorUrl: string;
}): ViatorTourTemplateModel {
  const { parsed, derived, viatorUrl } = input;
  const heroImageUrl =
    parsed.primaryImage ?? parsed.images?.[0] ?? FALLBACK_IMAGE;

  const remainingImages = (parsed.images ?? []).filter(
    image => image !== heroImageUrl
  );
  const galleryImageUrls = remainingImages.length
    ? remainingImages.slice(0, 4)
    : [heroImageUrl, FALLBACK_IMAGE].filter(Boolean).slice(0, 2);

  return {
    title: parsed.title ?? "Viator tour",
    destinationText: parsed.destinationText,
    durationText: parsed.durationText,
    heroImageUrl,
    galleryImageUrls,
    included: parsed.included?.length ? parsed.included : undefined,
    notIncluded: parsed.notIncluded?.length ? parsed.notIncluded : undefined,
    longDescription: derived.description,
    highlights: derived.highlights,
    meetingPoint: parsed.meetingPoint,
    itinerary: parsed.itinerary ?? [],
    faqs: parsed.faqs ?? [],
    bookingUrl: viatorUrl,
    priceFrom: parsed.priceFrom,
    currency: parsed.currency,
  };
}
