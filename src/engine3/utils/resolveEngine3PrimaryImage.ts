import { DEFAULT_ENGINE3_HERO_IMAGE_URL } from "../constants";
import {
  collectEngine3ImageCandidates,
  selectEngine3PrimaryImage,
} from "./selectEngine3PrimaryImage";

export const resolveEngine3PrimaryImage = (input: {
  productCode?: string;
  imageCandidates?: string[];
  fallbackImageUrl?: string;
}) => {
  const discoveredCandidates = collectEngine3ImageCandidates({
    viatorImageCandidates: input.imageCandidates,
  });

  const discoveredFromViator = selectEngine3PrimaryImage({
    viatorImageCandidates: input.imageCandidates,
    fallbackImageUrl: input.fallbackImageUrl,
  });

  const usedFallback =
    Boolean(input.fallbackImageUrl) &&
    Boolean(discoveredFromViator) &&
    discoveredCandidates.length === 0;

  if (!discoveredFromViator) {
    console.warn(
      `[engine3] Missing API image candidates for ${input.productCode ?? "unknown-product"}; using default fallback hero.`
    );
  } else if (usedFallback) {
    console.warn(
      `[engine3] API image array empty for ${input.productCode ?? "unknown-product"}; using fallback supplier image.`
    );
  }

  const heroImageUrl = discoveredFromViator ?? DEFAULT_ENGINE3_HERO_IMAGE_URL;

  const gallery = Array.from(
    new Set([
      ...discoveredCandidates,
      discoveredFromViator,
      input.fallbackImageUrl,
    ])
  ).filter((value): value is string => typeof value === "string" && value.length > 0);

  const secondaryImageUrl =
    gallery.find(image => image !== heroImageUrl) ??
    gallery[0] ??
    DEFAULT_ENGINE3_HERO_IMAGE_URL;

  return {
    primaryImageUrl: heroImageUrl,
    heroImageOverrideUrl: undefined,
    discoveredFromViator,
    secondaryImageUrl,
    gallery,
  };
};
