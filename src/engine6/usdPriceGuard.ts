/**
 * Live Viator product payloads for non-US operators are often priced in the
 * supplier currency (JPY, KRW, …) while Engine6 always displays USD.
 * Treat a live amount as unusable for USD display when it is many times larger
 * than the known USD From$ reference (bundled fixture / listing starting price).
 */
export const shouldAcceptLiveAmountAsUsd = (
  liveAmount: number | null | undefined,
  usdReferenceAmount: number | null | undefined
): boolean => {
  if (
    typeof liveAmount !== "number" ||
    !Number.isFinite(liveAmount) ||
    liveAmount <= 0
  ) {
    return false;
  }

  if (
    typeof usdReferenceAmount !== "number" ||
    !Number.isFinite(usdReferenceAmount) ||
    usdReferenceAmount <= 0
  ) {
    return true;
  }

  return liveAmount / usdReferenceAmount < 8;
};

export const preferUsdCommercialPrice = <
  T extends { priceAmount: number | null; priceFormatted: string | null },
>(
  live: T,
  bundled: T | null | undefined
): T => {
  if (shouldAcceptLiveAmountAsUsd(live.priceAmount, bundled?.priceAmount)) {
    return live;
  }

  if (bundled && typeof bundled.priceAmount === "number") {
    return {
      ...live,
      priceAmount: bundled.priceAmount,
      priceFormatted: bundled.priceFormatted,
    };
  }

  return {
    ...live,
    priceAmount: null,
    priceFormatted: "Check latest price",
  };
};
