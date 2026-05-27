import { buildCanonicalUrl } from "../../utils/seo";
import {
  getSiteStructuredDataNodes,
  SITE_BRAND_ID,
  SITE_ORGANIZATION_ID,
  SITE_WEBSITE_ID,
  getPriceValidUntil,
} from "../../utils/structuredData";
import { SITE_BRAND_NAME } from "../../utils/site";
import { resolveEngine6OfferUrl } from "../buildEngine6ViatorBookingUrl";
import { buildEngine6ParentCityToursPath } from "../routeIntegrity";
import { formatEngine6CategoryLabel } from "../seo";
import type { Engine6Tour } from "../types";

const includesTerm = (source: string, term: string) =>
  source.toLowerCase().includes(term.trim().toLowerCase());

const buildCityAwareSchemaName = ({
  title,
  city,
}: {
  title: string;
  city: string;
}) => {
  const normalizedTitle = title.trim();
  const normalizedCity = city.trim();
  if (!normalizedTitle || !normalizedCity) {
    return normalizedTitle || normalizedCity;
  }

  return includesTerm(normalizedTitle, normalizedCity)
    ? normalizedTitle
    : `${normalizedTitle} in ${normalizedCity}`;
};

export const buildEngine6SchemaGraph = (tour: Engine6Tour) => {
  const resolvedHeroUrl = tour.resolvedHero?.url ?? tour.heroImageUrl ?? undefined;
  const canonicalUrl = buildCanonicalUrl(tour.canonicalPath);
  const affiliateUrl = tour.bookingUrl;
  const offerUrl =
    resolveEngine6OfferUrl(affiliateUrl) ??
    (affiliateUrl?.startsWith("/") ? affiliateUrl : undefined);
  const categoryLabel = formatEngine6CategoryLabel(tour.primaryCategory);
  const description = tour.seoDescription || tour.metaDescription || tour.description || tour.title;
  const schemaName = buildCityAwareSchemaName({
    title: tour.title,
    city: tour.city,
  });
  const pathSegments = tour.canonicalPath.split("/").filter(Boolean);
  const stateSlug = pathSegments[1] ?? "";
  const parentCityToursPath =
    buildEngine6ParentCityToursPath(tour.canonicalPath) ??
    `/destinations/${stateSlug}/${pathSegments[2] ?? ""}/tours`;
  const destinationPlaceId = `${canonicalUrl}#destination`;
  const departurePlaceId = `${canonicalUrl}#departure`;

  const itinerary =
    tour.itinerary.length >= 2
      ? {
          "@type": "ItemList",
          itemListElement: tour.itinerary.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "TouristAttraction",
              name: item.title,
              ...(item.description || item.admissionNote
                ? {
                    description: [item.description, item.admissionNote]
                      .filter(Boolean)
                      .join(" — "),
                  }
                : {}),
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
    ...(tour.priceFormatted ? { description: tour.priceFormatted } : {}),
    availability: "https://schema.org/InStock",
    priceValidUntil: getPriceValidUntil(),
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
  const siteNodes = getSiteStructuredDataNodes();

  const webpageNode = {
    "@type": "WebPage",
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: schemaName,
    description,
    isPartOf: { "@id": SITE_WEBSITE_ID },
    publisher: { "@id": SITE_ORGANIZATION_ID },
    ...(resolvedHeroUrl
      ? {
          primaryImageOfPage: {
            "@type": "ImageObject",
            "@id": `${canonicalUrl}#primaryimage`,
            url: resolvedHeroUrl,
          },
          image: resolvedHeroUrl,
        }
      : {}),
    about: { "@id": `${canonicalUrl}#product` },
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
            item: buildCanonicalUrl(parentCityToursPath),
          },
          {
            "@type": "ListItem",
            position: 4,
            name: tour.title,
            item: canonicalUrl,
          },
        ],
      },
      ...siteNodes,
      webpageNode,
      {
        "@type": "Place",
        "@id": destinationPlaceId,
        name: tour.city,
        address: {
          "@type": "PostalAddress",
          addressLocality: tour.city,
          addressRegion: tour.state,
          addressCountry: "US",
        },
      },
      {
        "@type": "TouristTrip",
        "@id": `${canonicalUrl}#trip`,
        name: schemaName,
        description,
        image: resolvedHeroUrl,
        url: canonicalUrl,
        provider: { "@id": SITE_ORGANIZATION_ID },
        touristDestination: { "@id": destinationPlaceId },
        areaServed: { "@id": destinationPlaceId },
        offers: { "@id": offerNode["@id"] },
        itinerary,
        ...(tour.durationText ? { duration: tour.durationText } : {}),
        ...(categoryLabel ? { touristType: categoryLabel } : {}),
        ...(tour.meetingPointText
          ? {
              departureStation: {
                "@type": "Place",
                "@id": departurePlaceId,
                name: "Meeting point",
                address: tour.meetingPointText,
              },
            }
          : {}),
      },
      {
        "@type": "Product",
        "@id": `${canonicalUrl}#product`,
        name: schemaName,
        image: resolvedHeroUrl,
        description,
        category: categoryLabel ?? undefined,
        url: canonicalUrl,
        brand: { "@id": SITE_BRAND_ID },
        provider: { "@id": SITE_ORGANIZATION_ID },
        seller: { "@id": SITE_ORGANIZATION_ID },
        areaServed: { "@id": destinationPlaceId },
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
