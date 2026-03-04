import type { ViatorProductData } from "../types";
import {
  collectEngine3ImageCandidates,
  selectEngine3PrimaryImage,
} from "./selectEngine3PrimaryImage";
import { pickViatorPrimaryImage } from "./viatorImages";

export const resolveEngine3PrimaryImage = (input: {
  productCode?: string;
  imageCandidates?: string[];
  fallbackImageUrl?: string;
}) => {
  const productStub: Partial<ViatorProductData> = {
    productCode: input.productCode,
    imageCandidates: input.imageCandidates,
    supplierImage: input.fallbackImageUrl,
  };

  const picked = pickViatorPrimaryImage(productStub);
  const discoveredCandidates = collectEngine3ImageCandidates({
    viatorImageCandidates: input.imageCandidates,
  });

  const discoveredFromViator =
    picked.heroUrl ??
    selectEngine3PrimaryImage({
      viatorImageCandidates: input.imageCandidates,
      fallbackImageUrl: input.fallbackImageUrl,
    });

  if (!discoveredFromViator) {
    console.warn(
      `[engine3] Missing API image candidates for ${input.productCode ?? "unknown-product"}; no hero image will be rendered.`
    );
  }

  const gallery = Array.from(
    new Set([
      discoveredFromViator,
      picked.cardUrl,
      ...discoveredCandidates,
      input.fallbackImageUrl,
    ])
  ).filter((value): value is string => typeof value === "string" && value.length > 0);

  const secondaryImageUrl =
    gallery.find(image => image !== discoveredFromViator) ?? gallery[0];

  return {
    primaryImageUrl: discoveredFromViator,
    heroImageOverrideUrl: undefined,
    discoveredFromViator,
    secondaryImageUrl,
    gallery,
  };
};
