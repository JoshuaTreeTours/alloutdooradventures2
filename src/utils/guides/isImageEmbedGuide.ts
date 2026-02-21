import type { GuidePageData } from "../loadGuide";

export type CityGuide = GuidePageData & {
  heroImage?: string;
  coverImage?: string;
  imageUrl?: string;
};

export const MIN_LANDMARK_IMAGES = 4;

const hasValue = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const hasGuideLevelImage = (guide: CityGuide) =>
  hasValue(guide.hero?.image) ||
  hasValue(guide.heroImage) ||
  hasValue(guide.coverImage) ||
  hasValue(guide.imageUrl);

const hasLandmarkImage = (thing: GuidePageData["thingsToDo"][number]) => {
  const candidate = thing as Record<string, unknown>;
  return [
    candidate.imageUrl,
    candidate.photoUrl,
    candidate.image,
    candidate.coverImage,
    candidate.heroImage,
  ].some(hasValue);
};

export const isImageEmbedGuide = (guide: CityGuide): boolean => {
  if (!guide || typeof guide !== "object") {
    return false;
  }

  if (hasGuideLevelImage(guide)) {
    return true;
  }

  const items = Array.isArray(guide.thingsToDo) ? guide.thingsToDo : [];
  const imageCount = items.reduce(
    (count, item) => count + (hasLandmarkImage(item) ? 1 : 0),
    0
  );

  return imageCount >= MIN_LANDMARK_IMAGES;
};
