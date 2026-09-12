import editorialRegistry from "./fareharborEditorial.generated.json";
import type { Tour } from "./tours.types";
import { getFareharborItemFromUrl } from "../lib/fareharbor";
import type { FareHarborEditorialEntry } from "../utils/fh/buildFareHarborEditorial";

type FareHarborEditorialRegistry = {
  generatedAt: string | null;
  summary: {
    total: number;
    sourceBacked: number;
    metadataFallback: number;
    content200: number;
    contentOther: number;
  };
  items: Record<string, FareHarborEditorialEntry>;
};

const registry = editorialRegistry as FareHarborEditorialRegistry;

export const getFareHarborEditorialRegistrySummary = () => registry.summary;

export const getFareHarborEditorialByKey = (key: string) =>
  registry.items[key] ?? null;

export const getFareHarborEditorialForBookingUrl = (bookingUrl?: string) => {
  const ref = getFareharborItemFromUrl(bookingUrl);
  if (!ref) return null;
  return getFareHarborEditorialByKey(`${ref.companyShortname}:${ref.itemId}`);
};

export const applyFareHarborEditorialToTour = (tour: Tour): Tour => {
  if (tour.bookingProvider !== "fareharbor" || tour.engine === "engine6") {
    return tour;
  }

  const editorial = getFareHarborEditorialForBookingUrl(tour.bookingUrl);
  if (!editorial) return tour;

  return {
    ...tour,
    shortDescription: editorial.metaDescription,
    longDescription: editorial.overview,
    content: {
      ...tour.content,
      overview: editorial.overview,
      highlights: editorial.highlights,
    },
  };
};
