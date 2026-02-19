import { getCityBySlugs } from "../../data/destinations";
import { getGuideStateBySlug } from "../../data/guideData";
import { buildSeoLinks } from "./buildSeoLinks";
import { selectCityHeroFromTours } from "./selectCityHeroFromTours";
import type { GuidePageData } from "../loadGuide";

type Tier2GenerationResult = {
  guide: GuidePageData;
  usedHeroFallback: boolean;
};

const toThingTitle = (value: string, cityName: string) =>
  value
    .replace(/\.$/, "")
    .replace(
      /^(Walk|Hike|Bike|Paddle|Explore|Visit|Take|Spend|Plan|Ride|Tour)\s+/i,
      ""
    )
    .replace(new RegExp(`^${cityName}\\s+`, "i"), "")
    .trim();

const toThingDescription = (cityName: string, title: string, index: number) => {
  const options = [
    `${title} is one of the easiest ways to understand ${cityName}. Plan about one to two hours, then pair it with a nearby cafe, neighborhood walk, or guided outing. This stop adds a recognizable anchor to your ${cityName} itinerary without forcing extra travel time.`,
    `If you are building a shorter trip, include ${title} in your ${cityName} plan. It offers a practical mix of local character and scenery, and it connects well with nearby districts. Most visitors can fit it into a half-day block and still keep the day flexible.`,
    `Many travelers rank ${title} as a high-value stop in ${cityName} because it combines atmosphere, easy access, and good pacing for first-time visitors. Schedule it early, then continue with another nearby attraction so your ${cityName} route stays efficient and balanced.`,
    `For a reliable local experience in ${cityName}, add ${title} to your route. It works well as a morning or sunset stop and pairs naturally with nearby food spots, outdoor walks, or culture-focused neighborhoods, giving your ${cityName} day strong variety without overplanning.`,
  ];

  return options[index % options.length];
};

export const generateTier2Guide = (
  stateSlug: string,
  citySlug: string,
  cityName: string
): Tier2GenerationResult => {
  const state = getGuideStateBySlug(stateSlug);
  if (!state) {
    throw new Error(`Unknown state slug: ${stateSlug}`);
  }

  const city = getCityBySlugs(stateSlug, citySlug);
  const hero = selectCityHeroFromTours(
    stateSlug,
    citySlug,
    cityName,
    state.name
  );

  const baseThings = city?.thingsToDo?.length
    ? city.thingsToDo.slice(0, 4)
    : [
        `Visit downtown ${cityName}.`,
        `Explore a local neighborhood in ${cityName}.`,
        `Spend time in an outdoor area near ${cityName}.`,
        `Book a local guided experience in ${cityName}.`,
      ];

  const thingsToDo = baseThings.map((item, index) => {
    const cleaned =
      toThingTitle(item, cityName) || `${cityName} highlight ${index + 1}`;

    return {
      title: cleaned.charAt(0).toUpperCase() + cleaned.slice(1),
      description: toThingDescription(cityName, cleaned, index),
    };
  });

  while (thingsToDo.length < 4) {
    const index = thingsToDo.length;
    const title = `${cityName} local experience ${index + 1}`;
    thingsToDo.push({
      title,
      description: toThingDescription(cityName, title, index),
    });
  }

  const seoLinks = buildSeoLinks({
    city: cityName,
    state: state.name,
  });

  return {
    usedHeroFallback: !hero,
    guide: {
      tier: "tier2",
      title: `${cityName}, ${state.name} Travel Guide`,
      country: "United States",
      state: state.name,
      city: cityName,
      slug: `guides/us/${stateSlug}/${citySlug}`,
      hero: {
        image: hero?.imageUrl ?? "/hero.jpg",
        alt: hero?.alt ?? `${cityName}, ${state.name} travel skyline`,
        headline: `${cityName}, ${state.name} Travel Guide`,
        subheadline: `Plan a focused ${cityName} trip with practical highlights, local context, and easy tour connections.`,
      },
      overview: [
        `${cityName}, ${state.name} is a strong base for travelers who want a concise mix of landmark stops, local neighborhoods, and outdoor time. This Tier-2 guide gives you quick planning coverage with essential experiences and practical pacing. Start each day with one anchor attraction, then add a nearby activity to reduce transit time and keep your ${cityName} itinerary efficient while still feeling varied and local.`,
      ],
      highlights: [
        {
          title: `${cityName} essentials`,
          description:
            "Prioritize one signature attraction each day for better pacing.",
        },
        {
          title: `${cityName} local character`,
          description:
            "Add nearby neighborhoods and outdoor stops for variety.",
        },
      ],
      thingsToDo,
      bestTimeToVisit: {
        title: `Shoulder seasons are typically easiest in ${cityName}`,
        bullets: [
          "Spring and fall usually offer comfortable weather and smoother logistics.",
          "Reserve popular tours and timed attractions early in busy periods.",
          "Use morning starts for major sights and photo-heavy locations.",
        ],
      },
      travelTips: [
        `Group activities by area to reduce transfers across ${cityName}.`,
        "Pre-book top tours and high-demand attractions when your dates are set.",
        "Leave one flexible time block each day for weather and local recommendations.",
      ],
      faq: [
        {
          q: `How many days should I plan for ${cityName}?`,
          a: `Two to three days is enough for core ${cityName} highlights plus one or two local experiences.`,
        },
        {
          q: `Should I book tours ahead in ${cityName}?`,
          a: "Yes—advance booking is recommended for weekends, holidays, and top-rated operators.",
        },
      ],
      tours: {
        stateSlug,
        citySlug,
        limit: 6,
        title: `Top ${cityName} tours`,
      },
      seoLinks,
    },
  };
};
