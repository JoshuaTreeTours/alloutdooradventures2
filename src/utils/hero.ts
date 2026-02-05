export type HeroPageType =
  | "home"
  | "state"
  | "city"
  | "destination"
  | "activity"
  | "product";

import { buildImageUrl } from "./seo";

export const HOME_HERO_IMAGE = "/hero.jpg";
export const TOUR_FALLBACK_HERO_IMAGE = "/images/hiking-hero.jpg";
export const GUIDE_FALLBACK_HERO_IMAGE = "/images/cycling-hero.jpg";
export const DESTINATION_FALLBACK_HERO_IMAGE = "/images/canoe-hero.jpg";
export const CITY_PLACEHOLDER_HERO_IMAGE = "/images/canoe-hero.jpg";

export type HeroRouteContext = {
  route: string;
  params?: Record<string, string | undefined>;
  tour?: {
    heroImage?: string;
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
    images?: HeroImageCandidate[];
    poiImages?: HeroImageCandidate[];
  } | null;
};

type CityHeroContext = {
  cityId?: string;
  citySlug?: string;
  stateSlug?: string;
  countryCode?: string;
};

export type HeroImageCandidate =
  | string
  | {
      src?: string;
      cityId?: string;
      citySlug?: string;
      stateSlug?: string;
      countryCode?: string;
      location?: {
        citySlug?: string;
      };
      poi?: {
        cityId?: string;
        citySlug?: string;
      };
    };

const normalizeHeroImage = (image?: string) => (image ?? "").trim();

const normalizeCountryCode = (value?: string) =>
  value ? value.trim().toUpperCase() : undefined;

const isHomeHeroImage = (image?: string) => {
  const normalized = normalizeHeroImage(image);
  if (!normalized) {
    return false;
  }

  return normalized === HOME_HERO_IMAGE || normalized.endsWith("/hero.jpg");
};

export const filterHeroImages = (
  images: Array<string | undefined>,
  pageType: HeroPageType,
) => {
  const uniqueImages = images
    .map((image) => normalizeHeroImage(image))
    .filter((image) => Boolean(image))
    .filter((image, index, list) => list.indexOf(image) === index);

  if (pageType === "home") {
    return uniqueImages;
  }

  return uniqueImages.filter((image) => !isHomeHeroImage(image));
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

const getCandidateSrc = (image?: HeroImageCandidate) => {
  if (!image) {
    return undefined;
  }

  if (typeof image === "string") {
    return image;
  }

  return image.src;
};

export const isImageInCity = (
  image: HeroImageCandidate | undefined,
  cityCtx: CityHeroContext,
) => {
  if (!image || typeof image === "string") {
    return false;
  }

  const cityId = cityCtx.cityId?.trim();
  const citySlug = cityCtx.citySlug?.trim();
  const stateSlug = cityCtx.stateSlug?.trim();
  const countryCode = normalizeCountryCode(cityCtx.countryCode);

  const imageCountryCode = normalizeCountryCode(image.countryCode);
  if (countryCode && imageCountryCode && imageCountryCode !== countryCode) {
    return false;
  }

  const imageStateSlug = image.stateSlug?.trim();
  if (stateSlug && imageStateSlug && imageStateSlug !== stateSlug) {
    return false;
  }

  const hasStrongMatch = Boolean(
    (cityId && image.cityId?.trim() === cityId) ||
      (citySlug && image.citySlug?.trim() === citySlug) ||
      (citySlug && image.location?.citySlug?.trim() === citySlug),
  );

  return hasStrongMatch;
};

export const resolveCityHeroImage = ({
  city,
  citySlug,
  stateSlug,
  countryCode,
  cityId,
}: {
  city?: HeroRouteContext["city"];
  citySlug?: string;
  stateSlug?: string;
  countryCode?: string;
  cityId?: string;
}) => {
  const cityCtx: CityHeroContext = {
    cityId: cityId ?? city?.id,
    citySlug: citySlug ?? city?.slug,
    stateSlug: stateSlug ?? city?.stateSlug,
    countryCode: countryCode ?? city?.countryCode,
  };

  const cityHeroFromDedicatedFields = filterHeroImages(
    [city?.heroImage, city?.heroImages?.[0]],
    "city",
  )[0];
  if (cityHeroFromDedicatedFields) {
    return buildImageUrl(cityHeroFromDedicatedFields);
  }

  const sameCityImages = (city?.images ?? []).filter((image) =>
    isImageInCity(image, cityCtx),
  );
  const cityImage = filterHeroImages(
    sameCityImages.map((image) => getCandidateSrc(image)),
    "city",
  )[0];
  if (cityImage) {
    return buildImageUrl(cityImage);
  }

  const sameCityPoiImages = (city?.poiImages ?? []).filter((image) => {
    if (!isImageInCity(image, cityCtx)) {
      return false;
    }

    if (typeof image === "string") {
      return false;
    }

    const poiCityId = image.poi?.cityId?.trim();
    const poiCitySlug = image.poi?.citySlug?.trim();
    if (cityCtx.cityId && poiCityId) {
      return poiCityId === cityCtx.cityId;
    }
    if (cityCtx.citySlug && poiCitySlug) {
      return poiCitySlug === cityCtx.citySlug;
    }

    return Boolean(poiCityId || poiCitySlug);
  });

  const poiImage = filterHeroImages(
    sameCityPoiImages.map((image) => getCandidateSrc(image)),
    "city",
  )[0];
  if (poiImage) {
    return buildImageUrl(poiImage);
  }

  return buildImageUrl(CITY_PLACEHOLDER_HERO_IMAGE);
};

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
      normalized,
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
  guideType?: "state" | "country" | "city",
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
  state?: HeroRouteContext["state"],
) => {
  const normalizedRoute = normalizePathname(route);
  const segments = normalizedRoute.replace(/^\//, "").split("/").filter(Boolean);

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
  }

  return {
    citySlug: city?.slug ?? routeCitySlug,
    stateSlug: city?.stateSlug ?? routeStateSlug ?? state?.slug,
    cityId: city?.id,
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
}: HeroRouteContext): string | null => {
  const normalizedRoute = normalizePathname(route);
  const isHome = isHomeRoute(normalizedRoute);

  if (isHome) {
    return buildImageUrl(HOME_HERO_IMAGE);
  }

  let resolvedImage: string | undefined;

  if (isBookingRoute(normalizedRoute) || isTourDetailRoute(normalizedRoute) || tour) {
    resolvedImage = resolveHeroImage({
      pageType: "product",
      primary: tour?.heroImage ?? tour?.galleryImages?.[0],
      fallbacks: [TOUR_FALLBACK_HERO_IMAGE],
    });
  } else if (isGuideRoute(normalizedRoute) || guide) {
    const isCityGuidePage =
      resolveGuidePageType(normalizedRoute, guide?.type) === "city";
    if (isCityGuidePage) {
      const cityCtx = resolveCityContextFromRoute(normalizedRoute, city, state);
      return resolveCityHeroImage({ city, ...cityCtx });
    }
    resolvedImage = resolveHeroImage({
      pageType: resolveGuidePageType(normalizedRoute, guide?.type),
      primary: guide?.guideImages?.[0]?.src ?? undefined,
      fallbacks: [city?.heroImages?.[0], state?.heroImage, GUIDE_FALLBACK_HERO_IMAGE],
    });
  } else if (isDestinationRoute(normalizedRoute) || state || city || destination) {
    const pageType: HeroPageType = city
      ? "city"
      : state
        ? "state"
        : "destination";
    if (pageType === "city") {
      const cityCtx = resolveCityContextFromRoute(normalizedRoute, city, state);
      return resolveCityHeroImage({ city, ...cityCtx });
    }
    resolvedImage = resolveHeroImage({
      pageType,
      primary: city?.heroImages?.[0] ?? state?.heroImage ?? destination?.heroImage,
      fallbacks: [city ? state?.heroImage : undefined, DESTINATION_FALLBACK_HERO_IMAGE],
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
      JSON.stringify({ route: normalizedRoute, params }),
    );
  }

  return absoluteImage;
};
