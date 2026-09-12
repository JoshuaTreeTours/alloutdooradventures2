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

type FareHarborPhase3Basis =
  | "standard-traveler-consensus"
  | "structured-adult"
  | "standard-ticket";

export type FareHarborPhase3Price = {
  startingPrice: number;
  currency: string;
  basis: FareHarborPhase3Basis;
  basisLabels: string[];
  confidence: "medium";
};

type JsonRecord = Record<string, unknown>;

type ParsedPricePreview = {
  currency: string;
  divisor: number;
  customerTypes: JsonRecord[];
};

type LabeledRate = {
  label: string;
  price: number;
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

// Phase 3 is based on the shadow audit rather than a broad fuzzy match. These
// are narrowly recognizable representations of an ordinary adult/standard
// admission that Phase 1 and Phase 2 intentionally did not accept.
const STRUCTURED_ADULT_LABEL =
  /^(?:adults|traveler\s*\|\s*adult\s*\|\s*ages?\s*\d+\s*\+)$/i;
const STANDARD_TICKET_LABEL =
  /^(?:\([A-Za-z0-9 _-]{1,12}\)\s*)?standard\s+ticket$/i;

const collectRatesMatching = (
  parsed: ParsedPricePreview,
  predicate: (label: string) => boolean,
): LabeledRate[] =>
  parsed.customerTypes
    .map(entry => {
      const label = labelOf(entry);
      const rawPrice = numberValue(entry.price);
      if (!predicate(label) || rawPrice === null || rawPrice <= 0) {
        return null;
      }
      return { label, price: rawPrice / parsed.divisor };
    })
    .filter((entry): entry is LabeledRate => Boolean(entry));

const collectQualifiedTravelerRates = (parsed: ParsedPricePreview) =>
  collectRatesMatching(parsed, isQualifiedTravelerLabel);

const consensusPrice = (rates: LabeledRate[]) => {
  if (!rates.length) return null;
  const pricesInCents = new Set(rates.map(entry => Math.round(entry.price * 100)));
  if (pricesInCents.size !== 1) return null;
  const price = rates[0].price;
  return Number.isFinite(price) && price > 0 ? price : null;
};

export const resolveHighConfidenceFareHarborPrice = (
  payload: unknown,
): FareHarborHighConfidencePrice | null => {
  const parsed = parsePricePreview(payload);
  if (!parsed) return null;

  const adultRates = collectRatesMatching(parsed, isQualifiedAdultLabel);
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

  const travelerRates = collectQualifiedTravelerRates(parsed);

  // A second production cohort should still be singular and explainable. If an
  // operator exposes multiple standard-looking traveler labels, hold it for a
  // later consensus phase rather than guessing which is canonical.
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

export const resolvePhase3FareHarborPrice = (
  payload: unknown,
): FareHarborPhase3Price | null => {
  if (
    resolveHighConfidenceFareHarborPrice(payload) ||
    resolvePhase2FareHarborPrice(payload)
  ) {
    return null;
  }

  const parsed = parsePricePreview(payload);
  if (!parsed) return null;

  // First retain the original Phase 3 idea: multiple distinct ordinary traveler
  // labels are safe only when every one of them quotes the same price.
  const travelerRates = collectQualifiedTravelerRates(parsed);
  const travelerLabels = Array.from(
    new Set(travelerRates.map(entry => entry.label.trim())),
  );
  if (travelerRates.length >= 2 && travelerLabels.length >= 2) {
    const startingPrice = consensusPrice(travelerRates);
    if (startingPrice !== null) {
      return {
        startingPrice,
        currency: parsed.currency,
        basis: "standard-traveler-consensus",
        basisLabels: travelerLabels.sort((a, b) => a.localeCompare(b)),
        confidence: "medium",
      };
    }
  }

  // The first live audit showed a small number of very explicit adult labels
  // such as "Adults" and "Traveler | Adult | Age 12+". They are admitted as a
  // separate explainable cohort, never by a generic "contains Adult" rule.
  const structuredAdultRates = collectRatesMatching(
    parsed,
    label => STRUCTURED_ADULT_LABEL.test(label.trim()),
  );
  if (structuredAdultRates.length) {
    const startingPrice = consensusPrice(structuredAdultRates);
    if (startingPrice !== null) {
      return {
        startingPrice,
        currency: parsed.currency,
        basis: "structured-adult",
        basisLabels: Array.from(
          new Set(structuredAdultRates.map(entry => entry.label.trim())),
        ).sort((a, b) => a.localeCompare(b)),
        confidence: "medium",
      };
    }
  }

  // Two audited operators prefix their ordinary Standard Ticket with a short
  // tour code. Accept only that exact semantic form; VIP, member, child, add-on,
  // upgrade and other ticket labels remain excluded.
  const standardTicketRates = collectRatesMatching(
    parsed,
    label => STANDARD_TICKET_LABEL.test(label.trim()),
  );
  if (standardTicketRates.length) {
    const startingPrice = consensusPrice(standardTicketRates);
    if (startingPrice !== null) {
      return {
        startingPrice,
        currency: parsed.currency,
        basis: "standard-ticket",
        basisLabels: Array.from(
          new Set(standardTicketRates.map(entry => entry.label.trim())),
        ).sort((a, b) => a.localeCompare(b)),
        confidence: "medium",
      };
    }
  }

  return null;
};
