import { getActivityLabelFromSlug } from "./activityLabels";
import { cityLandmarks } from "./cityLandmarks";
import type { CityLandmarkMetadata } from "./cityLandmarks";
import type { CityFacts } from "../lib/cityGuideFacts";
import { buildCityGuideFacts } from "../lib/cityGuideFacts";
import { getFlagstaffTourDetailPath } from "./flagstaffTours";
import type { GuideImage } from "./guideImages";
import { getGuideImages } from "./guideImages";
import { getTourDetailPath, tours } from "./tours";
import type { Tour } from "./tours.types";
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

export type GuideListItem = {
  title: string;
  description: string;
};

export type GuideItinerary = {
  title: string;
  duration: string;
  description: string;
  links: GuideLink[];
};

export type GuideEssaySection = {
  title: string;
  paragraphs: string[];
};

export type GuideContent = {
  type: "state" | "country" | "city";
  name: string;
  slug: string;
  parentName?: string;
  parentSlug?: string;
  regionType?: "state" | "country";
  intro: string;
  breadcrumbs: GuideLink[];
  topCities?: GuideCitySummary[];
  activities?: GuideLink[];
  itineraries: GuideItinerary[];
  bestTimeToVisit: string;
  whatToPack: string;
  featuredTours: Tour[];
  activityFocus?: string;
  thingsToDoSections?: GuideEssaySection[];
  topThingsToDo?: GuideListItem[];
  guideImages?: GuideImage[];
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

const uniqueValues = (items: string[]) => {
  const seen = new Set<string>();
  const results: string[] = [];

  items.forEach((item) => {
    const trimmed = item.trim();
    if (!trimmed || seen.has(trimmed)) {
      return;
    }

    seen.add(trimmed);
    results.push(trimmed);
  });

  return results;
};

type CityLandmarks = {
  museums: string[];
  culturalSites: string[];
  neighborhoods: string[];
  districts: string[];
  outdoors: string[];
};

const CITY_LANDMARKS: Record<string, CityLandmarks> = {
  "georgia/atlanta": {
    museums: [
      "High Museum of Art",
      "Atlanta History Center",
      "Fernbank Museum of Natural History",
      "Michael C. Carlos Museum",
    ],
    culturalSites: [
      "Martin Luther King Jr. National Historical Park",
      "National Center for Civil and Human Rights",
      "Fox Theatre",
    ],
    neighborhoods: [
      "Midtown",
      "Old Fourth Ward",
      "Inman Park",
      "Virginia-Highland",
      "Little Five Points",
      "Buckhead",
    ],
    districts: ["Ponce City Market", "Krog Street Market", "Sweet Auburn"],
    outdoors: [
      "Atlanta BeltLine",
      "Piedmont Park",
      "Atlanta Botanical Garden",
      "Chattahoochee River National Recreation Area",
      "Stone Mountain Park",
    ],
  },
};

const STATE_ABBREVIATIONS: Record<string, string> = {
  alabama: "al",
  alaska: "ak",
  arizona: "az",
  arkansas: "ar",
  california: "ca",
  colorado: "co",
  connecticut: "ct",
  delaware: "de",
  florida: "fl",
  georgia: "ga",
  hawaii: "hi",
  idaho: "id",
  illinois: "il",
  indiana: "in",
  iowa: "ia",
  kansas: "ks",
  kentucky: "ky",
  louisiana: "la",
  maine: "me",
  maryland: "md",
  massachusetts: "ma",
  michigan: "mi",
  minnesota: "mn",
  mississippi: "ms",
  missouri: "mo",
  montana: "mt",
  nebraska: "ne",
  nevada: "nv",
  "new-hampshire": "nh",
  "new-jersey": "nj",
  "new-mexico": "nm",
  "new-york": "ny",
  "north-carolina": "nc",
  "north-dakota": "nd",
  ohio: "oh",
  oklahoma: "ok",
  oregon: "or",
  pennsylvania: "pa",
  "rhode-island": "ri",
  "south-carolina": "sc",
  "south-dakota": "sd",
  tennessee: "tn",
  texas: "tx",
  utah: "ut",
  vermont: "vt",
  virginia: "va",
  washington: "wa",
  "west-virginia": "wv",
  wisconsin: "wi",
  wyoming: "wy",
  "district-of-columbia": "dc",
};

const getCityLandmarks = (
  parentSlug: string,
  citySlug: string,
): CityLandmarks | null => CITY_LANDMARKS[`${parentSlug}/${citySlug}`] ?? null;

const getCityMetadata = (
  stateSlug: string,
  citySlug: string,
): CityLandmarkMetadata | null => {
  const stateAbbreviation = STATE_ABBREVIATIONS[stateSlug] ?? stateSlug;
  return cityLandmarks[`${citySlug}-${stateAbbreviation}`] ?? null;
};

const formatLandmarkList = (items: string[], fallback: string) =>
  items.length ? formatList(items) : fallback;

const buildMuseumsEssay = (
  cityName: string,
  parentName: string,
  landmarks: CityLandmarks | null,
  metadata: CityLandmarkMetadata | null,
): GuideEssaySection => {
  const museums = landmarks?.museums ?? [];
  const culturalSites = landmarks?.culturalSites ?? [];
  const culturalAreas = metadata?.culturalAreas ?? [];

  const museumsLine = formatLandmarkList(
    museums,
    `flagship art collections, regional history museums, and design-focused galleries`,
  );
  const culturalLine = formatLandmarkList(
    culturalSites,
    `heritage sites that frame the city’s founding stories and modern identity`,
  );
  const culturalAreasLine =
    culturalAreas.length > 0
      ? `Neighborhoods and cultural districts like ${formatList(culturalAreas)} add another layer, with theaters, live music rooms, and creative studios that stay busy well into the evening.`
      : `Neighborhood stages, pop-up galleries, and creative studios add another layer, with performances and openings that keep the cultural calendar full.`;

  return {
    title: `Museums & Culture in ${cityName}`,
    paragraphs: [
      `${cityName}’s cultural scene reflects the wider story of ${parentName}: a place where regional history, migration, and creative ambition keep rewriting the city’s identity. Start by spending an unhurried morning in ${museumsLine}. Visitors typically move from grand galleries to intimate collections, with docents and interpretive signage turning each stop into a narrative about the city’s evolving personality. Even if you arrive with a single institution in mind, the best experience comes from pacing your visit with time to linger in sculpture gardens, café courtyards, and gallery wings that highlight both local voices and international works.`,
      `History is woven into the streets just as tightly as it is in museum halls. In ${cityName}, sites like ${culturalLine} connect civil rights stories, civic milestones, and the everyday lives of residents who shaped the city’s modern character. These are places where visitors are encouraged to slow down, read the details, and let the context set the tone for the rest of the trip. Walking tours, audio guides, and temporary exhibitions often bridge the gap between past and present, showing how the city’s neighborhoods, music, and food traditions are linked to deeper civic narratives.`,
      culturalAreasLine,
      `Culture also lives outside institutional walls. Evening performances, gallery openings, and seasonal festivals keep the calendar full, but the rhythm is always the same: locals gathering in shared spaces, conversations spilling onto patios, and a sense that the city is best experienced in community. Plan time to pair an exhibit visit with live music or an indie film screening, then end the night at a chef-driven restaurant that highlights regional ingredients. That blend of big-ticket institutions and neighborhood energy is what makes ${cityName} feel like a destination rather than a checklist.`,
    ],
  };
};

const buildNeighborhoodsEssay = (
  cityName: string,
  parentName: string,
  landmarks: CityLandmarks | null,
  metadata: CityLandmarkMetadata | null,
  cityFacts: CityFacts,
): GuideEssaySection => {
  const neighborhoods = landmarks?.neighborhoods ?? [];
  const districts = landmarks?.districts ?? [];
  const namedNeighborhoods = metadata?.neighborhoods ?? [];
  const anchorsLine = formatList(cityFacts.anchors.slice(0, 6));
  const nearbyLine = formatList(cityFacts.nearby.slice(0, 3));
  const corridorsLine = formatList(cityFacts.corridors.slice(0, 3));
  const typeLine =
    cityFacts.type === "mountain-town"
      ? `a mountain-town base`
      : cityFacts.type === "coastal-town"
        ? `a coastal town vibe`
        : cityFacts.type === "desert-town"
          ? `a desert-town energy`
        : cityFacts.type === "historic-district"
          ? `a historic district feel`
        : cityFacts.type === "urban"
          ? `an urban energy`
          : `a small-town rhythm`;

  const neighborhoodsLine = formatLandmarkList(
    neighborhoods,
    `historic neighborhoods with tree-lined streets, creative districts, and café-filled corners`,
  );
  const districtsLine = formatLandmarkList(
    districts,
    `market halls, converted warehouses, and downtown corridors that anchor the local scene`,
  );

  if (
    cityFacts.type === "mountain-town" ||
    cityFacts.type === "historic-district" ||
    cityFacts.type === "desert-town"
  ) {
    return {
      title: "Neighborhoods & City Life",
      paragraphs: [
        `${cityName} delivers ${typeLine} centered on ${anchorsLine}. Plan to spend unhurried time along the main streets and heritage corridors, where locally owned cafés, outfitters, and historic facades keep the pace relaxed.`,
        `Neighborhood energy here means walkable blocks, scenic drives, and easy access to trailheads or scenic byways. Use ${nearbyLine} as day-trip extensions, then return to town for sunset dinners and a quieter evening stroll.`,
        `The best way to experience ${cityName} is to slow down: shop local, browse galleries, and follow the rhythm of community events that gather residents and visitors in the same places.`,
      ],
    };
  }

  if (cityFacts.type === "coastal-town") {
    return {
      title: "Neighborhoods & City Life",
      paragraphs: [
        `${cityName} feels most alive along ${anchorsLine}, where waterfront walks and local hangouts set the tone. You’ll move between breezy cafés, small shops, and scenic overlooks in a way that keeps the day flexible.`,
        `Keep an eye out for ${corridorsLine}, which anchor the town’s energy with markets, marinas, and beachfront promenades. The contrast between lively waterfront stretches and quieter residential pockets is what makes the city feel balanced.`,
        `Plan a half-day detour to ${nearbyLine} for extra coastal scenery, then return for a sunset stroll and a relaxed evening meal by the water.`,
      ],
    };
  }

  if (cityFacts.type === "urban") {
    return {
      title: "Neighborhoods & City Life",
      paragraphs: [
        `${cityName} rewards visitors who explore beyond the headline attractions and spend time in neighborhoods like ${anchorsLine}. Each district has its own rhythm, from early coffee runs to late-night patios, and walking between them is the best way to see how the city shifts block by block.`,
        `Start with ${corridorsLine} to get a sense of the city’s core, then branch into smaller streets packed with independent shops, galleries, and chef-driven restaurants. That mix of everyday routines and creative energy is what makes ${cityName} feel lived-in rather than staged.`,
        `When you want a change of scenery, nearby escapes like ${nearbyLine} keep the itinerary flexible. Pair a neighborhood morning with an afternoon detour, then come back for dinner and a sunset stroll to round out the day.`,
      ],
    };
  }

  if (cityFacts.type === "town") {
    return {
      title: "Neighborhoods & City Life",
      paragraphs: [
        `${cityName} keeps the pace grounded in places like ${anchorsLine}. These are the blocks where daily routines unfold—morning coffee counters, family-run shops, and casual dinners that linger after sunset.`,
        `Spend time walking between districts and stopping at local favorites, because the best discoveries here are often small and personal. That slower rhythm is exactly what makes ${cityName} feel welcoming and easy to navigate.`,
        `For extra variety, pair the core neighborhoods with nearby excursions to ${nearbyLine}. You’ll be back in town in time for dinner, with a better feel for the region around ${cityName}.`,
      ],
    };
  }

  if (namedNeighborhoods.length >= 4) {
    const focusNeighborhoods = namedNeighborhoods.slice(0, 8);
    const walkableCore = focusNeighborhoods.slice(0, 2);
    const artsyCorridor = focusNeighborhoods.slice(2, 4);
    const historicSide = focusNeighborhoods.slice(4, 6);
    const residentialEscape = focusNeighborhoods.slice(6, 8);
    const walkableLine = formatList(walkableCore);
    const artsyLine = artsyCorridor.length ? formatList(artsyCorridor) : null;
    const historicLine = historicSide.length ? formatList(historicSide) : null;
    const residentialLine = residentialEscape.length
      ? formatList(residentialEscape)
      : null;

    return {
      title: "Neighborhoods & City Life",
      paragraphs: [
        `${cityName} feels most alive when you move between its neighborhoods instead of sticking to a single district. Start in ${walkableLine}, where cafés, boutiques, and older buildings keep the streets busy from morning into the evening.${artsyLine ? ` From there, head toward ${artsyLine} for murals, music venues, and the creative energy that shows up in vintage shops and chef-driven restaurants.` : ""}${historicLine ? ` ${historicLine} offers a more residential pace, with leafy blocks, historic homes, and local parks that make it easy to slow down.` : ""}`,
        `${
          residentialLine
            ? `If you still have time, spend a few hours in ${residentialLine} for a quieter look at how residents live day to day.`
            : "If you still have time, wander a quieter residential pocket for a look at how residents live day to day."
        } The contrast between walkable cores, artsy corridors, and residential pockets is what makes ${cityName} feel layered—you can move from a bustling café row to a calm neighborhood greenway in a matter of minutes. Plan to stop often, because the best discoveries come from corner bakeries, local bookstores, and small galleries that anchor each district.`,
        `Getting between neighborhoods is part of the experience. Many of ${cityName}’s districts are close enough for walking or biking, especially along the main commercial corridors, and transit lines make it easy to hop between neighborhoods without a car. Use a bike share for a midday loop, then ride transit to dinner or a late-night show. That easy movement keeps the itinerary flexible and lets you experience multiple sides of the city in a single day.`,
      ],
    };
  }

  return {
    title: "Neighborhoods & City Life",
    paragraphs: [
      `${cityName} rewards visitors who explore beyond the main attractions and spend time in the neighborhoods where daily life unfolds. Start with ${neighborhoodsLine}, where the mood shifts block by block—from leafy residential avenues to pocket parks and café patios that fill up by late morning. These areas are perfect for a slow walk with room for detours: indie bookstores, corner bakeries, and pocket galleries that give the city its lived-in feel. Even without a fixed plan, you’ll notice how architecture, street art, and small businesses signal the different eras that shaped ${cityName}.`,
      `The city’s social heartbeat often comes alive around ${districtsLine}. These hubs are where locals meet after work, where visiting chefs host pop-ups, and where a visitor can sample the city’s flavors without needing a reservation at every stop. Look for multi-vendor food halls, late-night dessert counters, and patios that double as people-watching spots. The rhythm is casual and welcoming—arrive with curiosity, ask for recommendations, and allow the day to stretch out as you move from lunch to a local shop to an unexpected live set.`,
      `Neighborhoods also tell the story of how ${cityName} sees itself today. Some districts emphasize preservation, keeping historic homes and community gardens intact; others are in the middle of reinvention, with new hotels, galleries, and public art projects rising alongside legacy businesses. Travelers who spend time in both get the full picture: a city that honors its roots while experimenting with new energy. Whether you’re biking between districts or riding transit to a late-night show, the shared experience is the same—people choosing to stay out a little longer because the atmosphere feels easy and genuinely local.`,
    ],
  };
};

const buildOutdoorsEssay = (
  cityName: string,
  parentName: string,
  landmarks: CityLandmarks | null,
  metadata: CityLandmarkMetadata | null,
  cityFacts: CityFacts,
): GuideEssaySection => {
  const outdoors = cityFacts.outdoors;
  const scenicAreas = metadata?.scenicAreas ?? [];
  const outdoorsLine = formatLandmarkList(
    outdoors,
    `a mix of greenways, riverfront paths, and hillside viewpoints that frame the skyline`,
  );
  const scenicLine = scenicAreas.length
    ? `Local favorites like ${formatList(scenicAreas)} keep the scenery close at hand.`
    : `Quick trips to ${formatList(cityFacts.nearby)} add variety without leaving the region behind.`;

  return {
    title: "Outdoors & Scenic Experiences",
    paragraphs: [
      `${cityName} makes it easy to balance city energy with outdoor breathing room. Start with ${outdoorsLine}, where visitors can walk, bike, or find a quiet bench with a view. ${scenicLine} These spaces act like living rooms for locals, with joggers at sunrise and casual gatherings that stretch into the evening.`,
      `Beyond the core parks, ${cityName} opens up to the wider landscape of ${parentName}. Scenic overlooks and regional trails highlight how the terrain shapes the city’s pace, from shaded greenways to open ridgelines that glow at golden hour. Plan a half-day outing with comfortable shoes and a flexible schedule, then stay for sunset as locals arrive with dogs, bikes, and blankets.`,
      `Outdoor time also connects visitors to the city’s creative life. Murals along trails, seasonal art markets, and pop-up food vendors blur the line between nature and culture. Pack snacks, take advantage of trail-side cafés, and let the route guide you—whether that means a short loop or a longer stretch toward one of the nearby day trips.`,
    ],
  };
};

const buildTopThingsToDo = (
  cityName: string,
  parentName: string,
  parentSlug: string,
  citySlug: string,
  cityFacts: CityFacts,
): GuideListItem[] => {
  const landmarks = getCityLandmarks(parentSlug, citySlug);
  const metadata = getCityMetadata(parentSlug, citySlug);
  const candidates = uniqueValues([
    ...(landmarks?.museums ?? []),
    ...(landmarks?.culturalSites ?? []),
    ...(metadata?.culturalAreas ?? []),
    ...cityFacts.anchors,
    ...cityFacts.outdoors,
    ...cityFacts.nearby,
    `Historic Downtown ${cityName}`,
    `Old Town ${cityName}`,
    `${cityName} Arts District`,
    `${cityName} Town Square`,
    `${cityName} Community Green`,
  ]);

  const paddedCandidates = [...candidates];
  const fallbackExtras = [
    `${cityName} Heritage Walk`,
    `${cityName} Main Street`,
    `${cityName} Scenic Overlook`,
    `${cityName} Town Square`,
    `${cityName} Nature Preserve`,
  ];
  fallbackExtras.forEach((item) => {
    if (paddedCandidates.length < 15 && !paddedCandidates.includes(item)) {
      paddedCandidates.push(item);
    }
  });

  const anchorSet = new Set(cityFacts.anchors);
  const outdoorSet = new Set(cityFacts.outdoors);
  const nearbySet = new Set(cityFacts.nearby);
  const museumSet = new Set([
    ...(landmarks?.museums ?? []),
    ...(landmarks?.culturalSites ?? []),
  ]);

  return paddedCandidates.slice(0, 15).map((item) => {
    let description = `Explore ${item} to see how ${cityName} comes alive day to day.`;

    if (nearbySet.has(item)) {
      description = `Plan a half-day trip to ${item} for a change of scenery and a deeper look at the wider ${parentName} region.`;
    } else if (outdoorSet.has(item)) {
      description = `Spend outdoor time at ${item} with a walk, bike loop, or scenic overlook stop.`;
    } else if (museumSet.has(item)) {
      description = `Add ${item} to your culture loop for a focused look at local history and creativity.`;
    } else if (anchorSet.has(item)) {
      description = `Schedule a slow stroll through ${item} to catch local cafés, shops, and the city’s everyday rhythm.`;
    }

    return {
      title: item,
      description,
    };
  });
};

const buildCityThingsToDoSections = (
  cityName: string,
  parentName: string,
  parentSlug: string,
  citySlug: string,
  cityFacts: CityFacts,
): GuideEssaySection[] => {
  const landmarks = getCityLandmarks(parentSlug, citySlug);
  const metadata = getCityMetadata(parentSlug, citySlug);

  return [
    buildMuseumsEssay(cityName, parentName, landmarks, metadata),
    buildNeighborhoodsEssay(cityName, parentName, landmarks, metadata, cityFacts),
    buildOutdoorsEssay(cityName, parentName, landmarks, metadata, cityFacts),
  ];
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
  const landmarks = getCityLandmarks(parentSlug, citySlug);
  const metadata = getCityMetadata(parentSlug, citySlug);
  const cityFacts = buildCityGuideFacts({
    cityName,
    citySlug,
    parentName,
    parentSlug,
    regionType,
    tours: cityTours,
    landmarks,
    metadata,
  });

  return {
    type: "city",
    name: cityName,
    slug: citySlug,
    parentName,
    parentSlug,
    regionType,
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
    guideImages: getGuideImages(
      citySlug,
      regionType === "state" ? parentSlug : undefined,
      regionType === "country" ? parentSlug : undefined,
    ),
    thingsToDoSections: buildCityThingsToDoSections(
      cityName,
      parentName,
      parentSlug,
      citySlug,
      cityFacts,
    ),
    topThingsToDo: buildTopThingsToDo(
      cityName,
      parentName,
      parentSlug,
      citySlug,
      cityFacts,
    ),
  };
};
