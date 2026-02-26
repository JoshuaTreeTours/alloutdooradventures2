import type {
  ViatorImageOverrides,
  ViatorParsedTour,
  ViatorTourTemplateModel,
} from "./types";

const normalize = (items?: string[]) =>
  Array.from(new Set((items ?? []).filter(Boolean)));

const hasAllowedImagePattern = (url: string) => {
  const lowered = url.toLowerCase();
  if (!lowered.startsWith("https://")) {
    return false;
  }
  if (
    ["data:image", "sprite", "icon", "logo", "favicon"].some(token =>
      lowered.includes(token)
    )
  ) {
    return false;
  }

  return (
    /(\.jpg|\.jpeg|\.png|\.webp)(\?|$)/i.test(lowered) ||
    lowered.includes("images.unsplash.com/") ||
    lowered.includes("upload.wikimedia.org/")
  );
};

const cleanImageUrl = (url?: string) => {
  if (!url) {
    return undefined;
  }

  return hasAllowedImagePattern(url) ? url : undefined;
};

export function mapViatorToTourModel(input: {
  parsed: ViatorParsedTour;
  derived: {
    highlights: string[];
    description: string;
  };
  viatorUrl: string;
  imageOverrides?: ViatorImageOverrides;
}): ViatorTourTemplateModel {
  const { parsed, derived, viatorUrl, imageOverrides } = input;

  const dedupedImages = normalize(parsed.images).filter(hasAllowedImagePattern);
  const overrideHero = cleanImageUrl(imageOverrides?.heroImageUrlOverride);
  const overrideBottom = cleanImageUrl(imageOverrides?.bottomImageUrlOverride);

  const heroImageUrl =
    overrideHero ?? cleanImageUrl(parsed.primaryImage) ?? dedupedImages[0];
  const bottomImageUrl =
    overrideBottom ?? dedupedImages.find(image => image !== heroImageUrl);

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
