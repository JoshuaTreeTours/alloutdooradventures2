export const EXCLUDED_PRODUCT_CODES = [
  "36001P1",
  "fh-central-park-bike-tours-16628",
  "44152P18",
  "5559561P1",
  "5765P7",
  "5396BOEING",
  "6021MBA",
  "118744P4",
  "191303P1",
  "9345P1",
  "3454P57",
  "463268P4",
  "52661P41",
  "5603847P4",
  "5639875P7",
] as const;

/** Active tour pages may remain published; these codes must not ship in merchantFeed.csv. */
export const MERCHANT_FEED_EXCLUDED_PRODUCT_CODES = [] as const;

const EXCLUDED_PRODUCT_CODE_SET = new Set<string>(
  EXCLUDED_PRODUCT_CODES.map(productCode => productCode.toUpperCase())
);

const MERCHANT_FEED_EXCLUDED_PRODUCT_CODE_SET = new Set<string>(
  MERCHANT_FEED_EXCLUDED_PRODUCT_CODES.map(productCode =>
    productCode.toUpperCase()
  )
);

export const isExcludedProductCode = (productCode?: string | null): boolean =>
  Boolean(productCode) &&
  EXCLUDED_PRODUCT_CODE_SET.has(productCode!.toUpperCase());

export const isMerchantFeedExcludedProductCode = (
  productCode?: string | null
): boolean =>
  Boolean(productCode) &&
  MERCHANT_FEED_EXCLUDED_PRODUCT_CODE_SET.has(productCode!.toUpperCase());
