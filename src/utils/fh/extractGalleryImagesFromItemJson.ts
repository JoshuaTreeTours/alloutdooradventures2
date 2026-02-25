import type { FHItem, FHItemImage } from "./fetchFareHarborItemJson";

const toHttps = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("http://")) {
    return `https://${trimmed.slice("http://".length)}`;
  }

  return null;
};

const pickImageUrl = (image: FHItemImage): string | null => {
  const candidates = [
    image.large,
    image.full,
    image.original,
    image.secure_url,
    image.url,
    image.src,
    image.medium,
    image.thumb,
  ];

  for (const candidate of candidates) {
    const normalized = toHttps(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return null;
};

export const extractGalleryImagesFromItemJson = (
  item: FHItem | null
): string[] => {
  if (!item || typeof item !== "object") {
    return [];
  }

  const source = Array.isArray(item.images)
    ? item.images
    : Array.isArray(item.gallery)
      ? item.gallery
      : [];

  const unique = new Set<string>();

  for (const image of source) {
    if (!image || typeof image !== "object") {
      continue;
    }

    const url = pickImageUrl(image as FHItemImage);
    if (url) {
      unique.add(url);
    }
  }

  return Array.from(unique);
};
