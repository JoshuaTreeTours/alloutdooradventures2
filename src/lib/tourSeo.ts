import { SITE_BRAND_NAME } from "../utils/site";
import { SITE_URL, buildMetaDescription } from "../utils/seo";

type TourSeoDestination = {
  city?: string;
  state?: string;
};

type TourLike = {
  title?: string;
  slug?: string;
  id?: string;
  shortDescription?: string;
  longDescription?: string;
  badges?: {
    tagline?: string;
  };
  destination?: TourSeoDestination;
};

const DEFAULT_INDEX_ROBOTS = "index,follow,max-image-preview:large";
const DEFAULT_NOINDEX_ROBOTS = "noindex,follow,max-image-preview:large";

const buildSeoTitle = (tour: TourLike) => `${tour.title ?? "Tour"} Booking | ${SITE_BRAND_NAME}`;

const buildSeoDescription = (tour: TourLike) =>
  buildMetaDescription(
    `Reserve ${tour.title ?? "this tour"} in ${tour.destination?.city ?? "Unknown"}, ${tour.destination?.state ?? "Unknown"}.`,
    tour.shortDescription ?? tour.badges?.tagline ?? tour.longDescription,
  );

const buildTourCanonicalUrl = (tour: TourLike) => `${SITE_URL}/tours/${tour.slug ?? ""}`;

export function buildTourMeta(tour: TourLike, canonicalUrl?: string) {
  const title = buildSeoTitle(tour);
  const description = buildSeoDescription(tour);
  const canonical = canonicalUrl ?? buildTourCanonicalUrl(tour);

  return {
    title,
    description,
    canonical,
    robots: DEFAULT_INDEX_ROBOTS,
    googlebot: DEFAULT_INDEX_ROBOTS,
    ogTitle: title,
    ogDescription: description,
    twitterTitle: title,
    twitterDescription: description,
  };
}

export function buildBookingMeta(tour: TourLike, canonicalTourUrl: string) {
  const title = buildSeoTitle(tour);
  const description = buildSeoDescription(tour);

  return {
    title,
    description,
    canonical: canonicalTourUrl,
    robots: DEFAULT_NOINDEX_ROBOTS,
    googlebot: DEFAULT_NOINDEX_ROBOTS,
    ogTitle: title,
    ogDescription: description,
    twitterTitle: title,
    twitterDescription: description,
  };
}

