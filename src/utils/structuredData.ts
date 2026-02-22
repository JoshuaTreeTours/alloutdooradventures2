import type { Tour } from "../data/tours.types";
import {
  DEFAULT_CURRENCY,
  DEFAULT_IMAGE_URL,
} from "../constants/merchantDefaults";
import { applyPriceFloor } from "./merchantPricing";
import { filterHeroImages } from "./hero";
import { buildCanonicalUrl, buildImageUrl, SITE_URL } from "./seo";
import { SITE_BRAND_NAME } from "./site";

type StructuredDataValue =
  | string
  | number
  | boolean
  | null
  | StructuredDataValue[]
  | { [key: string]: StructuredDataValue };

type StructuredDataNode = Record<string, unknown>;

export const SITE_ORGANIZATION_ID = `${SITE_URL}/#org`;
export const SITE_BRAND_ID = `${SITE_URL}/#brand`;
export const SITE_WEBSITE_ID = `${SITE_URL}/#website`;
export const SITE_AGENCY_ID = SITE_BRAND_ID;
export const PRICING_RELIABLE_DEFAULT = false;

const ORGANIZATION_NAME = "Outdoor Adventures, Inc.";

const URL_FIELDS = new Set(["url", "item", "logo", "image"]);
const ID_FIELDS = new Set(["@id"]);
const LEGACY_BRAND_PATTERN = new RegExp(
  ["All", "Outdoor", "Adventures"].join("\\s+"),
  "gi"
);

const toAbsoluteUrl = (value: string) => {
  if (!value) {
    return value;
  }
  if (value.startsWith("http")) {
    return value;
  }
  return buildCanonicalUrl(value);
};

const stripEmptyValues = (value: StructuredDataValue): StructuredDataValue => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  if (Array.isArray(value)) {
    const cleaned = value
      .map(item => stripEmptyValues(item))
      .filter(item => item !== null);
    return cleaned.length ? cleaned : null;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, entryValue]) => [key, stripEmptyValues(entryValue)])
      .filter(([, entryValue]) => entryValue !== null);
    if (!entries.length) {
      return null;
    }
    return Object.fromEntries(entries) as StructuredDataValue;
  }

  return value;
};

const ensureAbsoluteUrls = (
  value: StructuredDataValue,
  key?: string
): StructuredDataValue => {
  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    if (key && (URL_FIELDS.has(key) || ID_FIELDS.has(key))) {
      return toAbsoluteUrl(value);
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(item => ensureAbsoluteUrls(item, key));
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        ensureAbsoluteUrls(entryValue, entryKey),
      ])
    ) as StructuredDataValue;
  }

  return value;
};

const hasType = (value: StructuredDataValue): boolean => {
  if (!value || typeof value !== "object") {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some(hasType);
  }

  if ("@type" in value) {
    const typeValue = value["@type"];
    if (Array.isArray(typeValue)) {
      return typeValue.length > 0;
    }
    return Boolean(typeValue);
  }

  if ("@graph" in value && Array.isArray(value["@graph"])) {
    return value["@graph"].some(node => {
      if (!node || typeof node !== "object" || Array.isArray(node)) {
        return false;
      }
      const typeValue = (node as { "@type"?: StructuredDataValue })["@type"];
      if (Array.isArray(typeValue)) {
        return typeValue.length > 0;
      }
      return Boolean(typeValue);
    });
  }

  return false;
};

export const normalizeStructuredData = (
  value: StructuredDataValue
): StructuredDataValue | null => {
  const stripped = stripEmptyValues(value);
  if (!stripped) {
    return null;
  }

  const normalized = ensureAbsoluteUrls(stripped);

  if (
    normalized &&
    typeof normalized === "object" &&
    !Array.isArray(normalized) &&
    "@graph" in normalized &&
    Array.isArray(normalized["@graph"])
  ) {
    return hasType(normalized)
      ? {
          ...normalized,
          "@graph": dedupeGraphNodesById(normalized["@graph"]),
        }
      : null;
  }

  if (Array.isArray(normalized)) {
    const deduped = dedupeGraphNodesById(normalized);
    return hasType(deduped) ? deduped : null;
  }

  return hasType(normalized) ? normalized : null;
};

export const dedupeGraphNodesById = (nodes: unknown[]): unknown[] => {
  const seen = new Set<string>();

  return nodes.filter(node => {
    if (!node || typeof node !== "object" || Array.isArray(node)) {
      return true;
    }

    const nodeId = (node as StructuredDataNode)["@id"];
    if (typeof nodeId !== "string") {
      return true;
    }

    if (seen.has(nodeId)) {
      return false;
    }

    seen.add(nodeId);
    return true;
  });
};

export const getSiteStructuredDataNodes = () => {
  const logoUrl = buildImageUrl("/images/Logo.png");

  return [
    {
      "@type": "Organization",
      "@id": SITE_ORGANIZATION_ID,
      name: ORGANIZATION_NAME,
      url: SITE_URL,
      logo: logoUrl,
      telephone: "+1-855-314-8687",
      sameAs: [
        "https://www.facebook.com/alloutdooradventuresonline/",
        "https://www.linkedin.com/company/all-outdoor-adventures/",
      ],
    },
    {
      "@type": ["Organization", "TravelAgency"],
      "@id": SITE_BRAND_ID,
      name: SITE_BRAND_NAME,
      url: SITE_URL,
      logo: logoUrl,
      telephone: "+1-855-314-8687",
      sameAs: [
        "https://www.facebook.com/alloutdooradventuresonline/",
        "https://www.linkedin.com/company/all-outdoor-adventures/",
      ],
      parentOrganization: {
        "@id": SITE_ORGANIZATION_ID,
      },
      areaServed: [
        {
          "@type": "GeoShape",
          name: "Worldwide",
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": SITE_WEBSITE_ID,
      url: SITE_URL,
      name: SITE_BRAND_NAME,
      publisher: {
        "@id": SITE_ORGANIZATION_ID,
      },
      about: {
        "@id": SITE_BRAND_ID,
      },
    },
  ];
};

export const sanitizeSchemaName = (value: string) =>
  value.replace(LEGACY_BRAND_PATTERN, SITE_BRAND_NAME).trim();

const buildImageObject = (url: string, id?: string) => ({
  "@type": "ImageObject",
  ...(id ? { "@id": id } : {}),
  url,
});

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  "united states": "US",
  "united states of america": "US",
  usa: "US",
  us: "US",
  australia: "AU",
  canada: "CA",
  denmark: "DK",
  france: "FR",
  germany: "DE",
  greece: "GR",
  iceland: "IS",
  ireland: "IE",
  italy: "IT",
  netherlands: "NL",
  portugal: "PT",
  spain: "ES",
  "united kingdom": "GB",
  "great britain": "GB",
  uk: "GB",
};

const ISO_COUNTRY_CODE_PATTERN = /^[A-Za-z]{2}$/;

type MissingGeoFallback = {
  tourId: string;
  detailUrl: string;
  fallback: string;
  reason: string;
};

const missingGeoFallbacks: MissingGeoFallback[] = [];

const recordMissingGeoFallback = (entry: MissingGeoFallback) => {
  missingGeoFallbacks.push(entry);
  console.warn(
    `[schema] Tour ${entry.tourId} missing geo metadata (${entry.reason}); using ${entry.fallback}.`
  );
};

export const getMissingGeoFallbackReport = () => [...missingGeoFallbacks];

export const resetMissingGeoFallbackReport = () => {
  missingGeoFallbacks.length = 0;
};

const normalizeCountryKey = (value: string) =>
  value.trim().toLowerCase().replace(/[.,]/g, "").replace(/\s+/g, " ");

const resolveCountryCode = (tour: Tour, detailUrl: string): string => {
  const country = tour.destination.country?.trim();
  if (!country) {
    const normalizedUrl = detailUrl.toLowerCase();
    const isUnitedStatesRoute =
      normalizedUrl.includes("/destinations/united-states/") ||
      normalizedUrl.includes("/tours/");
    if (isUnitedStatesRoute) {
      recordMissingGeoFallback({
        tourId: tour.id,
        detailUrl,
        fallback: "US",
        reason: "missing destination.country inferred from URL",
      });
      return "US";
    }
    recordMissingGeoFallback({
      tourId: tour.id,
      detailUrl,
      fallback: "US",
      reason: "missing destination.country default fallback",
    });
    return "US";
  }

  if (ISO_COUNTRY_CODE_PATTERN.test(country)) {
    return country.toUpperCase();
  }

  const normalizedCountry = normalizeCountryKey(country);
  if (COUNTRY_NAME_TO_CODE[normalizedCountry]) {
    return COUNTRY_NAME_TO_CODE[normalizedCountry];
  }

  return "US";
};

const buildTourLocationStructuredData = (tour: Tour, detailUrl: string) => {
  const locality = tour.destination.city;
  const region = tour.destination.state;
  const countryCode = resolveCountryCode(tour, detailUrl);
  const placeName = region ? `${locality}, ${region}` : locality;

  return {
    "@type": "Place",
    name: placeName,
    address: {
      "@type": "PostalAddress",
      addressLocality: locality,
      ...(region ? { addressRegion: region } : {}),
      addressCountry: countryCode,
    },
  };
};

const TOUR_PRICE_DESCRIPTION =
  "Pricing varies by date and group size; see booking partner for current rates.";

const toOfferPrice = (tour: Tour) =>
  applyPriceFloor(tour.startingPrice ?? null);

const toOfferCurrency = (tour: Tour) =>
  tour.currency?.trim().toUpperCase() || DEFAULT_CURRENCY;

const parseBuildDate = () => {
  const buildDate = process.env.BUILD_DATE;
  if (buildDate) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(buildDate)) {
      return new Date(`${buildDate}T00:00:00.000Z`);
    }
    const parsed = new Date(buildDate);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date();
};

export const getPriceValidUntil = (days = 365): string => {
  const baseDate = parseBuildDate();
  const futureDate = new Date(baseDate);
  futureDate.setUTCDate(futureDate.getUTCDate() + days);
  return futureDate.toISOString().slice(0, 10);
};

export const buildWebPageStructuredData = ({
  url,
  name,
  description,
  image,
  mainEntityId,
}: {
  url: string;
  name: string;
  description?: string;
  image?: string;
  mainEntityId?: string;
}) => {
  const imageId = image ? `${url}#primaryimage` : undefined;
  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: sanitizeSchemaName(name),
    description,
    isPartOf: { "@id": SITE_WEBSITE_ID },
    publisher: { "@id": SITE_ORGANIZATION_ID },
    ...(mainEntityId ? { mainEntity: { "@id": mainEntityId } } : {}),
    ...(image
      ? {
          primaryImageOfPage: buildImageObject(image, imageId),
          image,
        }
      : {}),
  };
};

export const buildBreadcrumbList = (
  items: { name: string; url: string }[]
) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const buildItemList = (
  items: { name: string; url: string; image?: string | string[] }[]
) => ({
  "@type": "ItemList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    url: item.url,
    ...(item.image
      ? {
          image: Array.isArray(item.image) ? item.image : [item.image],
        }
      : {}),
  })),
});

export const buildTourProductStructuredData = ({
  tour,
  detailUrl,
  bookingUrl,
  description,
  images,
  ratingsVisible = false,
}: {
  tour: Tour;
  detailUrl: string;
  bookingUrl?: string;
  description?: string;
  images?: string[];
  ratingsVisible?: boolean;
}) => {
  const resolvedImages = filterHeroImages(
    images ?? [
      tour.heroImage,
      ...(tour.galleryImages ?? []),
      DEFAULT_IMAGE_URL,
    ],
    "product"
  );
  const offerUrl = bookingUrl || detailUrl;
  const ratingValue = tour.badges?.rating;
  const reviewCount = tour.badges?.reviewCount;
  const ratingsEnabled = process.env.ENABLE_RATINGS_SCHEMA === "true" || ratingsVisible;
  const aggregateRating =
    ratingsEnabled &&
    typeof ratingValue === "number" &&
    typeof reviewCount === "number" &&
    reviewCount > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: ratingValue.toFixed(1),
          reviewCount,
        }
      : undefined;

  const offer = {
    "@type": "Offer",
    url: offerUrl,
    availability: "https://schema.org/InStock",
    price: toOfferPrice(tour).toFixed(2),
    priceCurrency: toOfferCurrency(tour),
    priceValidUntil: getPriceValidUntil(),
  };

  return {
    "@type": "Product",
    "@id": `${detailUrl}#product`,
    url: detailUrl,
    name: tour.title,
    description,
    ...(resolvedImages.length ? { image: resolvedImages } : {}),
    sku: tour.id,
    brand: { "@id": SITE_BRAND_ID },
    provider: { "@id": SITE_BRAND_ID },
    offers: offer,
    ...(aggregateRating ? { aggregateRating } : {}),
    priceSpecification: {
      "@type": "PriceSpecification",
      description: TOUR_PRICE_DESCRIPTION,
    },
    location: buildTourLocationStructuredData(tour, detailUrl),
    mainEntityOfPage: { "@type": "WebPage", "@id": `${detailUrl}#webpage` },
  };
};

export const buildTourTripStructuredData = ({
  tour,
  detailUrl,
  bookingUrl,
  description,
  images,
  ratingsVisible = false,
}: {
  tour: Tour;
  detailUrl: string;
  bookingUrl?: string;
  description?: string;
  images?: string[];
  ratingsVisible?: boolean;
}) => {
  const resolvedImages = filterHeroImages(
    images ?? [
      tour.heroImage,
      ...(tour.galleryImages ?? []),
      DEFAULT_IMAGE_URL,
    ],
    "product"
  );
  const offerUrl = bookingUrl || detailUrl;
  const ratingValue = tour.badges?.rating;
  const reviewCount = tour.badges?.reviewCount;
  const ratingsEnabled = process.env.ENABLE_RATINGS_SCHEMA === "true" || ratingsVisible;
  const aggregateRating =
    ratingsEnabled &&
    typeof ratingValue === "number" &&
    typeof reviewCount === "number" &&
    reviewCount > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: ratingValue.toFixed(1),
          reviewCount,
        }
      : undefined;

  return {
    "@type": "TouristTrip",
    "@id": `${detailUrl}#touristtrip`,
    name: tour.title,
    description,
    ...(resolvedImages.length ? { image: resolvedImages } : {}),
    provider: { "@id": SITE_BRAND_ID },
    offers: {
      "@type": "Offer",
      url: offerUrl,
      availability: "https://schema.org/InStock",
      price: toOfferPrice(tour).toFixed(2),
      priceCurrency: toOfferCurrency(tour),
      priceValidUntil: getPriceValidUntil(),
    },
    ...(aggregateRating ? { aggregateRating } : {}),
    priceSpecification: {
      "@type": "PriceSpecification",
      description: TOUR_PRICE_DESCRIPTION,
    },
    location: buildTourLocationStructuredData(tour, detailUrl),
    mainEntityOfPage: { "@id": `${detailUrl}#webpage` },
  };
};

export const buildReserveActionStructuredData = ({
  bookingUrl,
  tourDetailUrl,
  tourName,
}: {
  bookingUrl: string;
  tourDetailUrl: string;
  tourName: string;
}) => ({
  "@type": "ReserveAction",
  "@id": `${bookingUrl}#reserve`,
  name: `Reserve ${tourName}`,
  provider: { "@id": SITE_BRAND_ID },
  target: {
    "@type": "EntryPoint",
    urlTemplate: bookingUrl,
  },
  object: {
    "@id": `${tourDetailUrl}#product`,
  },
});
