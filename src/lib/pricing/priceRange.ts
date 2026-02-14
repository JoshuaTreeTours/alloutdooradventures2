import type { Tour } from "../../data/tours.types";

const PREMIUM_KEYWORDS = ["private", "luxury", "helicopter"];
const BUDGET_KEYWORDS = ["walking tour", "walking", "short"];

const includesKeyword = (haystack: string, keywords: string[]) =>
  keywords.some(keyword => haystack.includes(keyword));

const buildTourPricingText = (tour: Tour) =>
  [
    tour.title,
    tour.shortDescription,
    tour.primaryCategory,
    ...(tour.categories ?? []),
    ...(tour.tags ?? []),
    ...(tour.activitySlugs ?? []),
    tour.badges.duration,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

export const getTourPriceRange = (tour: Tour): string => {
  const pricingText = buildTourPricingText(tour);

  if (includesKeyword(pricingText, PREMIUM_KEYWORDS)) {
    return "$$$–$$$$";
  }

  if (includesKeyword(pricingText, BUDGET_KEYWORDS)) {
    return "$–$$";
  }

  return "$$–$$$";
};
