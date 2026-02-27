import type {
  ViatorMedia,
  ViatorParsedTour,
  ViatorTourTemplateModel,
} from "./types";
import { getDestinationFallbackImages } from "../images/destinationFallback";

const normalize = (items?: string[]) =>
  Array.from(new Set((items ?? []).filter(Boolean)));

export function mapViatorToTourModel(input: {
  parsed: ViatorParsedTour;
  media: ViatorMedia;
  derived: {
    highlights: string[];
    description: string;
  };
  viatorUrl: string;
  regionSlug: string;
  destinationSlug: string;
  heroImageUrl?: string;
  bottomImageUrl?: string;
}): ViatorTourTemplateModel {
  const {
    parsed,
    media,
    derived,
    viatorUrl,
    regionSlug,
    destinationSlug,
    heroImageUrl: heroPrefilled,
    bottomImageUrl: bottomPrefilled,
  } = input;

  const fallback = getDestinationFallbackImages(regionSlug, destinationSlug);
  const images = normalize(media.images);

  const heroImageUrl =
    heroPrefilled ?? media.primaryImage ?? images[0] ?? fallback.hero;
  const bottomImageUrl =
    bottomPrefilled ??
    images.find(image => image !== heroImageUrl) ??
    fallback.secondary;

  return {
    title: parsed.title ?? "Viator tour",
    destinationText: parsed.destinationText,
    durationText: parsed.durationText,
    heroImageUrl,
    bottomImageUrl,
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
