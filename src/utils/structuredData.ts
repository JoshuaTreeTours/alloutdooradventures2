import type { Tour } from "../data/tours.types";
import { filterHeroImages } from "./hero";
import { buildCanonicalUrl, buildImageUrl, SITE_URL } from "./seo";

type StructuredDataValue =
  | string
  | number
  | boolean
  | null
  | StructuredDataValue[]
  | { [key: string]: StructuredDataValue };

export const SITE_ORGANIZATION_ID = `${SITE_URL}/#org`;
export const SITE_AGENCY_ID = `${SITE_URL}/#agency`;

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
  const logoUrl = buildImageUrl("/images/Logo.png");

  return [
    {
      "@type": "Organization",
      "@id": SITE_ORGANIZATION_ID,
      name: "Outdoor Adventures",
      url: SITE_URL,
      logo: logoUrl,
      telephone: "+1-855-314-8687",
      sameAs: [
        "https://www.facebook.com/alloutdooradventuresonline/",
        "https://www.linkedin.com/company/all-outdoor-adventures/",
      ],
    },
    {
      "@type": "TravelAgency",
      "@id": SITE_AGENCY_ID,
      name: "Outdoor Adventures",
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
    },
  ];
};

export const sanitizeSchemaName = (value: string) =>
  value.replace(/All Outdoor Adventures/gi, "Outdoor Adventures").trim();

const buildImageObject = (url: string, id?: string) => ({
  "@type": "ImageObject",
  ...(id ? { "@id": id } : {}),
  url,
});

export const buildWebPageStructuredData = ({
  url,
  name,
  description,
  image,
}: {
  url: string;
  name: string;
  description?: string;
  image?: string;
}) => {
  const imageId = image ? `${url}#primaryimage` : undefined;
  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: sanitizeSchemaName(name),
    description,
    isPartOf: { "@id": SITE_AGENCY_ID },
    publisher: { "@id": SITE_ORGANIZATION_ID },
    ...(image
      ? {
          primaryImageOfPage: buildImageObject(image, imageId),
          image,
        }
      : {}),
  };
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
  images,
}: {
  tour: Tour;
  detailUrl: string;
  bookingUrl: string;
  description?: string;
  images?: string[];
}) => {
  const resolvedImages = filterHeroImages(
    images ?? [tour.heroImage, ...(tour.galleryImages ?? [])],
    "product",
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
    ...(resolvedImages.length ? { image: resolvedImages } : {}),
    sku: tour.id,
    brand: { "@id": SITE_ORGANIZATION_ID },
    provider: { "@id": SITE_AGENCY_ID },
    offers: offer,
    mainEntityOfPage: { "@id": `${detailUrl}#webpage` },
  };
};

export const buildTourTripStructuredData = ({
  tour,
  detailUrl,
  bookingUrl,
  description,
  images,
}: {
  tour: Tour;
  detailUrl: string;
  bookingUrl: string;
  description?: string;
  images?: string[];
}) => {
  const resolvedImages = filterHeroImages(
    images ?? [tour.heroImage, ...(tour.galleryImages ?? [])],
    "product",
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
    ...(resolvedImages.length ? { image: resolvedImages } : {}),
    provider: { "@id": SITE_AGENCY_ID },
    offers: offer,
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
  provider: { "@id": SITE_AGENCY_ID },
  target: {
    "@type": "EntryPoint",
    urlTemplate: bookingUrl,
  },
  object: {
    "@id": `${tourDetailUrl}#product`,
  },
});
