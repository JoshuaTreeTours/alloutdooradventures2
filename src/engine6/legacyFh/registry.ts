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
