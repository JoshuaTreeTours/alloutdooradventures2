export type MexicoCityMeta = {
  title: string;
  description: string;
};

export const mexicoCityMetaBySlug: Record<string, MexicoCityMeta> = {
  "puerto-vallarta": {
    title: "Puerto Vallarta Tours | Mexico Outdoor Adventures",
    description:
      "Book top-rated outdoor experiences in Puerto Vallarta, Mexico — cruises, snorkeling, hikes, and guided day trips. Compare tours and reserve online.",
  },
};

export const getMexicoCityMeta = (
  citySlug: string,
): MexicoCityMeta | null => mexicoCityMetaBySlug[citySlug] ?? null;
