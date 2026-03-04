import { engine4ViatorTours } from "../data/viatorTours";
import type { Engine4ViatorApiTour } from "../types";

const isTrackerPixel = (url: string) =>
  /(?:[?&](?:w|width)=1(?:&|$))|(?:[?&](?:h|height)=1(?:&|$))|\/1x1(?:\.|\/|$)/i.test(
    url
  );

const isBrokenHeroCandidate = (value?: string): boolean => {
  if (!value) {
    return true;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  if (trimmed.startsWith("data:text/html")) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return true;
    }
    return isTrackerPixel(trimmed);
  } catch {
    return true;
  }
};

const toInlinePlaceholder = () =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 675'><rect width='1200' height='675' fill='#e7eadf'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial,sans-serif' font-size='42' fill='#2f4a2f'>Tour image unavailable</text></svg>`
  );

export const resolveEngine4ViatorHero = (input: {
  productCode: string;
  apiTour?: Engine4ViatorApiTour;
}) => {
  const normalizedCode = input.productCode.toUpperCase();
  const tourRecord = engine4ViatorTours.find(
    tour => tour.viator.productCode.toUpperCase() === normalizedCode
  );

  const candidates = [
    tourRecord?.viator.heroImageOverrideUrl,
    input.apiTour?.primaryImageUrl,
    input.apiTour?.galleryImages?.[0],
    input.apiTour?.sourceDerivedImageUrl,
    tourRecord?.viator.sourceHeroImageUrl,
  ];

  const heroImage =
    candidates.find(candidate => !isBrokenHeroCandidate(candidate)) ??
    toInlinePlaceholder();

  return heroImage;
};
