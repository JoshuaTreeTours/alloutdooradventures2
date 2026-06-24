import {
  mergeEngine6LiveFieldsIntoEngine6Tour,
  type Engine6LiveProductFields,
} from "./liveProductFields";
import type { Engine6Tour } from "./types";

/**
 * Mirrors the commercial-field merge used by Engine6TourPage / CityTourDetailRoute
 * before buildEngine6SchemaGraph() emits Product JSON-LD.
 */
export const resolveEngine6TourForProductSchema = (
  tour: Engine6Tour,
  liveFields?: Partial<Engine6LiveProductFields>
): Engine6Tour => mergeEngine6LiveFieldsIntoEngine6Tour(tour, liveFields);
