import { TOUR_ACTIVITY_CATEGORIES } from "../lib/tourCategoryClassifier";
import { getStateBySlug } from "./destinations";
import { tours } from "./tours";
import type { Tour } from "./tours.types";
import { resolveTourHeroImage } from "../utils/hero";
import { slugify } from "../utils/slugify";

export type ActivityDiscoveryPage = {
  slug: string;
  label: string;
  title: string;
  description: string;
};

const ACTIVITY_PAGE_COPY: Record<
  string,
  { title: string; description: string }
> = {
  cycling: {
    title: "Cycling Tours & Outdoor Adventures",
    description:
      "Discover guided cycling tours, e-bike rides, scenic road routes, and bike-based outdoor adventures.",
  },
  hiking: {
    title: "Hiking Tours & Outdoor Adventures",
    description:
      "Find guided hiking tours, trail days, nature walks, and outdoor adventures led by local experts.",
  },
  "paddle-sports": {
    title: "Paddle Sports Tours & Outdoor Adventures",
    description:
      "Explore kayak, canoe, stand-up paddleboard, SUP, and other paddle-powered adventures on rivers, lakes, and coastlines.",
  },
  "water-sports": {
    title: "Water Sports Tours & Outdoor Adventures",
    description:
      "Browse jet ski rides, snorkeling trips, speedboat outings, and active water-based outdoor adventures.",
  },
  sailing: {
    title: "Sailing Tours & Outdoor Adventures",
    description:
      "Compare sailing charters, harbor cruises, sunset sails, and wind-powered experiences on the water.",
  },
  "jeep-off-road": {
    title: "Jeep & Off-Road Tours & Outdoor Adventures",
    description:
      "Find Jeep tours, 4x4 routes, desert drives, and rugged off-road outdoor adventures.",
  },
  wildlife: {
    title: "Wildlife Tours & Outdoor Adventures",
    description:
      "Discover wildlife watching tours, whale watching trips, national park outings, and nature-focused adventures.",
  },
  stargazing: {
    title: "Stargazing Tours & Outdoor Adventures",
    description:
      "Browse night-sky tours, astronomy outings, and guided stargazing experiences in memorable outdoor settings.",
  },
  "food-wine": {
    title: "Food & Wine Tours & Outdoor Adventures",
    description:
      "Explore food tours, wine country outings, bike-and-bite experiences, and culinary adventures with a local flavor.",
  },
  "air-tours": {
    title: "Air Tours & Outdoor Adventures",
    description:
      "Find helicopter rides, flightseeing tours, aerial sightseeing, and sky-high outdoor adventure experiences.",
  },
  "sightseeing-city-tours": {
    title: "Sightseeing & City Tours & Outdoor Adventures",
    description:
      "Browse city tours, scenic sightseeing routes, local highlights, and easy guided discovery experiences.",
  },
};

export const ACTIVITY_DISCOVERY_PAGES: ActivityDiscoveryPage[] =
  TOUR_ACTIVITY_CATEGORIES.map(category => ({
    slug: category.slug,
    label: category.label,
    title:
      ACTIVITY_PAGE_COPY[category.slug]?.title ??
      `${category.label} Tours & Outdoor Adventures`,
    description:
      ACTIVITY_PAGE_COPY[category.slug]?.description ??
      `Browse ${category.label.toLowerCase()} tours and outdoor adventures.`,
  }));

export type ActivityLocationOption = {
  slug: string;
  name: string;
};

export const getActivityDiscoveryPage = (activitySlug: string) =>
  ACTIVITY_DISCOVERY_PAGES.find(activity => activity.slug === activitySlug) ??
  null;

const hasActivityCategory = (tour: Tour, activitySlug: string) =>
  Boolean(
    tour.activityCategories?.some(category => category.slug === activitySlug)
  );

const getUniqueTourKey = (tour: Tour) =>
  tour.productCode ||
  tour.id ||
  [tour.destination.stateSlug, tour.destination.citySlug, tour.slug].join("/");

const dedupeTours = (activityTours: Tour[]) => {
  const seen = new Set<string>();
  return activityTours.filter(tour => {
    const key = getUniqueTourKey(tour);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const getQualityValue = (value: number | undefined) =>
  typeof value === "number" && Number.isFinite(value) ? value : -1;

export const sortActivityDiscoveryTours = (activityTours: Tour[]) =>
  [...activityTours].sort((a, b) => {
    const ratingDelta =
      getQualityValue(b.badges.rating) - getQualityValue(a.badges.rating);
    if (ratingDelta !== 0) return ratingDelta;

    const reviewDelta =
      getQualityValue(b.badges.reviewCount) -
      getQualityValue(a.badges.reviewCount);
    if (reviewDelta !== 0) return reviewDelta;

    return a.title.localeCompare(b.title);
  });

export const getToursByActivityCategory = (activitySlug: string) =>
  sortActivityDiscoveryTours(
    dedupeTours(tours.filter(tour => hasActivityCategory(tour, activitySlug)))
  );

export const getToursByActivityLocation = ({
  activitySlug,
  stateSlug,
  citySlug,
}: {
  activitySlug: string;
  stateSlug?: string;
  citySlug?: string;
}) =>
  getToursByActivityCategory(activitySlug).filter(tour => {
    if (stateSlug && tour.destination.stateSlug !== stateSlug) {
      return false;
    }

    if (citySlug && tour.destination.citySlug !== citySlug) {
      return false;
    }

    return true;
  });

export const getActivityStateOptions = (
  activitySlug: string
): ActivityLocationOption[] => {
  const stateMap = new Map<string, string>();

  getToursByActivityCategory(activitySlug).forEach(tour => {
    const stateSlug = tour.destination.stateSlug;
    if (!stateSlug || stateMap.has(stateSlug)) {
      return;
    }

    stateMap.set(
      stateSlug,
      getStateBySlug(stateSlug)?.name || tour.destination.state || stateSlug
    );
  });

  return [...stateMap.entries()]
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const getActivityCityOptions = (
  activitySlug: string,
  stateSlug: string
): ActivityLocationOption[] => {
  const cityMap = new Map<string, string>();

  getToursByActivityLocation({ activitySlug, stateSlug }).forEach(tour => {
    const citySlug = tour.destination.citySlug;
    if (!citySlug || cityMap.has(citySlug)) {
      return;
    }

    cityMap.set(citySlug, tour.destination.city || citySlug);
  });

  return [...cityMap.entries()]
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const buildActivityDiscoveryPath = ({
  activitySlug,
  stateSlug,
  citySlug,
}: {
  activitySlug: string;
  stateSlug?: string;
  citySlug?: string;
}) => {
  if (!activitySlug) {
    return "/tours";
  }

  if (stateSlug && citySlug) {
    return `/tours/${activitySlug}/${stateSlug}/${citySlug}`;
  }

  if (stateSlug) {
    return `/tours/${activitySlug}/${stateSlug}`;
  }

  return `/tours/${activitySlug}`;
};

export const resolveActivityHeroImage = (activityTours: Tour[]) => {
  const heroTour = sortActivityDiscoveryTours(activityTours).find(tour =>
    Boolean(resolveTourHeroImage(tour))
  );

  return heroTour ? resolveTourHeroImage(heroTour) : null;
};

export const getActivityDisplayTitle = (activitySlug: string) =>
  getActivityDiscoveryPage(activitySlug)?.label ||
  activitySlug.replace(/-/g, " ").replace(/\b\w/g, char => char.toUpperCase());

export const getActivityLocationNames = ({
  activitySlug,
  stateSlug,
  citySlug,
}: {
  activitySlug: string;
  stateSlug?: string;
  citySlug?: string;
}) => {
  const stateName = stateSlug
    ? getActivityStateOptions(activitySlug).find(
        state => state.slug === stateSlug
      )?.name ||
      getStateBySlug(stateSlug)?.name ||
      stateSlug
    : "";
  const cityName =
    stateSlug && citySlug
      ? getActivityCityOptions(activitySlug, stateSlug).find(
          city => city.slug === citySlug
        )?.name || citySlug
      : "";

  return { stateName, cityName };
};

export type ActivityDiscoveryRouteDefinition = {
  path: string;
  params: {
    activitySlug: string;
    stateSlug?: string;
    citySlug?: string;
  };
};

export const getActivityDiscoveryRouteDefinitions = () => {
  const definitions: ActivityDiscoveryRouteDefinition[] = [];

  ACTIVITY_DISCOVERY_PAGES.forEach(activity => {
    definitions.push({
      path: buildActivityDiscoveryPath({ activitySlug: activity.slug }),
      params: { activitySlug: activity.slug },
    });

    getActivityStateOptions(activity.slug).forEach(state => {
      definitions.push({
        path: buildActivityDiscoveryPath({
          activitySlug: activity.slug,
          stateSlug: state.slug,
        }),
        params: { activitySlug: activity.slug, stateSlug: state.slug },
      });

      getActivityCityOptions(activity.slug, state.slug).forEach(city => {
        definitions.push({
          path: buildActivityDiscoveryPath({
            activitySlug: activity.slug,
            stateSlug: state.slug,
            citySlug: city.slug,
          }),
          params: {
            activitySlug: activity.slug,
            stateSlug: state.slug,
            citySlug: city.slug,
          },
        });
      });
    });
  });

  return definitions;
};

export const slugifyActivityLocation = (value: string) => slugify(value);
