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

const LEGACY_DETAIL_RE =
  /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)\/?$/;

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

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ");

const extractUrlFromSrcset = (value: string): string | null => {
  const first = value.split(",")[0]?.trim();
  if (!first) return null;
  return first.split(/\s+/)[0] ?? null;
};

const extractFirstLegacyMarkupImage = (
  raw: string,
  candidateLog?: LegacyImageCandidateLog[],
  collectAllCandidates = false
): string | null => {
  const text = decodeHtmlEntities(raw);
  const patterns: Array<{ type: LegacyImageCandidateLog["type"]; re: RegExp }> = [
    { type: "img[src]", re: /<img[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi },
    { type: "data-src", re: /<img[^>]*\sdata-src=["']([^"']+)["'][^>]*>/gi },
    { type: "data-lazy-src", re: /<img[^>]*\sdata-lazy-src=["']([^"']+)["'][^>]*>/gi },
    { type: "data-flickity-lazyload", re: /<img[^>]*\sdata-flickity-lazyload=["']([^"']+)["'][^>]*>/gi },
    { type: "srcset", re: /<img[^>]*\ssrcset=["']([^"']+)["'][^>]*>/gi },
    { type: "background-image", re: /background-image\s*:\s*url\(([^)]+)\)/gi },
    { type: "json-blobs", re: /["'](?:image|image_url|heroImage|feature_image|url)["']\s*[:=]\s*["'](https?:\\?\/\\?\/[^"']+)["']/gi },
    { type: "filestack", re: /https?:\\?\/\\?\/cdn\.filestackcontent\.com\\?\/[A-Za-z0-9][^\s"')<]*/gi },
  ];

  type MatchCandidate = { index: number; type: LegacyImageCandidateLog["type"]; raw: string };
  const matches: MatchCandidate[] = [];

  for (const { type, re } of patterns) {
    for (const match of text.matchAll(re)) {
      const candidate = match[1] ?? match[0];
      if (!candidate) continue;
      matches.push({ index: match.index ?? Number.MAX_SAFE_INTEGER, type, raw: candidate });
    }
  }

  matches.sort((a, b) => a.index - b.index);

  for (const item of matches) {
    const decoded = item.raw.replace(/\\\//g, "/");
    const maybeSrcset = item.type === "srcset" ? extractUrlFromSrcset(decoded) : decoded;
    const cleaned = maybeSrcset?.replace(/^['"]|['"]$/g, "").trim() ?? null;
    const normalized = normalizeCandidateImage(cleaned);
    candidateLog?.push({ type: item.type, raw: item.raw, normalized });
    if (normalized && !collectAllCandidates) return normalized;
  }

  return candidateLog?.find(entry => entry.normalized)?.normalized ?? null;
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
    extractFirstLegacyMarkupImage(value, candidateLog, true);
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
  const detailMatch = pathname.match(LEGACY_DETAIL_RE);
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
