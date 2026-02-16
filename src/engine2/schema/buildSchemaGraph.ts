import {
  getSiteStructuredDataNodes,
  buildBreadcrumbList,
  buildWebPageStructuredData,
} from "../../utils/structuredData";
import type { Engine2Tour } from "../data/loadEngine2";
import type { Engine2Seo } from "../seo/buildEngine2Seo";
import {
  DEFAULT_CURRENCY,
  DEFAULT_IMAGE_URL,
} from "../../constants/merchantDefaults";
import { applyPriceFloor, parsePrice } from "../../utils/merchantPricing";

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
  const effectiveHeroImage = tour.images.hero || DEFAULT_IMAGE_URL;
  const flooredPrice = applyPriceFloor(parsePrice(tour.pricing?.price ?? null));
  const offerCurrency = tour.pricing?.currency || DEFAULT_CURRENCY;
  const offer: Record<string, unknown> = {
    "@type": "Offer",
    url: tour.booking.bookingUrl,
    availability: "https://schema.org/InStock",
    price: flooredPrice.toFixed(2),
    priceCurrency: offerCurrency,
  };

  return [
    ...getSiteStructuredDataNodes(),
    buildWebPageStructuredData({
      url: seo.canonical,
      name: seo.title,
      description: seo.description,
      image: effectiveHeroImage,
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
      image: [effectiveHeroImage, ...imageGallery],
      brand: { "@type": "Brand", name: "All Outdoor Adventures" },
      offers: offer,
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
      offers: offer,
    },
    buildBreadcrumbList([
      { name: "Destinations", url: "/destinations" },
      { name: tour.geo.region, url: "/destinations/california" },
      {
        name: formatCityFromSlug(tour.sourceCitySlug),
        url: `/destinations/california/${tour.sourceCitySlug}`,
      },
      {
        name: "Tours",
        url: `/destinations/california/${tour.sourceCitySlug}/tours`,
      },
      { name: tour.name, url: tour.seo.canonicalPath },
    ]),
  ];
};
