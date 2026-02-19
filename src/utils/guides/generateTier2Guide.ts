import { getGuideStateBySlug } from "../../data/guideData";
import { buildSeoLinks } from "./buildSeoLinks";
import { selectCityHeroFromTours } from "./selectCityHeroFromTours";
import { extractCityLandmarksFromTours } from "./extractCityLandmarksFromTours";
import { buildTier2ThingsToDo } from "./buildTier2ThingsToDo";
import type { GuidePageData } from "../loadGuide";

type Tier2GenerationResult = {
  guide: GuidePageData;
  usedHeroFallback: boolean;
};

export const generateTier2Guide = async (
  stateSlug: string,
  citySlug: string,
  cityName: string
): Promise<Tier2GenerationResult> => {
  const state = getGuideStateBySlug(stateSlug);
  if (!state) {
    throw new Error(`Unknown state slug: ${stateSlug}`);
  }

  const hero = selectCityHeroFromTours(
    stateSlug,
    citySlug,
    cityName,
    state.name
  );

  const landmarks = extractCityLandmarksFromTours(stateSlug, citySlug);
  const thingsToDo = buildTier2ThingsToDo(
    cityName,
    state.name,
    landmarks
  ).slice(0, 6);

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
