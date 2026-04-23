export const EXCLUDED_PRODUCT_CODES = ["36001P1"] as const;

const EXCLUDED_PRODUCT_CODE_SET = new Set<string>(EXCLUDED_PRODUCT_CODES);

export const isExcludedProductCode = (productCode?: string | null): boolean =>
  Boolean(productCode) && EXCLUDED_PRODUCT_CODE_SET.has(productCode!.toUpperCase());
