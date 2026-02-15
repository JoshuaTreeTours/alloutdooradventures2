import {
  tourEnrichmentById,
  type TourEnrichment,
} from "./generated/tourEnrichment.generated";

export { TourEnrichment };

export function getTourEnrichment(tourId: string): TourEnrichment | undefined {
  return tourEnrichmentById[tourId];
}
