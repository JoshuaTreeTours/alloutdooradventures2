import { isRejectedCandidate } from "./selectEngine3PrimaryImage";

type ResolveEngine3ViatorHeroInput = {
  bookingProvider?: "viator";
  tourId: string;
  primaryImageUrl?: string;
  heroImageOverrideUrl?: string;
};

const cleanText = (value?: string): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const resolveEngine3ViatorHero = (
  input: ResolveEngine3ViatorHeroInput
): string | undefined => {
  if (input.bookingProvider !== "viator") {
    return (
      cleanText(input.primaryImageUrl) ?? cleanText(input.heroImageOverrideUrl)
    );
  }

  const candidates = [
    cleanText(input.heroImageOverrideUrl),
    cleanText(input.primaryImageUrl),
  ].filter((value): value is string => Boolean(value));

  const hero = candidates.find(candidate => !isRejectedCandidate(candidate));

  if (!hero) {
    console.warn(
      `[engine3] Missing render-safe Viator hero for ${input.tourId}`
    );
  }

  return hero;
};
