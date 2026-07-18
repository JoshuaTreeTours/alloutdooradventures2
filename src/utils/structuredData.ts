import type { Tour } from "../data/tours.types";
import { DEFAULT_CURRENCY } from "../constants/merchantDefaults";
import { applyPriceFloor } from "./merchantPricing";
import { filterHeroImages, resolveTourHeroImage } from "./hero";
import { cleanImageUrls, toSchemaImageValue } from "./cleanImageUrls";
import {
  buildCanonicalUrl,
  buildImageUrl,
  ROOT_OG_IMAGE,
  SITE_URL,
} from "./seo";
import { SITE_BRAND_NAME } from "./site";
import { resolveUsState } from "./geo/usStates";
import {
  COUNTRY_NAME_TO_ISO2,
  COUNTRY_SLUG_TO_ISO2,
  extractCountrySlugFromDestinationsPath,
  normalizeCountryKey,
} from "./geo/countryCode";

export type StructuredDataValue =
  | string
  | number
  | boolean
  | null
  | readonly StructuredDataValue[]
  | { readonly [key: string]: StructuredDataValue | undefined };

export type StructuredDataNode = Record<string, unknown>;

export const SITE_ORGANIZATION_ID = `${SITE_URL}/#org`;
export const SITE_BRAND_ID = `${SITE_URL}/#brand`;
export const SITE_WEBSITE_ID = `${SITE_URL}/#website`;
export const SITE_AGENCY_ID = SITE_BRAND_ID;
export const SITE_POSTAL_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "732 S 6th St, Ste N",
  addressLocality: "Las Vegas",
  addressRegion: "NV",
  postalCode: "89101",
  addressCountry: "US",
} as const;
export const PRICING_RELIABLE_DEFAULT = false;
export const SITE_CUSTOMER_SUPPORT_CONTACT_POINT = [
  {
    "@type": "ContactPoint",
    telephone: "+1-855-314-8687",
    contactType: "customer support",
    areaServed: "US",
    availableLanguage: "English",
  },
] as const;

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
      .map(([key, entryValue]) => [key, stripEmptyValues(entryValue ?? null)])
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
        ensureAbsoluteUrls(entryValue ?? null, entryKey),
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
  value: unknown
): StructuredDataValue | null => {
  const stripped = stripEmptyValues(value as StructuredDataValue);
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

export const dedupeGraphNodesById = (
  nodes: readonly unknown[]
): StructuredDataValue[] => {
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
  }) as StructuredDataValue[];
};

export const getSiteStructuredDataNodes = ({
  includeRootImage = false,
}: { includeRootImage?: boolean } = {}) => {
  const logoUrl = buildImageUrl("/images/Outdoor-Adventures-Logo-Transparent.png");
  const organizationImageFields = includeRootImage
    ? { image: buildImageUrl(ROOT_OG_IMAGE) }
    : {};

  return [
    {
      "@type": "Organization",
      "@id": SITE_ORGANIZATION_ID,
      name: ORGANIZATION_NAME,
      url: SITE_URL,
      logo: logoUrl,
      ...organizationImageFields,
      telephone: "+1-855-314-8687",
      contactPoint: SITE_CUSTOMER_SUPPORT_CONTACT_POINT,
      sameAs: [
        "https://www.facebook.com/alloutdooradventuresonline/",
        "https://www.linkedin.com/company/all-outdoor-adventures/",
      ],
      address: SITE_POSTAL_ADDRESS,
    },
    {
      "@type": ["Organization", "TravelAgency"],
      "@id": SITE_BRAND_ID,
      name: SITE_BRAND_NAME,
      url: SITE_URL,
      logo: logoUrl,
      ...organizationImageFields,
      telephone: "+1-855-314-8687",
      contactPoint: SITE_CUSTOMER_SUPPORT_CONTACT_POINT,
      sameAs: [
        "https://www.facebook.com/alloutdooradventuresonline/",
        "https://www.linkedin.com/company/all-outdoor-adventures/",
      ],
      parentOrganization: {
        "@id": SITE_ORGANIZATION_ID,
      },
      address: SITE_POSTAL_ADDRESS,
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

const ISO_COUNTRY_CODE_PATTERN = /^[A-Za-z]{2}$/;

type MissingGeoFallback = {
  tourId: string;
  title: string;
  detailUrl: string;
  destination: Tour["destination"];
  inferredISO2: string;
  reason: string;
};

const missingGeoFallbacks: MissingGeoFallback[] = [];

const recordMissingGeoFallback = (entry: MissingGeoFallback) => {
  missingGeoFallbacks.push(entry);
  console.warn(
    `[schema] Tour ${entry.tourId} missing geo metadata (${entry.reason}); using ${entry.inferredISO2}.`
  );
};

export const getMissingGeoFallbackReport = () => [...missingGeoFallbacks];

export const resetMissingGeoFallbackReport = () => {
  missingGeoFallbacks.length = 0;
};

const resolveISO2CountryCode = ({
  tour,
  detailUrl,
}: {
  tour: Tour;
  detailUrl: string;
}): string => {
  const rawCountryCode = tour.destination.countryCode?.trim();
  if (rawCountryCode && ISO_COUNTRY_CODE_PATTERN.test(rawCountryCode)) {
    return rawCountryCode.toUpperCase();
  }

  const countrySlug = tour.destination.countrySlug?.trim().toLowerCase();
  if (countrySlug && COUNTRY_SLUG_TO_ISO2[countrySlug]) {
    return COUNTRY_SLUG_TO_ISO2[countrySlug];
  }

  const inferredCountrySlug = extractCountrySlugFromDestinationsPath(detailUrl);
  if (inferredCountrySlug && COUNTRY_SLUG_TO_ISO2[inferredCountrySlug]) {
    return COUNTRY_SLUG_TO_ISO2[inferredCountrySlug];
  }

  const countryName = tour.destination.country?.trim();
  if (countryName) {
    if (ISO_COUNTRY_CODE_PATTERN.test(countryName)) {
      return countryName.toUpperCase();
    }

    const normalizedCountry = normalizeCountryKey(countryName);
    if (COUNTRY_NAME_TO_ISO2[normalizedCountry]) {
      return COUNTRY_NAME_TO_ISO2[normalizedCountry];
    }
  }

  recordMissingGeoFallback({
    tourId: tour.id,
    title: tour.title,
    detailUrl,
    destination: tour.destination,
    inferredISO2: "US",
    reason: inferredCountrySlug
      ? `unmapped country slug: ${inferredCountrySlug}`
      : "missing country metadata and URL inference",
  });

  return "US";
};

const buildTourLocationStructuredData = (tour: Tour, detailUrl: string) => {
  const locality = tour.destination.city;
  const countryCode = resolveISO2CountryCode({ tour, detailUrl });
  const region = tour.destination.state;
  const normalizedUsState =
    countryCode === "US" ? resolveUsState(region) : null;
  const placeRegion = normalizedUsState?.name ?? region;
  const placeName = placeRegion ? `${locality}, ${placeRegion}` : locality;

  return {
    "@type": "Place",
    name: placeName,
    address: {
      "@type": "PostalAddress",
      addressLocality: locality,
      ...(placeRegion
        ? { addressRegion: normalizedUsState?.code ?? placeRegion }
        : {}),
      addressCountry: countryCode,
    },
    ...(normalizedUsState
      ? {
          containedInPlace: {
            "@type": "AdministrativeArea",
            name: normalizedUsState.name,
          },
        }
      : {}),
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

const OFFER_URL_BOOK_ROUTE_PATTERNS = [
  /^\/destinations\/(?:world\/canada\/[^/]+\/[^/]+|[^/]+\/[^/]+|united-states\/[^/]+\/[^/]+)\/tours\/[^/]+\/?$/,
  /^\/tours\/[^/]+\/?$/,
  /^\/tours\/[^/]+\/[^/]+\/[^/]+\/?$/,
];

const isAoaBookingOfferEnabled = () =>
  process.env.ENABLE_AOA_BOOKING_OFFER_URL !== "false";

const isTourSchemaSafeV1Enabled = () =>
  process.env.NEXT_PUBLIC_SCHEMA_TOUR_SAFE_V1 === "true";

const hasAoaBookingRoute = (canonicalUrl: string): boolean => {
  try {
    const { pathname } = new URL(canonicalUrl);
    return OFFER_URL_BOOK_ROUTE_PATTERNS.some(pattern =>
      pattern.test(pathname)
    );
  } catch {
    return OFFER_URL_BOOK_ROUTE_PATTERNS.some(pattern =>
      pattern.test(canonicalUrl)
    );
  }
};

export const resolveCanonicalProductUrl = (detailUrl: string): string => {
  const absoluteDetailUrl = toAbsoluteUrl(detailUrl).trim();
  return absoluteDetailUrl.endsWith("/")
    ? absoluteDetailUrl.slice(0, -1)
    : absoluteDetailUrl;
};

export const buildTourProductNodeId = (tourId: string): string =>
  `${SITE_URL}/#p${tourId}`;

export const buildAoaBookingUrlFromCanonical = (
  canonicalUrl: string
): string =>
  canonicalUrl.endsWith("/book") ? canonicalUrl : `${canonicalUrl}/book`;

export const resolveOfferUrl = ({
  canonicalUrl,
  partnerBookingUrl,
}: {
  canonicalUrl: string;
  partnerBookingUrl?: string;
}): string => {
  if (isAoaBookingOfferEnabled() && hasAoaBookingRoute(canonicalUrl)) {
    return buildAoaBookingUrlFromCanonical(canonicalUrl);
  }

  return partnerBookingUrl ? toAbsoluteUrl(partnerBookingUrl) : canonicalUrl;
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
  const webPageImage = image ? cleanImageUrls([image], 1)[0] : undefined;
  const imageId = webPageImage ? `${url}#primaryimage` : undefined;
  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: sanitizeSchemaName(name),
    description,
    isPartOf: { "@id": SITE_WEBSITE_ID },
    publisher: { "@id": SITE_ORGANIZATION_ID },
    ...(mainEntityId
      ? {
          about: { "@id": mainEntityId },
          mainEntity: { "@id": mainEntityId },
        }
      : {}),
    ...(webPageImage
      ? {
          primaryImageOfPage: buildImageObject(webPageImage, imageId),
          image: webPageImage,
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
  productNodeId,
  bookingUrl,
  description,
  images,
  ratingsVisible = false,
}: {
  tour: Tour;
  detailUrl: string;
  productNodeId?: string;
  bookingUrl?: string;
  description?: string;
  images?: string[];
  ratingsVisible?: boolean;
}) => {
  const resolvedImages = filterHeroImages(
    images ?? [resolveTourHeroImage(tour)],
    "product"
  );
  const schemaImages = cleanImageUrls(resolvedImages);
  const canonicalProductUrl = resolveCanonicalProductUrl(detailUrl);
  const resolvedProductNodeId =
    productNodeId ?? buildTourProductNodeId(tour.id);
  const offerUrl = resolveOfferUrl({
    canonicalUrl: canonicalProductUrl,
    partnerBookingUrl: bookingUrl,
  });
  const ratingValue = tour.badges?.rating;
  const reviewCount = tour.badges?.reviewCount;
  const ratingsEnabled =
    process.env.ENABLE_RATINGS_SCHEMA === "true" || ratingsVisible;
  const safeSchemaEnabled = isTourSchemaSafeV1Enabled();
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
  const tourDuration = tour.badges?.duration?.trim() || undefined;

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
    "@id": resolvedProductNodeId,
    url: canonicalProductUrl,
    name: tour.title,
    description,
    ...(toSchemaImageValue(schemaImages)
      ? { image: toSchemaImageValue(schemaImages) }
      : {}),
    sku: tour.id,
    brand: { "@id": SITE_BRAND_ID },
    seller: { "@id": SITE_ORGANIZATION_ID },
    provider: { "@id": SITE_BRAND_ID },
    ...(safeSchemaEnabled && tourDuration ? { duration: tourDuration } : {}),
    ...(safeSchemaEnabled
      ? {
          areaServed: { "@id": `${canonicalProductUrl}#place` },
          isRelatedTo: { "@id": `${canonicalProductUrl}#trip` },
        }
      : {}),
    offers: offer,
    ...(aggregateRating ? { aggregateRating } : {}),
    priceSpecification: {
      "@type": "PriceSpecification",
      description: TOUR_PRICE_DESCRIPTION,
    },
    location: buildTourLocationStructuredData(tour, canonicalProductUrl),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${canonicalProductUrl}#webpage`,
    },
  };
};

export const buildTourTripStructuredData = ({
  tour,
  detailUrl,
  productNodeId,
  bookingUrl,
  description,
  images,
  ratingsVisible = false,
}: {
  tour: Tour;
  detailUrl: string;
  productNodeId?: string;
  bookingUrl?: string;
  description?: string;
  images?: string[];
  ratingsVisible?: boolean;
}) => {
  const resolvedImages = filterHeroImages(
    images ?? [resolveTourHeroImage(tour)],
    "product"
  );
  const schemaImages = cleanImageUrls(resolvedImages);
  const canonicalProductUrl = resolveCanonicalProductUrl(detailUrl);
  const resolvedProductNodeId =
    productNodeId ?? buildTourProductNodeId(tour.id);
  const offerUrl = resolveOfferUrl({
    canonicalUrl: canonicalProductUrl,
    partnerBookingUrl: bookingUrl,
  });
  const ratingValue = tour.badges?.rating;
  const reviewCount = tour.badges?.reviewCount;
  const ratingsEnabled =
    process.env.ENABLE_RATINGS_SCHEMA === "true" || ratingsVisible;
  const safeSchemaEnabled = isTourSchemaSafeV1Enabled();
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
  const tourDuration = tour.badges?.duration?.trim() || undefined;

  return {
    "@type": "TouristTrip",
    "@id": `${canonicalProductUrl}#touristtrip`,
    name: tour.title,
    description,
    ...(toSchemaImageValue(schemaImages)
      ? { image: toSchemaImageValue(schemaImages) }
      : {}),
    provider: { "@id": SITE_BRAND_ID },
    ...(safeSchemaEnabled && tourDuration ? { duration: tourDuration } : {}),
    ...(safeSchemaEnabled
      ? {
          areaServed: { "@id": `${canonicalProductUrl}#place` },
          isRelatedTo: { "@id": resolvedProductNodeId },
        }
      : {}),
    offers: {
      "@type": "Offer",
      url: offerUrl,
      availability: "https://schema.org/InStock",
      price: toOfferPrice(tour).toFixed(2),
      priceCurrency: toOfferCurrency(tour),
      priceValidUntil: getPriceValidUntil(),
    },
    ...(!safeSchemaEnabled && aggregateRating ? { aggregateRating } : {}),
    priceSpecification: {
      "@type": "PriceSpecification",
      description: TOUR_PRICE_DESCRIPTION,
    },
    location: buildTourLocationStructuredData(tour, canonicalProductUrl),
    mainEntityOfPage: { "@id": `${canonicalProductUrl}#webpage` },
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
