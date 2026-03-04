import { DEFAULT_ENGINE3_HERO_IMAGE_URL } from "../constants";

const cleanText = (value?: string | null): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const resolveEngine3ViatorHero = (input: {
  bookingProvider?: "viator" | "fareharbor";
  viatorPrimaryImageUrl?: string;
  contentImages?: string[];
  heroImageOverrideUrl?: string;
  fallbackImageUrl?: string;
  productCode?: string;
}): string | null => {
  const provider = input.bookingProvider ?? "viator";

  const resolved =
    provider === "viator"
      ? cleanText(input.viatorPrimaryImageUrl) ??
        cleanText(input.contentImages?.[0]) ??
        cleanText(input.heroImageOverrideUrl)
      : cleanText(input.heroImageOverrideUrl) ?? cleanText(input.contentImages?.[0]);

  if (resolved) {
    return resolved;
  }

  const fallback =
    cleanText(input.fallbackImageUrl) ??
    cleanText(input.contentImages?.[0]) ??
    DEFAULT_ENGINE3_HERO_IMAGE_URL;

  console.warn(
    `[engine3] Falling back to default hero image for ${provider} tour${
      input.productCode ? ` ${input.productCode}` : ""
    }`
  );

  return fallback;
};
