import type { Engine6Tour } from "../types";
import { centralParkBikeToursMigratedRecord } from "./fixtures/centralParkBikeTours";
import { fortLauderdaleEBikeMigratedRecord } from "./fixtures/fortLauderdaleEBike";
import { mapLegacyFhRecordToEngine6Tour } from "./mapLegacyFhRecordToEngine6Tour";
import type { LegacyFhMigratedProductRecord } from "./types";

export const legacyFhMigratedProductRecords: LegacyFhMigratedProductRecord[] = [
  centralParkBikeToursMigratedRecord,
  fortLauderdaleEBikeMigratedRecord,
];

export const legacyFhMigratedTours: Engine6Tour[] =
  legacyFhMigratedProductRecords.map(mapLegacyFhRecordToEngine6Tour);

const legacyFhMigratedTourByCanonicalPath = new Map<string, Engine6Tour>(
  legacyFhMigratedTours.map(tour => [tour.canonicalPath, tour])
);

export const getLegacyFhMigratedTourBySlugs = (
  stateSlug: string,
  citySlug: string,
  tourSlug: string
) =>
  legacyFhMigratedTourByCanonicalPath.get(
    `/destinations/${stateSlug}/${citySlug}/tours/${tourSlug}`
  ) ?? null;

export const getLegacyFhMigratedTourByCanonicalPath = (canonicalPath: string) =>
  legacyFhMigratedTourByCanonicalPath.get(canonicalPath) ?? null;
