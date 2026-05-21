import { buildImageUrl } from "../utils/seo";
import { resolveTourHeroImage } from "../utils/hero";
import type { buildBookingMeta, buildTourMeta } from "./tourMeta";

type Tour = {
  slug: string;
  destination: { stateSlug: string; citySlug: string };
  heroImage?: string | null;
  galleryImages?: string[] | null;
};

type MetaBuilder = typeof buildTourMeta;
type BookingBuilder = typeof buildBookingMeta;

const LEGACY_DETAIL_RES = [
  /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)\/?$/,
  /^\/tours\/([^/]+)\/([^/]+)\/([^/]+)\/?$/,
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
  if (/^\/hero\.jpg$/i.test(trimmed)) return null;
  if (/^https?:\/\/www\.alloutdooradventures\.com\/hero\.jpg$/i.test(trimmed)) return null;
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
  const patterns: Array<{ type: LegacyImageCandidateLog["type"]; re: RegExp }> = [
    { type: "img[src]", re: /<img[^>]*\ssrc=["']([^"']+)["'][^>]*>/i },
    { type: "data-src", re: /<img[^>]*\sdata-src=["']([^"']+)["'][^>]*>/i },
    { type: "data-lazy-src", re: /<img[^>]*\sdata-lazy-src=["']([^"']+)["'][^>]*>/i },
    { type: "data-flickity-lazyload", re: /<img[^>]*\sdata-flickity-lazyload=["']([^"']+)["'][^>]*>/i },
    { type: "srcset", re: /<img[^>]*\ssrcset=["']([^"']+)["'][^>]*>/i },
    { type: "background-image", re: /background-image\s*:\s*url\(([^)]+)\)/i },
    { type: "json-blobs", re: /["'](?:image|image_url|heroImage|feature_image|url)["']\s*[:=]\s*["'](https?:\\?\/\\?\/[^"']+)["']/i },
    { type: "filestack", re: /https?:\\?\/\\?\/cdn\.filestackcontent\.com\\?\/[A-Za-z0-9][^\s"')<]*/i },
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

const resolveLegacyTourRouteImage = (tour: Tour & Record<string, unknown>) => {
  const primary = normalizeCandidateImage(resolveTourHeroImage(tour as any) ?? tour.heroImage ?? null);
  if (primary) return primary;

  for (const image of tour.galleryImages ?? []) {
    const normalized = normalizeCandidateImage(image);
    if (normalized) return normalized;
  }

  for (const value of Object.values(tour)) {
    if (typeof value !== "string") continue;
    const extracted = extractFirstLegacyMarkupImage(value);
    if (extracted) return extracted;
  }

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

  const [, stateSlug, citySlug, tourSlug] = detailMatch;
  const tour = tours.find(
    t =>
      t.destination.stateSlug === stateSlug &&
      t.destination.citySlug === citySlug &&
      t.slug === tourSlug
  );
  if (!tour) return null;

  const canonical = `${site}${pathname}`;
  const meta = buildTourMetaFn(tour as any, canonical);

  return {
    title: meta.title,
    description: meta.description,
    url: meta.canonical,
    image: resolveLegacyTourRouteImage(tour as Tour & Record<string, unknown>),
  };
};
