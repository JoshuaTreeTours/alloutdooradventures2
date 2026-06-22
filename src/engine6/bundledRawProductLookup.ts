import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import { ENGINE6_VALIDATION_FIXTURES } from "./validationFixtures";

const fixtureByProductCode = new Map(
  ENGINE6_VALIDATION_FIXTURES.map(fixture => [
    fixture.productCode.trim().toUpperCase(),
    fixture,
  ])
);

const bundledRawProductByProductCode = new Map<string, Record<string, unknown>>();

export const getEngine6BundledRawProductByProductCode = (
  productCode: string | null | undefined
): Record<string, unknown> | null => {
  const normalizedProductCode = productCode?.trim().toUpperCase();
  if (!normalizedProductCode) {
    return null;
  }

  const cached = bundledRawProductByProductCode.get(normalizedProductCode);
  if (cached) {
    return cached;
  }

  const fixture = fixtureByProductCode.get(normalizedProductCode);
  if (!fixture) {
    return null;
  }

  const extraction = extractEngine6Product(fixture.rawPayload);
  const product = extraction.product;
  if (!product || typeof product !== "object") {
    return null;
  }

  bundledRawProductByProductCode.set(
    normalizedProductCode,
    product as Record<string, unknown>
  );
  return product as Record<string, unknown>;
};
