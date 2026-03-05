import { engine4ViatorTours } from "../data/viatorTours";
import type { Engine4ViatorApiTour } from "../types";

const INVALID_SCHEMES = ["javascript:", "data:"];
const ALLOWED_TACDN_HOSTS = new Set([
  "dynamic-media.tacdn.com",
  "media.tacdn.com",
]);

const isTrackerPixel = (url: string) =>
  /(?:[?&](?:w|width)=1(?:&|$))|(?:[?&](?:h|height)=1(?:&|$))|\/1x1(?:\.|\/|$)/i.test(
    url
  );

const hasAllowedImagePath = (pathname: string, search: string) =>
  /\.(?:jpg|jpeg|png|webp)(?:\?|$)/i.test(`${pathname}${search}`);

const isValidHeroCandidate = (value?: string): boolean => {
  if (!value) {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  if (
    INVALID_SCHEMES.some(scheme => trimmed.toLowerCase().startsWith(scheme))
  ) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    if (!ALLOWED_TACDN_HOSTS.has(parsed.hostname.toLowerCase())) {
      return false;
    }

    if (isTrackerPixel(trimmed)) {
      return false;
    }

    return hasAllowedImagePath(parsed.pathname, parsed.search);
  } catch {
    return false;
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
    tour => tour.productCode.toUpperCase() === normalizedCode
  );

  const candidates = [
    tourRecord?.heroImage,
    input.apiTour?.primaryImageUrl,
    input.apiTour?.galleryImages?.[0],
    input.apiTour?.sourceDerivedImageUrl,
  ];

  return (
    candidates.find(candidate => isValidHeroCandidate(candidate)) ??
    toInlinePlaceholder()
  );
};
