import {
  classifyTourCategories,
  normalizeTourCategoryText,
  TOUR_ACTIVITY_CATEGORIES,
} from "../lib/tourCategoryClassifier";
import { getStateBySlug } from "./destinations";
import { getAllRouteBackedTourEntries, getTourDetailPath } from "./tours";
import type { Tour } from "./tours.types";
import type { UnifiedCityTour } from "./tours";
import { resolveTourHeroImage } from "../utils/hero";
import { slugify } from "../utils/slugify";

export type ActivityDiscoveryPage = {
  slug: string;
  label: string;
  title: string;
  description: string;
};

export type ActivityIndexCard = ActivityDiscoveryPage & {
  image: string | null;
  tourCount: number;
  href: string;
};

export const ACTIVITY_INDEX_PREFERRED_ORDER = [
  "hiking",
  "horseback-riding",
  "walking-tours",
  "cycling",
  "paddle-sports",
  "water-sports",
  "sailing",
  "boating",
  "fishing",
  "wildlife",
  "stargazing",
  "jeep-off-road",
  "air-tours",
  "food-wine",
  "sightseeing-city-tours",
] as const;

const BOATING_ACTIVITY_HERO_IMAGE =
  "https://cdn.filestackcontent.com/OJiNPwlYQlaHDU6gDwva";

export const CYCLING_ACTIVITY_HERO_IMAGE =
  "https://www.alloutdooradventures.com/images/cycling-hero.jpg";

export const HIKING_ACTIVITY_HERO_IMAGE =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/0d/07/b0/bc.jpg";

export const SAILING_ACTIVITY_HERO_IMAGE =
  "https://cdn.filestackcontent.com/MMdbUxClRWq36GyZNbqk";

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
      "Find guided trail hikes, mountain hikes, canyon hikes, national park hikes, and nature-trail adventures led by local experts.",
  },
  "horseback-riding": {
    title: "Horseback Riding Tours & Outdoor Adventures",
    description:
      "Browse horseback riding tours, trail rides, ranch rides, mule rides, pony rides, and equestrian outdoor adventures.",
  },
  "walking-tours": {
    title: "Walking Tours & Outdoor Adventures",
    description:
      "Explore city walking tours, historic walks, ghost walks, architecture walks, neighborhood walks, street art walks, and cultural walking experiences.",
  },
  "paddle-sports": {
    title: "Paddle Sports Tours & Outdoor Adventures",
    description:
      "Explore kayak, canoe, stand-up paddleboard, SUP, and other paddle-powered adventures on rivers, lakes, and coastlines.",
  },
  "water-sports": {
    title: "Water Sports Tours & Outdoor Adventures",
    description:
      "Browse jet ski rides, snorkeling trips, scuba outings, parasailing, tubing, and active water-based outdoor adventures.",
  },
  sailing: {
    title: "Sailing Tours & Outdoor Adventures",
    description:
      "Compare sailing charters, sunset sails, sailboat trips, and wind-powered experiences on the water.",
  },
  boating: {
    title: "Boating Tours & Outdoor Adventures",
    description:
      "Browse boat tours, harbor cruises, bay cruises, river cruises, pontoon outings, speedboat sightseeing, and private boat charters.",
  },
  fishing: {
    title: "Fishing Tours & Outdoor Adventures",
    description:
      "Browse fishing charters, deep sea fishing trips, fly fishing guides, and lake, river, and reef angling experiences.",
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

const resolvedPrimaryActivitySlugCache = new WeakMap<Tour, string | null>();

const normalizeActivityLookupValue = (value: string | null | undefined) =>
  value ? normalizeTourCategoryText(value).replace(/-tour$/, "") : "";

const PRIMARY_ACTIVITY_SLUG_LOOKUP = new Map(
  TOUR_ACTIVITY_CATEGORIES.flatMap(category => [
    [normalizeActivityLookupValue(category.slug), category.slug],
    [normalizeActivityLookupValue(category.label), category.slug],
  ])
);

const resolvePrimaryActivitySlugFromValue = (
  value: string | null | undefined
) =>
  PRIMARY_ACTIVITY_SLUG_LOOKUP.get(normalizeActivityLookupValue(value)) ?? null;

const REPAIRED_ACTIVITY_SLUGS = new Set([
  "hiking",
  "walking-tours",
  "paddle-sports",
]);

const isRepairedActivitySlug = (slug: string | null | undefined) =>
  Boolean(slug && REPAIRED_ACTIVITY_SLUGS.has(slug));

const isRepairedActivityValue = (value: string | null | undefined) =>
  isRepairedActivitySlug(resolvePrimaryActivitySlugFromValue(value));

const isStaleRepairedValue = (value: string | null | undefined) =>
  isRepairedActivitySlug(resolvePrimaryActivitySlugFromValue(value));

const classifyTourPrimaryActivitySlug = (tour: Tour) => {
  const hasStoredRepairedActivity =
    isRepairedActivityValue(tour.primaryDisplayCategory) ||
    isRepairedActivityValue(tour.primaryCategory) ||
    isRepairedActivitySlug(tour.activityCategories?.[0]?.slug);

  return (
    classifyTourCategories({
      title: tour.title,
      overview: hasStoredRepairedActivity ? undefined : tour.shortDescription,
      description: hasStoredRepairedActivity ? undefined : tour.longDescription,
      highlights: [
        ...((tour.content?.highlights as string[] | undefined) ?? []),
        ...(tour.tags ?? []),
        ...(tour.tagPills ?? []),
      ].filter(
        (value): value is string =>
          Boolean(value) &&
          !(hasStoredRepairedActivity && isStaleRepairedValue(value))
      ),
      categories: [tour.primaryCategory].filter(
        (value): value is string =>
          Boolean(value) && !isRepairedActivityValue(value)
      ),
    }).matchedCategorySlugs[0] ?? null
  );
};

export const getResolvedPrimaryActivitySlug = (tour: Tour) => {
  const cached = resolvedPrimaryActivitySlugCache.get(tour);
  if (cached !== undefined) {
    return cached;
  }

  const storedPrimarySlug =
    resolvePrimaryActivitySlugFromValue(tour.primaryDisplayCategory) ??
    resolvePrimaryActivitySlugFromValue(tour.primaryCategory) ??
    tour.activityCategories?.[0]?.slug ??
    null;
  const classifiedSlug = classifyTourPrimaryActivitySlug(tour);
  const resolvedSlug = isRepairedActivitySlug(storedPrimarySlug)
    ? classifiedSlug
    : (storedPrimarySlug ?? classifiedSlug);

  resolvedPrimaryActivitySlugCache.set(tour, resolvedSlug);
  return resolvedSlug;
};

const hasActivityCategory = (tour: Tour, activitySlug: string) =>
  getResolvedPrimaryActivitySlug(tour) === activitySlug;

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

const compareActivityDiscoveryTours = (a: Tour, b: Tour) => {
  const ratingDelta =
    getQualityValue(b.badges.rating) - getQualityValue(a.badges.rating);
  if (ratingDelta !== 0) return ratingDelta;

  const reviewDelta =
    getQualityValue(b.badges.reviewCount) -
    getQualityValue(a.badges.reviewCount);
  if (reviewDelta !== 0) return reviewDelta;

  return a.title.localeCompare(b.title);
};

export const sortActivityDiscoveryTours = (activityTours: Tour[]) =>
  [...activityTours].sort(compareActivityDiscoveryTours);

const getUniqueEntryKey = (entry: UnifiedCityTour) =>
  entry.href || getUniqueTourKey(entry.tour);

const dedupeTourEntries = (activityEntries: UnifiedCityTour[]) => {
  const seen = new Set<string>();
  return activityEntries.filter(entry => {
    const key = getUniqueEntryKey(entry);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const sortActivityDiscoveryEntries = (activityEntries: UnifiedCityTour[]) =>
  [...activityEntries].sort((a, b) =>
    compareActivityDiscoveryTours(a.tour, b.tour)
  );

const activityTourHrefByKey = new Map<string, string>();

export const getActivityTourEntriesByCategory = (activitySlug: string) => {
  const entries = sortActivityDiscoveryEntries(
    dedupeTourEntries(
      getAllRouteBackedTourEntries().filter(entry =>
        hasActivityCategory(entry.tour, activitySlug)
      )
    )
  );

  entries.forEach(entry => {
    activityTourHrefByKey.set(getUniqueTourKey(entry.tour), entry.href);
  });

  return entries;
};

export const getToursByActivityCategory = (activitySlug: string) =>
  getActivityTourEntriesByCategory(activitySlug).map(entry => entry.tour);

export const getActivityTourHref = (tour: Tour) => {
  const key = getUniqueTourKey(tour);
  const cachedHref = activityTourHrefByKey.get(key);
  if (cachedHref) {
    return cachedHref;
  }

  const matchedEntry = getAllRouteBackedTourEntries().find(
    entry => getUniqueTourKey(entry.tour) === key
  );
  const href = matchedEntry?.href ?? getTourDetailPath(tour);
  activityTourHrefByKey.set(key, href);
  return href;
};

const matchesActivityLocation = (
  tour: Tour,
  {
    stateSlug,
    citySlug,
  }: {
    stateSlug?: string;
    citySlug?: string;
  }
) => {
  if (stateSlug && tour.destination.stateSlug !== stateSlug) {
    return false;
  }

  if (citySlug && tour.destination.citySlug !== citySlug) {
    return false;
  }

  return true;
};

export const getActivityTourEntriesByLocation = ({
  activitySlug,
  stateSlug,
  citySlug,
}: {
  activitySlug: string;
  stateSlug?: string;
  citySlug?: string;
}) =>
  getActivityTourEntriesByCategory(activitySlug).filter(entry =>
    matchesActivityLocation(entry.tour, { stateSlug, citySlug })
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
  getActivityTourEntriesByLocation({ activitySlug, stateSlug, citySlug }).map(
    entry => entry.tour
  );

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

  return Array.from(stateMap.entries())
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

  return Array.from(cityMap.entries())
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

export const resolveActivityHeroImage = (
  activityTours: Tour[],
  activitySlug?: string
) => {
  if (activitySlug === "cycling") {
    return CYCLING_ACTIVITY_HERO_IMAGE;
  }

  if (activitySlug === "boating") {
    return BOATING_ACTIVITY_HERO_IMAGE;
  }

  if (activitySlug === "hiking") {
    return HIKING_ACTIVITY_HERO_IMAGE;
  }

  if (activitySlug === "sailing") {
    return SAILING_ACTIVITY_HERO_IMAGE;
  }

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

const ACTIVITY_INDEX_ORDER_RANK: Map<string, number> = new Map(
  ACTIVITY_INDEX_PREFERRED_ORDER.map((slug, index) => [slug, index])
);

export const getActivityIndexCards = (): ActivityIndexCard[] =>
  ACTIVITY_DISCOVERY_PAGES.map(activity => {
    const activityTours = getToursByActivityCategory(activity.slug);

    return {
      ...activity,
      image: resolveActivityHeroImage(activityTours, activity.slug) ?? null,
      tourCount: activityTours.length,
      href: buildActivityDiscoveryPath({ activitySlug: activity.slug }),
    };
  })
    .filter(card => card.tourCount > 0)
    .sort((a, b) => {
      const rankDelta =
        (ACTIVITY_INDEX_ORDER_RANK.get(a.slug) ?? Number.MAX_SAFE_INTEGER) -
        (ACTIVITY_INDEX_ORDER_RANK.get(b.slug) ?? Number.MAX_SAFE_INTEGER);

      return rankDelta || a.label.localeCompare(b.label);
    });

export const slugifyActivityLocation = (value: string) => slugify(value);
