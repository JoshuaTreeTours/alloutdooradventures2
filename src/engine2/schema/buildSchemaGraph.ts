import {
  getSiteStructuredDataNodes,
  buildBreadcrumbList,
  buildWebPageStructuredData,
  SITE_ORGANIZATION_ID,
  SITE_BRAND_ID,
  getPriceValidUntil,
  resolveCanonicalProductUrl,
  resolveOfferUrl,
} from "../../utils/structuredData";
import type { Engine2Tour } from "../data/loadEngine2";
import type { Engine2Seo } from "../seo/buildEngine2Seo";
import {
  DEFAULT_CURRENCY,
  DEFAULT_IMAGE_URL,
} from "../../constants/merchantDefaults";
import { applyPriceFloor, parsePrice } from "../../utils/merchantPricing";
import type { AOAEnrichedContent } from "../../utils/fh/transformToAOAContent";

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

const formatNameFromSlug = (slug?: string) =>
  slug
    ? slug
        .split("-")
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : "";

const getDestinationMeta = (tour: Engine2Tour) => {
  if (tour.sourceCountrySlug === "canada") {
    return {
      countryCode: "CA",
      countryName: "Canada",
      countryUrl: "/destinations/world/canada",
      cityUrl: `/destinations/world/canada/${tour.sourceProvinceSlug}/${tour.sourceCitySlug}`,
      toursUrl: `/destinations/world/canada/${tour.sourceProvinceSlug}/${tour.sourceCitySlug}`,
    };
  }

  if (tour.sourceCountrySlug === "mexico") {
    return {
      countryCode: "MX",
      countryName: "Mexico",
      countryUrl: "/destinations/mexico",
      cityUrl: `/destinations/mexico/${tour.sourceCitySlug}`,
      toursUrl: `/destinations/mexico/${tour.sourceCitySlug}/tours`,
    };
  }

  if (tour.sourceCountrySlug && tour.sourceCountrySlug !== "united-states") {
    return {
      countryCode:
        (tour.geo.country || "").toLowerCase() === "netherlands" ? "NL" : "US",
      countryName: tour.geo.country,
      countryUrl: `/destinations/${tour.sourceCountrySlug}`,
      cityUrl: `/destinations/${tour.sourceCountrySlug}/${tour.sourceCitySlug}`,
      toursUrl: `/destinations/${tour.sourceCountrySlug}/${tour.sourceCitySlug}/tours`,
    };
  }

  if (tour.seo.canonicalPath.startsWith("/destinations/united-states/")) {
    const stateSlug = tour.seo.canonicalPath.split("/")[3] || "";
    const citySlug = tour.sourceCitySlug;
    return {
      countryCode: "US",
      countryName: "United States",
      stateName: formatNameFromSlug(stateSlug),
      stateUrl: `/destinations/united-states/${stateSlug}`,
      cityName: formatCityFromSlug(citySlug),
      cityUrl: `/destinations/united-states/${stateSlug}/${citySlug}`,
      toursUrl: `/destinations/united-states/${stateSlug}/${citySlug}/tours`,
    };
  }

  const stateSlug = tour.seo.canonicalPath.split("/")[2] || "";
  const citySlug = tour.sourceCitySlug;
  return {
    countryCode: "US",
    countryName: "United States",
    stateName: formatNameFromSlug(stateSlug),
    stateUrl: `/destinations/united-states/${stateSlug}`,
    cityName: formatCityFromSlug(citySlug),
    cityUrl: `/destinations/united-states/${stateSlug}/${citySlug}`,
    toursUrl: `/destinations/united-states/${stateSlug}/${citySlug}/tours`,
  };
};

export const buildSchemaGraph = (
  tour: Engine2Tour,
  seo: Engine2Seo,
  pilotContent?: AOAEnrichedContent | null,
  isPalmSprings = false,
  isPspBookRewriteEnabled = false
): StructuredDataNode[] => {
  const productId = `${seo.canonical}#product`;
  const tripId = `${seo.canonical}#trip`;
  const placeId = `${seo.canonical}#place`;
  const imageGallery = normalizeStringArray(tour.images.gallery);
  const effectiveHeroImage = tour.images.hero || DEFAULT_IMAGE_URL;
  const flooredPrice = applyPriceFloor(parsePrice(tour.pricing?.price ?? null));
  const offerCurrency = tour.pricing?.currency || DEFAULT_CURRENCY;
  const destinationMeta = getDestinationMeta(tour);
  const canonicalProductUrl = resolveCanonicalProductUrl(seo.canonical);
  const offer: Record<string, unknown> = {
    "@type": "Offer",
    url: resolveOfferUrl({
      canonicalUrl: canonicalProductUrl,
      partnerBookingUrl: tour.bookingUrl ?? tour.booking.bookingUrl,
    }),
    availability: "https://schema.org/InStock",
    price: flooredPrice.toFixed(2),
    priceCurrency: offerCurrency,
    priceValidUntil: getPriceValidUntil(),
  };

  const usePspOverride = isPalmSprings && isPspBookRewriteEnabled;

  return [
    ...getSiteStructuredDataNodes(),
    buildWebPageStructuredData({
      url: seo.canonical,
      name: seo.title,
      description: seo.description,
      image: effectiveHeroImage,
    }),
    {
      "@type": "Place",
      "@id": placeId,
      name:
        usePspOverride && pilotContent?.quickFacts?.location
          ? pilotContent.quickFacts.location
          : `${tour.geo.city}, ${tour.geo.region}`,
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
      url: canonicalProductUrl,
      name: tour.name,
      description: usePspOverride
        ? (pilotContent?.schemaDescription ?? seo.description)
        : seo.description,
      image: [effectiveHeroImage, ...imageGallery],
      brand: { "@id": SITE_BRAND_ID },
      offers: offer,
      provider: { "@id": SITE_ORGANIZATION_ID },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${seo.canonical}#webpage`,
      },
    },
    {
      "@type": "TouristTrip",
      "@id": tripId,
      name: tour.name,
      description: usePspOverride
        ? (pilotContent?.schemaDescription ?? seo.description)
        : seo.description,
      itinerary:
        usePspOverride && pilotContent?.highlights?.length
          ? pilotContent.highlights.map(step => ({
              "@type": "TouristAttraction",
              name: step,
            }))
          : { "@id": placeId },
      provider: { "@id": SITE_ORGANIZATION_ID },
      touristType: "Adventure travelers",
      offers: offer,
    },
    buildBreadcrumbList([
      { name: "Destinations", url: "/destinations" },
      {
        name: destinationMeta.countryName,
        url:
          "countryUrl" in destinationMeta
            ? destinationMeta.countryUrl
            : "/destinations/united-states",
      },
      ...(destinationMeta.stateName
        ? [{ name: destinationMeta.stateName, url: destinationMeta.stateUrl }]
        : []),
      {
        name:
          "cityName" in destinationMeta
            ? destinationMeta.cityName
            : formatCityFromSlug(tour.sourceCitySlug),
        url: destinationMeta.cityUrl,
      },
      {
        name: "Tours",
        url: destinationMeta.toursUrl,
      },
      { name: tour.name, url: tour.seo.canonicalPath },
    ]),
  ];
};
