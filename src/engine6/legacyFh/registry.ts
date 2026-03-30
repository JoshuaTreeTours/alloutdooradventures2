import type { Engine6Tour } from "../types";
import { centralParkBikeToursMigratedRecord } from "./fixtures/centralParkBikeTours";
import { mapLegacyFhRecordToEngine6Tour } from "./mapLegacyFhRecordToEngine6Tour";
import { miamiLegacyMigratedRecords } from "./fixtures/miamiLegacyBatch";
import type { LegacyFhMigratedProductRecord } from "./types";

export const legacyFhMigratedProductRecords: LegacyFhMigratedProductRecord[] = [
  centralParkBikeToursMigratedRecord,
  ...miamiLegacyMigratedRecords,
];

const legacyFhMigratedTourBySlug = new Map<string, Engine6Tour>(
  legacyFhMigratedProductRecords.map(record => [
    `${record.canonicalPath}`,
    mapLegacyFhRecordToEngine6Tour(record),
  ])
);

export const getLegacyFhMigratedTourBySlugs = (
  stateSlug: string,
  citySlug: string,
  tourSlug: string
) =>
  legacyFhMigratedTourBySlug.get(
    `/destinations/${stateSlug}/${citySlug}/tours/${tourSlug}`
  ) ?? null;
