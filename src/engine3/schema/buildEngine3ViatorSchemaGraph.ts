import { buildCanonicalUrl } from "../../utils/seo";
import type { Engine3TourViewModel } from "../types";

type SchemaBreadcrumbItem = {
  name: string;
  item: string;
};

type BuildEngine3ViatorSchemaGraphOptions = {
  tripDescription?: string;
  breadcrumbItems?: SchemaBreadcrumbItem[];
};

const trim = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const parsePriceValue = (value?: string): string | undefined => {
  const cleaned = trim(value);
  if (!cleaned) {
    return undefined;
  }

  const number = cleaned.replace(/[^\d.]/g, "");
  return number.length > 0 ? number : undefined;
};

const normalizeFaqs = (faqs: Engine3TourViewModel["faqs"]) => {
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
    });
};

const toShortDescription = (value?: string): string | undefined => {
  const text = trim(value);
  if (!text) {
    return undefined;
  }

  const sentences =
    text.match(/[^.!?]+[.!?]?/g)?.map(item => item.trim()) ?? [];
  const short = sentences.slice(0, 2).join(" ").trim();
  return short || text;
};

const buildFallbackBreadcrumbItems = (
  input: Engine3TourViewModel,
  canonicalUrl: string
): SchemaBreadcrumbItem[] => {
  const stateSlug = trim(input.stateSlug) ?? "california";
  const citySlug = trim(input.citySlug) ?? "palm-springs";

  return [
    { name: "Home", item: "/" },
    { name: "Tours", item: "/tours" },
    {
      name: trim(input.city) ?? "Palm Springs",
      item: `/tours?state=${stateSlug}&city=${citySlug}`,
    },
    { name: input.title, item: canonicalUrl },
  ];
};

export const buildEngine3ViatorSchemaGraph = (
  input: Engine3TourViewModel,
  canonicalUrl: string,
  options?: BuildEngine3ViatorSchemaGraphOptions
) => {
  const absoluteCanonicalUrl = buildCanonicalUrl(canonicalUrl);
  const description =
    trim(input.description) ??
    trim(options?.tripDescription) ??
    trim(`${input.title} in ${input.city}, ${input.region}`);
  const shortDescription = toShortDescription(description);
  const viatorAffiliateUrl = trim(input.bookingUrl);

  const breadcrumbItems =
    options?.breadcrumbItems?.length &&
    options.breadcrumbItems.every(item => trim(item.name) && trim(item.item))
      ? options.breadcrumbItems
      : buildFallbackBreadcrumbItems(input, canonicalUrl);

  const offerId = `${absoluteCanonicalUrl}#offer`;
  const productId = `${absoluteCanonicalUrl}#product`;
  const tripId = `${absoluteCanonicalUrl}#trip`;
  const webpageId = `${absoluteCanonicalUrl}#webpage`;
  const providerId = `${absoluteCanonicalUrl}#provider`;
  const brandId = "https://www.alloutdooradventures.com/#brand";

  const price = parsePriceValue(input.priceFrom);
  const currency = trim(input.priceCurrency) ?? "USD";
  const shouldEmitOffer = Boolean(price);

  const offerNode: Record<string, unknown> | undefined = shouldEmitOffer
    ? {
        "@type": "Offer",
        "@id": offerId,
        url: viatorAffiliateUrl ?? absoluteCanonicalUrl,
        price,
        priceCurrency: currency,
        availability: trim(input.availability) ?? "https://schema.org/InStock",
      }
    : undefined;

  const productName = trim(input.title);
  const productNode: Record<string, unknown> | undefined = productName
    ? {
        "@type": "Product",
        "@id": productId,
        url: absoluteCanonicalUrl,
        name: productName,
        ...(description ? { description } : {}),
        ...(input.primaryImageUrl ? { image: [input.primaryImageUrl] } : {}),
        brand: {
          "@id": brandId,
        },
        ...(shouldEmitOffer
          ? {
              offers: {
                "@id": offerId,
              },
            }
          : {}),
      }
    : undefined;

  const tripNode: Record<string, unknown> = {
    "@type": "TouristTrip",
    "@id": tripId,
    name: input.title,
    url: absoluteCanonicalUrl,
    ...(description ? { description } : {}),
    ...(input.primaryImageUrl ? { image: [input.primaryImageUrl] } : {}),
    provider: {
      "@id": providerId,
    },
    ...(shouldEmitOffer
      ? {
          offers: {
            "@id": offerId,
          },
        }
      : {}),
    touristType: "Sightseeing",
    areaServed: [
      { "@type": "Country", name: "United States" },
      { "@type": "AdministrativeArea", name: "California" },
      { "@type": "City", name: "Palm Springs" },
    ],
  };

  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      "@id": webpageId,
      url: absoluteCanonicalUrl,
      name: input.title,
      ...(shortDescription ? { description: shortDescription } : {}),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${absoluteCanonicalUrl}#breadcrumb`,
      itemListElement: breadcrumbItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: buildCanonicalUrl(item.item),
      })),
    },
    tripNode,
    {
      "@type": "Organization",
      "@id": brandId,
      name: "All Outdoor Adventures",
      url: "https://www.alloutdooradventures.com",
    },
    {
      "@type": "Organization",
      "@id": providerId,
      name: trim(input.operatorName) ?? "Viator Operator",
    },
    ...(productNode ? [productNode] : []),
    ...(offerNode ? [offerNode] : []),
  ];

  if (input.itinerary?.length) {
    const itinerary = input.itinerary
      .filter(
        item =>
          trim(item.title) || trim(item.description) || trim(item.duration)
      )
      .sort(
        (a, b) =>
          (a.order ?? Number.MAX_SAFE_INTEGER) -
          (b.order ?? Number.MAX_SAFE_INTEGER)
      )
      .map((item, index) => ({
        "@type": "TouristAttraction",
        name: trim(item.title),
        description: trim(item.description),
        timeRequired: trim(item.duration),
        position: item.order ?? index + 1,
      }));

    if (itinerary.length > 0) {
      tripNode.itinerary = {
        "@type": "ItemList",
        itemListElement: itinerary,
      };
    }
  }

  if (input.rating && input.reviewCount) {
    const aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: input.rating,
      reviewCount: input.reviewCount,
    };

    if (productNode) {
      productNode.aggregateRating = aggregateRating;
    }

    tripNode.aggregateRating = aggregateRating;
  }

  if (input.latitude && input.longitude) {
    tripNode.location = {
      "@type": "Place",
      name: `${input.city}, ${input.region}`,
      geo: {
        "@type": "GeoCoordinates",
        latitude: input.latitude,
        longitude: input.longitude,
      },
    };
  }

  const normalizedFaqs = normalizeFaqs(input.faqs);
  if (normalizedFaqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${absoluteCanonicalUrl}#faq`,
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

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
};
