import { buildCanonicalUrl } from "../../utils/seo";
import {
  getSiteStructuredDataNodes,
  normalizeStructuredData,
  buildBreadcrumbList,
} from "../../utils/structuredData";
import type { Engine2Tour } from "../data/loadEngine2";

const excerpt = (value: string, max = 220) =>
  value.length <= max ? value : `${value.slice(0, max).trimEnd()}…`;

export const buildSchemaGraph = (tour: Engine2Tour) => {
  const canonicalUrl = buildCanonicalUrl(tour.seo.canonicalPath);
  const providerId = `${canonicalUrl}#provider`;
  const productId = `${canonicalUrl}#product`;
  const tripId = `${canonicalUrl}#trip`;
  const placeId = `${canonicalUrl}#place`;

  const nodes = [
    ...getSiteStructuredDataNodes(),
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
      description: tour.seo.description,
      image: [tour.images.hero, ...tour.images.gallery],
      brand: { "@type": "Brand", name: "All Outdoor Adventures" },
      offers: {
        "@type": "Offer",
        url: tour.booking.regularLink,
        availability: "https://schema.org/InStock",
      },
      provider: { "@id": providerId },
    },
    {
      "@type": "TouristTrip",
      "@id": tripId,
      name: tour.name,
      description: excerpt(tour.content.experienceText),
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

  return normalizeStructuredData({
    "@context": "https://schema.org",
    "@graph": nodes,
  });
};
