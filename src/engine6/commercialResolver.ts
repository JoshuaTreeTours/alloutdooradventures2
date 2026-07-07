import type { Engine6LiveProductFields } from "./liveProductFields";
import { fetchEngine6LiveCommercialFieldsForSchema } from "./fetchEngine6LiveCommercialFieldsForSchema";
import { resolveEngine6TourForProductSchema } from "./resolveEngine6TourForProductSchema";
import type { Engine6Tour } from "./types";

export const ENGINE6_COMMERCIAL_SOURCE_LABEL =
  "shared Engine6 commercial resolver (/api/engine6/viator-product or Viator API fallback)";

/**
 * Single governed commercial resolver for Engine6 page rendering, Product JSON-LD,
 * and merchant feed generation/audits. It overlays live syndicated commercial
 * fields on the static Engine6 tour record before downstream artifacts read
 * price, rating, and review counts.
 */
export const resolveEngine6CommercialFields = async (
  productCode: string
): Promise<Partial<Engine6LiveProductFields>> =>
  fetchEngine6LiveCommercialFieldsForSchema(productCode);

export const resolveEngine6TourWithCommercialSource = async (
  tour: Engine6Tour
): Promise<Engine6Tour> => {
  const liveFields = await resolveEngine6CommercialFields(tour.productCode);
  return resolveEngine6TourForProductSchema(tour, liveFields);
};

export const resolveEngine6ToursWithCommercialSource = async (
  tours: Engine6Tour[]
): Promise<Engine6Tour[]> => {
  const concurrency = 12;
  const resolvedTours: Engine6Tour[] = [];

  for (let index = 0; index < tours.length; index += concurrency) {
    const batch = tours.slice(index, index + concurrency);
    resolvedTours.push(
      ...(await Promise.all(batch.map(resolveEngine6TourWithCommercialSource)))
    );
  }

  return resolvedTours;
};
