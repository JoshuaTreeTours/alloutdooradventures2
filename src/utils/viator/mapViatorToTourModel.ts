import type {
  ViatorMedia,
  ViatorParsedTour,
  ViatorTourTemplateModel,
} from "./types";

export function mapViatorToTourModel(input: {
  parsed: ViatorParsedTour;
  media: ViatorMedia;
  derived: {
    highlights: string[];
    description: string;
  };
  viatorUrl: string;
  heroImageUrl?: string;
}): ViatorTourTemplateModel {
  const {
    parsed,
    media,
    derived,
    viatorUrl,
    heroImageUrl: heroPrefilled,
  } = input;

  const heroImageUrl =
    heroPrefilled ?? parsed.primaryImage ?? media.primaryImage;

  return {
    title: parsed.title ?? "Viator tour",
    destinationText: parsed.destinationText,
    durationText: parsed.durationText,
    heroImageUrl,
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
