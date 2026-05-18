export type HeroPageType =
  | "home"
  | "state"
  | "city"
  | "destination"
  | "activity"
  | "product";

import { buildImageUrl } from "./seo";

export const HOME_HERO_IMAGE = "/hero.jpg";
export const TOUR_FALLBACK_HERO_IMAGE = undefined;
export const GUIDE_FALLBACK_HERO_IMAGE = undefined;
export const DESTINATION_FALLBACK_HERO_IMAGE = undefined;
export const CITY_NEUTRAL_BRAND_IMAGE = "/logo.svg";

export type HeroRouteContext = {
  route: string;
  params?: Record<string, string | undefined>;
  tour?: {
    heroImage?: string;
    primaryImageUrl?: string;
    resolvedImageUrl?: string | null;
    galleryImages?: string[];
  } | null;
  guide?: {
    type?: "state" | "country" | "city";
    guideImages?: Array<{ src?: string | null }> | null;
  } | null;
  destination?: {
    heroImage?: string;
    heroImages?: string[];
  } | null;
  state?: {
    heroImage?: string;
    slug?: string;
    countryCode?: string;
  } | null;
  city?: {
    id?: string;
    slug?: string;
    stateSlug?: string;
    countryCode?: string;
    heroImage?: string;
    heroImages?: string[];
  } | null;
  cityTours?: Array<{
    id?: string;
    heroImage?: string;
    primaryImage?: string;
    destination?: {
      citySlug?: string;
      stateSlug?: string;
      country?: string;
      countryCode?: string;
    };
    badges?: {
      reviewCount?: number;
      rating?: number;
    };
    title?: string;
  }>;
};

type CityRouteContext = {
  cityId?: string;
  citySlug?: string;
  stateSlug?: string;
  countryCode?: string;
};

type CityTourImageCandidate = {
  src?: string;
  tourId?: string;
  tourCitySlug?: string;
  citySlug?: string;
  stateSlug?: string;
  countryCode?: string;
  isActivityDefault?: boolean;
};

export const normalizeHeroImage = (image?: string | null) =>
  (image ?? "").trim();

const normalizeCountryCode = (value?: string) =>
  value ? value.trim().toUpperCase() : undefined;

export const isHomeHeroImage = (image?: string | null) => {
  const normalized = normalizeHeroImage(image);
  if (!normalized) {
    return false;
  }

  return normalized === HOME_HERO_IMAGE || normalized.endsWith("/hero.jpg");
};

const isHttpImageUrl = (value?: string) =>
  typeof value === "string" && /^https?:\/\//i.test(value.trim());

export const isActivityDefaultImage = (image?: string | null) => {
  const normalized = normalizeHeroImage(image);
  if (!normalized) {
    return false;
  }

  return [
    HOME_HERO_IMAGE,
    "/images/canoe-hero.jpg",
    "/images/cycling-hero.jpg",
    "/images/hiking-hero.jpg",
    "/images/hiking-hero2.jpg",
    "/images/hiking-hero3.jpg",
  ].some(blocked => normalized === blocked || normalized.endsWith(blocked));
};

export const isGenericHeroFallbackImage = (image?: string | null) => {
  const normalized = normalizeHeroImage(image);
  if (!normalized) {
    return false;
  }

  return isHomeHeroImage(normalized) || isActivityDefaultImage(normalized);
};

const isTacdnCaptionImage = (image?: string | null) => {
  const normalized = normalizeHeroImage(image).toLowerCase();
  return (
    normalized.includes("tacdn.com/") &&
    normalized.includes("/caption.") &&
    /^https?:\/\//.test(normalized)
  );
};

export const resolveTourHeroImage = (
  tour?: HeroRouteContext["tour"] | null
): string | undefined => {
  if (!tour) {
    return undefined;
  }

  const candidates = [
    tour.primaryImageUrl,
    tour.resolvedImageUrl ?? undefined,
    tour.heroImage,
    ...(tour.galleryImages ?? []),
  ]
    .map(image => normalizeHeroImage(image))
    .filter(Boolean)
    .filter((image, index, list) => list.indexOf(image) === index)
    .filter(image => !isGenericHeroFallbackImage(image));

  return candidates.find(image => isTacdnCaptionImage(image)) ?? candidates[0];
};

export const filterHeroImages = (
  images: Array<string | undefined>,
  pageType: HeroPageType
) => {
  const uniqueImages = images
    .map(image => normalizeHeroImage(image))
    .filter(image => Boolean(image))
    .filter((image, index, list) => list.indexOf(image) === index);

  if (pageType === "home") {
    return uniqueImages;
  }

  return uniqueImages.filter(image => !isHomeHeroImage(image));
};

export const resolveHeroImage = ({
  pageType,
  primary,
  fallbacks = [],
}: {
  pageType: HeroPageType;
  primary?: string;
  fallbacks?: Array<string | undefined>;
}) => {
  const candidates = filterHeroImages([primary, ...fallbacks], pageType);
  return candidates[0];
};

export const isImageInCityTour = (
  image: CityTourImageCandidate | undefined,
  cityCtx: CityRouteContext
) => {
  if (!image?.src || image.isActivityDefault) {
    return false;
  }

  if (!isHttpImageUrl(image.src)) {
    return false;
  }

  if (isActivityDefaultImage(image.src)) {
    return false;
  }

  const citySlug = cityCtx.citySlug?.trim();
  const stateSlug = cityCtx.stateSlug?.trim();
  const countryCode = normalizeCountryCode(cityCtx.countryCode);

  if (!citySlug) {
    return false;
  }

  if (image.citySlug && image.citySlug !== citySlug) {
    return false;
  }

  if (image.tourCitySlug && image.tourCitySlug !== citySlug) {
    return false;
  }

  if (stateSlug && image.stateSlug && image.stateSlug !== stateSlug) {
    return false;
  }

  const imageCountryCode = normalizeCountryCode(image.countryCode);
  if (countryCode && imageCountryCode && imageCountryCode !== countryCode) {
    return false;
  }

  return Boolean(
    image.tourCitySlug === citySlug || image.citySlug === citySlug
  );
};

const compareCityTours = (
  a: NonNullable<HeroRouteContext["cityTours"]>[number],
  b: NonNullable<HeroRouteContext["cityTours"]>[number]
) => {
  const reviewA = a.badges?.reviewCount ?? 0;
  const reviewB = b.badges?.reviewCount ?? 0;
  if (reviewA !== reviewB) {
    return reviewB - reviewA;
  }

  const ratingA = a.badges?.rating ?? 0;
  const ratingB = b.badges?.rating ?? 0;
  if (ratingA !== ratingB) {
    return ratingB - ratingA;
  }

  return (a.title ?? "").localeCompare(b.title ?? "");
};

export const resolveCityHeroImage = ({
  citySlug,
  stateSlug,
  countryCode,
  cityTours,
}: {
  citySlug?: string;
  stateSlug?: string;
  countryCode?: string;
  cityTours?: HeroRouteContext["cityTours"];
}) => {
  const tourPool = [...(cityTours ?? [])].sort(compareCityTours);
  const rankedTourPool = tourPool.slice(0, 12);

  for (const tour of rankedTourPool) {
    const candidateImage = tour.heroImage ?? tour.primaryImage;
    const candidate: CityTourImageCandidate = {
      src: candidateImage,
      tourId: tour.id,
      tourCitySlug: tour.destination?.citySlug,
      citySlug: tour.destination?.citySlug,
      stateSlug: tour.destination?.stateSlug,
      countryCode: tour.destination?.countryCode,
      isActivityDefault: isActivityDefaultImage(candidateImage),
    };

    if (isImageInCityTour(candidate, { citySlug, stateSlug, countryCode })) {
      return buildImageUrl(candidate.src);
    }
  }

  return buildImageUrl(CITY_NEUTRAL_BRAND_IMAGE);
};

export const resolveCitySocialImageFromTours = resolveCityHeroImage;

const normalizePathname = (pathname: string) => {
  if (!pathname) {
    return "/";
  }
  const trimmed = pathname.trim();
  if (!trimmed || trimmed === "/") {
    return "/";
  }
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
};

const isHomeRoute = (pathname: string) => normalizePathname(pathname) === "/";

const isTourDetailRoute = (pathname: string) => {
  const normalized = normalizePathname(pathname);
  return (
    /^\/tours\/[^/]+\/[^/]+\/[^/]+$/.test(normalized) ||
    /^\/tours\/[^/]+$/.test(normalized) ||
    /^\/destinations\/[^/]+\/[^/]+\/tours\/[^/]+$/.test(normalized) ||
    /^\/destinations\/states\/[^/]+\/cities\/[^/]+\/tours\/[^/]+$/.test(
      normalized
    )
  );
};

const isBookingRoute = (pathname: string) => {
  const normalized = normalizePathname(pathname);
  if (!normalized.endsWith("/book")) {
    return false;
  }
  const detailPath = normalized.replace(/\/book$/, "");
  return isTourDetailRoute(detailPath);
};

const isGuideRoute = (pathname: string) =>
  normalizePathname(pathname).startsWith("/guides/");

const isDestinationRoute = (pathname: string) =>
  normalizePathname(pathname).startsWith("/destinations/");

const isHomeHeroResolved = (image?: string) => {
  const normalized = normalizeHeroImage(image);
  if (!normalized) {
    return false;
  }
  return normalized.endsWith(HOME_HERO_IMAGE);
};

const resolveGuidePageType = (
  pathname: string,
  guideType?: "state" | "country" | "city"
): HeroPageType => {
  if (guideType === "city") {
    return "city";
  }
  if (guideType === "state") {
    return "state";
  }
  const normalized = normalizePathname(pathname);
  if (/^\/guides\/(us|world)\/[^/]+\/[^/]+$/.test(normalized)) {
    return "city";
  }
  if (/^\/guides\/us\/[^/]+$/.test(normalized)) {
    return "state";
  }
  return "destination";
};

const resolveCityContextFromRoute = (
  route: string,
  city?: HeroRouteContext["city"],
  state?: HeroRouteContext["state"]
) => {
  const normalizedRoute = normalizePathname(route);
  const segments = normalizedRoute
    .replace(/^\//, "")
    .split("/")
    .filter(Boolean);

  let routeCitySlug: string | undefined;
  let routeStateSlug: string | undefined;

  if (
    segments[0] === "destinations" &&
    segments[1] === "states" &&
    segments[3] === "cities" &&
    segments[4]
  ) {
    routeStateSlug = segments[2];
    routeCitySlug = segments[4];
  } else if (segments[0] === "guides" && segments[1] === "us" && segments[3]) {
    routeStateSlug = segments[2];
    routeCitySlug = segments[3];
  } else if (
    segments[0] === "destinations" &&
    (segments[1] === "world" || segments[1] === "europe") &&
    segments[3] === "cities" &&
    segments[4]
  ) {
    routeStateSlug = segments[2];
    routeCitySlug = segments[4];
  }

  return {
    citySlug: city?.slug ?? routeCitySlug,
    stateSlug: city?.stateSlug ?? routeStateSlug ?? state?.slug,
    countryCode: city?.countryCode ?? state?.countryCode,
  };
};

export const resolveHeroImageForRoute = ({
  route,
  params,
  tour,
  guide,
  destination,
  state,
  city,
  cityTours,
}: HeroRouteContext): string | null => {
  const normalizedRoute = normalizePathname(route);
  const isHome = isHomeRoute(normalizedRoute);

  if (isHome) {
    return null;
  }

  let resolvedImage: string | undefined;

  if (
    isBookingRoute(normalizedRoute) ||
    isTourDetailRoute(normalizedRoute) ||
    tour
  ) {
    resolvedImage = resolveHeroImage({
      pageType: "product",
      primary: resolveTourHeroImage(tour),
      fallbacks: [],
    });
  } else if (isGuideRoute(normalizedRoute) || guide) {
    const isCityGuidePage =
      resolveGuidePageType(normalizedRoute, guide?.type) === "city";
    if (isCityGuidePage) {
      const cityCtx = resolveCityContextFromRoute(normalizedRoute, city, state);
      return resolveCityHeroImage({
        citySlug: cityCtx.citySlug,
        stateSlug: cityCtx.stateSlug,
        countryCode: cityCtx.countryCode,
        cityTours,
      });
    }
    resolvedImage = resolveHeroImage({
      pageType: resolveGuidePageType(normalizedRoute, guide?.type),
      primary: guide?.guideImages?.[0]?.src ?? undefined,
      fallbacks: [
        city?.heroImages?.[0],
        state?.heroImage,
        GUIDE_FALLBACK_HERO_IMAGE,
      ],
    });
  } else if (
    isDestinationRoute(normalizedRoute) ||
    state ||
    city ||
    destination
  ) {
    const pageType: HeroPageType = city
      ? "city"
      : state
        ? "state"
        : "destination";
    if (pageType === "city") {
      const cityCtx = resolveCityContextFromRoute(normalizedRoute, city, state);
      return resolveCityHeroImage({
        citySlug: cityCtx.citySlug,
        stateSlug: cityCtx.stateSlug,
        countryCode: cityCtx.countryCode,
        cityTours,
      });
    }
    resolvedImage = resolveHeroImage({
      pageType,
      primary:
        city?.heroImages?.[0] ?? state?.heroImage ?? destination?.heroImage,
      fallbacks: [
        city ? state?.heroImage : undefined,
        DESTINATION_FALLBACK_HERO_IMAGE,
      ],
    });
  } else {
    resolvedImage = resolveHeroImage({
      pageType: "destination",
      primary: undefined,
      fallbacks: [DESTINATION_FALLBACK_HERO_IMAGE],
    });
  }

  const absoluteImage = resolvedImage ? buildImageUrl(resolvedImage) : null;

  if (
    process.env.NODE_ENV !== "production" &&
    absoluteImage &&
    isHomeHeroResolved(absoluteImage)
  ) {
    console.warn(
      "[hero] Resolved /hero.jpg for non-home route.",
      JSON.stringify({ route: normalizedRoute, params })
    );
  }

  return absoluteImage;
};
