import {
  classifyTourCategories,
  getTourActivityCategoryLabel,
} from "../lib/tourCategoryClassifier";

export type TourSchemaActivityInput = {
  title?: string | null;
  shortDescription?: string | null;
  longDescription?: string | null;
  tags?: string[] | null;
  tagPills?: string[] | null;
  categories?: string[] | null;
  primaryCategory?: string | null;
  primaryDisplayCategory?: string | null;
  activityCategories?: Array<{
    slug?: string | null;
    label?: string | null;
  }> | null;
  content?: {
    overview?: string | null;
    highlights?: string[] | null;
  } | null;
};

const normalizeDisplayLabel = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

/**
 * Resolves the activity-category display label that JSON-LD should use for both
 * Product.category and TouristTrip.touristType. This intentionally does not
 * change taxonomy rules; it only centralizes the schema-facing display value.
 */
export const resolveTourSchemaActivityLabel = (
  tour: TourSchemaActivityInput
): string | null => {
  const classification = classifyTourCategories({
    title: tour.title,
    overview: tour.shortDescription ?? tour.content?.overview,
    description: tour.longDescription,
    highlights: [
      ...(tour.content?.highlights ?? []),
      ...(tour.tags ?? []),
      ...(tour.tagPills ?? []),
    ],
    categories: [
      tour.primaryCategory,
      ...(tour.categories ?? []),
      ...(tour.activityCategories ?? []).flatMap(category => [
        category.slug,
        category.label,
      ]),
    ],
  });

  return (
    normalizeDisplayLabel(classification.primaryDisplayCategory) ??
    normalizeDisplayLabel(tour.primaryDisplayCategory) ??
    normalizeDisplayLabel(tour.activityCategories?.[0]?.label) ??
    getTourActivityCategoryLabel(tour.primaryCategory) ??
    normalizeDisplayLabel(tour.primaryCategory)
  );
};
