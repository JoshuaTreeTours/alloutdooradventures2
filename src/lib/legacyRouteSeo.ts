import { buildImageUrl } from "../utils/seo";
import { resolveTourHeroImage } from "../utils/hero";
import type { buildBookingMeta, buildTourMeta } from "./tourMeta";

type Tour = {
  id?: string | number;
  slug: string;
  destination: {
    stateSlug: string;
    citySlug: string;
    state?: string;
    city?: string;
  };
  heroImage?: string | null;
  galleryImages?: string[] | null;
  primaryImage?: string | null;
  image?: string | null;
};

type MetaBuilder = typeof buildTourMeta;
type BookingBuilder = typeof buildBookingMeta;

const LEGACY_DETAIL_RES = [
  /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)(\/book)?\/?$/,
  /^\/destinations\/([^/]+)\/([^/]+)\/([^/]+)\/tours\/([^/]+)(\/book)?\/?$/,
  /^\/tours\/([^/]+)\/([^/]+)\/([^/]+)(\/book)?\/?$/,
];

const FORBIDDEN_TOUR_ROUTE_IMAGES = new Set(["/hero.jpg"]);

type LegacyImageCandidateLog = {
  type:
    | "img[src]"
    | "data-src"
    | "data-lazy-src"
    | "srcset"
    | "background-image"
    | "json-blobs"
    | "filestack"
    | "data-flickity-lazyload";
  raw: string;
  normalized: string | null;
};

const normalizeCandidateImage = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/[<>]/.test(trimmed)) return null;
  if (/^\/hero\.jpg$/i.test(trimmed)) return null;
  if (/^https?:\/\/www\.alloutdooradventures\.com\/hero\.jpg$/i.test(trimmed))
    return null;
  const looksLikeImage =
    /^data:image\//i.test(trimmed) ||
    /cdn\.filestackcontent\.com|filepicker\.io/i.test(trimmed) ||
    /\.(?:jpe?g|png|webp|avif|gif|bmp|svg)(?:[?#].*)?$/i.test(trimmed);
  if (!looksLikeImage) return null;
  const canonical = buildImageUrl(trimmed);
  if (!canonical || FORBIDDEN_TOUR_ROUTE_IMAGES.has(canonical.toLowerCase())) {
    return null;
  }
  return canonical;
};

const extractFirstLegacyMarkupImage = (
  raw: string,
  candidateLog?: LegacyImageCandidateLog[]
): string | null => {
  const patterns: Array<{ type: LegacyImageCandidateLog["type"]; re: RegExp }> =
    [
      { type: "img[src]", re: /<img[^>]*\ssrc=["']([^"']+)["'][^>]*>/i },
      { type: "data-src", re: /<img[^>]*\sdata-src=["']([^"']+)["'][^>]*>/i },
      {
        type: "data-lazy-src",
        re: /<img[^>]*\sdata-lazy-src=["']([^"']+)["'][^>]*>/i,
      },
      {
        type: "data-flickity-lazyload",
        re: /<img[^>]*\sdata-flickity-lazyload=["']([^"']+)["'][^>]*>/i,
      },
      { type: "srcset", re: /<img[^>]*\ssrcset=["']([^"']+)["'][^>]*>/i },
      {
        type: "background-image",
        re: /background-image\s*:\s*url\(([^)]+)\)/i,
      },
      {
        type: "json-blobs",
        re: /["'](?:image|image_url|heroImage|feature_image|url)["']\s*[:=]\s*["'](https?:\\?\/\\?\/[^"']+)["']/i,
      },
      {
        type: "filestack",
        re: /https?:\\?\/\\?\/cdn\.filestackcontent\.com\\?\/[A-Za-z0-9][^\s"')<]*/i,
      },
    ];

  for (const { type, re } of patterns) {
    const match = re.exec(raw);
    const candidate = match?.[1] ?? match?.[0];
    if (!candidate) continue;
    const decoded = candidate.replace(/\\\//g, "/");
    const srcsetFirst = decoded.split(",")[0]?.trim().split(/\s+/)[0];
    const cleaned = srcsetFirst?.replace(/^['"]|['"]$/g, "");
    const normalized = normalizeCandidateImage(cleaned);
    candidateLog?.push({ type, raw: candidate, normalized });
    if (normalized) return normalized;
  }

  return null;
};

const findImageInUnknown = (
  value: unknown,
  seen = new Set<unknown>()
): string | null => {
  if (typeof value === "string") {
    return (
      normalizeCandidateImage(value) ?? extractFirstLegacyMarkupImage(value)
    );
  }

  if (!value || typeof value !== "object") return null;
  if (seen.has(value)) return null;
  seen.add(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findImageInUnknown(item, seen);
      if (found) return found;
    }
    return null;
  }

  const obj = value as Record<string, unknown>;
  const prioritizedKeys = [
    "image",
    "image_url",
    "heroImage",
    "primaryImage",
    "primaryImageUrl",
    "cardImage",
    "listingImage",
    "schemaImage",
    "src",
    "url",
  ];

  for (const key of prioritizedKeys) {
    const found = findImageInUnknown(obj[key], seen);
    if (found) return found;
  }

  for (const child of Object.values(obj)) {
    const found = findImageInUnknown(child, seen);
    if (found) return found;
  }

  return null;
};
export const resolveLegacyTourRouteImage = (
  tour: Tour & Record<string, unknown>
) => {
  const directCandidates = [
    resolveTourHeroImage(tour as any),
    tour.heroImage,
    tour.primaryImage,
    tour.image,
    (tour as any).primaryImageUrl,
    (tour as any).cardImage,
    (tour as any).listingImage,
    (tour as any).schemaImage,
  ];

  for (const candidate of directCandidates) {
    const normalized = normalizeCandidateImage(candidate);
    if (normalized) return normalized;
  }

  const payloadImageCollections = [
    tour.galleryImages,
    (tour as any).images,
    (tour as any).imageUrls,
    (tour as any).listingImages,
    (tour as any).media,
  ];

  for (const collection of payloadImageCollections) {
    if (!Array.isArray(collection)) continue;
    for (const image of collection) {
      const normalized = normalizeCandidateImage(
        typeof image === "string"
          ? image
          : ((image as any)?.url ?? (image as any)?.src)
      );
      if (normalized) return normalized;
    }
  }

  const nestedImage = findImageInUnknown(tour);
  if (nestedImage) return nestedImage;

  return "";
};

export const debugLegacyTourRouteImageCandidates = (
  tour: Tour & Record<string, unknown>
) => {
  const candidateLog: LegacyImageCandidateLog[] = [];
  for (const value of Object.values(tour)) {
    if (typeof value !== "string") continue;
    extractFirstLegacyMarkupImage(value, candidateLog);
  }
  return candidateLog;
};

export const buildLegacyTourRouteSeo = ({
  pathname,
  tours,
  buildTourMetaFn,
  buildBookingMetaFn,
  site,
}: {
  pathname: string;
  tours: Tour[];
  buildTourMetaFn: MetaBuilder;
  buildBookingMetaFn?: BookingBuilder;
  site: string;
}) => {
  const detailMatch = LEGACY_DETAIL_RES.map(re => pathname.match(re)).find(
    Boolean
  );
  if (!detailMatch) return null;

  const isBookingRoute = pathname.replace(/\/+$/, "").endsWith("/book");
  const routeGroups = detailMatch
    .slice(1)
    .filter(group => group !== undefined && group !== "/book");
  const [stateSlug, citySlug, tourSlug] =
    routeGroups.length === 4
      ? [routeGroups[1], routeGroups[2], routeGroups[3]]
      : [routeGroups[0], routeGroups[1], routeGroups[2]];
  const normalize = (value: string | undefined | null) =>
    (value ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  const routeState = normalize(stateSlug);
  const routeCity = normalize(citySlug);
  const routeProductIdMatch = /-(\d+)$/i.exec(tourSlug);
  const routeProductId = routeProductIdMatch?.[1] ?? null;

  const hasMatchingDestination = (tour: Tour) =>
    normalize(tour.destination.stateSlug) === routeState &&
    normalize(tour.destination.citySlug) === routeCity;

  const hasMatchingNamedDestination = (tour: Tour) =>
    normalize(tour.destination.state) === routeState &&
    normalize(tour.destination.city) === routeCity;

  const isMatchingProductId = (tour: Tour) => {
    if (!routeProductId) return false;
    const slugProductId = /-(\d+)$/i.exec(tour.slug)?.[1];
    const tourId =
      typeof tour.id === "number" || typeof tour.id === "string"
        ? String(tour.id)
        : null;
    return slugProductId === routeProductId || tourId === routeProductId;
  };

  const tour =
    tours.find(t => hasMatchingDestination(t) && t.slug === tourSlug) ??
    tours.find(t => hasMatchingDestination(t) && isMatchingProductId(t)) ??
    tours.find(t => isMatchingProductId(t) && hasMatchingNamedDestination(t));
  if (!tour) return null;

  const canonical = `${site}${pathname}`;
  const meta =
    isBookingRoute && buildBookingMetaFn
      ? buildBookingMetaFn(tour as any, canonical)
      : buildTourMetaFn(tour as any, canonical);

  return {
    title: meta.title,
    description: meta.description,
    url: meta.canonical,
    image: resolveLegacyTourRouteImage(tour as Tour & Record<string, unknown>),
    robots: meta.robots,
    googlebot: meta.googlebot,
  };
};
