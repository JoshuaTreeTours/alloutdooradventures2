import type { ViatorParsedTour, ViatorTourTemplateModel } from "./types";

const normalize = (items?: string[]) =>
  Array.from(new Set((items ?? []).filter(Boolean)));

export function mapViatorToTourModel(input: {
  parsed: ViatorParsedTour;
  derived: {
    highlights: string[];
    description: string;
  };
  viatorUrl: string;
}): ViatorTourTemplateModel {
  const { parsed, derived, viatorUrl } = input;

  const dedupedImages = normalize(parsed.images);
  const heroImageUrl = parsed.primaryImage ?? dedupedImages[0] ?? undefined;
  const galleryImageUrls = dedupedImages
    .filter(image => image !== heroImageUrl)
    .slice(0, 4);

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
