import { SITE_URL } from "../utils/seo";

type TourLike = {
  title?: string;
  name?: string;
  id?: string;
  partnerId?: string;
  slug?: string;
  shortDescription?: string;
  longDescription?: string;
  destination?: {
    city?: string;
    state?: string;
  };
};

const INDEX_ROBOTS = "index,follow,max-image-preview:large";
const NOINDEX_ROBOTS = "noindex,follow,max-image-preview:large";

const clean = (value?: string) => (value ?? "").trim();

const stripLegacyPrefix = (value: string) =>
  value.replace(/^Destinations\s*\/\s*[^/]+\s*\/\s*[^/]+\s*\/\s*Tours\s*\/\s*/i, "");

const stripTrailingId = (value: string) =>
  value
    .replace(/\s+[A-Z]?\d{5,}$/i, "")
    .replace(/\s+\d{5,}$/i, "")
    .trim();

const pickTourName = (tour: TourLike) => {
  const base = clean(tour.title) || clean(tour.name);
  return stripTrailingId(stripLegacyPrefix(base));
};

const pickCity = (tour: TourLike) => clean(tour.destination?.city) || "Unknown";

const pickState = (tour: TourLike) => clean(tour.destination?.state) || "Unknown";

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

const buildTitle = (tour: TourLike) =>
  `${pickTourName(tour) || "Tour"} | ${pickCity(tour)}, ${pickState(tour)} | All Outdoor Adventures`;

const buildDescription = (tour: TourLike) => {
  const tourName = pickTourName(tour) || "this tour";
  const city = pickCity(tour);
  const state = pickState(tour);
  const detail = clean(tour.shortDescription) || clean(tour.longDescription);

  if (detail) {
    return `Discover ${tourName} in ${city}, ${state}. ${detail}`;
  }

  return `Discover ${tourName} in ${city}, ${state} with guided highlights, local insights, and booking details from All Outdoor Adventures.`;
};

export const getCanonicalFromBookingPath = (pathname: string) => {
  const slugId = getTourSlugFromPath(pathname);
  return slugId ? `${SITE_URL}/tours/${slugId}` : "";
};

export function buildTourMeta(tour: TourLike, canonicalUrl: string) {
  const title = buildTitle(tour);
  const description = buildDescription(tour);
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
  const title = buildTitle(tour);
  const description = buildDescription(tour);
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
