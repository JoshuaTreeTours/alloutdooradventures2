import type { TourCategory } from "../../src/data/tourRegistry";

type TagRecord = {
  tagId: number;
  tagName: string;
};

type TagTaxonomy = {
  tags?: TagRecord[];
  data?: TagRecord[];
  [key: string]: unknown;
};

const CATEGORY_KEYWORDS: Record<TourCategory, string[]> = {
  Hiking: ["hike", "hiking", "trek", "trail", "walk"],
  Cycling: ["bike", "cycling", "bicycle", "ebike", "e-bike", "mountain bike"],
  "Water/Boating": ["kayak", "rafting", "boat", "sailing", "cruise", "paddle"],
  "Food & Drink": ["food", "wine", "brew", "brewery", "tasting", "culinary"],
  "Shows/Nightlife": ["show", "nightlife", "casino", "music", "concert"],
  "Scenic Drives": ["scenic", "drive", "loop", "road", "byway"],
  "Family-friendly": ["family", "kids", "all ages", "beginner"],
  Adventure: ["adventure", "canyon", "zip", "off-road", "jeep", "atv"],
};

const normalize = (value: string) => value.toLowerCase();

const extractTags = (taxonomy: TagTaxonomy): TagRecord[] => {
  if (Array.isArray(taxonomy.tags)) {
    return taxonomy.tags;
  }
  if (Array.isArray(taxonomy.data)) {
    return taxonomy.data;
  }
  return [];
};

export const categorizeTags = (
  tagIds: number[],
  taxonomy: TagTaxonomy
): TourCategory[] => {
  const tags = extractTags(taxonomy);
  const matched: Set<TourCategory> = new Set();

  tagIds.forEach((tagId) => {
    const tag = tags.find((entry) => entry.tagId === tagId);
    if (!tag) {
      return;
    }
    const name = normalize(tag.tagName);
    (Object.keys(CATEGORY_KEYWORDS) as TourCategory[]).forEach((category) => {
      if (
        CATEGORY_KEYWORDS[category].some((keyword) => name.includes(keyword))
      ) {
        matched.add(category);
      }
    });
  });

  return matched.size ? Array.from(matched) : ["Adventure"];
};
