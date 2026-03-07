import { buildCanonicalUrl } from "../../utils/seo";
import type { Engine5TourViewModel } from "../types";

export const buildEngine5SchemaGraph = (tour: Engine5TourViewModel) => {
  const canonicalUrl = buildCanonicalUrl(tour.canonicalPath);
  const numericPrice = tour.facts.priceFrom?.replace(/[^0-9.]/g, "");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${canonicalUrl}#product`,
        name: tour.title,
        image: tour.primaryImage,
        description: tour.content.overview,
        url: canonicalUrl,
        offers: {
          "@type": "Offer",
          "@id": `${canonicalUrl}#offer`,
          url: tour.bookingUrl,
          priceCurrency: "USD",
          price: numericPrice,
          availability: "https://schema.org/InStock",
        },
        ...(typeof tour.facts.ratingValue === "number" &&
        typeof tour.facts.reviewCount === "number"
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                "@id": `${canonicalUrl}#aggregateRating`,
                ratingValue: tour.facts.ratingValue,
                reviewCount: tour.facts.reviewCount,
              },
            }
          : {}),
      },
      {
        "@type": "TouristTrip",
        "@id": `${canonicalUrl}#trip`,
        name: tour.title,
        image: tour.primaryImage,
        description: tour.content.overview,
        duration: tour.facts.duration,
        startTime: tour.facts.startTime,
        ...(tour.facts.meetingPoint
          ? {
              departureStation: {
                "@type": "Place",
                name: "Meeting point",
                address: tour.facts.meetingPoint,
              },
            }
          : {}),
        ...(tour.content.itinerary.length
          ? {
              itinerary: {
                "@type": "ItemList",
                itemListElement: tour.content.itinerary.map((item, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  item: {
                    "@type": "TouristAttraction",
                    name: item.title,
                    ...(item.description
                      ? { description: item.description }
                      : {}),
                  },
                })),
              },
            }
          : {}),
      },
      ...(tour.content.faqs.length
        ? [
            {
              "@type": "FAQPage",
              "@id": `${canonicalUrl}#faq`,
              mainEntity: tour.content.faqs.map(item => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.answer,
                },
              })),
            },
          ]
        : []),
    ],
  };
};
