import wikiImagesData from "../../data/wikiImages.json";
import type { WikiImageEntry, WikiImageIndex } from "../utils/wiki/types";

const index = (wikiImagesData ?? {}) as WikiImageIndex;

const normalizeId = (value: string) => {
  const match = value.match(/(\d{3,})/);
  return match?.[1] ?? value;
};

export const getWikiImageByTourId = (tourId: string): WikiImageEntry | null => {
  return index[normalizeId(tourId)] ?? null;
};
