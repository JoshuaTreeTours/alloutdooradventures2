import { getActivityLabelFromSlug } from "../../../data/activityLabels";
import type { Engine2Tour } from "../../../engine2/data/loadEngine2";

export type CanadaActivityGroup = {
  slug: string;
  label: string;
  count: number;
  image: string | null;
};

const normalizeActivitySlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

export const getTourActivitySlugs = (tour: Engine2Tour): string[] => {
  const tagged = (tour as Engine2Tour & { activityTags?: unknown })
    .activityTags;
  if (Array.isArray(tagged) && tagged.length) {
    return tagged
      .map(value =>
        typeof value === "string" ? normalizeActivitySlug(value) : ""
      )
      .filter(Boolean);
  }
  return ["outdoor-adventures"];
};

export const buildCanadaActivityGroups = (
  tours: Engine2Tour[]
): CanadaActivityGroup[] => {
  const grouped = new Map<string, { count: number; image: string | null }>();

  tours.forEach(tour => {
    const image = tour.images.hero || tour.seo.ogImage || null;
    const slugs = getTourActivitySlugs(tour);
    slugs.forEach(slug => {
      const current = grouped.get(slug);
      if (!current) {
        grouped.set(slug, { count: 1, image });
        return;
      }
      current.count += 1;
      if (!current.image && image) {
        current.image = image;
      }
    });
  });

  return Array.from(grouped.entries())
    .map(([slug, value]) => ({
      slug,
      label: getActivityLabelFromSlug(slug) ?? slug.replace(/-/g, " "),
      count: value.count,
      image: value.image,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
};
