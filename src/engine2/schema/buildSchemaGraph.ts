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
import { buildTourItinerary } from "../../utils/buildTourItinerary";

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

const buildViatorItinerary = (tour: Engine2Tour) => {
  if (!tour.content.itinerary?.length) {
    return null;
  }

  const itemListElement = tour.content.itinerary
    .map((step, index) => {
      const nameParts = [
        step.title,
        step.duration ? `(${step.duration})` : null,
      ]
        .filter(Boolean)
        .join(" ");
      const description =
        typeof step.description === "string" && step.description.trim().length
          ? step.description
          : undefined;

      if (!nameParts) {
        return null;
      }

      return {
        "@type": "ListItem",
        position: index + 1,
        name: nameParts,
        ...(description ? { description } : {}),
      };
    })
    .filter((step): step is Record<string, unknown> => Boolean(step));

  if (!itemListElement.length) {
    return null;
  }

  return {
    "@type": "ItemList",
    itemListElement,
  };
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
  const isRental = tour.type === "rental";
  const productId = `${seo.canonical}#product`;
  const tripId = `${seo.canonical}#trip`;
  const imageGallery = normalizeStringArray(tour.images.gallery);
  const isViatorTour = tour.bookingProvider === "viator";
  const effectiveHeroImage = isViatorTour
    ? (tour.images.hero ?? undefined)
    : tour.images.hero || DEFAULT_IMAGE_URL;
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

  const itineraryV1Enabled =
    process.env.TOUR_ITINERARY_V1 === "true" || tour.id === "34849";
  const tourItinerary = itineraryV1Enabled
    ? buildTourItinerary({
        tourTitle: tour.name,
        cityName: tour.geo.city,
        placeName: tour.geo.city,
        departureLocationName:
          rewriteV3Content?.meetingPoint?.name ??
          rewriteV3Content?.meetingPoint?.rawText ??
          null,
        departureAddress: rewriteV3Content?.meetingPoint?.addressLine1 ?? null,
        duration: rewriteV3Content?.durationLabel ?? tourDuration ?? null,
        highlights: rewriteV3Content?.highlights?.length
          ? rewriteV3Content.highlights
          : tour.content.highlights,
        experienceText:
          rewriteV3Content?.whatYoullExperience?.join(" ") ||
          tour.content.experienceText,
      })
    : null;
  const viatorItinerary = isViatorTour ? buildViatorItinerary(tour) : null;

  const faqSource =
    overrideEnabled && overrideFaqs?.length
      ? overrideFaqs
      : tour.content.faqs?.length
        ? tour.content.faqs
        : null;

  const faqPageNode = faqSource?.length
    ? {
        "@type": "FAQPage",
        "@id": `${seo.canonical}#faqpage`,
        mainEntityOfPage: seo.canonical,
        mainEntity: faqSource.map(item => ({
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
          category: isRental
            ? "EquipmentRental"
            : rewriteV3Content?.category?.primary,
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
          itinerary: tourItinerary,
          suppressFallbackItinerary: isViatorTour,
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

  if (isViatorTour) {
    const ratingValue =
      typeof tour.viatorRatingValue === "number" && tour.viatorRatingValue > 0
        ? tour.viatorRatingValue
        : null;
    const reviewCount =
      typeof tour.viatorReviewCount === "number" && tour.viatorReviewCount > 0
        ? tour.viatorReviewCount
        : null;
    const aggregateRating =
      ratingValue && reviewCount
        ? {
            "@type": "AggregateRating",
            ratingValue,
            reviewCount,
          }
        : null;

    for (const node of tourNodes) {
      if (node["@type"] === "Product") {
        if (aggregateRating) {
          node.aggregateRating = aggregateRating;
        }
      }

      if (node["@type"] === "TouristTrip") {
        if (viatorItinerary) {
          node.itinerary = viatorItinerary;
        } else {
          delete node.itinerary;
        }

        if (aggregateRating) {
          node.aggregateRating = aggregateRating;
        }
      }
    }
  }

  if (isRental) {
    for (let index = tourNodes.length - 1; index >= 0; index -= 1) {
      if (tourNodes[index]["@type"] === "TouristTrip") {
        tourNodes.splice(index, 1);
      }
    }
  }

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
