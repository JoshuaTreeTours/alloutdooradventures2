import {
  getSiteStructuredDataNodes,
  buildBreadcrumbList,
  buildWebPageStructuredData,
} from "../../utils/structuredData";
import type { Engine2Tour } from "../data/loadEngine2";
import type { Engine2Seo } from "../seo/buildEngine2Seo";
import { loadTourEnrichment } from "../../data/tourEnrichment";

type StructuredDataNode = Record<string, unknown>;

const tourEnrichment = loadTourEnrichment();

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

export const buildSchemaGraph = (
  tour: Engine2Tour,
  seo: Engine2Seo
): StructuredDataNode[] => {
  const providerId = `${seo.canonical}#provider`;
  const productId = `${seo.canonical}#product`;
  const tripId = `${seo.canonical}#trip`;
  const placeId = `${seo.canonical}#place`;
  const imageGallery = normalizeStringArray(tour.images.gallery);
  const enrichment = tourEnrichment[String(tour.id)] || {};

  return [
    ...getSiteStructuredDataNodes(),
    buildWebPageStructuredData({
      url: seo.canonical,
      name: seo.title,
      description: seo.description,
      image: seo.og.image,
    }),
    {
      "@type": "Organization",
      "@id": providerId,
      name: tour.provider.name,
    },
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
        addressCountry: "US",
      },
    },
    {
      "@type": "Product",
      "@id": productId,
      name: tour.name,
      description: seo.description,
      image: [tour.images.hero, ...imageGallery],
      brand: { "@type": "Brand", name: "All Outdoor Adventures" },
      ...(enrichment.ratingValue && enrichment.ratingCount
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: enrichment.ratingValue,
              reviewCount: enrichment.ratingCount,
            },
          }
        : {}),
      offers: {
        "@type": "Offer",
        url: tour.booking.bookingUrl,
        ...(enrichment.price ? { price: enrichment.price } : {}),
        ...(enrichment.currency ? { priceCurrency: enrichment.currency } : {}),
        availability: "https://schema.org/InStock",
      },
      provider: { "@id": providerId },
    },
    {
      "@type": "TouristTrip",
      "@id": tripId,
      name: tour.name,
      description: seo.description,
      itinerary: { "@id": placeId },
      provider: { "@id": providerId },
      touristType: "Adventure travelers",
    },
    buildBreadcrumbList([
      { name: "Destinations", url: "/destinations" },
      { name: tour.geo.region, url: "/destinations/states/california" },
      {
        name: formatCityFromSlug(tour.sourceCitySlug),
        url: `/destinations/states/california/cities/${tour.sourceCitySlug}`,
      },
      {
        name: "Tours",
        url: `/destinations/california/${tour.sourceCitySlug}/tours`,
      },
      { name: tour.name, url: tour.seo.canonicalPath },
    ]),
  ];
};
