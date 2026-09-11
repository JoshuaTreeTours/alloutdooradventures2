export type FareHarborHighConfidencePrice = {
  startingPrice: number;
  currency: string;
  basis: "adult";
  basisLabel: string;
};

export type FareHarborPhase2Price = {
  startingPrice: number;
  currency: string;
  basis: "standard-traveler";
  basisLabel: string;
  confidence: "medium";
};

type JsonRecord = Record<string, unknown>;

type ParsedPricePreview = {
  currency: string;
  divisor: number;
  customerTypes: JsonRecord[];
};

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

const parsePricePreview = (payload: unknown): ParsedPricePreview | null => {
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

  return { currency, divisor, customerTypes };
};

// Phase 1 is deliberately conservative. We admit only a plain Adult customer
// type (optionally with an age qualifier) and reject modifiers such as Extra,
// Member, Resident, Upgrade, Group, BOGO, deck/class choices, rentals, etc.
const STANDARD_ADULT_LABEL =
  /^(?:one\s+)?adult(?:\s*(?:\(\s*\d+\s*\+?\s*\)|[,\-]?\s*\d+\s*\+))?$/i;

const isQualifiedAdultLabel = (label: string) =>
  STANDARD_ADULT_LABEL.test(label.trim());

// Phase 2 stays narrow but deliberately recovers standard traveler labels that
// FareHarbor operators use instead of Adult. Anchoring the expression prevents
// discounted, local, member, upgrade, equipment, and group variants from being
// mistaken for the base commercial price.
const STANDARD_TRAVELER_LABEL =
  /^(?:one\s+)?(?:person|participant|guest|visitor|travell?er|passenger|rider|general\s+admission|admission|ticket)(?:\s*(?:\(\s*\d+\s*\+?\s*\)|[,\-]?\s*\d+\s*\+))?$/i;

const isQualifiedTravelerLabel = (label: string) =>
  STANDARD_TRAVELER_LABEL.test(label.trim());

export const resolveHighConfidenceFareHarborPrice = (
  payload: unknown,
): FareHarborHighConfidencePrice | null => {
  const parsed = parsePricePreview(payload);
  if (!parsed) return null;

  const adultRates = parsed.customerTypes
    .map(entry => {
      const label = labelOf(entry);
      const rawPrice = numberValue(entry.price);
      if (!isQualifiedAdultLabel(label) || rawPrice === null || rawPrice <= 0) {
        return null;
      }
      return {
        label,
        price: rawPrice / parsed.divisor,
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
    currency: parsed.currency,
    basis: "adult",
    basisLabel: winner.label,
  };
};

export const resolvePhase2FareHarborPrice = (
  payload: unknown,
): FareHarborPhase2Price | null => {
  // Phase 2 is incremental by definition. Anything already accepted by Phase 1
  // remains in the high-confidence production cohort and must not be duplicated.
  if (resolveHighConfidenceFareHarborPrice(payload)) return null;

  const parsed = parsePricePreview(payload);
  if (!parsed) return null;

  const travelerRates = parsed.customerTypes
    .map(entry => {
      const label = labelOf(entry);
      const rawPrice = numberValue(entry.price);
      if (
        !isQualifiedTravelerLabel(label) ||
        rawPrice === null ||
        rawPrice <= 0
      ) {
        return null;
      }
      return {
        label,
        price: rawPrice / parsed.divisor,
      };
    })
    .filter((entry): entry is { label: string; price: number } => Boolean(entry));

  // A second production cohort should still be singular and explainable. If an
  // operator exposes multiple standard-looking traveler labels, hold it for a
  // later manual or operator-aware phase rather than guessing which is canonical.
  if (travelerRates.length !== 1) return null;

  const winner = travelerRates[0];
  if (!Number.isFinite(winner.price) || winner.price <= 0) return null;

  return {
    startingPrice: winner.price,
    currency: parsed.currency,
    basis: "standard-traveler",
    basisLabel: winner.label,
    confidence: "medium",
  };
};
