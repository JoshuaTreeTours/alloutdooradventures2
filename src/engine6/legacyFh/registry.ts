import type { Engine6Tour } from "../types";
import { centralParkBikeToursMigratedRecord } from "./fixtures/centralParkBikeTours";
import { mapLegacyFhRecordToEngine6Tour } from "./mapLegacyFhRecordToEngine6Tour";
import {
  sanDiegoWhaleWatchingCruise60603MigratedRecord,
} from "./fixtures/sanDiegoWhaleWatchingCruise60603";
import type { LegacyFhMigratedProductRecord } from "./types";

export const legacyFhMigratedProductRecords: LegacyFhMigratedProductRecord[] = [
  centralParkBikeToursMigratedRecord,
  sanDiegoWhaleWatchingCruise60603MigratedRecord,
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
