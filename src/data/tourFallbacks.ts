import type { City, StateDestination } from "./destinations";
import { tours } from "./tours";
import { getAllEngine2Tours } from "../engine2/data/loadEngine2";
import { slugify } from "../utils/slugify";

const buildActivityTags = (slugs: string[]) =>
  Array.from(new Set(slugs)).map((slug) => slug.replace(/-/g, " "));

const buildFallbackCity = ({
  cityName,
  citySlug,
  stateName,
  stateSlug,
  activityTags,
  lat,
  lng,
}: {
  cityName: string;
  citySlug: string;
  stateName: string;
  stateSlug: string;
  activityTags: string[];
  lat?: number;
  lng?: number;
}): City => {
  const activityList = activityTags.length
    ? activityTags.join(", ")
    : "guided tours";

  return {
    name: cityName,
    slug: citySlug,
    stateSlug,
    region: "Featured destination",
    lat: Number.isFinite(lat) ? (lat as number) : Number.NaN,
    lng: Number.isFinite(lng) ? (lng as number) : Number.NaN,
    shortDescription: `Guided adventures, local trails, and outdoor experiences around ${cityName}.`,
    intro: `${cityName} is a strong basecamp for ${activityList} in ${stateName}.`,
    heroImages: ["/hero.jpg"],
    activityTags: activityTags.length ? activityTags : ["cycling", "hiking", "canoeing"],
    whereItIs: [
      `${cityName} sits within ${stateName}, giving travelers access to scenic routes, waterways, and trailheads close to town.`,
      `Use the city as a launch point for guided experiences that showcase the best of the surrounding landscape.`,
    ],
    experiences: {
      mountains: `Look for ridge walks and scenic overlooks just outside of ${cityName}.`,
      lakesWater: `Plan a paddle or calm water adventure near ${cityName} when conditions are calm.`,
      desertForest: `Regional parks near ${cityName} deliver forested trails and open landscape hikes.`,
      cycling: `Local bike paths and guided rides make it easy to explore around ${cityName}.`,
      scenicDrives: `Short drives from ${cityName} reveal scenic byways and classic viewpoints.`,
      seasonalNotes: `Spring and fall bring mild temperatures and clear skies around ${cityName}.`,
    },
    thingsToDo: [
      `Ride a scenic bike loop around ${cityName}.`,
      `Join a guided hike with panoramic overlooks.`,
      `Plan a paddle-friendly outing near ${cityName}.`,
      `Explore a local park or nature preserve.`,
      `Catch golden hour at a nearby viewpoint.`,
    ],
    toursCopy: [
      `Plan a half-day tour to get oriented with ${cityName}'s outdoor highlights.`,
      `Pair a guided adventure with free time for local food and neighborhoods.`,
      `Use activity filters to compare ${activityList} available now.`,
    ],
    weekendItinerary: {
      dayOne: [
        `Morning: grab coffee in ${cityName} and start a guided tour.`,
        `Afternoon: unwind at a local overlook or waterfront.`,
        `Evening: explore downtown ${cityName} for dinner.`,
      ],
      dayTwo: [
        `Morning: hit a scenic trail or bike path.`,
        `Afternoon: visit a nearby park or market.`,
        `Evening: finish with a sunset viewpoint or easy stroll.`,
      ],
    },
    gettingThere: [
      `Fly or drive into ${cityName}, then use rideshare or rental car to reach trailheads.`,
      `Many tours depart from central pickup points near downtown ${cityName}.`,
    ],
    faq: [
      {
        question: `When is the best time to visit ${cityName}?`,
        answer: `Shoulder seasons deliver comfortable temperatures and fewer crowds in ${cityName}.`,
      },
      {
        question: `Do I need to book tours in advance?`,
        answer:
          "Popular departures fill quickly, so reserving ahead is recommended for peak travel dates.",
      },
    ],
  };
};

const buildFallbackState = (
  stateName: string,
  stateSlug: string,
  cities: City[],
): StateDestination => ({
  slug: stateSlug,
  name: stateName,
  description: `Outdoor experiences across ${stateName}.`,
  heroImage: "/hero.jpg",
  region: "Featured destination",
  intro: `Plan multi-activity getaways across ${stateName} with guided tours and local experts.`,
  longDescription: `${stateName} delivers a mix of easy access trail networks, scenic drives, and waterside adventures. Use a city basecamp to mix guided tours with free exploration, keeping the itinerary flexible while you explore the best of the region.\n\nAs tour inventory grows, each city in ${stateName} will highlight its local specialties so travelers can book with confidence.`,
  topRegions: [
    {
      title: "Trail networks",
      description: `Find day hikes, scenic lookouts, and local parks across ${stateName}.`,
    },
    {
      title: "Waterways",
      description: `Paddling routes and calm water escapes are easy to reach in ${stateName}.`,
    },
    {
      title: "Scenic drives",
      description: `Short drives from city centers reveal iconic views and seasonal highlights.`,
    },
  ],
  cities,
  isFallback: true,
});

const buildAverageCoordinate = (values: Array<number | undefined>) => {
  const valid = values.filter((value) => Number.isFinite(value)) as number[];
  if (!valid.length) {
    return undefined;
  }
  const sum = valid.reduce((total, value) => total + value, 0);
  return sum / valid.length;
};

export const getFallbackStateBySlug = (stateSlug: string) => {
  const stateTours = tours.filter(
    (tour) => tour.destination.stateSlug === stateSlug,
  );

  const engine2StateTours = getAllEngine2Tours().filter(
    tour =>
      tour.seo.canonicalPath.startsWith(`/destinations/${stateSlug}/`) ||
      tour.seo.canonicalPath.startsWith(`/destinations/united-states/${stateSlug}/`)
  );

  if (!stateTours.length && !engine2StateTours.length) {
    if (stateSlug === "mexico") {
      return buildFallbackState("Mexico", "mexico", []);
    }

    return null;
  }

  const engine2CountryMatch = engine2StateTours.find(
    tour => tour.sourceCountrySlug === stateSlug || slugify(tour.geo.country) === stateSlug
  );
  const stateName =
    stateTours[0]?.destination.state ??
    engine2CountryMatch?.geo.country ??
    engine2StateTours[0]?.geo.region ??
    stateSlug;
  const citySlugs = Array.from(
    new Set([
      ...stateTours.map((tour) => tour.destination.citySlug),
      ...engine2StateTours.map(tour => tour.sourceCitySlug),
    ]),
  );
  const cities = citySlugs
    .map((citySlug) =>
      getFallbackCityBySlugs(stateSlug, citySlug),
    )
    .filter((city): city is City => Boolean(city));

  return buildFallbackState(stateName, stateSlug, cities);
};

export const getFallbackCityBySlugs = (
  stateSlug: string,
  citySlug: string,
) => {
  const cityTours = tours.filter(
    (tour) =>
      tour.destination.stateSlug === stateSlug &&
      tour.destination.citySlug === citySlug,
  );
  const engine2CityTours = getAllEngine2Tours().filter(
    tour =>
      (tour.seo.canonicalPath.startsWith(`/destinations/${stateSlug}/${citySlug}/tours/`) ||
        tour.seo.canonicalPath.startsWith(
          `/destinations/united-states/${stateSlug}/${citySlug}/tours/`
        )) ||
      tour.seo.canonicalPath === `/destinations/${stateSlug}/tours/${tour.slug}` ||
      tour.seo.canonicalPath ===
        `/destinations/united-states/${stateSlug}/tours/${tour.slug}`
  );

  if (!cityTours.length && !engine2CityTours.length) {
    return null;
  }

  const stateName = cityTours[0]?.destination.state ?? engine2CityTours[0]?.geo.region ?? stateSlug;
  const cityName = cityTours[0]?.destination.city ?? engine2CityTours[0]?.geo.city ?? citySlug;
  const activityTags = buildActivityTags(
    [
      ...cityTours.flatMap((tour) => tour.activitySlugs),
      ...(engine2CityTours.length ? ["adventure"] : []),
    ],
  );
  const lat = buildAverageCoordinate(
    [
      ...cityTours.map((tour) => tour.destination.lat),
      ...engine2CityTours.map(tour => tour.geo.lat ?? undefined),
    ],
  );
  const lng = buildAverageCoordinate(
    [
      ...cityTours.map((tour) => tour.destination.lng),
      ...engine2CityTours.map(tour => tour.geo.lng ?? undefined),
    ],
  );

  return buildFallbackCity({
    cityName,
    citySlug,
    stateName,
    stateSlug,
    activityTags,
    lat,
    lng,
  });
};
