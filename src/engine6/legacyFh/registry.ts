import type { Engine6Tour } from "../types";
import { isExcludedProductCode } from "../../data/excludedProductCodes";
import { centralParkBikeToursMigratedRecord } from "./fixtures/centralParkBikeTours";
import { mapLegacyFhRecordToEngine6Tour } from "./mapLegacyFhRecordToEngine6Tour";
import type { LegacyFhMigratedProductRecord } from "./types";

export const legacyFhMigratedProductRecords: LegacyFhMigratedProductRecord[] = [
  centralParkBikeToursMigratedRecord,
];

export const legacyFhMigratedTours: Engine6Tour[] =
  legacyFhMigratedProductRecords
    .map(mapLegacyFhRecordToEngine6Tour)
    .filter(tour => !isExcludedProductCode(tour.productCode));

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
