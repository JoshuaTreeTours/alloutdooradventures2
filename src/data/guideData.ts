import { getActivityLabelFromSlug } from "./activityLabels";
import { getFlagstaffTourDetailPath } from "./flagstaffTours";
import { getTourDetailPath, tours } from "./tours";
import type { Tour } from "./tours.types";
import { generateCityGuide } from "../lib/guides/generateCityGuide";
import type { CityGuideContent } from "../lib/guides/generateCityGuide";
import { EUROPE_COUNTRIES, US_STATES, slugify } from "./tourCatalog";

export type GuideCitySummary = {
  name: string;
  slug: string;
  tourCount: number;
};

export type GuidePlaceSummary = {
  name: string;
  slug: string;
  tourCount: number;
  cities: GuideCitySummary[];
};

export type GuideLink = {
  label: string;
  href: string;
};

export type GuideItinerary = {
  title: string;
  duration: string;
  description: string;
  links: GuideLink[];
};

export type GuideContent = {
  type: "state" | "country" | "city";
  name: string;
  slug: string;
  intro: string;
  breadcrumbs: GuideLink[];
  topCities?: GuideCitySummary[];
  activities?: GuideLink[];
  itineraries: GuideItinerary[];
  bestTimeToVisit: string;
  whatToPack: string;
  featuredTours: Tour[];
  activityFocus?: string;
  cityGuide?: CityGuideContent;
};

const US_STATE_SLUGS = new Set(US_STATES.map((state) => slugify(state)));
const EUROPE_COUNTRY_SLUGS = new Set(
  EUROPE_COUNTRIES.map((country) => slugify(country)),
);
const CATEGORY_ACTIVITY_SLUGS = new Set([
  "cycling",
  "hiking",
  "canoeing",
  "day-adventures",
  "detours",
  "multi-day",
]);

const isUsStateTour = (tour: Tour) => {
  if (US_STATE_SLUGS.has(tour.destination.stateSlug)) {
    return true;
  }

  return US_STATE_SLUGS.has(slugify(tour.destination.state));
};

const getCountryFromTour = (tour: Tour) => {
  if (tour.destination.country) {
    return {
      name: tour.destination.country,
      slug: slugify(tour.destination.country),
    };
  }

  if (!isUsStateTour(tour) && tour.destination.state) {
    return {
      name: tour.destination.state,
      slug: tour.destination.stateSlug || slugify(tour.destination.state),
    };
  }

  return null;
};

const formatList = (items: string[]) => {
  if (!items.length) {
    return "guided tours";
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
};

const getActivitySlugs = (tourList: Tour[]) =>
  Array.from(
    new Set(
      tourList.flatMap((tour) =>
        tour.activitySlugs.length
          ? tour.activitySlugs
          : tour.primaryCategory
            ? [tour.primaryCategory]
            : [],
      ),
    ),
  );

const buildCitySummaries = (tourList: Tour[]): GuideCitySummary[] => {
  const cities = new Map<string, GuideCitySummary>();

  tourList.forEach((tour) => {
    const key = tour.destination.citySlug;
    if (!key) {
      return;
    }

    const existing = cities.get(key);
    if (existing) {
      existing.tourCount += 1;
      return;
    }

    cities.set(key, {
      name: tour.destination.city,
      slug: tour.destination.citySlug,
      tourCount: 1,
    });
  });

  return Array.from(cities.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
};

export const getGuideTourDetailPath = (tour: Tour) => {
  if (tour.destination.stateSlug === "arizona" && tour.destination.citySlug === "flagstaff") {
    return getFlagstaffTourDetailPath(tour);
  }

  return getTourDetailPath(tour);
};

export const getGuideStates = (): GuidePlaceSummary[] => {
  const states = new Map<string, GuidePlaceSummary>();

  tours.forEach((tour) => {
    if (!isUsStateTour(tour)) {
      return;
    }

    const key = tour.destination.stateSlug;
    const existing = states.get(key);
    if (existing) {
      existing.tourCount += 1;
      return;
    }

    states.set(key, {
      name: tour.destination.state,
      slug: key,
      tourCount: 1,
      cities: [],
    });
  });

  return Array.from(states.values())
    .map((state) => ({
      ...state,
      cities: buildCitySummaries(
        tours.filter((tour) => tour.destination.stateSlug === state.slug),
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const getGuideCountries = (): GuidePlaceSummary[] => {
  const countries = new Map<string, GuidePlaceSummary>();

  tours.forEach((tour) => {
    const country = getCountryFromTour(tour);
    if (!country) {
      return;
    }

    const existing = countries.get(country.slug);
    if (existing) {
      existing.tourCount += 1;
      return;
    }

    countries.set(country.slug, {
      name: country.name,
      slug: country.slug,
      tourCount: 1,
      cities: [],
    });
  });

  return Array.from(countries.values())
    .map((country) => ({
      ...country,
      cities: buildCitySummaries(
        tours.filter((tour) => {
          const tourCountry = getCountryFromTour(tour);
          return tourCountry?.slug === country.slug;
        }),
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const getGuideStateBySlug = (stateSlug: string) =>
  getGuideStates().find((state) => state.slug === stateSlug);

export const getGuideCountryBySlug = (countrySlug: string) =>
  getGuideCountries().find((country) => country.slug === countrySlug);

export const getCountryDestinationHref = (countrySlug: string) =>
  EUROPE_COUNTRY_SLUGS.has(countrySlug)
    ? `/destinations/europe/${countrySlug}`
    : `/destinations/world/${countrySlug}`;

const getInternationalCityBasePath = (
  countrySlug: string,
  citySlug: string,
) =>
  EUROPE_COUNTRY_SLUGS.has(countrySlug)
    ? `/destinations/europe/${countrySlug}/cities/${citySlug}`
    : `/destinations/world/${countrySlug}/cities/${citySlug}`;

const getInternationalCityToursPath = (
  countrySlug: string,
  citySlug: string,
) => `${getInternationalCityBasePath(countrySlug, citySlug)}/tours`;

const buildBestTimeToVisit = (placeName: string) =>
  `Tour availability in ${placeName} varies by operator and activity, so check live calendars and choose dates that match your preferred pace.`;

const buildWhatToPack = () =>
  "Plan for comfort and flexibility: bring layers, comfortable footwear, sun protection, and a refillable water bottle. Specific tours may recommend extra gear after booking.";

const buildActivityLinks = (
  tourList: Tour[],
  buildHref: (slug: string) => string,
): GuideLink[] => {
  const activitySlugs = getActivitySlugs(tourList);

  return activitySlugs.map((slug) => ({
    label: getActivityLabelFromSlug(slug),
    href: buildHref(slug),
  }));
};

const buildCategoryLinks = (tourList: Tour[], max = 3) =>
  getActivitySlugs(tourList)
    .filter((slug) => CATEGORY_ACTIVITY_SLUGS.has(slug))
    .slice(0, max)
    .map((slug) => ({
      slug,
      label: getActivityLabelFromSlug(slug),
      href: `/tours/activities/${slug}`,
    }));

export const buildStateGuide = (stateSlug: string): GuideContent | null => {
  const stateTours = tours.filter(
    (tour) => tour.destination.stateSlug === stateSlug && isUsStateTour(tour),
  );

  if (!stateTours.length) {
    return null;
  }

  const stateName = stateTours[0].destination.state;
  const cities = buildCitySummaries(stateTours);
  const highlightCities = [...cities]
    .sort((a, b) => b.tourCount - a.tourCount)
    .slice(0, 3);
  const activityLabels = getActivitySlugs(stateTours)
    .slice(0, 4)
    .map((slug) => getActivityLabelFromSlug(slug));
  const categoryLinks = buildCategoryLinks(stateTours, 3);

  const destinationCityLinks = highlightCities.map((city) => ({
    label: `${city.name} city page`,
    href: `/destinations/states/${stateSlug}/cities/${city.slug}`,
  }));

  const destinationLink = {
    label: `${stateName} destinations`,
    href: `/destinations/states/${stateSlug}`,
  };

  const itineraries: GuideItinerary[] = [
    {
      title: "Weekend (2–3 days)",
      duration: "2–3 days",
      description: `Base your weekend in ${highlightCities[0]?.name ?? stateName} and mix a highlight tour with one signature activity.`,
      links: [
        destinationLink,
        destinationCityLinks[0],
        categoryLinks[0],
      ].filter(
        (link): link is GuideLink => Boolean(link),
      ),
    },
    {
      title: "Classic (4–5 days)",
      duration: "4–5 days",
      description: `Split time between ${highlightCities[0]?.name ?? stateName} and ${highlightCities[1]?.name ?? "another nearby hub"} to sample multiple activities.`,
      links: [
        destinationLink,
        destinationCityLinks[1] ?? destinationCityLinks[0],
        categoryLinks[1] ?? categoryLinks[0],
      ].filter(
        (link): link is GuideLink => Boolean(link),
      ),
    },
    {
      title: "Deep dive (7 days)",
      duration: "7 days",
      description: `Loop through three regions and layer in longer tours for a full-state perspective.`,
      links: [
        destinationLink,
        destinationCityLinks[2] ?? destinationCityLinks[0],
        categoryLinks[2] ?? categoryLinks[0],
      ].filter(
        (link): link is GuideLink => Boolean(link),
      ),
    },
  ];

  return {
    type: "state",
    name: stateName,
    slug: stateSlug,
    intro: `${stateName} has ${stateTours.length} tours across ${cities.length} cities, covering ${formatList(activityLabels)}.`,
    breadcrumbs: [
      { label: "Guides", href: "/guides" },
      { label: "United States", href: "/guides" },
      { label: stateName, href: `/guides/us/${stateSlug}` },
    ],
    topCities: cities,
    itineraries,
    bestTimeToVisit: buildBestTimeToVisit(stateName),
    whatToPack: buildWhatToPack(),
    featuredTours: stateTours.slice(0, 12),
  };
};

export const buildCountryGuide = (countrySlug: string): GuideContent | null => {
  const countryTours = tours.filter((tour) => {
    const country = getCountryFromTour(tour);
    return country?.slug === countrySlug;
  });

  if (!countryTours.length) {
    return null;
  }

  const countryName = getCountryFromTour(countryTours[0])?.name ?? countrySlug;
  const cities = buildCitySummaries(countryTours);
  const highlightCities = [...cities]
    .sort((a, b) => b.tourCount - a.tourCount)
    .slice(0, 3);
  const activityLabels = getActivitySlugs(countryTours)
    .slice(0, 4)
    .map((slug) => getActivityLabelFromSlug(slug));
  const categoryLinks = buildCategoryLinks(countryTours, 3);
  const destinationHref = getCountryDestinationHref(countrySlug);

  const cityLinks = highlightCities.map((city) => ({
    label: `${city.name} city page`,
    href: getInternationalCityBasePath(countrySlug, city.slug),
  }));

  const destinationLink = {
    label: `${countryName} destinations`,
    href: destinationHref,
  };

  const itineraries: GuideItinerary[] = [
    {
      title: "Weekend (2–3 days)",
      duration: "2–3 days",
      description: `Start in ${highlightCities[0]?.name ?? countryName} and combine a headline tour with a focused activity.`,
      links: [destinationLink, cityLinks[0], categoryLinks[0]].filter(
        (link): link is GuideLink => Boolean(link),
      ),
    },
    {
      title: "Classic (4–5 days)",
      duration: "4–5 days",
      description: `Add ${highlightCities[1]?.name ?? "another city"} to diversify activities and tour styles.`,
      links: [destinationLink, cityLinks[1] ?? cityLinks[0], categoryLinks[1] ?? categoryLinks[0]].filter(
        (link): link is GuideLink => Boolean(link),
      ),
    },
    {
      title: "Deep dive (7 days)",
      duration: "7 days",
      description: `Connect multiple regions to build a well-rounded itinerary across the country.`,
      links: [destinationLink, cityLinks[2] ?? cityLinks[0], categoryLinks[2] ?? categoryLinks[0]].filter(
        (link): link is GuideLink => Boolean(link),
      ),
    },
  ];

  return {
    type: "country",
    name: countryName,
    slug: countrySlug,
    intro: `${countryName} offers ${countryTours.length} tours across ${cities.length} cities, spanning ${formatList(activityLabels)}.`,
    breadcrumbs: [
      { label: "Guides", href: "/guides" },
      { label: "International", href: "/guides" },
      { label: countryName, href: `/guides/world/${countrySlug}` },
    ],
    topCities: cities,
    itineraries,
    bestTimeToVisit: buildBestTimeToVisit(countryName),
    whatToPack: buildWhatToPack(),
    featuredTours: countryTours.slice(0, 12),
  };
};

export const buildCityGuide = ({
  parentSlug,
  citySlug,
  regionType,
  activityFocus,
}: {
  parentSlug: string;
  citySlug: string;
  regionType: "state" | "country";
  activityFocus?: string;
}): GuideContent | null => {
  const cityTours = tours.filter((tour) => {
    if (tour.destination.citySlug !== citySlug) {
      return false;
    }

    if (regionType === "state") {
      return tour.destination.stateSlug === parentSlug && isUsStateTour(tour);
    }

    const country = getCountryFromTour(tour);
    return country?.slug === parentSlug;
  });

  if (!cityTours.length) {
    return null;
  }

  const cityName = cityTours[0].destination.city;
  const parentName =
    regionType === "state"
      ? cityTours[0].destination.state
      : getCountryFromTour(cityTours[0])?.name ?? parentSlug;
  const filteredTours = activityFocus
    ? cityTours.filter((tour) =>
        tour.activitySlugs.includes(activityFocus),
      )
    : cityTours;
  const toursToShow = filteredTours.length ? filteredTours : cityTours;
  const activityLinks = buildActivityLinks(cityTours, (slug) =>
    regionType === "state"
      ? `/destinations/states/${parentSlug}/cities/${citySlug}/tours?activity=${slug}`
      : `${getInternationalCityToursPath(parentSlug, citySlug)}?activity=${slug}`,
  );
  const activityLabels = activityLinks.map((activity) => activity.label).slice(0, 4);

  const tourLinks = toursToShow.slice(0, 6).map((tour) => ({
    label: tour.title,
    href: getGuideTourDetailPath(tour),
  }));
  const cityToursLink =
    regionType === "state"
      ? {
          label: "All city tours",
          href: `/destinations/states/${parentSlug}/cities/${citySlug}/tours`,
        }
      : {
          label: "All city tours",
          href: getInternationalCityToursPath(parentSlug, citySlug),
        };
  const primaryActivitySlug = getActivitySlugs(cityTours)[0];
  const categoriesPresent = getActivitySlugs(cityTours);
  const categoryLinks = primaryActivitySlug
    ? [
        {
          label: `${getActivityLabelFromSlug(primaryActivitySlug)} tours`,
          href:
            regionType === "state"
              ? `/destinations/states/${parentSlug}/cities/${citySlug}/tours?activity=${primaryActivitySlug}`
              : `${getInternationalCityToursPath(parentSlug, citySlug)}?activity=${primaryActivitySlug}`,
        },
      ]
    : [];

  const itineraries: GuideItinerary[] = [
    {
      title: "1-Day sampler",
      duration: "1 day",
      description: `Pick one signature tour and add a short activity window to get oriented.`,
      links: [tourLinks[0], tourLinks[1], cityToursLink, ...categoryLinks].filter(
        (link): link is GuideLink => Boolean(link),
      ),
    },
    {
      title: "3-Day explorer",
      duration: "3 days",
      description: `Combine two guided days with open time to explore neighborhoods and viewpoints.`,
      links: [
        tourLinks[2] ?? tourLinks[0],
        tourLinks[3] ?? tourLinks[1],
        cityToursLink,
        ...categoryLinks,
      ].filter(
        (link): link is GuideLink => Boolean(link),
      ),
    },
    {
      title: "5-Day deep dive",
      duration: "5 days",
      description: `Rotate through multiple tour types and save a day for an all-day excursion.`,
      links: [
        tourLinks[4] ?? tourLinks[0],
        tourLinks[5] ?? tourLinks[1],
        cityToursLink,
        ...categoryLinks,
      ].filter(
        (link): link is GuideLink => Boolean(link),
      ),
    },
  ];

  const activityFocusLabel = activityFocus
    ? getActivityLabelFromSlug(activityFocus)
    : undefined;

  return {
    type: "city",
    name: cityName,
    slug: citySlug,
    intro: `${cityName} is a base for ${toursToShow.length} tours in ${parentName}, featuring ${formatList(activityLabels)}.`,
    breadcrumbs: [
      { label: "Guides", href: "/guides" },
      {
        label: regionType === "state" ? "United States" : "International",
        href: "/guides",
      },
      {
        label: parentName,
        href:
          regionType === "state"
            ? `/guides/us/${parentSlug}`
            : `/guides/world/${parentSlug}`,
      },
      {
        label: cityName,
        href:
          regionType === "state"
            ? `/guides/us/${parentSlug}/${citySlug}`
            : `/guides/world/${parentSlug}/${citySlug}`,
      },
    ],
    activities: activityLinks,
    itineraries,
    bestTimeToVisit: buildBestTimeToVisit(cityName),
    whatToPack: buildWhatToPack(),
    featuredTours: toursToShow.slice(0, 12),
    activityFocus: activityFocusLabel,
    cityGuide: generateCityGuide({
      cityName,
      stateName: parentName,
      categoriesPresent,
    }),
  };
};
