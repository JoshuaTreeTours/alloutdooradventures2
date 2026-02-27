import type {
  ViatorMedia,
  ViatorParsedTour,
  ViatorTourTemplateModel,
} from "./types";
import { getDestinationFallbackImages } from "../images/destinationFallback";
import { selectBestHeroImage } from "./selectBestHeroImage";

const normalize = (items?: string[]) =>
  Array.from(new Set((items ?? []).filter(Boolean)));

const GENERIC_OUTDOOR_TOUR_PLACEHOLDER =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80";

const isCityGeneric = (url: string) =>
  ["downtown", "street", "skyline", "hotel", "resort", "palm"].some(token =>
    url.toLowerCase().includes(token)
  );

export function mapViatorToTourModel(input: {
  parsed: ViatorParsedTour;
  media: ViatorMedia;
  operatorImages?: string[];
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
    operatorImages,
    derived,
    viatorUrl,
    regionSlug,
    destinationSlug,
    heroImageUrl: heroPrefilled,
    bottomImageUrl: bottomPrefilled,
  } = input;

  const fallback = getDestinationFallbackImages(regionSlug, destinationSlug);
  const viatorImages = normalize(media.images);
  const operatorImagePool = normalize(operatorImages);

  let heroImageUrl =
    heroPrefilled ??
    selectBestHeroImage({
      title: parsed.title ?? "Viator tour",
      images: viatorImages,
    });

  if (!heroImageUrl) {
    heroImageUrl =
      selectBestHeroImage({
        title: parsed.title ?? "Viator tour",
        images: operatorImagePool,
      }) ?? operatorImagePool[0];
  }

  if (!heroImageUrl && fallback.hero && !isCityGeneric(fallback.hero)) {
    heroImageUrl = fallback.hero;
  }

  if (!heroImageUrl) {
    heroImageUrl = GENERIC_OUTDOOR_TOUR_PLACEHOLDER;
  }

  const bottomSource = viatorImages.length ? viatorImages : operatorImagePool;
  const bottomImageUrl =
    bottomPrefilled ??
    bottomSource.find(image => image !== heroImageUrl) ??
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
