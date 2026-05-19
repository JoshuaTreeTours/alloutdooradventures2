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

const extractFirstLegacyMarkupImage = (raw: string): string | null => {
  const patterns = [
    /<img[^>]*\ssrc=["']([^"']+)["'][^>]*>/i,
    /<img[^>]*\sdata-src=["']([^"']+)["'][^>]*>/i,
    /<img[^>]*\sdata-lazy-src=["']([^"']+)["'][^>]*>/i,
    /<img[^>]*\ssrcset=["']([^"']+)["'][^>]*>/i,
    /background-image\s*:\s*url\(([^)]+)\)/i,
    /https?:\/\/cdn\.filestackcontent\.com\/[A-Za-z0-9][^\s"')<]*/i,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(raw);
    const candidate = match?.[1] ?? match?.[0];
    if (!candidate) continue;
    const srcsetFirst = candidate.split(",")[0]?.trim().split(/\s+/)[0];
    const cleaned = srcsetFirst?.replace(/^['"]|['"]$/g, "");
    const normalized = normalizeCandidateImage(cleaned);
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
