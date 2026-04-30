import {
  buildBreadcrumbList,
  buildReserveActionStructuredData,
  getSiteStructuredDataNodes,
  getPriceValidUntil,
  SITE_BRAND_ID,
  SITE_ORGANIZATION_ID,
  SITE_WEBSITE_ID,
} from "../../utils/structuredData";
import { cleanImageUrls, toSchemaImageValue } from "../../utils/cleanImageUrls";
import type { Engine3TourViewModel } from "../types";

type Engine3SchemaBreadcrumb = { name: string; url: string };

type BuildEngine3SchemaGraphInput = {
  tour: Engine3TourViewModel;
  seo: {
    canonicalUrl: string;
    title: string;
    description?: string;
    image?: string;
  };
  route: {
    pathname: string;
    isBookingRoute: boolean;
  };
  affiliateBookingUrl?: string;
  breadcrumbs: Engine3SchemaBreadcrumb[];
};

const trim = (value?: string | null): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : undefined;
};

const parsePriceValue = (value?: string): number | undefined => {
  const cleaned = trim(value);
  if (!cleaned) {
    return undefined;
  }

  const numeric = Number.parseFloat(cleaned.replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
};

const sanitizeFaqs = (faqs: Engine3TourViewModel["faqs"]) => {
  if (!faqs?.length) {
    return [];
  }

  const seen = new Set<string>();

  return faqs
    .map(item => ({
      question: trim(item.question),
      answer: trim(item.answer),
    }))
    .filter((item): item is { question: string; answer: string } =>
      Boolean(item.question && item.answer)
    )
    .filter(item => {
      const key = item.question.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, 5);
};

export const buildEngine3SchemaGraph = (
  input: BuildEngine3SchemaGraphInput
): Record<string, unknown>[] => {
  const canonicalUrl = input.seo.canonicalUrl;
  const productId = `${canonicalUrl}#product`;
  const tripId = `${canonicalUrl}#trip`;
  const webpageId = `${canonicalUrl}#webpage`;
  const placeId = `${canonicalUrl}#place`;
  const itineraryId = `${canonicalUrl}#itinerary`;
  const bookingUrl = trim(input.affiliateBookingUrl) ?? trim(input.tour.bookingUrl);
  const description =
    trim(input.tour.overview) ??
    trim(input.seo.description) ??
    trim(input.tour.description) ??
    trim(input.tour.title);

  const images = cleanImageUrls([
    input.seo.image,
    input.tour.primaryImageUrl,
    input.tour.heroImageOverrideUrl,
    input.tour.heroImageUrl,
  ]);

  const operatorName = trim(input.tour.operatorName);
  const providerEntity = operatorName
    ? {
        "@type": "Organization",
        name: operatorName,
      }
    : {
        "@type": "Organization",
        name: "Independent third-party tour operator",
      };

  const graph: Record<string, unknown>[] = [
    ...getSiteStructuredDataNodes(),
    {
      "@type": "WebPage",
      "@id": webpageId,
      url: canonicalUrl,
      name: input.seo.title,
      ...(description ? { description } : {}),
      ...(toSchemaImageValue(images) ? { image: toSchemaImageValue(images) } : {}),
      isPartOf: { "@id": SITE_WEBSITE_ID },
      publisher: { "@id": SITE_ORGANIZATION_ID },
      about: { "@id": productId },
      mainEntity: { "@id": productId },
    },
    {
      ...buildBreadcrumbList(input.breadcrumbs),
      "@id": `${canonicalUrl}#breadcrumb`,
    },
  ];

  const offerNode: Record<string, unknown> | undefined = bookingUrl
    ? {
        "@type": "Offer",
        url: bookingUrl,
        availability: "https://schema.org/InStock",
        ...(typeof parsePriceValue(input.tour.priceFrom) === "number"
          ? { price: parsePriceValue(input.tour.priceFrom)?.toFixed(2) }
          : {}),
        priceCurrency: trim(input.tour.priceCurrency) ?? "USD",
        priceValidUntil: getPriceValidUntil(),
      }
    : undefined;

  const productNode: Record<string, unknown> = {
    "@type": "Product",
    "@id": productId,
    url: canonicalUrl,
    name: input.tour.title,
    ...(description ? { description } : {}),
    ...(toSchemaImageValue(images) ? { image: toSchemaImageValue(images) } : {}),
    brand: { "@id": SITE_BRAND_ID },
    seller: { "@id": SITE_ORGANIZATION_ID },
    provider: providerEntity,
    ...(offerNode ? { offers: offerNode } : {}),
    mainEntityOfPage: { "@id": webpageId },
  };

  if (
    typeof input.tour.rating === "number" &&
    Number.isFinite(input.tour.rating) &&
    input.tour.rating > 0 &&
    typeof input.tour.reviewCount === "number" &&
    Number.isFinite(input.tour.reviewCount) &&
    input.tour.reviewCount > 0
  ) {
    productNode.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: input.tour.rating,
      reviewCount: input.tour.reviewCount,
    };
  }

  graph.push(productNode);

  const tripNode: Record<string, unknown> = {
    "@type": "TouristTrip",
    "@id": tripId,
    name: input.tour.title,
    url: canonicalUrl,
    ...(description ? { description } : {}),
    ...(toSchemaImageValue(images) ? { image: toSchemaImageValue(images) } : {}),
    provider: providerEntity,
    ...(offerNode ? { offers: offerNode } : {}),
    mainEntityOfPage: { "@id": webpageId },
  };

  const hasGeo =
    typeof input.tour.latitude === "number" &&
    Number.isFinite(input.tour.latitude) &&
    typeof input.tour.longitude === "number" &&
    Number.isFinite(input.tour.longitude);

  const hasPlaceName = Boolean(trim(input.tour.city) || trim(input.tour.region));
  if (hasGeo || hasPlaceName) {
    const placeNode: Record<string, unknown> = {
      "@type": "Place",
      "@id": placeId,
      ...(hasPlaceName
        ? {
            name: [trim(input.tour.city), trim(input.tour.region)]
              .filter(Boolean)
              .join(", "),
          }
        : {}),
    };

    if (hasGeo) {
      placeNode.geo = {
        "@type": "GeoCoordinates",
        latitude: input.tour.latitude,
        longitude: input.tour.longitude,
      };
    }

    graph.push(placeNode);
    tripNode.touristDestination = { "@id": placeId };
    tripNode.location = { "@id": placeId };
  }

  if (input.tour.itinerary?.length) {
    const itineraryStops = input.tour.itinerary
      .filter(item => trim(item.title) || trim(item.description) || trim(item.duration))
      .sort(
        (a, b) =>
          (a.order ?? Number.MAX_SAFE_INTEGER) -
          (b.order ?? Number.MAX_SAFE_INTEGER)
      );

    if (itineraryStops.length > 0) {
      const itineraryItems = itineraryStops.map((stop, index) => {
        const stopId = `${canonicalUrl}#itinerary-stop-${index + 1}`;
        graph.push({
          "@type": "TouristAttraction",
          "@id": stopId,
          ...(trim(stop.title) ? { name: trim(stop.title) } : {}),
          ...(trim(stop.description) ? { description: trim(stop.description) } : {}),
          ...(trim(stop.duration) ? { timeRequired: trim(stop.duration) } : {}),
        });

        return {
          "@type": "ListItem",
          position: index + 1,
          item: { "@id": stopId },
        };
      });

      const itineraryNode = {
        "@type": "ItemList",
        "@id": itineraryId,
        itemListElement: itineraryItems,
      };

      graph.push(itineraryNode);
      tripNode.itinerary = { "@id": itineraryId };
    }
  }

  graph.push(tripNode);

  const normalizedFaqs = sanitizeFaqs(input.tour.faqs);
  if (normalizedFaqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${canonicalUrl}#faq`,
      mainEntity: normalizedFaqs.map(item => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  if (input.route.isBookingRoute && bookingUrl) {
    graph.push(
      buildReserveActionStructuredData({
        bookingUrl,
        tourDetailUrl: canonicalUrl,
        tourName: input.tour.title,
      }) as Record<string, unknown>
    );
  }

  return graph;
};
