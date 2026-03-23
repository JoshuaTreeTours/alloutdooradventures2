import { buildCanonicalUrl } from "../../utils/seo";
import { resolveEngine6OfferUrl } from "../buildEngine6ViatorBookingUrl";
import { resolveEngine6CtaUrl } from "../resolveEngine6CtaUrl";
import { formatEngine6CategoryLabel } from "../seo";
import type { Engine6Tour } from "../types";

export const buildEngine6SchemaGraph = (tour: Engine6Tour) => {
  const canonicalUrl = buildCanonicalUrl(tour.canonicalPath);
  const affiliateUrl = resolveEngine6CtaUrl(tour);
  const offerUrl = resolveEngine6OfferUrl(affiliateUrl);
  const categoryLabel = formatEngine6CategoryLabel(tour.primaryCategory);
  const description = tour.description || tour.metaDescription || tour.title;
  const pathSegments = tour.canonicalPath.split("/").filter(Boolean);
  const stateSlug = pathSegments[1] ?? "";
  const citySlug = pathSegments[2] ?? "";

  const itinerary =
    tour.itinerary.length > 0
      ? {
          "@type": "ItemList",
          itemListElement: tour.itinerary.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "TouristAttraction",
              name: item.title,
              ...(item.description ? { description: item.description } : {}),
            },
          })),
        }
      : undefined;

  const offerNode = {
    "@type": "Offer",
    "@id": `${canonicalUrl}#offer`,
    ...(offerUrl ? { url: offerUrl } : {}),
    priceCurrency: "USD",
    ...(typeof tour.priceAmount === "number"
      ? { price: tour.priceAmount }
      : {}),
    availability: "https://schema.org/InStock",
  };

  const aggregateRatingNode =
    typeof tour.aggregateRating === "number" &&
    Number.isFinite(tour.aggregateRating) &&
    typeof tour.reviewCount === "number" &&
    Number.isFinite(tour.reviewCount)
      ? {
          "@type": "AggregateRating",
          "@id": `${canonicalUrl}#aggregate-rating`,
          ratingValue: tour.aggregateRating,
          reviewCount: tour.reviewCount,
        }
      : undefined;

  const faqNode =
    tour.faqs.length > 0
      ? {
          "@type": "FAQPage",
          "@id": `${canonicalUrl}#faq`,
          mainEntity: tour.faqs.map(item => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : undefined;

  const webpageNode = {
    "@type": "WebPage",
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: tour.title,
    description: tour.metaDescription,
    mainEntity: { "@id": `${canonicalUrl}#trip` },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Destinations",
            item: buildCanonicalUrl("/destinations"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: tour.state,
            item: buildCanonicalUrl(`/destinations/${stateSlug}`),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: tour.city,
            item: buildCanonicalUrl(
              `/destinations/${stateSlug}/${citySlug}/tours`
            ),
          },
          {
            "@type": "ListItem",
            position: 4,
            name: tour.title,
            item: canonicalUrl,
          },
        ],
      },
      webpageNode,
      {
        "@type": "TouristTrip",
        "@id": `${canonicalUrl}#trip`,
        name: tour.title,
        description,
        image: tour.heroImageUrl,
        url: canonicalUrl,
        offers: { "@id": offerNode["@id"] },
        itinerary,
        ...(categoryLabel ? { touristType: categoryLabel } : {}),
        ...(tour.meetingPointText
          ? {
              departureStation: {
                "@type": "Place",
                name: "Meeting point",
                address: tour.meetingPointText,
              },
            }
          : {}),
      },
      {
        "@type": "Product",
        "@id": `${canonicalUrl}#product`,
        name: tour.title,
        image: tour.heroImageUrl,
        description,
        category: categoryLabel ?? undefined,
        url: canonicalUrl,
        offers: { "@id": offerNode["@id"] },
        ...(aggregateRatingNode
          ? { aggregateRating: { "@id": aggregateRatingNode["@id"] } }
          : {}),
      },
      offerNode,
      ...(aggregateRatingNode ? [aggregateRatingNode] : []),
      ...(faqNode ? [faqNode] : []),
    ],
  };
};
