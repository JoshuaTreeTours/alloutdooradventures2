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
    country?: string;
  };
  categories?: string[];
  primaryCategory?: string;
  activityType?: string;
  activitySlugs?: string[];
  badges?: {
    duration?: string;
  };
  operator?: string;
  engine?: string;
};

const INDEX_ROBOTS = "index,follow,max-image-preview:large";
const NOINDEX_ROBOTS = "noindex,follow,max-image-preview:large";

const clean = (value?: string) => (value ?? "").trim();

const stripLegacyPrefix = (value: string) =>
  value
    .replace(/^Destinations\s*\/\s*[^/]+\s*\/\s*[^/]+\s*\/\s*Tours\s*\/\s*/i, "")
    .replace(/\bHome\s*[:|/-]\s*/gi, "")
    .replace(/\s*\|\s*All Outdoor Adventures$/i, "");

const stripTrailingId = (value: string) =>
  value
    .replace(/\s+[A-Z]?\d{5,}$/i, "")
    .replace(/\s+\d{5,}$/i, "")
    .trim();

const prettifyLegacyTourName = (value: string) =>
  value
    .replace(/\s*-\s*/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\bsignature tour\b/gi, "")
    .replace(/\bwith\b/gi, " ")
    .replace(/\bf\s+pjx\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^[-:|\s]+|[-:|\s]+$/g, "")
    .trim();

const isGrandCanyonSouthRimHummerRoute = (tour: TourLike) =>
  clean(tour.slug) ===
  "grand-canyon-signature-tour-south-rim-with-hummer-ground-tour-f-pjx-164131";

const pickTourName = (tour: TourLike) => {
  const base = clean(tour.title) || clean(tour.name);
  return prettifyLegacyTourName(stripTrailingId(stripLegacyPrefix(base)));
};

const pickCity = (tour: TourLike) => clean(tour.destination?.city) || "Unknown";

const pickState = (tour: TourLike) => clean(tour.destination?.state) || "Unknown";

const pickCountry = (tour: TourLike) => clean(tour.destination?.country) || pickState(tour);

const isInternationalLegacyTourRoute = (tour: TourLike, canonicalUrl: string) => {
  const rawCountry = clean(tour.destination?.country);
  const country = rawCountry.toLowerCase();
  const isInternational = !!rawCountry && country !== "united states" && country !== "usa";
  const isLegacyRoute =
    /\/tours\/[^/]+\/[^/]+\/[^/]+\/?$/i.test(canonicalUrl) ||
    /\/destinations\/[^/]+\/[^/]+\/tours\/[^/]+\/?$/i.test(canonicalUrl);
  return isInternational && isLegacyRoute && tour.engine !== "engine6";
};

const pickActivityType = (tour: TourLike) => {
  const raw =
    clean(tour.activityType) ||
    clean(tour.primaryCategory) ||
    clean(tour.categories?.[0]) ||
    clean(tour.activitySlugs?.[0]);
  return raw ? raw.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim().toLowerCase() : "";
};

const withLengthCap = (value: string, max: number) =>
  value.length <= max ? value : `${value.slice(0, Math.max(0, max - 1)).trimEnd()}…`;

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

const buildTitle = (tour: TourLike, canonicalUrl: string) => {
  if (tour.engine === "engine6") {
    return `${pickTourName(tour) || "Tour"} | ${pickCity(tour)}, ${pickState(tour)} | All Outdoor Adventures`;
  }

  if (isInternationalLegacyTourRoute(tour, canonicalUrl)) {
    return `${pickTourName(tour) || "Tour"} | ${pickCity(tour)}, ${pickCountry(tour)} | All Outdoor Adventures`;
  }

  return `${
    isGrandCanyonSouthRimHummerRoute(tour)
      ? "Grand Canyon South Rim Hummer Ground Tour"
      : pickTourName(tour) || "Tour"
  } | ${pickCity(tour)}, ${pickState(tour)} | All Outdoor Adventures`;
};

const buildDescription = (tour: TourLike, canonicalUrl: string) => {
  const tourName = pickTourName(tour) || "this tour";
  const city = pickCity(tour);
  const state = pickState(tour);
  const country = pickCountry(tour);
  const detail = clean(tour.shortDescription) || clean(tour.longDescription);

  if (isGrandCanyonSouthRimHummerRoute(tour)) {
    return "Experience the Grand Canyon South Rim with a guided Hummer ground tour from Flagstaff, Arizona. Explore scenic canyon viewpoints, desert landscapes, and one of America’s most iconic natural wonders with All Outdoor Adventures.";
  }

  if (tour.engine === "engine6") {
    if (detail) {
      return withLengthCap(`Explore ${tourName} in ${city}, ${state}. ${detail}`, 155);
    }
    return withLengthCap(
      `Experience ${tourName} in ${city}, ${state} with destination highlights, local context, and flexible planning through All Outdoor Adventures.`,
      155
    );
  }

  if (isInternationalLegacyTourRoute(tour, canonicalUrl)) {
    const activity = pickActivityType(tour);
    const duration = clean(tour.badges?.duration);
    const operator = clean(tour.operator);
    const templates = [
      `Explore ${tourName} in ${city}, ${country}`,
      `Experience ${tourName} in ${city}, ${country}`,
      `Join ${tourName} in ${city}, ${country}`,
      `Enjoy ${tourName} in ${city}, ${country}`,
    ];
    const templateIndex = (clean(tour.id).length + clean(tour.slug).length) % templates.length;
    const pieces = [
      templates[templateIndex],
      activity ? `for a ${activity} outing` : "for a memorable local outing",
      duration ? `${duration}` : "",
      operator ? `with ${operator}` : "",
    ].filter(Boolean);
    const base = `${pieces.join(" ")}.`;
    if (detail) {
      return withLengthCap(`${base} ${detail}`, 155);
    }
    return withLengthCap(`${base} Discover destination highlights, local atmosphere, and easy planning for your trip.`, 155);
  }

  const templates = [
    `Explore ${tourName} in ${city}, ${state}.`,
    `Experience ${tourName} in ${city}, ${state}.`,
    `Join ${tourName} in ${city}, ${state}.`,
    `Enjoy ${tourName} in ${city}, ${state}.`,
    `Ride into ${city}, ${state} on ${tourName}.`,
    `Discover ${tourName} across ${city}, ${state}.`,
  ];
  const templateIndex = (clean(tour.id).length + clean(tour.slug).length) % templates.length;
  const activity = pickActivityType(tour);
  const duration = clean(tour.badges?.duration);
  const operator = clean(tour.operator);
  const qualifier = [activity, duration, operator ? `with ${operator}` : ""]
    .filter(Boolean)
    .join(" • ");

  if (detail) {
    return withLengthCap(
      `${templates[templateIndex]}${qualifier ? ` ${qualifier}.` : ""} ${detail}`,
      155
    );
  }

  return withLengthCap(
    `${templates[templateIndex]}${qualifier ? ` ${qualifier}.` : ""} Discover key sights, local flavor, and straightforward trip planning with All Outdoor Adventures.`,
    155
  );
};

export const getCanonicalFromBookingPath = (pathname: string) => {
  const slugId = getTourSlugFromPath(pathname);
  return slugId ? `${SITE_URL}/tours/${slugId}` : "";
};

export function buildTourMeta(tour: TourLike, canonicalUrl: string) {
  const title = buildTitle(tour, canonicalUrl);
  const description = buildDescription(tour, canonicalUrl);
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
  const title = buildTitle(tour, canonicalUrl);
  const description = buildDescription(tour, canonicalUrl);
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
