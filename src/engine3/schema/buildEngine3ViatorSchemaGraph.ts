import { SITE_BRAND_ID } from "../../utils/structuredData";
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
  const description =
    trim(options?.tripDescription) ??
    trim(`${input.title} in ${input.city}, ${input.region}`);

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

  const offerId = `${canonicalUrl}#offer`;

  const offerNode: Record<string, unknown> = {
    "@type": "Offer",
    "@id": offerId,
    url: input.bookingUrl,
    availability: "https://schema.org/InStock",
  };

  const price = parsePriceValue(input.priceFrom);
  if (price) {
    offerNode.price = price;
  }

  const currency = trim(input.priceCurrency);
  if (currency) {
    offerNode.priceCurrency = currency;
  }

  const graph: Record<string, unknown>[] = [
    {
      "@type": ["Organization", "TravelAgency"],
      "@id": SITE_BRAND_ID,
      name: "All Outdoor Adventures",
      url: "/",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumb`,
      itemListElement: breadcrumbItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.item,
      })),
    },
    offerNode,
  ];

  if (trim(input.title) && description) {
    const tripNode: Record<string, unknown> = {
      "@type": "TouristTrip",
      "@id": `${canonicalUrl}#trip`,
      name: input.title,
      description,
      provider: {
        "@id": SITE_BRAND_ID,
      },
      offers: {
        "@id": offerId,
      },
      touristType: "Sightseeing",
    };

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

    graph.push(tripNode);
  }

  const normalizedFaqs = normalizeFaqs(input.faqs);
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

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
};
