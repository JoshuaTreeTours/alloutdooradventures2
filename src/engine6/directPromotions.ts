export type Engine6DirectPromotion = {
  productCode: string;
  canonicalPath: string;
};

export const ENGINE6_DIRECT_PROMOTIONS: readonly Engine6DirectPromotion[] = [
  {
    productCode: "6740JTREE",
    canonicalPath:
      "/destinations/california/palm-springs/tours/joshua-tree-hummer-adventure-from-palm-desert-6740jtree",
  },
] as const;

const directPromotionPathByProductCode = new Map(
  ENGINE6_DIRECT_PROMOTIONS.map(promotion => [
    promotion.productCode.toUpperCase(),
    promotion.canonicalPath,
  ])
);

const directPromotionProductCodeByPath = new Map(
  ENGINE6_DIRECT_PROMOTIONS.map(promotion => [
    promotion.canonicalPath,
    promotion.productCode.toUpperCase(),
  ])
);

export const ENGINE6_DIRECT_PROMOTION_PRODUCT_CODES =
  ENGINE6_DIRECT_PROMOTIONS.map(promotion =>
    promotion.productCode.toUpperCase()
  );

export const resolveEngine6DirectPromotionPathForProductCode = (
  productCode: string | null | undefined
) => {
  const normalized = productCode?.trim().toUpperCase();
  return normalized ? directPromotionPathByProductCode.get(normalized) ?? null : null;
};

export const resolveEngine6DirectPromotionProductCodeForPath = (
  path: string
) => directPromotionProductCodeByPath.get(path) ?? null;

export const isEngine6DirectPromotionPath = (path: string) =>
  directPromotionProductCodeByPath.has(path);
