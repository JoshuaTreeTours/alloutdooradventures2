import { viatorTours } from "../data/viatorTours";
import { DEFAULT_ENGINE3_HERO_IMAGE_URL } from "../constants";
import {
  collectEngine3ImageCandidates,
  isRejectedCandidate,
  selectEngine3PrimaryImage,
} from "./selectEngine3PrimaryImage";

const cleanText = (value?: string | null): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const getHeroImageOverride = (productCode?: string): string | undefined => {
  if (!productCode) {
    return undefined;
  }

  const entry = viatorTours.find(
    tour => tour.viator.productCode.toUpperCase() === productCode.toUpperCase()
  );
  const override = cleanText(entry?.viator.heroImageOverrideUrl);

  if (!override || isRejectedCandidate(override)) {
    return undefined;
  }

  return override;
};

export const resolveEngine3PrimaryImage = (input: {
  productCode?: string;
  imageCandidates?: string[];
  fallbackImageUrl?: string;
}) => {
  const heroImageOverrideUrl = getHeroImageOverride(input.productCode);

  const discoveredCandidates = collectEngine3ImageCandidates({
    viatorImageCandidates: input.imageCandidates,
  });

  const discoveredFromViator = selectEngine3PrimaryImage({
    viatorImageCandidates: input.imageCandidates,
    fallbackImageUrl: input.fallbackImageUrl,
  });

  if (
    process.env.NODE_ENV !== "production" &&
    input.productCode &&
    discoveredCandidates.length === 0
  ) {
    console.warn(
      `[engine3] missing images for productCode=${input.productCode}`
    );
  }

  const heroImageUrl =
    discoveredFromViator ?? heroImageOverrideUrl ?? DEFAULT_ENGINE3_HERO_IMAGE_URL;

  const gallery = Array.from(
    new Set([
      ...discoveredCandidates,
      discoveredFromViator,
      heroImageOverrideUrl,
      input.fallbackImageUrl,
    ])
  ).filter((value): value is string => typeof value === "string" && value.length > 0);

  const secondaryImageUrl =
    gallery[1] && gallery[1] !== heroImageUrl
      ? gallery[1]
      : gallery.find(image => image !== heroImageUrl) ??
        gallery[0] ??
        DEFAULT_ENGINE3_HERO_IMAGE_URL;

  return {
    primaryImageUrl: heroImageUrl,
    heroImageOverrideUrl,
    discoveredFromViator,
    viatorImages: discoveredCandidates,
    secondaryImageUrl,
    gallery,
  };
};
