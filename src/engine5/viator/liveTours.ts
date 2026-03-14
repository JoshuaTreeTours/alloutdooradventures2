import type { Tour } from "../../data/tours.types";
import { getEngine5ViatorTourData } from "./getEngine5ViatorTourData";
import { mapViatorToEngine5Tour } from "./mapViatorToEngine5Tour";
import { engine5ViatorRecords } from "./records";

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
      const apiTour = await getEngine5ViatorTourData(record.productCode);
      const normalized = mapViatorToEngine5Tour(record, apiTour);
      return {
        tour: normalized.listing,
        href: normalized.page.canonicalPath,
      };
    })
  );

  return mapped;
};
