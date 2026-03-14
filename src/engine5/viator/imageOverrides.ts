const engine5ExactProductHeroOverrides: Record<string, string> = {};

export const getEngine5ExactProductHeroOverride = (
  productCode: string
): string | undefined => {
  const normalizedCode = productCode.trim().toUpperCase();
  if (!normalizedCode) return undefined;
  return engine5ExactProductHeroOverrides[normalizedCode];
};
