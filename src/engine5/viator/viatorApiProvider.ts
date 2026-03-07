import {
  engine5ViatorApiFallbackByProductCode,
  engine5ViatorTours,
} from "../data/viatorTours";
import type { Engine5ViatorApiTour, Engine5ViatorTourRecord } from "../types";

export const getEngine5ViatorRecordByCode = (
  productCode: string
): Engine5ViatorTourRecord | undefined =>
  engine5ViatorTours.find(
    entry => entry.productCode.toUpperCase() === productCode.toUpperCase()
  );

export const getEngine5ViatorApiFacts = (
  productCode: string
): Engine5ViatorApiTour | undefined => {
  const normalized = productCode.trim().toUpperCase();
  const facts = engine5ViatorApiFallbackByProductCode[normalized];

  if (facts) {
    console.info(`[engine5-api] product=${normalized}`);
    console.info("[engine5-api] factSource=api");
  }

  return facts;
};
