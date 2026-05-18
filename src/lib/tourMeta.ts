import { SITE_URL } from "../utils/seo";

type TourLike = {
  title?: string;
  name?: string;
  id?: string;
  partnerId?: string;
  slug?: string;
  destination?: {
    city?: string;
    state?: string;
  };
};

const INDEX_ROBOTS = "index,follow,max-image-preview:large";
const NOINDEX_ROBOTS = "noindex,follow,max-image-preview:large";
const LEGACY_BRAND_SUFFIX = "All Outdoor Adventures";

const clean = (value?: string) => (value ?? "").trim();

const pickTourName = (tour: TourLike) => clean(tour.title) || clean(tour.name) || "Tour";

const pickCity = (tour: TourLike) => clean(tour.destination?.city);

const pickState = (tour: TourLike) => clean(tour.destination?.state);

const getTourSlugFromPath = (pathname: string) => {
  const normalized = pathname.split("?")[0].split("#")[0].replace(/\/+$/, "");
  const match = normalized.match(/\/tours\/([^/]+)\/book$/);
  return match?.[1] ?? "";
};

const normalizeCanonical = (canonicalUrl: string) => {
  if (canonicalUrl.startsWith("http://") || canonicalUrl.startsWith("https://")) {
    return canonicalUrl;
  }

  const path = canonicalUrl.startsWith("/") ? canonicalUrl : `/${canonicalUrl}`;
  return `${SITE_URL}${path}`;
};

const buildLegacyTourTitle = (tour: TourLike) => {
  const tourName = pickTourName(tour);
  const city = pickCity(tour);
  return city ? `${tourName} in ${city}` : `${tourName} | ${LEGACY_BRAND_SUFFIX}`;
};

const buildLegacyTourDescription = (tour: TourLike) => {
  const tourName = pickTourName(tour);
  const city = pickCity(tour);
  const state = pickState(tour);
  const location = city && state ? `${city}, ${state}` : city || state || "your destination";
  return `Book ${tourName} in ${location} with ${LEGACY_BRAND_SUFFIX}. View highlights, trip details, photos, and booking information.`;
};

export const getCanonicalFromBookingPath = (pathname: string) => {
  const slugId = getTourSlugFromPath(pathname);
  return slugId ? `${SITE_URL}/tours/${slugId}` : "";
};

export function buildTourMeta(tour: TourLike, canonicalUrl: string) {
  const title = buildLegacyTourTitle(tour);
  const description = buildLegacyTourDescription(tour);
  const canonical = normalizeCanonical(canonicalUrl);

  return {
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    twitterTitle: title,
    twitterDescription: description,
    robots: INDEX_ROBOTS,
    googlebot: INDEX_ROBOTS,
    canonical,
  };
}

export function buildBookingMeta(tour: TourLike, canonicalUrl: string) {
  const title = buildLegacyTourTitle(tour);
  const description = buildLegacyTourDescription(tour);
  const canonical = normalizeCanonical(canonicalUrl);

  return {
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    twitterTitle: title,
    twitterDescription: description,
    robots: NOINDEX_ROBOTS,
    googlebot: NOINDEX_ROBOTS,
    canonical,
  };
}
