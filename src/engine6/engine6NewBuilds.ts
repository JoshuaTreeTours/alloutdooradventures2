import { ENGINE6_VALIDATION_FIXTURES } from "./validationFixtures";

export const ENGINE6_NEW_BUILD_PRODUCT_CODES = new Set(
  ENGINE6_VALIDATION_FIXTURES.filter(
    fixture => fixture.validationRules?.itineraryOriginalityForNewBuilds
  ).map(fixture => fixture.productCode.trim().toUpperCase())
);

export const isEngine6NewBuildProductCode = (
  productCode: string | null | undefined
) => {
  const normalized = productCode?.trim().toUpperCase();
  return normalized ? ENGINE6_NEW_BUILD_PRODUCT_CODES.has(normalized) : false;
};
