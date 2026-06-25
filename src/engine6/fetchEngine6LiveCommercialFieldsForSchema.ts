import { resolveEngine6ViatorProductCommercialExtract } from "../../api/engine6/resolveEngine6ViatorProductCommercialExtract";
import type { Engine6LiveProductFields } from "./liveProductFields";
import { resolveEngine6TourForProductSchema } from "./resolveEngine6TourForProductSchema";
import type { Engine6Tour } from "./types";

const toLiveCommercialFields = (
  commercial: Awaited<
    ReturnType<typeof resolveEngine6ViatorProductCommercialExtract>
  >
): Partial<Engine6LiveProductFields> => ({
  priceAmount: commercial.priceAmount,
  priceFormatted: commercial.priceFormatted,
  aggregateRating: commercial.aggregateRating,
  reviewCount: commercial.reviewCount,
});

/**
 * Resolves the canonical Viator commercial overlay used by the product page
 * (/api/engine6/viator-product) before Product JSON-LD is rendered.
 */
export const fetchEngine6LiveCommercialFieldsForSchema = async (
  productCode: string
): Promise<Partial<Engine6LiveProductFields>> => {
  const commercial =
    await resolveEngine6ViatorProductCommercialExtract(productCode);
  return toLiveCommercialFields(commercial);
};

export const resolveEngine6ToursForProductSchema = async (
  tours: Engine6Tour[]
): Promise<Engine6Tour[]> =>
  Promise.all(
    tours.map(async tour => {
      const liveFields = await fetchEngine6LiveCommercialFieldsForSchema(
        tour.productCode
      );
      return resolveEngine6TourForProductSchema(tour, liveFields);
    })
  );

export { resolveEngine6ViatorProductCommercialExtract };
