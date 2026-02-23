import {
  getSiteStructuredDataNodes,
  buildWebPageStructuredData,
  SITE_ORGANIZATION_ID,
  SITE_BRAND_ID,
  resolveCanonicalProductUrl,
  resolveOfferUrl,
} from "../../utils/structuredData";
import {
  buildTourBreadcrumbNode,
  buildTourOfferNode,
  resolveTourDurationISO,
} from "../../schema/buildTourSchemaGraph";
import type { Engine2Tour } from "../data/loadEngine2";
import type { Engine2Seo } from "../seo/buildEngine2Seo";
import {
  DEFAULT_CURRENCY,
  DEFAULT_IMAGE_URL,
} from "../../constants/merchantDefaults";
import { applyPriceFloor, parsePrice } from "../../utils/merchantPricing";
import type { AOAEnrichedTourContent } from "../../utils/fh/transformFareHarborToAOAContent";
import type { TourRewriteV3_1 } from "../../utils/fh/transformToAOAContent";

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

const isTourSchemaSafeV1Enabled = () =>
  process.env.NEXT_PUBLIC_SCHEMA_TOUR_SAFE_V1 === "true";

const getDestinationMeta = (tour: Engine2Tour) => {
  if (tour.sourceCountrySlug === "canada") {
    return { countryCode: "CA" };
  }

  if (tour.sourceCountrySlug === "mexico") {
    return { countryCode: "MX" };
  }

  if (tour.sourceCountrySlug && tour.sourceCountrySlug !== "united-states") {
    return {
      countryCode:
        (tour.geo.country || "").toLowerCase() === "netherlands" ? "NL" : "US",
    };
  }

  return { countryCode: "US" };
};

export const buildSchemaGraph = (
  tour: Engine2Tour,
  seo: Engine2Seo,
  pilotContent?: AOAEnrichedTourContent | null,
  isPalmSprings = false,
  overrideDescription?: string,
  overrideFaqs?: Array<{ question: string; answer: string }>,
  overrideEnabled = false,
  rewriteV3Content?: TourRewriteV3_1
): StructuredDataNode[] => {
  const productId = `${seo.canonical}#product`;
  const tripId = `${seo.canonical}#trip`;
  const placeId = `${seo.canonical}#place`;
  const imageGallery = normalizeStringArray(tour.images.gallery);
  const effectiveHeroImage = tour.images.hero || DEFAULT_IMAGE_URL;
  const fallbackPrice = applyPriceFloor(
    parsePrice(tour.pricing?.price ?? null)
  );
  const schemaPrice = rewriteV3Content?.schemaPrice ?? fallbackPrice;
  const offerCurrency = tour.pricing?.currency || DEFAULT_CURRENCY;
  const destinationMeta = getDestinationMeta(tour);
  const canonicalProductUrl = resolveCanonicalProductUrl(seo.canonical);
  const offerUrl = resolveOfferUrl({
    canonicalUrl: canonicalProductUrl,
    partnerBookingUrl: tour.bookingUrl ?? tour.booking.bookingUrl,
  });
  const offer = buildTourOfferNode({
    offerUrl,
    currency: offerCurrency,
    fallbackPrice: schemaPrice,
    rewrite: rewriteV3Content,
  });
  const safeSchemaEnabled = isTourSchemaSafeV1Enabled();
  const tourDuration = resolveTourDurationISO(rewriteV3Content);

  const faqPageNode =
    overrideEnabled && overrideFaqs?.length
      ? {
          "@type": "FAQPage",
          "@id": `${seo.canonical}#faqpage`,
          mainEntityOfPage: seo.canonical,
          mainEntity: overrideFaqs.map(item => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

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
        isPalmSprings && pilotContent?.quickFacts?.startLocationArea
          ? pilotContent.quickFacts.startLocationArea
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
      description: isPalmSprings
        ? (overrideDescription ??
          pilotContent?.whatYoullExperience ??
          seo.description)
        : seo.description,
      image: [effectiveHeroImage, ...imageGallery],
      category: rewriteV3Content?.category?.primary,
      brand: { "@id": SITE_BRAND_ID },
      offers: offer,
      provider: { "@id": SITE_ORGANIZATION_ID },
      ...(safeSchemaEnabled && tourDuration ? { duration: tourDuration } : {}),
      ...(safeSchemaEnabled
        ? {
            areaServed: { "@id": placeId },
            isRelatedTo: { "@id": tripId },
          }
        : {}),
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${seo.canonical}#webpage`,
      },
    },
    {
      "@type": "TouristTrip",
      "@id": tripId,
      name: tour.name,
      description: isPalmSprings
        ? (overrideDescription ??
          pilotContent?.whatYoullExperience ??
          seo.description)
        : seo.description,
      itinerary:
        isPalmSprings && pilotContent?.itineraryOutline?.length
          ? pilotContent.itineraryOutline.map(step => ({
              "@type": "TouristAttraction",
              name: step,
            }))
          : { "@id": placeId },
      provider: { "@id": SITE_ORGANIZATION_ID },
      touristType: "Adventure travelers",
      departureLocation: rewriteV3Content?.meetingPoint
        ? {
            "@type": "Place",
            name:
              rewriteV3Content.meetingPoint.name ??
              rewriteV3Content.meetingPoint.rawText,
            address: {
              "@type": "PostalAddress",
              streetAddress: rewriteV3Content.meetingPoint.addressLine1,
              addressLocality: rewriteV3Content.meetingPoint.city,
              addressRegion: rewriteV3Content.meetingPoint.region,
              postalCode: rewriteV3Content.meetingPoint.postalCode,
              addressCountry: rewriteV3Content.meetingPoint.country ?? "US",
            },
          }
        : undefined,
      offers: offer,
      ...(tourDuration ? { duration: tourDuration } : {}),
      ...(safeSchemaEnabled
        ? {
            areaServed: { "@id": placeId },
            isRelatedTo: { "@id": productId },
          }
        : {}),
    },
    ...(faqPageNode ? [faqPageNode] : []),
    buildTourBreadcrumbNode({
      canonicalPath: rewriteV3Content?.canonicalPath ?? tour.seo.canonicalPath,
      tourName: tour.name,
    }),
  ];
};
