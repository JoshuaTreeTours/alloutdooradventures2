const cleanText = (value?: string | null): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const resolveEngine3ViatorHero = (input: {
  bookingProvider?: "viator" | "fareharbor";
  heroImageOverrideUrl?: string;
  contentImages?: string[];
}): string | null => {
  if (input.bookingProvider !== "viator") {
    return cleanText(input.heroImageOverrideUrl) ?? cleanText(input.contentImages?.[0]) ?? null;
  }

  return cleanText(input.heroImageOverrideUrl) ?? cleanText(input.contentImages?.[0]) ?? null;
};
