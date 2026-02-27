import type {
  ViatorMedia,
  ViatorParsedTour,
  ViatorTourTemplateModel,
} from "./types";
import { getDestinationFallbackImages } from "../images/destinationFallback";
import { selectHeroImage } from "./selectHeroImage";

const normalize = (items?: string[]) =>
  Array.from(new Set((items ?? []).filter(Boolean)));

const GENERIC_OFFROAD_FALLBACK =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80";

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
    heroPrefilled ??
    selectHeroImage({
      title: parsed.title ?? "Viator tour",
      destinationSlug,
      images,
      destinationFallbackHero: fallback.hero,
      genericOffroadFallback: GENERIC_OFFROAD_FALLBACK,
    });

  const bottomImageUrl =
    bottomPrefilled ??
    images.find(image => image !== heroImageUrl) ??
    undefined;

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
