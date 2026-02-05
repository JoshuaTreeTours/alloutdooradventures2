import {
  buildTourDescription,
  extractTourBaseDescription,
  extractVariantLabel,
} from "./tourDescription";
import { SITE_BRAND_NAME } from "./site";

export const SITE_URL = "https://www.alloutdooradventures.com";

export const DEFAULT_SEO = {
  title: `${SITE_BRAND_NAME} | Curated Tours & Experiences Worldwide`,
  description: `Discover unforgettable outdoor adventures across the United States and beyond. From national park tours and desert safaris to sailing, hiking, and wildlife experiences, ${SITE_BRAND_NAME} curates the world’s best outdoor tours in one place.`,
  url: `${SITE_URL}/`,
  type: "website",
  image: "/hero.jpg",
} as const;

export const STATIC_PAGE_SEO = {
  "/faqs": {
    title: `FAQs | ${SITE_BRAND_NAME}`,
    description:
      "Get answers about booking, cancellations, and tour logistics so you can plan your outdoor adventure with confidence.",
  },
  "/contact": {
    title: `Contact | ${SITE_BRAND_NAME}`,
    description:
      "Connect with our travel team to plan custom journeys, private group experiences, and curated outdoor tours.",
  },
  "/tours": {
    title: `Tours | ${SITE_BRAND_NAME}`,
    description:
      "Navigate outdoor destinations by country or state and jump straight to local guides and tours.",
  },
  "/destinations": {
    title: `Destinations | ${SITE_BRAND_NAME}`,
    description:
      "Explore curated outdoor destinations across the U.S. and preview upcoming international tour hubs.",
  },
  "/guides": {
    title: `Guides | ${SITE_BRAND_NAME}`,
    description:
      "Discover destination guides with expert insights to help you plan your next outdoor escape.",
  },
  "/journeys": {
    title: `Journeys | ${SITE_BRAND_NAME}`,
    description:
      "Plan multi-day journeys and custom itineraries built around iconic landscapes and local expertise.",
  },
  "/about": {
    title: `About | ${SITE_BRAND_NAME}`,
    description: `Learn about the team behind ${SITE_BRAND_NAME} and our mission to curate unforgettable experiences.`,
  },
} as const;

const normalizeText = (text: string) => text.replace(/\s+/g, " ").trim();

const clampDescription = (text: string, maxLength = 160) => {
  if (text.length <= maxLength) {
    return text;
  }

  const trimmed = text.slice(0, maxLength - 1);
  const lastSpace = trimmed.lastIndexOf(" ");
  const safeTrim = lastSpace > 90 ? trimmed.slice(0, lastSpace) : trimmed;

  return `${safeTrim.trim()}…`;
};

export const buildMetaDescription = (
  primary: string,
  fallback?: string,
  minLength = 140
) => {
  const base = normalizeText(primary);
  let composed = base;

  if (composed.length < minLength && fallback) {
    composed = `${composed} ${normalizeText(fallback)}`.trim();
  }

  if (composed.length < minLength) {
    composed =
      `${composed} Explore curated tours, local guides, and outdoor experiences.`.trim();
  }

  return clampDescription(composed);
};

export const buildTourMetaDescription = (
  tour: {
    id?: string;
    slug?: string;
    title?: string;
    destination?: {
      city?: string;
      state?: string;
      country?: string;
      citySlug?: string;
      stateSlug?: string;
    };
    shortDescription?: string;
    badges?: { tagline?: string };
    longDescription?: string;
  },
  options?: { isDuplicate?: boolean; diagnosticsLabel?: string }
) => {
  return buildTourDescription({
    baseDescription: extractTourBaseDescription(tour),
    tourName: normalizeText(tour.title ?? "this tour"),
    cityName: normalizeText(tour.destination?.city ?? ""),
    stateName: normalizeText(
      tour.destination?.state ?? tour.destination?.country ?? ""
    ),
    citySlug: tour.destination?.citySlug,
    stateSlug: tour.destination?.stateSlug,
    tourId: tour.id ?? "",
    tourSlug: tour.slug,
    variantLabel:
      extractVariantLabel(tour.title) ??
      extractVariantLabel(tour.badges?.tagline),
    isDuplicate: options?.isDuplicate,
    diagnosticsLabel: options?.diagnosticsLabel,
  });
};

export const buildCanonicalUrl = (path: string) => {
  if (!path) {
    return DEFAULT_SEO.url;
  }

  if (path.startsWith("http")) {
    return path;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;

  return `${SITE_URL}${normalized}`;
};

export const buildImageUrl = (image?: string) => {
  if (!image) {
    return buildCanonicalUrl(DEFAULT_SEO.image);
  }

  if (image.startsWith("http")) {
    return image;
  }

  return buildCanonicalUrl(image);
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

export const getStaticPageSeo = (pathname: string) => {
  const normalized = normalizePathname(pathname);
  const entry = STATIC_PAGE_SEO[normalized as keyof typeof STATIC_PAGE_SEO];
  if (!entry) {
    return null;
  }

  return {
    title: entry.title,
    description: entry.description,
    url: buildCanonicalUrl(normalized),
    type: DEFAULT_SEO.type,
    image: buildImageUrl(entry.image ?? DEFAULT_SEO.image),
  };
};
