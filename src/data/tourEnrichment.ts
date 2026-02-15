import tourEnrichmentCsv from "../../data/tourEnrichment.csv?raw";

export type TourEnrichment = {
  ratingValue?: number;
  ratingCount?: number;
  price?: number;
  currency?: string;
};

const toNumber = (value: string | undefined): number | undefined => {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export function loadTourEnrichment(): Record<string, TourEnrichment> {
  const rows = tourEnrichmentCsv
    .trim()
    .split("\n")
    .map(row => row.trim())
    .filter(Boolean);

  if (rows.length <= 1) {
    return {};
  }

  const [, ...data] = rows;

  return data.reduce(
    (acc, row) => {
      const [tourId, ratingValue, ratingCount, price, currency] = row
        .split(",")
        .map(field => field.trim());

      if (!tourId) {
        return acc;
      }

      acc[tourId] = {
        ratingValue: toNumber(ratingValue),
        ratingCount: toNumber(ratingCount),
        price: toNumber(price),
        currency: currency || undefined,
      };

      return acc;
    },
    {} as Record<string, TourEnrichment>
  );
}
