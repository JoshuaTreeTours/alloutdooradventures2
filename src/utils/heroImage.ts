const INVALID_IMAGE_PATTERNS = [
  "no-image",
  "placeholder",
  "default-image",
  "image-not-available",
];

const clean = (value?: string | null) => (value ?? "").trim();

const looksInvalid = (value?: string | null) => {
  const normalized = clean(value).toLowerCase();
  if (!normalized) {
    return true;
  }

  return INVALID_IMAGE_PATTERNS.some(pattern => normalized.includes(pattern));
};

const toImageCandidates = (tour: unknown): Array<string | undefined> => {
  if (!tour || typeof tour !== "object") {
    return [];
  }

  const record = tour as Record<string, unknown>;
  const nestedImages = Array.isArray(record.images)
    ? record.images
    : Array.isArray((record.images as { gallery?: unknown })?.gallery)
      ? ((record.images as { gallery: unknown[] }).gallery as unknown[])
      : [];

  return [
    record.image,
    record.image_url,
    record.primaryImage,
    record.heroImage,
    ...nestedImages,
    record.ogImage,
    (record.seo as { ogImage?: unknown } | undefined)?.ogImage,
  ].filter((value): value is string => typeof value === "string");
};

export const pickBestHeroImageFromTours = (
  tours: unknown[],
  options?: { minCount?: number }
): string | null => {
  const minCount = Math.max(1, options?.minCount ?? 1);
  if (!Array.isArray(tours) || tours.length < minCount) {
    return null;
  }

  for (const tour of tours) {
    const match = toImageCandidates(tour).find(candidate => !looksInvalid(candidate));
    if (match) {
      return clean(match);
    }
  }

  return null;
};
