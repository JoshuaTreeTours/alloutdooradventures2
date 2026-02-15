import {
  getSiteStructuredDataNodes,
  buildBreadcrumbList,
  buildWebPageStructuredData,
} from "../../utils/structuredData";
import type { Engine2Tour } from "../data/loadEngine2";
import type { Engine2Seo } from "../seo/buildEngine2Seo";

type StructuredDataNode = Record<string, unknown>;

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

  return [
    ...getSiteStructuredDataNodes(),
    buildWebPageStructuredData({
      url: seo.canonical,
      name: seo.title,
      description: seo.description,
      image: seo.og.image ?? undefined,
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
      image: tour.images.hero ?? undefined,
      brand: { "@type": "Brand", name: "All Outdoor Adventures" },
      offers: {
        "@type": "Offer",
        url: tour.booking.bookingUrl,
        availability: "https://schema.org/InStock",
      },
      provider: { "@id": providerId },
    },
    {
      "@type": "TouristTrip",
      "@id": tripId,
      name: tour.name,
      description: seo.description,
      image: tour.images.hero ?? undefined,
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
