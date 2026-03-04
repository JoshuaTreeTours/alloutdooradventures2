export const VIATOR_HERO_IMAGE_OVERRIDES: Record<string, string> = {
  "6740P7":
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/73/42/6d.jpg",
};

export const getViatorHeroImageOverride = (
  productCode?: string | null,
): string | undefined => {
  if (!productCode) {
    return undefined;
  }
  return VIATOR_HERO_IMAGE_OVERRIDES[productCode.toUpperCase()];
};
