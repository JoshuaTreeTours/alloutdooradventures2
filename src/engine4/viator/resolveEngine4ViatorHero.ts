import { engine4ViatorTours } from "../data/viatorTours";
import type { Engine4ViatorApiTour } from "../types";

export const ENGINE4_VIATOR_PLACEHOLDER_HERO = "/images/tour-placeholder.jpg";

const isTrackerPixel = (url: string) =>
  /(?:[?&](?:w|width)=1(?:&|$))|(?:[?&](?:h|height)=1(?:&|$))|\/1x1(?:\.|\/|$)/i.test(
    url
  );

const isTacdnCaptionUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();
    const isTacdnHost =
      host === "dynamic-media.tacdn.com" || host === "media.tacdn.com";

    return (
      isTacdnHost &&
      path.includes("/caption.jpg") &&
      (path.includes("/photo-o/") || path.includes("/media/photo-o/"))
    );
  } catch {
    return false;
  }
};

const isValidHeroCandidate = (value?: string): boolean => {
  if (!value) {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("data:text/html")) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    return !isTrackerPixel(trimmed);
  } catch {
    return false;
  }
};

export const resolveEngine4ViatorHero = (input: {
  productCode: string;
  apiTour?: Engine4ViatorApiTour;
}) => {
  const normalizedCode = input.productCode.toUpperCase();
  const tourRecord = engine4ViatorTours.find(
    tour => tour.viator.productCode.toUpperCase() === normalizedCode
  );

  const pageSourceHero = input.apiTour?.sourceDerivedImageUrl;
  const sourceHeroCandidate = isTacdnCaptionUrl(pageSourceHero ?? "")
    ? pageSourceHero
    : undefined;

  const candidates = [
    tourRecord?.viator.heroImageOverrideUrl,
    sourceHeroCandidate,
    input.apiTour?.primaryImageUrl,
    input.apiTour?.galleryImages?.[0],
  ];

  return (
    candidates.find(candidate => isValidHeroCandidate(candidate)) ??
    ENGINE4_VIATOR_PLACEHOLDER_HERO
  );
};
