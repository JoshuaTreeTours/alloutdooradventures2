import type { GuidePageData } from "../loadGuide";

type GuideLike = Partial<GuidePageData> & {
  thingsToDo?: Array<Record<string, unknown>>;
  aboutCity?: Record<string, unknown>;
};

const IMAGE_EMBED_MARKER = /!\[[^\]]*\]\([^)]*\)|<img\b|\[image-embed\]/i;

const hasValue = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const hasEmbedMarker = (value: unknown): boolean =>
  typeof value === "string" && IMAGE_EMBED_MARKER.test(value);

const hasThingImage = (item: Record<string, unknown>): boolean => {
  const gallery = item.gallery;
  const hasGalleryImages =
    Array.isArray(gallery) && gallery.some(entry => hasValue(entry));

  return (
    hasValue(item.imageUrl) ||
    hasValue(item.photoUrl) ||
    hasValue(item.image) ||
    hasValue(item.coverImage) ||
    hasValue(item.heroImage) ||
    hasGalleryImages
  );
};

const hasAnyEmbedMarkers = (guide: GuideLike): boolean => {
  const things = Array.isArray(guide.thingsToDo) ? guide.thingsToDo : [];

  for (const item of things) {
    if (!item || typeof item !== "object") continue;
    if (hasEmbedMarker(item.description) || hasEmbedMarker(item.notes)) {
      return true;
    }
  }

  const aboutCity = guide.aboutCity;
  if (aboutCity && typeof aboutCity === "object") {
    for (const value of Object.values(aboutCity)) {
      if (hasEmbedMarker(value)) {
        return true;
      }
    }
  }

  return false;
};

export const shouldPreserveGuideContent = (guide: GuideLike): boolean => {
  if (!guide || typeof guide !== "object") {
    return false;
  }

  const things = Array.isArray(guide.thingsToDo) ? guide.thingsToDo : [];
  if (
    things.some(item => item && typeof item === "object" && hasThingImage(item))
  ) {
    return true;
  }

  return hasAnyEmbedMarkers(guide);
};
