import type { Tour } from "../data/tours.types";
import { buildCanonicalUrl, buildImageUrl, SITE_URL } from "./seo";

type StructuredDataValue =
  | string
  | number
  | boolean
  | null
  | StructuredDataValue[]
  | { [key: string]: StructuredDataValue };

export const SITE_ORGANIZATION_ID = `${SITE_URL}/#org`;
export const SITE_BUSINESS_ID = `${SITE_URL}/#business`;

const URL_FIELDS = new Set(["url", "item", "logo", "image"]);
const ID_FIELDS = new Set(["@id"]);

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
      .map((item) => stripEmptyValues(item))
      .filter((item) => item !== null);
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
  key?: string,
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
    return value.map((item) => ensureAbsoluteUrls(item, key));
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        ensureAbsoluteUrls(entryValue, entryKey),
      ]),
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
    return value["@graph"].some((node) => {
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
  value: StructuredDataValue,
): StructuredDataValue | null => {
  const stripped = stripEmptyValues(value);
  if (!stripped) {
    return null;
  }

  const normalized = ensureAbsoluteUrls(stripped);

  return hasType(normalized) ? normalized : null;
};

export const getSiteStructuredDataNodes = () => {
  const address = {
    "@type": "PostalAddress",
    addressLocality: "Las Vegas",
    addressRegion: "NV",
    addressCountry: "US",
  };

  const areaServed = [
    "Worldwide",
    {
      "@type": "Country",
      name: "United States",
    },
  ];

  const logoUrl = buildImageUrl("/images/Logo.png");
  const heroUrl = buildImageUrl("/hero.jpg");

  return [
    {
      "@type": "Organization",
      "@id": SITE_ORGANIZATION_ID,
      name: "Outdoor Adventures",
      url: SITE_URL,
      logo: logoUrl,
      image: heroUrl,
      telephone: "+18553148687",
      address,
      areaServed,
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: "+18553148687",
        },
      ],
    },
    {
      "@type": ["LocalBusiness", "TravelAgency"],
      "@id": SITE_BUSINESS_ID,
      name: "Outdoor Adventures",
      url: SITE_URL,
      logo: logoUrl,
      image: [heroUrl],
      telephone: "+18553148687",
      address,
      areaServed,
      parentOrganization: {
        "@id": SITE_ORGANIZATION_ID,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Outdoor Adventures",
      publisher: {
        "@id": SITE_ORGANIZATION_ID,
      },
      about: {
        "@id": SITE_BUSINESS_ID,
      },
    },
  ];
};

export const buildBreadcrumbList = (
  items: { name: string; url: string }[],
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
  items: { name: string; url: string; image?: string | string[] }[],
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
}: {
  tour: Tour;
  detailUrl: string;
  bookingUrl: string;
  description?: string;
}) => {
  const images = Array.from(
    new Set([tour.heroImage, ...(tour.galleryImages ?? [])].filter(Boolean)),
  );
  const offer: Record<string, StructuredDataValue> = {
    "@type": "Offer",
    url: bookingUrl,
  };

  if (
    tour.startingPrice !== undefined &&
    tour.startingPrice !== null &&
    tour.currency
  ) {
    offer.price = String(tour.startingPrice);
    offer.priceCurrency = tour.currency;
  }

  return {
    "@type": "Product",
    "@id": `${detailUrl}#product`,
    name: tour.title,
    description,
    image: images.length ? images : undefined,
    brand: { "@id": SITE_ORGANIZATION_ID },
    seller: { "@id": SITE_BUSINESS_ID },
    offers: offer,
    mainEntityOfPage: { "@id": `${detailUrl}#webpage` },
  };
};

export const buildTourTripStructuredData = ({
  tour,
  detailUrl,
  bookingUrl,
  description,
}: {
  tour: Tour;
  detailUrl: string;
  bookingUrl: string;
  description?: string;
}) => {
  const images = Array.from(
    new Set([tour.heroImage, ...(tour.galleryImages ?? [])].filter(Boolean)),
  );
  const offer: Record<string, StructuredDataValue> = {
    "@type": "Offer",
    url: bookingUrl,
  };

  if (
    tour.startingPrice !== undefined &&
    tour.startingPrice !== null &&
    tour.currency
  ) {
    offer.price = String(tour.startingPrice);
    offer.priceCurrency = tour.currency;
  }

  return {
    "@type": "TouristTrip",
    "@id": `${detailUrl}#trip`,
    name: tour.title,
    description,
    image: images.length ? images : undefined,
    provider: { "@id": SITE_BUSINESS_ID },
    offers: offer,
    mainEntityOfPage: { "@id": `${detailUrl}#webpage` },
  };
};
