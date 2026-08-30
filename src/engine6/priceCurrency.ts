const ISO_CURRENCY = /^[A-Z]{3}$/;

const NON_USD_AMOUNT_PATTERN =
  /¥|€|£|฿|\bJPY\b|\bEUR\b|\bGBP\b|\bKRW\b|\bCNY\b|\bTHB\b/i;

export const normalizeIsoCurrency = (
  value: string | null | undefined
): string | null => {
  const normalized = value?.trim().toUpperCase() ?? "";
  if (!ISO_CURRENCY.test(normalized)) {
    return null;
  }
  return normalized;
};

export const isUsdCurrency = (
  value: string | null | undefined
): boolean => normalizeIsoCurrency(value) === "USD";

export const formattedPriceLooksNonUsd = (
  value: string | null | undefined
): boolean => {
  const formatted = value?.trim() ?? "";
  if (!formatted) {
    return false;
  }
  if (/\$|\bUSD\b/i.test(formatted)) {
    return false;
  }
  return NON_USD_AMOUNT_PATTERN.test(formatted);
};

/**
 * Engine6 listing/cards may only claim USD when the amount is a USD commercial
 * price (merchant-feed snapshot or an extracted USD source). Never label a
 * local Viator amount such as JPY as USD.
 */
export const isUsdCommercialSource = (source: {
  priceCurrency?: string | null;
  priceFormatted?: string | null;
}): boolean => {
  const currency = normalizeIsoCurrency(source.priceCurrency);
  if (currency && currency !== "USD") {
    return false;
  }
  if (formattedPriceLooksNonUsd(source.priceFormatted)) {
    return false;
  }
  return true;
};

export const shouldApplyLivePriceAsUsd = (live: {
  priceAmount?: number | null;
  priceFormatted?: string | null;
  priceCurrency?: string | null;
}): boolean => isUsdCommercialSource(live);

/**
 * Reject a live amount that is orders of magnitude larger than an existing USD
 * commercial price. Typical JPY/USD ratios are ~100–160x; a 20x jump on the
 * same product is treated as a local-currency amount, not a real USD change.
 */
export const looksLikeCurrencyMismatch = (
  existingUsdAmount: number | null | undefined,
  liveAmount: number | null | undefined
): boolean => {
  if (
    typeof existingUsdAmount !== "number" ||
    typeof liveAmount !== "number" ||
    existingUsdAmount <= 0 ||
    liveAmount <= 0
  ) {
    return false;
  }

  return liveAmount / existingUsdAmount >= 20;
};

export type Engine6ListingPriceFields = {
  startingPrice: number | undefined;
  currency: "USD" | undefined;
  priceFrom: string | undefined;
};

export const resolveEngine6ListingPriceFields = (tour: {
  priceAmount: number | null;
  priceFormatted: string;
  priceCurrency?: string | null;
}): Engine6ListingPriceFields => {
  if (!isUsdCommercialSource(tour)) {
    return {
      startingPrice: undefined,
      currency: undefined,
      priceFrom: undefined,
    };
  }

  return {
    startingPrice: tour.priceAmount ?? undefined,
    currency: "USD",
    priceFrom: tour.priceFormatted,
  };
};
