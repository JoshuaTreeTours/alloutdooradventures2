import {
  getSiteStructuredDataNodes,
  buildWebPageStructuredData,
  SITE_ORGANIZATION_ID,
  SITE_BRAND_ID,
  SITE_WEBSITE_ID,
  resolveCanonicalProductUrl,
  resolveOfferUrl,
} from "../../utils/structuredData";
import {
  buildTourSchemaGraph,
  buildTourBreadcrumbNode,
  ENABLE_TOUR_SCHEMA_V1,
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

  const tourNodes = ENABLE_TOUR_SCHEMA_V1
    ? (buildTourSchemaGraph({
        url: seo.canonical,
        pageName: seo.title,
        pageDescription: seo.description,
        heroImage: effectiveHeroImage,
        derivedImages: imageGallery,
        place: {
          city: tour.geo.city,
          region: tour.geo.region,
          countryCode: destinationMeta.countryCode,
          lat: tour.geo.lat,
          lng: tour.geo.lng,
        },
        product: {
          id: productId,
          name: tour.name,
          description: isPalmSprings
            ? (overrideDescription ??
              pilotContent?.whatYoullExperience ??
              seo.description)
            : seo.description,
          category: rewriteV3Content?.category?.primary,
        },
        trip: {
          id: tripId,
          name: tour.name,
          description: isPalmSprings
            ? (overrideDescription ??
              pilotContent?.whatYoullExperience ??
              seo.description)
            : seo.description,
          duration: tourDuration,
          touristType: "Adventure travelers",
          departureLocation: rewriteV3Content?.meetingPoint
            ? {
                name:
                  rewriteV3Content.meetingPoint.name ??
                  rewriteV3Content.meetingPoint.rawText,
                streetAddress: rewriteV3Content.meetingPoint.addressLine1,
                addressLocality: rewriteV3Content.meetingPoint.city,
                addressRegion: rewriteV3Content.meetingPoint.region,
                postalCode: rewriteV3Content.meetingPoint.postalCode,
                addressCountry: rewriteV3Content.meetingPoint.country ?? "US",
              }
            : null,
        },
        offers: {
          url: offerUrl,
          lowPrice: rewriteV3Content?.pricing?.low,
          highPrice: rewriteV3Content?.pricing?.high,
          price: schemaPrice,
          priceCurrency: offerCurrency,
          offerCount:
            typeof rewriteV3Content?.pricing?.low === "number" &&
            typeof rewriteV3Content?.pricing?.high === "number"
              ? 2
              : null,
          availability: "https://schema.org/InStock",
        },
        brandOrgIds: {
          orgId: SITE_ORGANIZATION_ID,
          brandId: SITE_BRAND_ID,
          websiteId: SITE_WEBSITE_ID,
        },
      })["@graph"] as StructuredDataNode[])
    : [
        buildWebPageStructuredData({
          url: seo.canonical,
          name: seo.title,
          description: seo.description,
          image: effectiveHeroImage,
        }),
      ];

  return [
    ...getSiteStructuredDataNodes(),
    ...tourNodes,
    ...(faqPageNode ? [faqPageNode] : []),
    buildTourBreadcrumbNode({
      canonicalPath: rewriteV3Content?.canonicalPath ?? tour.seo.canonicalPath,
      tourName: tour.name,
    }),
  ];
};
