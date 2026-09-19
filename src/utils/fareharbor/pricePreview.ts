export type FareHarborHighConfidencePrice = {
  startingPrice: number;
  currency: string;
  basis: "adult";
  basisLabel: string;
};

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const numberValue = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const labelOf = (record: JsonRecord) => {
  for (const key of ["singular", "name", "label", "title", "plural"]) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
};

// Phase 1 is deliberately conservative. We admit only a plain Adult customer
// type (optionally with an age qualifier) and reject modifiers such as Extra,
// Member, Resident, Upgrade, Group, BOGO, deck/class choices, rentals, etc.
const STANDARD_ADULT_LABEL = /^(?:one\s+)?adult(?:\s*(?:\(\s*\d+\s*\+?\s*\)|[,\-]?\s*\d+\s*\+))?$/i;

const isQualifiedAdultLabel = (label: string) =>
  STANDARD_ADULT_LABEL.test(label.trim());

export const resolveHighConfidenceFareHarborPrice = (
  payload: unknown,
): FareHarborHighConfidencePrice | null => {
  if (!isRecord(payload)) return null;

  const details = isRecord(payload.details) ? payload.details : {};
  const currency =
    typeof details.currency === "string"
      ? details.currency.trim().toUpperCase()
      : "";
  if (!/^[A-Z]{3}$/.test(currency)) return null;

  const decimalPlaces = numberValue(details.currency_decimal_places) ?? 2;
  if (decimalPlaces < 0 || decimalPlaces > 4) return null;
  const divisor = 10 ** decimalPlaces;

  const items = Array.isArray(payload.items)
    ? payload.items.filter(isRecord)
    : [];
  if (items.length !== 1) return null;

  const price = isRecord(items[0].price) ? items[0].price : null;
  if (!price) return null;

  const breakdown = isRecord(price.breakdown) ? price.breakdown : null;
  if (!breakdown) return null;

  const customerTypes = Array.isArray(breakdown.customer_types)
    ? breakdown.customer_types.filter(isRecord)
    : [];
  if (!customerTypes.length) return null;

  const adultRates = customerTypes
    .map(entry => {
      const label = labelOf(entry);
      const rawPrice = numberValue(entry.price);
      if (!isQualifiedAdultLabel(label) || rawPrice === null || rawPrice <= 0) {
        return null;
      }
      return {
        label,
        price: rawPrice / divisor,
      };
    })
    .filter((entry): entry is { label: string; price: number } => Boolean(entry));

  if (!adultRates.length) return null;

  const winner = adultRates.reduce((best, current) =>
    current.price < best.price ? current : best,
  );

  if (!Number.isFinite(winner.price) || winner.price <= 0) return null;

  return {
    startingPrice: winner.price,
    currency,
    basis: "adult",
    basisLabel: winner.label,
  };
};
