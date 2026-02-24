export type WikiQueryTour = {
  title: string;
  city?: string;
  region?: string;
  keywords?: string[];
  primaryCategory?: string;
};

const DEFAULT_KEYWORD = "landscape";

const pickCategoryKeyword = (tour: WikiQueryTour) => {
  const combined = [tour.primaryCategory, ...(tour.keywords ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (combined.includes("fault") || combined.includes("geolog")) {
    return "geology";
  }
  if (combined.includes("desert")) {
    return "desert";
  }
  if (combined.includes("canyon")) {
    return "canyon";
  }
  if (combined.includes("oasis")) {
    return "oasis";
  }

  return DEFAULT_KEYWORD;
};

export const buildWikiQueries = (tour: WikiQueryTour): string[] => {
  const city = tour.city?.trim() ?? "";
  const region = tour.region?.trim() ?? "";
  const primaryKeyword = pickCategoryKeyword(tour);
  const landmark = tour.keywords?.find(keyword => keyword.trim().length > 3)?.trim();

  const candidates = [
    `${tour.title} ${city} ${region}`.trim(),
    `${city} ${region} ${primaryKeyword}`.trim(),
    `${landmark ?? city} landscape`.trim(),
  ];

  return Array.from(new Set(candidates.filter(Boolean))).slice(0, 3);
};
