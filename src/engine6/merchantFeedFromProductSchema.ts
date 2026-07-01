import { formatMerchantPrice } from "../utils/merchantPricing";
import { parseEngine6StateCityFromCanonicalPath, resolveEngine6DisplayHero } from "./displayHero";
import { resolveEngine6GovernedProductDescription } from "./governedEditorialDescriptions";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import type { Engine6Tour } from "./types";

const DEFAULT_BRAND = "Outdoor Adventures";

export type MerchantFeedProductSchemaSnapshot = {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  availability: string;
  price: string;
  priceCurrency: string;
  averageRating: string;
  ratingCount: string;
  reviewCount: string;
  bookingUrl: string;
  offerPrice: number | null;
  aggregateRatingValue: number | null;
  aggregateReviewCount: number | null;
};

export type MerchantFeedRowFromProductSchema = {
  id: string;
  title: string;
  description: string;
  link: string;
  image_link: string;
  availability: string;
  price: string;
  condition: string;
  brand: string;
  average_rating: string;
  rating_count: string;
  review_count: string;
};

const SCHEMA_OFFER_AVAILABILITY_TO_MERCHANT: Record<string, string> = {
  "https://schema.org/InStock": "in stock",
  "https://schema.org/OutOfStock": "out of stock",
  "https://schema.org/PreOrder": "preorder",
  "https://schema.org/PreSale": "preorder",
  "https://schema.org/BackOrder": "backorder",
};

const formatMerchantRating = (value: number) => value.toFixed(1);

const formatMerchantCount = (value: number) => String(Math.trunc(value));

const mapSchemaAvailabilityToMerchant = (value: unknown) => {
  if (typeof value !== "string") {
    return "in stock";
  }

  return SCHEMA_OFFER_AVAILABILITY_TO_MERCHANT[value] ?? "in stock";
};

const getSchemaGraphNodes = (tour: Engine6Tour) =>
  buildEngine6SchemaGraph(tour)["@graph"] as Array<Record<string, unknown>>;

export const resolveMerchantFeedProductSchemaSnapshot = (
  tour: Engine6Tour
): MerchantFeedProductSchemaSnapshot => {
  const graph = getSchemaGraphNodes(tour);
  const productNode = graph.find(node => node["@type"] === "Product");
  const offerNode = graph.find(node => node["@type"] === "Offer");
  const aggregateRatingNode = graph.find(
    node => node["@type"] === "AggregateRating"
  );

  if (!productNode) {
    throw new Error(
      `Engine6 Product JSON-LD missing for merchant feed row ${tour.productCode}`
    );
  }

  const priceCurrency =
    typeof offerNode?.priceCurrency === "string"
      ? offerNode.priceCurrency
      : "USD";
  const offerPrice =
    typeof offerNode?.price === "number" ? offerNode.price : null;
  const aggregateRatingValue =
    typeof aggregateRatingNode?.ratingValue === "number"
      ? aggregateRatingNode.ratingValue
      : null;
  const aggregateReviewCount =
    typeof aggregateRatingNode?.reviewCount === "number"
      ? aggregateRatingNode.reviewCount
      : null;

  const { stateSlug, citySlug } = parseEngine6StateCityFromCanonicalPath(
    tour.canonicalPath
  );
  const schemaProductImage =
    typeof productNode.image === "string" ? productNode.image : tour.heroImageUrl;
  const merchantImageLink = resolveEngine6DisplayHero({
    productHeroUrl: schemaProductImage,
    productCode: tour.productCode,
    stateSlug,
    citySlug,
  });

  return {
    id: tour.productCode,
    title: typeof productNode.name === "string" ? productNode.name : tour.title,
    description:
      typeof productNode.description === "string"
        ? productNode.description
        : "",
    link: typeof productNode.url === "string" ? productNode.url : "",
    imageLink: merchantImageLink,
    availability: mapSchemaAvailabilityToMerchant(offerNode?.availability),
    price: formatMerchantPrice(offerPrice, priceCurrency),
    priceCurrency,
    averageRating:
      aggregateRatingValue !== null
        ? formatMerchantRating(aggregateRatingValue)
        : "",
    ratingCount:
      aggregateReviewCount !== null
        ? formatMerchantCount(aggregateReviewCount)
        : "",
    reviewCount:
      aggregateReviewCount !== null
        ? formatMerchantCount(aggregateReviewCount)
        : "",
    bookingUrl: typeof offerNode?.url === "string" ? offerNode.url : "",
    offerPrice,
    aggregateRatingValue,
    aggregateReviewCount,
  };
};

export const buildMerchantFeedRowFromProductSchema = (
  tour: Engine6Tour
): MerchantFeedRowFromProductSchema => {
  const snapshot = resolveMerchantFeedProductSchemaSnapshot(tour);

  return {
    id: snapshot.id,
    title: snapshot.title,
    description: resolveEngine6GovernedProductDescription(tour),
    link: snapshot.link,
    image_link: snapshot.imageLink,
    availability: snapshot.availability,
    price: snapshot.price,
    condition: "new",
    brand: DEFAULT_BRAND,
    average_rating: snapshot.averageRating,
    rating_count: snapshot.ratingCount,
    review_count: snapshot.reviewCount,
  };
};
