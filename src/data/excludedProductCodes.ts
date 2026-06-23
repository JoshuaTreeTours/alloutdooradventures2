export const EXCLUDED_PRODUCT_CODES = [
  "36001P1",
  "fh-central-park-bike-tours-16628",
] as const;

const EXCLUDED_PRODUCT_CODE_SET = new Set<string>(
  EXCLUDED_PRODUCT_CODES.map(productCode => productCode.toUpperCase())
);

export const isExcludedProductCode = (productCode?: string | null): boolean =>
  Boolean(productCode) &&
  EXCLUDED_PRODUCT_CODE_SET.has(productCode!.toUpperCase());
