import {
  DEFAULT_CURRENCY,
  PRICE_FLOOR_USD,
  PRICE_MIN_THRESHOLD_USD,
} from "../constants/merchantDefaults";

export const parsePrice = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value
    .trim()
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "");
  if (!normalized) {
    return null;
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

export const parseMerchantPriceCurrency = (
  value: unknown
): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const match = value.trim().match(/([A-Za-z]{3})\s*$/);
  return match ? match[1].toUpperCase() : null;
};

export const applyPriceFloor = (price: number | null): number => {
  if (price === null || !Number.isFinite(price) || price <= 0) {
    return PRICE_FLOOR_USD;
  }

  if (price < PRICE_MIN_THRESHOLD_USD) {
    return PRICE_FLOOR_USD;
  }

  return price;
};

const formatCleanMerchantAmount = (amount: number): string => {
  const roundedToCents = Math.round(amount * 100) / 100;
  return roundedToCents.toFixed(2).replace(/\.00$/, "");
};

export const formatMerchantPrice = (
  amount: number | null,
  currency: string
): string => {
  if (amount === null || !Number.isFinite(amount) || amount <= 0) {
    return "";
  }

  const normalizedCurrency = currency?.trim().toUpperCase() || DEFAULT_CURRENCY;
  return `${formatCleanMerchantAmount(amount)} ${normalizedCurrency}`;
};

/**
 * One commercial price label for the merchant feed, the website snapshot, and
 * Product JSON-LD parity. `189.5 USD` and `189.50 USD` are the same amount;
 * writers that stringify a JS number drop the trailing zero, while
 * formatMerchantPrice keeps cent precision.
 */
export const canonicalMerchantPriceLabel = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const currency = parseMerchantPriceCurrency(trimmed) ?? DEFAULT_CURRENCY;
  return formatMerchantPrice(parsePrice(trimmed), currency);
};
