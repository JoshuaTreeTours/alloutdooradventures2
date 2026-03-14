import type { Tour } from "../../data/tours.types";
import { engine5ViatorRecords } from "./records";
import { resolveEngine5Tour } from "./resolveEngine5Tour";

export const getEngine5RecordsByCity = (stateSlug: string, citySlug: string) =>
  engine5ViatorRecords.filter(
    record =>
      record.destination.stateSlug === stateSlug &&
      record.destination.citySlug === citySlug
  );

export const isEngine5CanonicalTourSlug = (
  stateSlug: string,
  citySlug: string,
  tourSlug: string
) =>
  getEngine5RecordsByCity(stateSlug, citySlug).find(record =>
    tourSlug.endsWith(`-${record.productCode.toLowerCase()}`)
  );

export const getEngine5LiveListingsByCity = async (
  stateSlug: string,
  citySlug: string
): Promise<Array<{ tour: Tour; href: string }>> => {
  const records = getEngine5RecordsByCity(stateSlug, citySlug);
  if (!records.length) return [];

  const mapped = await Promise.all(
    records.map(async record => {
      const resolved = await resolveEngine5Tour(record);
      return {
        tour: resolved.listing,
        href: resolved.page.canonicalPath,
      };
    })
  );

  return mapped;
};
