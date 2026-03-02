import {
  buildBreadcrumbList,
  getPriceValidUntil,
} from "../utils/structuredData";
import { cleanImageUrls, toSchemaImageValue } from "../utils/cleanImageUrls";
import { resolveUsState } from "../utils/geo/usStates";
import type { TourRewriteV3_1 } from "../utils/fh/transformToAOAContent";

export const ENABLE_TOUR_SCHEMA_V1 = true;


type SchemaOffer = Record<string, unknown>;

const toSlugLabel = (value: string) =>
  value
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const resolveTourDurationISO = (
  rewrite?: TourRewriteV3_1
): string | undefined => {
  if (rewrite?.durationISO) {
    return rewrite.durationISO;
  }

  if (rewrite?.durationMinutes && rewrite.durationMinutes > 0) {
    const hours = Math.floor(rewrite.durationMinutes / 60);
    const minutes = rewrite.durationMinutes % 60;
    if (hours && minutes) {
      return `PT${hours}H${minutes}M`;
    }
    if (hours) {
      return `PT${hours}H`;
    }
    return `PT${minutes}M`;
  }

  return undefined;
};

export const buildTourOfferNode = ({
  offerUrl,
  currency,
  fallbackPrice,
  rewrite,
}: {
  offerUrl: string;
  currency: string;
  fallbackPrice: number;
  rewrite?: TourRewriteV3_1;
}): SchemaOffer => {
  const schemaCurrency =
    rewrite?.pricing?.currency ?? rewrite?.priceCurrency ?? currency;
  const pricingLow = rewrite?.pricing?.low;
  const pricingHigh = rewrite?.pricing?.high;

  if (typeof pricingLow === "number" && typeof pricingHigh === "number") {
    return {
      "@type": "AggregateOffer",
      url: offerUrl,
      availability: "https://schema.org/InStock",
      lowPrice: pricingLow.toFixed(2),
      highPrice: pricingHigh.toFixed(2),
      priceCurrency: schemaCurrency,
      offerCount: 2,
    };
  }

  const singlePrice =
    typeof rewrite?.schemaPrice === "number"
      ? rewrite.schemaPrice
      : typeof pricingHigh === "number"
        ? pricingHigh
        : fallbackPrice;

  return {
    "@type": "Offer",
    url: offerUrl,
    availability: "https://schema.org/InStock",
    price: singlePrice.toFixed(2),
    priceCurrency: schemaCurrency,
    priceValidUntil: getPriceValidUntil(),
  };
};

export const buildTourBreadcrumbNode = ({
  canonicalPath,
  tourName,
}: {
  canonicalPath: string;
  tourName: string;
}) => {
  if (!canonicalPath.startsWith("/destinations/")) {
    return buildBreadcrumbList([
      { name: "Tours", url: "/tours" },
      { name: tourName, url: canonicalPath },
    ]);
  }

  const segments = canonicalPath.split("/").filter(Boolean);
  const destinationsIndex = segments.indexOf("destinations");
  const toursIndex = segments.indexOf("tours");
  const pathSegments =
    destinationsIndex >= 0 && toursIndex > destinationsIndex
      ? segments.slice(destinationsIndex + 1, toursIndex)
      : [];

  const crumbs: Array<{ name: string; url: string }> = [
    { name: "Destinations", url: "/destinations" },
  ];

  pathSegments.forEach((segment, index) => {
    crumbs.push({
      name: toSlugLabel(segment),
      url: `/destinations/${pathSegments.slice(0, index + 1).join("/")}`,
    });
  });

  crumbs.push({
    name: "Tours",
    url: `/destinations/${pathSegments.join("/")}/tours`,
  });
  crumbs.push({ name: tourName, url: canonicalPath });

  return buildBreadcrumbList(crumbs);
};

export function buildTourSchemaGraph(args: {
  url: string;
  pageName: string;
  pageDescription: string;
  heroImage?: string | null;
  derivedImages?: string[] | null;
  place?: {
    city?: string | null;
    region?: string | null;
    regionCode?: string | null;
    countryCode?: string | null;
    lat?: number | null;
    lng?: number | null;
  };
  product: {
    id: string;
    name: string;
    description: string;
    category?: string | null;
  };
  trip: {
    id: string;
    name: string;
    description: string;
    duration?: string | null;
    departureLocation?: {
      name?: string | null;
      streetAddress?: string | null;
      addressLocality?: string | null;
      addressRegion?: string | null;
      postalCode?: string | null;
      addressCountry?: string | null;
    } | null;
    touristType?: string | null;
    itinerary?: Record<string, unknown> | null;
    suppressFallbackItinerary?: boolean;
  };
  offers: {
    url: string;
    lowPrice?: string | number | null;
    highPrice?: string | number | null;
    price?: string | number | null;
    priceCurrency: string;
    availability?: string | null;
    offerCount?: number | null;
  };
  brandOrgIds: {
    orgId: string;
    brandId: string;
    websiteId: string;
  };
}): any {
  const placeId = `${args.url}#place`;
  const imageList = cleanImageUrls([
    args.heroImage,
    ...(args.derivedImages ?? []),
  ]);
  const webHero = cleanImageUrls([args.heroImage, ...imageList], 1)[0];

  const hasGeo =
    typeof args.place?.lat === "number" && typeof args.place?.lng === "number";
  const normalizedUsState =
    args.place?.countryCode === "US" ? resolveUsState(args.place?.region) : null;
  const regionName = normalizedUsState?.name ?? args.place?.region ?? null;
  const regionValue = normalizedUsState?.code ?? regionName;

  const placeNode: Record<string, unknown> = {
    "@type": "Place",
    "@id": placeId,
    name: [args.place?.city, regionName].filter(Boolean).join(", "),
    address: {
      "@type": "PostalAddress",
      ...(args.place?.city ? { addressLocality: args.place.city } : {}),
      ...(regionValue ? { addressRegion: regionValue } : {}),
      ...(args.place?.countryCode
        ? { addressCountry: args.place.countryCode }
        : {}),
    },
    ...(normalizedUsState
      ? {
          containedInPlace: {
            "@type": "AdministrativeArea",
            name: normalizedUsState.name,
          },
        }
      : {}),
    ...(hasGeo
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: args.place?.lat,
            longitude: args.place?.lng,
          },
        }
      : {}),
  };

  const offerAvailability =
    args.offers.availability ?? "https://schema.org/InStock";
  const lowPrice =
    args.offers.lowPrice === null || args.offers.lowPrice === undefined
      ? null
      : Number(args.offers.lowPrice);
  const highPrice =
    args.offers.highPrice === null || args.offers.highPrice === undefined
      ? null
      : Number(args.offers.highPrice);

  const offerNode: Record<string, unknown> =
    Number.isFinite(lowPrice) && Number.isFinite(highPrice)
      ? {
          "@type": "AggregateOffer",
          url: args.offers.url,
          availability: offerAvailability,
          lowPrice: Number(lowPrice).toFixed(2),
          highPrice: Number(highPrice).toFixed(2),
          priceCurrency: args.offers.priceCurrency,
          ...(typeof args.offers.offerCount === "number"
            ? { offerCount: args.offers.offerCount }
            : {}),
        }
      : {
          "@type": "Offer",
          url: args.offers.url,
          availability: offerAvailability,
          ...(args.offers.price !== null && args.offers.price !== undefined
            ? { price: Number(args.offers.price).toFixed(2) }
            : {}),
          priceCurrency: args.offers.priceCurrency,
          priceValidUntil: getPriceValidUntil(),
        };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${args.url}#webpage`,
        url: args.url,
        name: args.pageName,
        description: args.pageDescription,
        isPartOf: { "@id": args.brandOrgIds.websiteId },
        publisher: { "@id": args.brandOrgIds.orgId },
        about: { "@id": args.product.id },
        mainEntity: { "@id": args.product.id },
        ...(webHero
          ? {
              primaryImageOfPage: {
                "@type": "ImageObject",
                "@id": `${args.url}#primaryimage`,
                url: webHero,
              },
              image: webHero,
            }
          : {}),
      },
      placeNode,
      {
        "@type": "Product",
        "@id": args.product.id,
        url: args.url,
        name: args.product.name,
        description: args.product.description,
        ...(toSchemaImageValue(imageList)
          ? { image: toSchemaImageValue(imageList) }
          : {}),
        ...(args.product.category ? { category: args.product.category } : {}),
        brand: { "@id": args.brandOrgIds.brandId },
        seller: { "@id": args.brandOrgIds.orgId },
        provider: { "@id": args.brandOrgIds.orgId },
        offers: offerNode,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${args.url}#webpage`,
        },
      },
      {
        "@type": "TouristTrip",
        "@id": args.trip.id,
        name: args.trip.name,
        description: args.trip.description,
        ...(toSchemaImageValue(imageList)
          ? { image: toSchemaImageValue(imageList) }
          : {}),
        provider: { "@id": args.brandOrgIds.orgId },
        touristDestination: { "@id": placeId },
        ...(!args.trip.suppressFallbackItinerary || args.trip.itinerary
          ? {
              itinerary:
                args.trip.itinerary ??
                {
                  "@type": "ItemList",
                  itemListElement: [
                    {
                      "@type": "ListItem",
                      position: 1,
                      item: { "@id": placeId },
                    },
                  ],
                },
            }
          : {}),
        ...(args.trip.touristType
          ? { touristType: args.trip.touristType }
          : {}),
        ...(args.trip.duration ? { duration: args.trip.duration } : {}),
        ...(args.trip.departureLocation
          ? {
              departureLocation: {
                "@type": "Place",
                ...(args.trip.departureLocation.name
                  ? { name: args.trip.departureLocation.name }
                  : {}),
                address: {
                  "@type": "PostalAddress",
                  ...(args.trip.departureLocation.streetAddress
                    ? {
                        streetAddress:
                          args.trip.departureLocation.streetAddress,
                      }
                    : {}),
                  ...(args.trip.departureLocation.addressLocality
                    ? {
                        addressLocality:
                          args.trip.departureLocation.addressLocality,
                      }
                    : {}),
                  ...(args.trip.departureLocation.addressRegion
                    ? {
                        addressRegion:
                          args.trip.departureLocation.addressRegion,
                      }
                    : {}),
                  ...(args.trip.departureLocation.postalCode
                    ? { postalCode: args.trip.departureLocation.postalCode }
                    : {}),
                  ...(args.trip.departureLocation.addressCountry
                    ? {
                        addressCountry:
                          args.trip.departureLocation.addressCountry,
                      }
                    : {}),
                },
              },
            }
          : {}),
        offers: offerNode,
      },
    ],
  };
}
