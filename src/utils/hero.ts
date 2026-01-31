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
  } | null;
  city?: {
    heroImages?: string[];
  } | null;
};

const normalizeHeroImage = (image?: string) => (image ?? "").trim();

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
    resolvedImage = resolveHeroImage({
      pageType: resolveGuidePageType(normalizedRoute, guide?.type),
      primary: guide?.guideImages?.[0]?.src ?? undefined,
      fallbacks: [
        city?.heroImages?.[0],
        state?.heroImage,
        GUIDE_FALLBACK_HERO_IMAGE,
      ],
    });
  } else if (isDestinationRoute(normalizedRoute) || state || city || destination) {
    const pageType: HeroPageType = city
      ? "city"
      : state
        ? "state"
        : "destination";
    resolvedImage = resolveHeroImage({
      pageType,
      primary: city?.heroImages?.[0] ?? state?.heroImage ?? destination?.heroImage,
      fallbacks: [
        city ? state?.heroImage : undefined,
        DESTINATION_FALLBACK_HERO_IMAGE,
      ],
    });
  } else {
    resolvedImage = resolveHeroImage({
      pageType: "destination",
      primary: destination?.heroImage ?? state?.heroImage ?? city?.heroImages?.[0],
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
