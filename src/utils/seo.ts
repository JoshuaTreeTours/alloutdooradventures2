import { getActivityLabelFromSlug } from "../data/activityLabels";
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

const stripHtml = (text: string) => text.replace(/<[^>]+>/g, " ");

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

const normalizeLocation = (city?: string, region?: string) => {
  if (city && region) {
    return `${city}, ${region}`;
  }

  return city ?? region ?? "";
};

const trimHookToFit = (hook: string, maxLength: number) => {
  if (hook.length <= maxLength) {
    return hook;
  }

  const trimmed = hook.slice(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(" ");
  const safeTrim = lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed;
  const normalized = safeTrim.replace(/[\s,.]+$/, "");

  return normalized ? `${normalized}.` : "";
};

export const buildTourMetaDescription = (tour: {
  title?: string;
  destination?: { city?: string; state?: string; country?: string };
  activitySlugs?: string[];
  primaryCategory?: string;
}) => {
  const title = normalizeText(tour.title ?? "this tour");
  const city = normalizeText(tour.destination?.city ?? "");
  const region = normalizeText(
    tour.destination?.state ?? tour.destination?.country ?? ""
  );
  const location = normalizeLocation(city || undefined, region || undefined);
  const prefix = location
    ? `Discover ${title} in ${location}.`
    : `Discover ${title}.`;
  const suffix = "Book your outdoor adventure today.";
  const activitySlug = tour.activitySlugs?.[0] ?? tour.primaryCategory ?? "";
  const activityLabel = normalizeText(getActivityLabelFromSlug(activitySlug));
  const activityLower = activityLabel
    ? activityLabel.toLowerCase()
    : "guided outdoor";

  const hookOptions = activityLabel
    ? [
        `Enjoy a ${activityLower} experience with local guides and unforgettable scenery.`,
        `Enjoy a ${activityLower} experience with local guides and scenic highlights.`,
        `Enjoy a ${activityLower} experience with local guides.`,
        `Enjoy a ${activityLower} experience.`,
      ]
    : [
        "Enjoy a guided outdoor experience with local guides and unforgettable scenery.",
        "Enjoy a guided outdoor experience with local guides and scenic highlights.",
        "Enjoy a guided outdoor experience with local guides.",
        "Enjoy a guided outdoor experience.",
      ];

  const minLength = 120;
  const maxLength = 155;
  let hook = hookOptions[0];
  let composed = `${prefix} ${hook} ${suffix}`.trim();

  for (const option of hookOptions) {
    const candidate = `${prefix} ${option} ${suffix}`.trim();
    if (candidate.length <= maxLength) {
      hook = option;
      composed = candidate;
      break;
    }
  }

  if (composed.length < minLength) {
    const expansionOptions = [
      "perfect for travelers seeking fresh air and local insight",
      "ideal for travelers craving fresh air",
    ];
    for (const expansion of expansionOptions) {
      const expandedHook = hook.replace(/\.$/, `, ${expansion}.`);
      const candidate = `${prefix} ${expandedHook} ${suffix}`.trim();
      if (candidate.length >= minLength && candidate.length <= maxLength) {
        hook = expandedHook;
        composed = candidate;
        break;
      }
    }
  }

  if (composed.length > maxLength) {
    const available = maxLength - prefix.length - suffix.length - 2;
    const trimmedHook = trimHookToFit(hook, Math.max(0, available));
    composed = `${prefix} ${trimmedHook} ${suffix}`.trim();
  }

  if (composed.length < minLength) {
    composed = buildMetaDescription(composed, undefined, minLength);
  }

  return clampDescription(composed, maxLength);
};

type TourMetaInput = {
  title?: string;
  shortDescription?: string;
  longDescription?: string;
  heroImage?: string;
  galleryImages?: string[];
  badges?: { tagline?: string };
  destination?: { city?: string; state?: string; country?: string };
};

type ResolveTourMetaOptions = {
  tour: TourMetaInput;
  productDescription?: string;
  tripSummary?: string;
};

type ResolvedTourMeta = {
  title?: string;
  description?: string;
  image?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
};

const isUnitedStates = (country?: string) => {
  const normalized = normalizeText(country ?? "").toLowerCase();
  return (
    normalized === "us" ||
    normalized === "usa" ||
    normalized === "united states"
  );
};

const buildTourLocation = (destination?: {
  city?: string;
  state?: string;
  country?: string;
}) => {
  const city = normalizeText(destination?.city ?? "");
  const state = normalizeText(destination?.state ?? "");
  const country = normalizeText(destination?.country ?? "");
  const region = state || (!isUnitedStates(country) ? country : "");
  const titleLocation = city ? `${city}${region ? `, ${region}` : ""}` : "";
  const descriptionLocation = city
    ? `${city}${region ? `, ${region}` : ""}`
    : region;

  return { city, region, titleLocation, descriptionLocation };
};

const includesLocation = (text: string, location: string) => {
  if (!text || !location) {
    return false;
  }
  return text.toLowerCase().includes(location.toLowerCase());
};

const summarizeTourDescription = ({
  title,
  description,
  secondary,
  location,
}: {
  title?: string;
  description?: string;
  secondary?: string;
  location?: string;
}) => {
  const cleanedPrimary = normalizeText(stripHtml(description ?? ""));
  const cleanedSecondary = normalizeText(stripHtml(secondary ?? ""));
  const cleanedTitle = normalizeText(title ?? "");
  let composed = cleanedPrimary || cleanedSecondary;

  if (!composed && cleanedTitle) {
    composed = `Explore ${cleanedTitle}${location ? ` in ${location}` : ""} with an outdoor guided experience.`;
  }

  if (location && !includesLocation(composed, location)) {
    composed = `${composed.replace(/[.!?]+$/, "")}. In ${location}.`;
  }

  if (
    composed.length < 140 &&
    cleanedSecondary &&
    !composed.includes(cleanedSecondary)
  ) {
    composed = `${composed} ${cleanedSecondary}`.trim();
  }

  return clampDescription(composed, 165);
};

export const resolveTourMeta = ({
  tour,
  productDescription,
  tripSummary,
}: ResolveTourMetaOptions): ResolvedTourMeta => {
  const titleName = normalizeText(tour.title ?? "");
  const { titleLocation, descriptionLocation } = buildTourLocation(
    tour.destination
  );
  const title = titleName
    ? `${titleName}${titleLocation ? ` in ${titleLocation}` : ""} | ${SITE_BRAND_NAME}`
    : undefined;
  const description = summarizeTourDescription({
    title: titleName,
    description:
      productDescription ??
      tripSummary ??
      tour.longDescription ??
      tour.shortDescription ??
      tour.badges?.tagline,
    secondary: tripSummary ?? tour.shortDescription ?? tour.badges?.tagline,
    location: descriptionLocation,
  });

  const imageCandidate = [tour.heroImage, ...(tour.galleryImages ?? [])]
    .map(image => normalizeText(image ?? ""))
    .find(
      image => image && !image.endsWith("/hero.jpg") && image !== "/hero.jpg"
    );
  const image = imageCandidate ? buildImageUrl(imageCandidate) : undefined;

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    ...(title ? { ogTitle: title, twitterTitle: title } : {}),
    ...(description
      ? { ogDescription: description, twitterDescription: description }
      : {}),
  };
};

type GeoPageMeta = {
  title: string;
  description: string;
};

const joinPlace = (city?: string, state?: string) => {
  const cityName = normalizeText(city ?? "");
  const stateName = normalizeText(state ?? "");
  return cityName && stateName
    ? `${cityName}, ${stateName}`
    : cityName || stateName;
};

export const buildGuideCityMeta = ({
  city,
  state,
}: {
  city: string;
  state: string;
}): GeoPageMeta => {
  const place = joinPlace(city, state);
  const title = `${place} Travel Guide | ${SITE_BRAND_NAME}`;
  const description = clampDescription(
    `Plan outdoor adventures in ${place} with curated tour ideas, local highlights, and practical tips for exploring trails, neighborhoods, and nearby experiences.`,
    165
  );

  return { title, description };
};

export const buildDestinationStateMeta = ({
  state,
}: {
  state: string;
}): GeoPageMeta => {
  const stateName = normalizeText(state);
  const title = `${stateName} Outdoor Adventures & Tours | ${SITE_BRAND_NAME}`;
  const description = clampDescription(
    `Explore outdoor adventures, tours, and featured cities across ${stateName}. Compare experiences by region and find curated options built for every travel style.`,
    165
  );

  return { title, description };
};

export const buildDestinationCityMeta = ({
  city,
  state,
}: {
  city: string;
  state: string;
}): GeoPageMeta => {
  const place = joinPlace(city, state);
  const title = `${place} Outdoor Adventures | ${SITE_BRAND_NAME}`;
  const description = clampDescription(
    `Discover outdoor adventures, tours, and city experiences in ${place}, from iconic highlights to active day trips, all organized for easy trip planning.`,
    165
  );

  return { title, description };
};

export const buildDestinationCityToursMeta = ({
  city,
  state,
}: {
  city: string;
  state: string;
}): GeoPageMeta => {
  const place = joinPlace(city, state);
  const title = `${place} Tours & Experiences | ${SITE_BRAND_NAME}`;
  const description = clampDescription(
    `Browse guided tours and outdoor experiences in ${place}, with activity filters and direct booking links to help you choose the right trip quickly.`,
    165
  );

  return { title, description };
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
    image: buildImageUrl(
      ("image" in entry ? entry.image : undefined) ?? DEFAULT_SEO.image
    ),
  };
};
