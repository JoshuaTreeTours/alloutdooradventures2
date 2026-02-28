import { viatorTours } from "../data/viatorTours";
import { DEFAULT_ENGINE3_HERO_IMAGE_URL } from "../constants";
import {
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

  const selectedImage = selectEngine3PrimaryImage({
    viatorImageCandidates: input.imageCandidates,
    fallbackImageUrl: input.fallbackImageUrl,
  });

  const primaryImageUrl =
    heroImageOverrideUrl ?? selectedImage ?? DEFAULT_ENGINE3_HERO_IMAGE_URL;

  return {
    primaryImageUrl,
    heroImageOverrideUrl,
  };
};
