import { buildCanonicalUrl } from "../../utils/seo";
import type { Engine4TourViewModel } from "../types";

export const buildEngine4ViatorSchemaGraph = (tour: Engine4TourViewModel) => {
  const canonicalUrl = buildCanonicalUrl(tour.canonicalPath);

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
            item: buildCanonicalUrl(
              `/destinations/${tour.state.toLowerCase()}`
            ),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: tour.city,
            item: buildCanonicalUrl(
              `/destinations/${tour.state.toLowerCase()}/${tour.city.toLowerCase()}`
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
        image: tour.heroImage,
        description: tour.overview,
        touristType: "Adventure travelers",
        itinerary: {
          "@type": "ItemList",
          itemListElement: tour.highlights.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item,
          })),
        },
      },
      {
        "@type": "Product",
        "@id": `${canonicalUrl}#product`,
        name: tour.title,
        image: tour.heroImage,
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
