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

const titleCaseFromSlug = (value?: string): string | undefined => {
  const cleaned = trim(value);
  if (!cleaned) {
    return undefined;
  }

  return cleaned
    .split("-")
    .filter(Boolean)
    .map(token => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
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
  const viatorAffiliateUrl = trim(input.bookingUrl);

  const regionSlug = trim(input.region);
  const citySlug = trim(input.city);
  const destinationsUrl = "/destinations";
  const regionUrl = regionSlug ? `${destinationsUrl}/${regionSlug}` : undefined;
  const cityUrl =
    regionSlug && citySlug
      ? `${destinationsUrl}/${regionSlug}/${citySlug}`
      : undefined;

  const fallbackBreadcrumbItems = [
    { name: "Destinations", item: destinationsUrl },
    ...(regionUrl && regionSlug
      ? [{ name: titleCaseFromSlug(regionSlug) ?? regionSlug, item: regionUrl }]
      : []),
    ...(cityUrl && citySlug
      ? [{ name: titleCaseFromSlug(citySlug) ?? citySlug, item: cityUrl }]
      : []),
    { name: input.title, item: canonicalUrl },
  ];

  const breadcrumbItems =
    options?.breadcrumbItems?.length &&
    options.breadcrumbItems.every(item => trim(item.name) && trim(item.item))
      ? options.breadcrumbItems
      : fallbackBreadcrumbItems;

  const offerId = `${absoluteCanonicalUrl}#offer`;
  const tripId = `${absoluteCanonicalUrl}#trip`;
  const webpageId = `${absoluteCanonicalUrl}#webpage`;
  const providerId = `${absoluteCanonicalUrl}#provider`;

  const offerNode: Record<string, unknown> = {
    "@type": "Offer",
    "@id": offerId,
    url: viatorAffiliateUrl,
  };

  const price = parsePriceValue(input.priceFrom);
  if (price) {
    offerNode.price = price;
  }

  const currency = trim(input.priceCurrency);
  if (currency) {
    offerNode.priceCurrency = currency;
  }

  const availability = trim(input.availability);
  if (availability) {
    offerNode.availability = availability;
  }

  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      "@id": webpageId,
      url: absoluteCanonicalUrl,
      name: input.title,
      ...(description ? { description } : {}),
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
    {
      "@type": "TouristTrip",
      "@id": tripId,
      name: input.title,
      url: absoluteCanonicalUrl,
      ...(description ? { description } : {}),
      ...(input.primaryImageUrl ? { image: [input.primaryImageUrl] } : {}),
      provider: {
        "@id": providerId,
      },
      offers: {
        "@id": offerId,
      },
      touristType: "Sightseeing",
      areaServed: [
        { "@type": "Country", name: "United States" },
        { "@type": "AdministrativeArea", name: "California" },
        { "@type": "City", name: "Palm Springs" },
      ],
    },
    {
      "@type": "Organization",
      "@id": providerId,
      name: trim(input.operatorName) ?? "Viator Operator",
    },
    offerNode,
  ];

  const tripNode = graph.find(node => node["@type"] === "TouristTrip") as
    | Record<string, unknown>
    | undefined;

  if (tripNode && input.itinerary?.length) {
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

  if (input.rating && input.reviewCount && tripNode) {
    tripNode.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: input.rating,
      reviewCount: input.reviewCount,
    };
  }

  if (input.latitude && input.longitude && tripNode) {
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
