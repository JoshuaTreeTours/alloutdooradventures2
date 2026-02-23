import { buildBreadcrumbList, getPriceValidUntil } from "../utils/structuredData";
import type { TourRewriteV3_1 } from "../utils/fh/transformToAOAContent";

type SchemaOffer = Record<string, unknown>;

const toSlugLabel = (value: string) =>
  value
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const resolveTourDurationISO = (
  rewrite?: TourRewriteV3_1
): string | undefined => {
  if (rewrite?.durationISO) {
    return rewrite.durationISO;
  }

  if (rewrite?.durationMinutes && rewrite.durationMinutes > 0) {
    const hours = Math.floor(rewrite.durationMinutes / 60);
    const minutes = rewrite.durationMinutes % 60;
    if (hours && minutes) {
      return `PT${hours}H${minutes}M`;
    }
    if (hours) {
      return `PT${hours}H`;
    }
    return `PT${minutes}M`;
  }

  return undefined;
};

export const buildTourOfferNode = ({
  offerUrl,
  currency,
  fallbackPrice,
  rewrite,
}: {
  offerUrl: string;
  currency: string;
  fallbackPrice: number;
  rewrite?: TourRewriteV3_1;
}): SchemaOffer => {
  const schemaCurrency =
    rewrite?.pricing?.currency ?? rewrite?.priceCurrency ?? currency;
  const pricingLow = rewrite?.pricing?.low;
  const pricingHigh = rewrite?.pricing?.high;
  const canAggregate =
    rewrite?.pricing?.isAggregate !== false &&
    typeof pricingLow === "number" &&
    typeof pricingHigh === "number" &&
    pricingLow !== pricingHigh;

  if (canAggregate) {
    return {
      "@type": "AggregateOffer",
      url: offerUrl,
      availability: "https://schema.org/InStock",
      lowPrice: pricingLow.toFixed(2),
      highPrice: pricingHigh.toFixed(2),
      priceCurrency: schemaCurrency,
      offerCount: 2,
    };
  }

  const singlePrice =
    typeof rewrite?.schemaPrice === "number"
      ? rewrite.schemaPrice
      : typeof pricingHigh === "number"
        ? pricingHigh
        : fallbackPrice;

  return {
    "@type": "Offer",
    url: offerUrl,
    availability: "https://schema.org/InStock",
    price: singlePrice.toFixed(2),
    priceCurrency: schemaCurrency,
    priceValidUntil: getPriceValidUntil(),
  };
};

export const buildTourBreadcrumbNode = ({
  canonicalPath,
  tourName,
}: {
  canonicalPath: string;
  tourName: string;
}) => {
  if (!canonicalPath.startsWith("/destinations/")) {
    return buildBreadcrumbList([
      { name: "Tours", url: "/tours" },
      { name: tourName, url: canonicalPath },
    ]);
  }

  const segments = canonicalPath.split("/").filter(Boolean);
  const destinationsIndex = segments.indexOf("destinations");
  const toursIndex = segments.indexOf("tours");
  const pathSegments =
    destinationsIndex >= 0 && toursIndex > destinationsIndex
      ? segments.slice(destinationsIndex + 1, toursIndex)
      : [];

  const crumbs: Array<{ name: string; url: string }> = [
    { name: "Destinations", url: "/destinations" },
  ];

  pathSegments.forEach((segment, index) => {
    crumbs.push({
      name: toSlugLabel(segment),
      url: `/destinations/${pathSegments.slice(0, index + 1).join("/")}`,
    });
  });

  crumbs.push({
    name: "Tours",
    url: `/destinations/${pathSegments.join("/")}/tours`,
  });
  crumbs.push({ name: tourName, url: canonicalPath });

  return buildBreadcrumbList(crumbs);
};
