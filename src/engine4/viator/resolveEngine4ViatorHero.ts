import { engine4ViatorTours } from "../data/viatorTours";
import type { Engine4ViatorApiTour } from "../types";

type UnknownRecord = Record<string, unknown>;

const ALLOWED_HOSTS = [/^media\.tacdn\.com$/i, /^dynamic-media\.tacdn\.com$/i];
const HERO_PATH_REGEX = /\/(?:media\/photo-o\/|media\/attractions-splice)/i;
const UNRELATED_TEXT_REGEX =
  /(traveler|review|avatar|profile|user-photo|homepage|home-hero|default-hero|placeholder)/i;
const THUMBNAIL_ONLY_REGEX =
  /(?:\/photo-s\/|\/photo-l\/|[?&](?:w|width)=(?:1\d\d|\d\d)(?:&|$)|[?&](?:h|height)=(?:1\d\d|\d\d)(?:&|$))/i;

const asRecord = (value: unknown): UnknownRecord | undefined =>
  typeof value === "object" && value !== null
    ? (value as UnknownRecord)
    : undefined;

const asNonEmptyString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;

const asValidHero = (value: unknown): string | undefined => {
  const url = asNonEmptyString(value);
  if (
    !url ||
    UNRELATED_TEXT_REGEX.test(url) ||
    THUMBNAIL_ONLY_REGEX.test(url)
  ) {
    return undefined;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      return undefined;
    }

    if (!ALLOWED_HOSTS.some(host => host.test(parsed.hostname))) {
      return undefined;
    }

    if (!HERO_PATH_REGEX.test(parsed.pathname)) {
      return undefined;
    }

    return url;
  } catch {
    return undefined;
  }
};

const toImageUrlFromNode = (node: unknown): string | undefined => {
  const row = asRecord(node);
  if (!row) {
    return asValidHero(node);
  }

  const direct =
    asValidHero(row.url) ??
    asValidHero(row.imageUrl) ??
    asValidHero(asRecord(row.large)?.url) ??
    asValidHero(asRecord(row.hero)?.url);
  if (direct) {
    return direct;
  }

  const variants = asRecord(row.variants);
  if (variants) {
    return (
      asValidHero(asRecord(variants.xxlarge)?.url) ??
      asValidHero(asRecord(variants.xlarge)?.url) ??
      asValidHero(asRecord(variants.large)?.url) ??
      asValidHero(asRecord(variants.original)?.url)
    );
  }

  return undefined;
};

const isOfficialProductImage = (node: unknown): boolean => {
  const row = asRecord(node);
  if (!row) {
    return true;
  }

  const classificationFields = [
    row.type,
    row.imageType,
    row.category,
    row.source,
    row.kind,
    row.caption,
    row.altText,
  ]
    .map(asNonEmptyString)
    .filter((value): value is string => Boolean(value))
    .join(" ");

  return !UNRELATED_TEXT_REGEX.test(classificationFields);
};

const collectPrimaryFieldCandidates = (
  apiTour?: Engine4ViatorApiTour
): string[] => {
  const payload = asRecord(apiTour?.rawProductPayload);
  const maybeProduct = asRecord(payload?.product);

  const sources: unknown[] = [
    apiTour?.primaryImageUrl,
    payload?.primaryImageUrl,
    payload?.coverImageUrl,
    payload?.heroImageUrl,
    maybeProduct?.primaryImageUrl,
    maybeProduct?.coverImageUrl,
    maybeProduct?.heroImageUrl,
    payload?.primaryImage,
    payload?.coverImage,
    payload?.heroImage,
    maybeProduct?.primaryImage,
    maybeProduct?.coverImage,
    maybeProduct?.heroImage,
  ];

  return sources
    .map(toImageUrlFromNode)
    .filter((value): value is string => Boolean(value));
};

const collectOfficialImageArrayCandidates = (
  apiTour?: Engine4ViatorApiTour
): string[] => {
  const payload = asRecord(apiTour?.rawProductPayload);
  const maybeProduct = asRecord(payload?.product);
  const imageArrays = [
    payload?.images,
    payload?.media,
    maybeProduct?.images,
    maybeProduct?.media,
    apiTour?.galleryImages,
  ].filter(Boolean);

  const candidates: string[] = [];

  imageArrays.forEach(entry => {
    if (Array.isArray(entry)) {
      entry.forEach(image => {
        if (!isOfficialProductImage(image)) {
          return;
        }
        const candidate = toImageUrlFromNode(image);
        if (candidate) {
          candidates.push(candidate);
        }
      });
      return;
    }

    const row = asRecord(entry);
    if (!row) {
      return;
    }

    Object.values(row).forEach(value => {
      if (!isOfficialProductImage(value)) {
        return;
      }
      const candidate = toImageUrlFromNode(value);
      if (candidate) {
        candidates.push(candidate);
      }
    });
  });

  return candidates;
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
    ...collectPrimaryFieldCandidates(input.apiTour),
    ...collectOfficialImageArrayCandidates(input.apiTour),
    asValidHero(input.apiTour?.sourceDerivedImageUrl),
    asValidHero(tourRecord?.heroImage),
  ].filter((value): value is string => Boolean(value));

  return candidates[0] ?? toInlinePlaceholder();
};
