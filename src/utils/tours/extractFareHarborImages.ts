import { cleanImageUrls } from "../cleanImageUrls";

type FareHarborImageLike = {
  url?: unknown;
  src?: unknown;
  image?: unknown;
  imageUrl?: unknown;
};

type FareHarborItemLike = {
  imageUrls?: unknown;
  images?: unknown;
  gallery?: unknown;
  sliderImages?: unknown;
};

const toStringUrl = (value: unknown) =>
  typeof value === "string" ? value : undefined;

const collectArrayUrls = (input: unknown): string[] => {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.flatMap(item => {
    if (typeof item === "string") {
      return [item];
    }

    if (item && typeof item === "object") {
      const image = item as FareHarborImageLike;
      return [image.url, image.src, image.image, image.imageUrl]
        .map(toStringUrl)
        .filter((url): url is string => Boolean(url));
    }

    return [];
  });
};

export const extractFareHarborGalleryImages = (
  fhItem: FareHarborItemLike | null | undefined
): string[] => {
  if (!fhItem) {
    return [];
  }

  const candidates = [
    ...collectArrayUrls(fhItem.imageUrls),
    ...collectArrayUrls(fhItem.gallery),
    ...collectArrayUrls(fhItem.sliderImages),
    ...collectArrayUrls(fhItem.images),
  ];

  return cleanImageUrls(candidates, 20).filter(url => /^https:\/\//i.test(url));
};

export const selectSecondaryImage = (
  heroUrl: string | null | undefined,
  galleryUrls: string[]
): string | null => {
  const hero = cleanImageUrls([heroUrl], 1)[0] ?? null;
  const next = cleanImageUrls(galleryUrls, 20).find(url => url !== hero);
  return next ?? null;
};
