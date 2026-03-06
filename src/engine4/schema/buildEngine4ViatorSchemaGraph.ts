import { buildCanonicalUrl } from "../../utils/seo";
import type { Engine4TourViewModel } from "../types";

export const buildEngine4ViatorSchemaGraph = (tour: Engine4TourViewModel) => {
  const canonicalUrl = buildCanonicalUrl(tour.canonicalPath);

  const itinerary =
    tour.content.itinerary && tour.content.itinerary.length > 0
      ? {
          "@type": "ItemList",
          itemListElement: tour.content.itinerary.map((item, index) => ({
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
    url: tour.bookingUrl,
    priceCurrency: "USD",
    price: tour.facts.priceFrom?.replace(/[^0-9.]/g, "") || undefined,
    availability: "https://schema.org/InStock",
  };

  const aggregateRatingNode =
    typeof tour.facts.ratingValue === "number" &&
    typeof tour.facts.reviewCount === "number"
      ? {
          "@type": "AggregateRating",
          "@id": `${canonicalUrl}#aggregate-rating`,
          ratingValue: tour.facts.ratingValue,
          reviewCount: tour.facts.reviewCount,
        }
      : undefined;

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
            name: tour.destination.state,
            item: buildCanonicalUrl(
              `/destinations/${tour.destination.stateSlug}`
            ),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: tour.destination.city,
            item: buildCanonicalUrl(
              `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours`
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
      {
        "@type": "TouristTrip",
        "@id": `${canonicalUrl}#trip`,
        name: tour.title,
        description: tour.content.overview,
        image: tour.primaryImage ?? tour.heroImage ?? undefined,
        url: canonicalUrl,
        offers: { "@id": offerNode["@id"] },
        itinerary,
        duration: tour.facts.duration,
        startTime: tour.facts.startTime,
      },
      {
        "@type": "Product",
        "@id": `${canonicalUrl}#product`,
        name: tour.title,
        image: tour.primaryImage ?? tour.heroImage ?? undefined,
        description: tour.content.overview,
        url: tour.bookingUrl,
        offers: { "@id": offerNode["@id"] },
        ...(aggregateRatingNode
          ? { aggregateRating: { "@id": aggregateRatingNode["@id"] } }
          : {}),
      },
      offerNode,
      ...(aggregateRatingNode ? [aggregateRatingNode] : []),
    ],
  };
};
