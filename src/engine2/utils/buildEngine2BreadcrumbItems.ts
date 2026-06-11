import type { Engine2Tour } from "../data/loadEngine2";
import { resolveInternationalGuideHref } from "../../utils/guides/guideResolver";

export type Engine2BreadcrumbItem = {
  name: string;
  url: string;
};

const toSlugLabel = (value: string) =>
  value
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getCountryGuideName = (tour: Engine2Tour) =>
  tour.geo.country || toSlugLabel(tour.sourceCountrySlug ?? "world");

const buildInternationalGuideCrumbs = (
  tour: Engine2Tour
): Engine2BreadcrumbItem[] | null => {
  const countrySlug = tour.sourceCountrySlug;

  if (!countrySlug || countrySlug === "united-states") {
    return null;
  }

  const countryGuide = resolveInternationalGuideHref(
    countrySlug,
    tour.sourceCitySlug
  );

  const crumbs: Engine2BreadcrumbItem[] = [
    {
      name: getCountryGuideName(tour),
      url: countryGuide.countryHref,
    },
  ];

  if (countryGuide.hasCityGuide) {
    crumbs.push({
      name: tour.geo.city,
      url: countryGuide.href,
    });
  }

  return crumbs;
};

export const getEngine2DestinationBreadcrumbs = (
  tour: Engine2Tour
): Engine2BreadcrumbItem[] => {
  const internationalGuideCrumbs = buildInternationalGuideCrumbs(tour);

  if (internationalGuideCrumbs) {
    return internationalGuideCrumbs;
  }

  return [
    { name: "California", url: "/destinations/california" },
    {
      name: tour.geo.city,
      url: `/destinations/california/${tour.sourceCitySlug}`,
    },
    {
      name: "Tours",
      url: `/destinations/california/${tour.sourceCitySlug}/tours`,
    },
  ];
};

export const buildEngine2TourBreadcrumbItems = (
  tour: Engine2Tour,
  options: { includeBook?: boolean; includeRoot?: boolean } = {}
): Engine2BreadcrumbItem[] => {
  const includeRoot = options.includeRoot ?? true;
  const crumbs = [
    ...(includeRoot ? [{ name: "Destinations", url: "/destinations" }] : []),
    ...getEngine2DestinationBreadcrumbs(tour),
    { name: tour.name, url: tour.seo.canonicalPath },
  ];

  if (options.includeBook) {
    crumbs.push({ name: "Book", url: `${tour.seo.canonicalPath}/book` });
  }

  return crumbs;
};
