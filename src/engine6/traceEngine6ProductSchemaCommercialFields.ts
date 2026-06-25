import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import { fetchEngine6LiveCommercialFieldsForSchema } from "./fetchEngine6LiveCommercialFieldsForSchema";
import { resolveEngine6ViatorProductCommercialExtract } from "../../api/engine6/resolveEngine6ViatorProductCommercialExtract";
import { resolveMerchantFeedProductSchemaSnapshot } from "./merchantFeedFromProductSchema";
import { auditEngine6CommercialFieldParity } from "./merchantFeedParity";
import { getEngine6TourRatingSourceOfTruth } from "./ratingSourceOfTruth";
import { resolveEngine6TourForProductSchema } from "./resolveEngine6TourForProductSchema";
import type { Engine6Tour } from "./types";

export const traceEngine6ProductSchemaCommercialFields = async (
  tour: Engine6Tour
) => {
  const registryRating = getEngine6TourRatingSourceOfTruth(tour);
  const registryGraph = buildEngine6SchemaGraph(tour)["@graph"] as Array<
    Record<string, unknown>
  >;
  const registryAggregateRating = registryGraph.find(
    node => node["@type"] === "AggregateRating"
  );

  const liveFields = await fetchEngine6LiveCommercialFieldsForSchema(
    tour.productCode
  );
  const canonicalCommercial =
    await resolveEngine6ViatorProductCommercialExtract(tour.productCode);
  const resolvedTour = resolveEngine6TourForProductSchema(tour, liveFields);
  const resolvedRating = getEngine6TourRatingSourceOfTruth(resolvedTour);
  const resolvedGraph = buildEngine6SchemaGraph(resolvedTour)[
    "@graph"
  ] as Array<Record<string, unknown>>;
  const resolvedAggregateRating = resolvedGraph.find(
    node => node["@type"] === "AggregateRating"
  );
  const snapshot = resolveMerchantFeedProductSchemaSnapshot(resolvedTour);
  const merchantRow = {
    id: tour.productCode,
    title: snapshot.title,
    description: snapshot.description,
    link: snapshot.link,
    image_link: snapshot.imageLink,
    availability: snapshot.availability,
    price: snapshot.price,
    average_rating: snapshot.averageRating,
    rating_count: snapshot.ratingCount,
    review_count: snapshot.reviewCount,
  };
  const parity = auditEngine6CommercialFieldParity(resolvedTour, merchantRow);

  return {
    productCode: tour.productCode,
    canonicalCommercialExtract: canonicalCommercial,
    registryTour: {
      reviewCount: tour.reviewCount,
      aggregateRating: tour.aggregateRating,
      ratingSourceOfTruth: registryRating,
    },
    buildEngine6SchemaGraph_registry: {
      aggregateRatingReviewCount: registryAggregateRating?.reviewCount ?? null,
      aggregateRatingValue: registryAggregateRating?.ratingValue ?? null,
    },
    liveCommercialOverlay: liveFields,
    buildEngine6SchemaGraph_resolved: {
      aggregateRatingReviewCount: resolvedAggregateRating?.reviewCount ?? null,
      aggregateRatingValue: resolvedAggregateRating?.ratingValue ?? null,
      ratingSourceOfTruth: resolvedRating,
    },
    merchantFeedGeneration: {
      review_count: snapshot.reviewCount,
      average_rating: snapshot.averageRating,
    },
    parityAudit: {
      pass: parity.pass,
      mismatches: parity.mismatches,
    },
  };
};
