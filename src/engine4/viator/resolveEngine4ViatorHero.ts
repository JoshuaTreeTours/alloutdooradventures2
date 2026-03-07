import { engine4ViatorTours } from "../data/viatorTours";
import type { Engine4ViatorApiTour } from "../types";
import { selectEngine4ViatorImage } from "./selectEngine4ViatorImage";

export const resolveEngine4ViatorHero = (input: {
  productCode: string;
  apiTour?: Engine4ViatorApiTour;
}) => {
  const normalizedCode = input.productCode.toUpperCase();
  const tourRecord = engine4ViatorTours.find(
    tour => tour.productCode.toUpperCase() === normalizedCode
  );

  const selection = selectEngine4ViatorImage({
    productCode: normalizedCode,
    apiTour: input.apiTour,
    recordHeroImage: tourRecord?.heroImage,
  });

  if (selection.selected) {
    return selection.selected;
  }

  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    throw new Error(
      `Engine4 image selection failed for ${normalizedCode}: ${JSON.stringify(selection.rejected)}`
    );
  }

  return "";
};
