import {
  buildTourDescription,
  extractTourBaseDescription,
  extractVariantLabel,
} from "./tourDescription";
import { SITE_BRAND_NAME } from "./site";

export const SITE_URL = "https://www.alloutdooradventures.com";
export const ROOT_OG_IMAGE =
  "https://cdn.filestackcontent.com/MMdbUxClRWq36GyZNbqk";

export const DEFAULT_SEO = {
  title: `${SITE_BRAND_NAME} | Outdoor Tours, Activities & Travel Guides`,
  description: `Discover outdoor tours, activities, travel guides, and curated local experiences across the United States and top adventure destinations worldwide.`,
  url: `${SITE_URL}/`,
  type: "website",
  image: null,
} as const;

type StaticSeoEntry = {
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  ogImage?: string;
  twitterImage?: string;
};

export const STATIC_PAGE_SEO: Record<string, StaticSeoEntry> = {
  "/faqs": {
    title: `FAQs | ${SITE_BRAND_NAME}`,
    description:
      "Get answers to common questions about booking, cancellations, policies, and tour logistics so you can plan with confidence.",
  },
  "/refund-policy": {
    title: `Refund & Cancellation Policy | ${SITE_BRAND_NAME}`,
    description:
      "Review the All Outdoor Adventures refund and cancellation policy for guided tours, cruises, sightseeing experiences, and activity bookings.",
  },
  "/contact": {
    title: `Contact ${SITE_BRAND_NAME}`,
    description:
      "Contact All Outdoor Adventures for tour support, booking questions, partnerships, and curated travel experience inquiries.",
  },
  "/tours": {
    title: `Tours | ${SITE_BRAND_NAME}`,
    description:
      "Navigate outdoor destinations by country or state and jump straight to local guides and tours.",
  },
  "/activities": {
    title: `Explore Outdoor Activities | ${SITE_BRAND_NAME}`,
    description:
      "Browse outdoor tours by activity type, from hiking and cycling to paddle sports, wildlife, stargazing, food and wine, sailing, air tours, and city sightseeing.",
  },
  "/destinations": {
    title: `Outdoor Adventure Destinations | ${SITE_BRAND_NAME}`,
    description:
      "Browse outdoor adventure destinations, tours, activities, and travel experiences across the United States.",
  },
  "/guides": {
    title: `Travel Guides | ${SITE_BRAND_NAME}`,
    description:
      "Plan trips with destination travel guides, attractions, outdoor activities, and local experiences across top adventure spots.",
  },
  "/guides/us": {
    title: `US Guides | ${SITE_BRAND_NAME}`,
    description:
      "Browse United States outdoor guides by state and jump into city-level planning pages.",
  },
  "/guides/world": {
    title: `International Guides | ${SITE_BRAND_NAME}`,
    description:
      "Browse international country guides and continue into destination-level planning pages.",
  },
  "/guides/international": {
    title: `International Guides | ${SITE_BRAND_NAME}`,
    description:
      "Browse international country guides and continue into destination-level planning pages.",
  },
  "/journeys": {
    title: `Journeys | ${SITE_BRAND_NAME}`,
    description:
      "Plan multi-day journeys and custom itineraries built around iconic landscapes and local expertise.",
  },
  "/about": {
    title: `About ${SITE_BRAND_NAME} | Tours & Travel Guides`,
    description: `Learn how All Outdoor Adventures helps travelers compare trusted tours, use practical guides, and book memorable outdoor experiences.`,
  },
};

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
      `${composed} Discover curated tours, local guides, and outdoor experiences.`.trim();
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

export const buildImageUrl = (image?: string | null) => {
  if (!image) {
    return "";
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
    image: entry.image ? buildImageUrl(entry.image) : null,
    ...(entry.imageAlt ? { imageAlt: entry.imageAlt } : {}),
    ...(entry.ogImage ? { ogImage: buildImageUrl(entry.ogImage) } : {}),
    ...(entry.twitterImage
      ? { twitterImage: buildImageUrl(entry.twitterImage) }
      : {}),
  };
};
