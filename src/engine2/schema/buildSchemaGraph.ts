import {
  getSiteStructuredDataNodes,
  buildBreadcrumbList,
  buildWebPageStructuredData,
} from "../../utils/structuredData";
import type { Engine2Tour } from "../data/loadEngine2";
import type { Engine2Seo } from "../seo/buildEngine2Seo";
import { buildFareHarborUrl, normalizeFareHarborUrl } from "../utils/buildFareHarborUrl";

type StructuredDataNode = Record<string, unknown>;

const normalizeStringArray = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map(item => item.trim())
    .filter(Boolean);
};

export const buildSchemaGraph = (
  tour: Engine2Tour,
  seo: Engine2Seo
): StructuredDataNode[] => {
  const providerId = `${seo.canonical}#provider`;
  const productId = `${seo.canonical}#product`;
  const tripId = `${seo.canonical}#trip`;
  const placeId = `${seo.canonical}#place`;
  const imageGallery = normalizeStringArray(tour.images.gallery);

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
      offers: {
        "@type": "Offer",
        url: tour.booking.fareharbor
          ? buildFareHarborUrl({
              company: tour.booking.fareharbor.shortname,
              itemId: tour.booking.fareharbor.itemId,
              calendarPath: tour.booking.bookingUrl,
            })
          : normalizeFareHarborUrl(tour.booking.bookingUrl),
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
        name: tour.geo.city,
        url: "/destinations/states/california/cities/palm-springs",
      },
      { name: "Tours", url: "/destinations/california/palm-springs/tours" },
      { name: tour.name, url: tour.seo.canonicalPath },
    ]),
  ];
};
