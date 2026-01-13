export const IMAGE_ROOT = "/images";
export const PLACEHOLDER_IMAGE = `${IMAGE_ROOT}/placeholder.webp`;

export const normalizeImagePath = (
  path?: string | null,
  fallback: string = PLACEHOLDER_IMAGE
) => {
  const trimmed = path?.trim();

  if (
    trimmed &&
    trimmed.startsWith(`${IMAGE_ROOT}/`) &&
    trimmed !== PLACEHOLDER_IMAGE
  ) {
    return trimmed;
  }

  return fallback;
};

export const buildStateHeroImage = (stateSlug: string) =>
  `${IMAGE_ROOT}/states/${stateSlug}.webp`;

export const buildCityHeroImages = (
  stateSlug: string,
  citySlug: string,
  count = 3
) =>
  Array.from({ length: count }, (_, index) => {
    const imageIndex = index + 1;
    return `${IMAGE_ROOT}/cities/${stateSlug}/${citySlug}-${imageIndex}.webp`;
  });

export const normalizeImageArray = (
  paths: string[] | undefined,
  fallbackImages: string[]
) => {
  const normalized = (paths ?? []).map((path, index) =>
    normalizeImagePath(path, fallbackImages[index] ?? PLACEHOLDER_IMAGE)
  );

  if (normalized.length > 0) {
    return normalized;
  }

  return fallbackImages.length > 0 ? fallbackImages : [PLACEHOLDER_IMAGE];
};

export const buildBackgroundImageStyle = (path?: string | null) => {
  const safePath = normalizeImagePath(path);

  return {
    backgroundImage: `url(${safePath}), url(${PLACEHOLDER_IMAGE})`,
  } as const;
};
