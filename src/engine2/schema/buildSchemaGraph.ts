import {
  SITE_BRAND_ID,
  buildBreadcrumbList,
  buildWebPageStructuredData,
  getSiteStructuredDataNodes,
} from "../../utils/structuredData";
import type { Engine2Tour } from "../data/loadEngine2";
import type { Engine2Seo } from "../seo/buildEngine2Seo";
import {
  DEFAULT_CURRENCY,
  DEFAULT_IMAGE_URL,
} from "../../constants/merchantDefaults";
import { applyPriceFloor, parsePrice } from "../../utils/merchantPricing";

type StructuredDataNode = Record<string, unknown>;

type DestinationMeta = {
  countryCode: string;
  countryName: string;
  stateName?: string;
  stateSlug?: string;
  cityUrl: string;
  toursUrl: string;
  breadcrumbs: { name: string; url: string }[];
};

const normalizeStringArray = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map(item => item.trim())
    .filter(Boolean);
};

const formatCityFromSlug = (slug: string) =>
  slug
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getDestinationMeta = (tour: Engine2Tour): DestinationMeta => {
  const countrySlug = (tour.sourceCountrySlug || "united-states").trim();

  if (countrySlug === "united-states") {
    const stateSlug = tour.geo.region.trim().toLowerCase().replace(/\s+/g, "-");
    return {
      countryCode: "US",
      countryName: "United States",
      stateName: tour.geo.region,
      stateSlug,
      cityUrl: `/destinations/united-states/${stateSlug}/${tour.sourceCitySlug}`,
      toursUrl: `/destinations/united-states/${stateSlug}/${tour.sourceCitySlug}/tours`,
      breadcrumbs: [
        { name: "Destinations", url: "/destinations" },
        { name: "United States", url: "/destinations/united-states" },
        {
          name: tour.geo.region,
          url: `/destinations/united-states/${stateSlug}`,
        },
        {
          name: formatCityFromSlug(tour.sourceCitySlug),
          url: `/destinations/united-states/${stateSlug}/${tour.sourceCitySlug}`,
        },
      ],
    };
  }

  const countryName = tour.geo.country;
  const cityUrl = `/destinations/${countrySlug}/${tour.sourceCitySlug}`;

  const countryCode =
    countrySlug === "canada"
      ? "CA"
      : countrySlug === "mexico"
        ? "MX"
        : countrySlug === "netherlands"
          ? "NL"
          : "US";

  return {
    countryCode,
    countryName,
    cityUrl,
    toursUrl: `${cityUrl}/tours`,
    breadcrumbs: [
      { name: "Destinations", url: "/destinations" },
      {
        name: countryName,
        url: `/destinations/${countrySlug}`,
      },
      {
        name: formatCityFromSlug(tour.sourceCitySlug),
        url: cityUrl,
      },
    ],
  };
};

export const buildSchemaGraph = (
  tour: Engine2Tour,
  seo: Engine2Seo
): StructuredDataNode[] => {
  const productId = `${seo.canonical}#product`;
  const tripId = `${seo.canonical}#trip`;
  const placeId = `${seo.canonical}#place`;
  const imageGallery = normalizeStringArray(tour.images.gallery);
  const effectiveHeroImage = tour.images.hero || DEFAULT_IMAGE_URL;
  const flooredPrice = applyPriceFloor(parsePrice(tour.pricing?.price ?? null));
  const offerCurrency = tour.pricing?.currency || DEFAULT_CURRENCY;
  const destinationMeta = getDestinationMeta(tour);

  return [
    ...getSiteStructuredDataNodes(),
    buildWebPageStructuredData({
      url: seo.canonical,
      name: seo.title,
      description: seo.description,
      image: effectiveHeroImage,
      mainEntityId: productId,
    }),
    {
      "@type": "Place",
      "@id": placeId,
      name: `${tour.geo.city}, ${tour.geo.region}`,
      geo:
        typeof tour.geo.lat === "number" && typeof tour.geo.lng === "number"
          ? {
              "@type": "GeoCoordinates",
              latitude: tour.geo.lat,
              longitude: tour.geo.lng,
            }
          : undefined,
      address: {
        "@type": "PostalAddress",
        addressLocality: tour.geo.city,
        addressRegion: tour.geo.region,
        addressCountry: destinationMeta.countryCode,
      },
    },
    {
      "@type": "Product",
      "@id": productId,
      name: tour.name,
      description: seo.description,
      image: [effectiveHeroImage, ...imageGallery],
      brand: { "@id": SITE_BRAND_ID },
      offers: {
        "@type": "Offer",
        url: seo.canonical,
        availability: "https://schema.org/InStock",
        price: flooredPrice.toFixed(2),
        priceCurrency: offerCurrency,
      },
      location: { "@id": placeId },
      provider: { "@id": SITE_BRAND_ID },
      mainEntityOfPage: { "@id": `${seo.canonical}#webpage` },
    },
    {
      "@type": "TouristTrip",
      "@id": tripId,
      name: tour.name,
      description: seo.description,
      itinerary: { "@id": placeId },
      provider: { "@id": SITE_BRAND_ID },
      touristType: "Adventure travelers",
      offers: {
        "@type": "Offer",
        url: seo.canonical,
        availability: "https://schema.org/InStock",
        price: flooredPrice.toFixed(2),
        priceCurrency: offerCurrency,
      },
      location: { "@id": placeId },
      mainEntityOfPage: { "@id": `${seo.canonical}#webpage` },
    },
    buildBreadcrumbList([
      ...destinationMeta.breadcrumbs,
      {
        name: "Tours",
        url: destinationMeta.toursUrl,
      },
      { name: tour.name, url: tour.seo.canonicalPath },
    ]),
  ];
};
