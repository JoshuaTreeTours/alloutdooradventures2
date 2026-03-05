import { buildCanonicalUrl } from "../../utils/seo";
import type { Engine4TourViewModel } from "../types";

export const buildEngine4ViatorSchemaGraph = (tour: Engine4TourViewModel) => {
  const canonicalUrl = buildCanonicalUrl(tour.canonicalPath);

  const itinerary =
    tour.itinerary && tour.itinerary.length > 0
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

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristTrip",
        "@id": `${canonicalUrl}#trip`,
        name: tour.title,
        description: tour.overview,
        touristType: "Adventure travelers",
        itinerary,
      },
      {
        "@type": "Product",
        "@id": `${canonicalUrl}#product`,
        name: tour.title,
        image: [tour.heroImage],
        description: tour.overview,
        brand: {
          "@type": "Brand",
          name: "Viator",
        },
        aggregateRating:
          typeof tour.rating === "number" &&
          typeof tour.reviewCount === "number"
            ? {
                "@type": "AggregateRating",
                ratingValue: tour.rating,
                reviewCount: tour.reviewCount,
              }
            : undefined,
        offers: {
          "@type": "Offer",
          url: tour.bookingUrl,
          priceCurrency: "USD",
          price: tour.fromPrice?.replace(/[^0-9.]/g, "") || undefined,
          availability: "https://schema.org/InStock",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        mainEntity: tour.faqs.map(faq => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };
};
