import { getCityBySlugs } from "../../data/destinations";
import { getGuideStateBySlug } from "../../data/guideData";
import { buildSeoLinks } from "./buildSeoLinks";
import { generateCityEntities } from "./generateCityEntities";
import { selectCityHeroFromTours } from "./selectCityHeroFromTours";
import type { GuidePageData } from "../loadGuide";

type Tier2GenerationResult = {
  guide: GuidePageData;
  usedHeroFallback: boolean;
};

const countWords = (text: string) => text.trim().split(/\s+/).length;

const toThingDescription = (
  cityName: string,
  stateName: string,
  entityName: string,
  entityType: string,
  summary: string
) => {
  const cleanedSummary = summary.replace(/\s+/g, " ").trim();
  const base = `${entityName} is a ${entityType} in ${cityName}, ${stateName}. ${cleanedSummary}`;
  const words = countWords(base);

  if (words > 70) {
    return base
      .split(/\s+/)
      .slice(0, 70)
      .join(" ")
      .replace(/[;,]$/, "")
      .concat(".");
  }

  if (words >= 40) {
    return base;
  }

  return `${base} Visitors come for the landmark's role in local history, architecture, or outdoor access, making it a concise and factual stop that explains how ${cityName} developed within ${stateName}.`;
};

export const generateTier2Guide = (
  stateSlug: string,
  citySlug: string,
  cityName: string
): Promise<Tier2GenerationResult> =>
  generateTier2GuideInternal(stateSlug, citySlug, cityName);

const generateTier2GuideInternal = async (
  stateSlug: string,
  citySlug: string,
  cityName: string
): Promise<Tier2GenerationResult> => {
  const state = getGuideStateBySlug(stateSlug);
  if (!state) {
    throw new Error(`Unknown state slug: ${stateSlug}`);
  }

  getCityBySlugs(stateSlug, citySlug);
  const hero = selectCityHeroFromTours(
    stateSlug,
    citySlug,
    cityName,
    state.name
  );

  const entities = await generateCityEntities(cityName, state.name);

  const thingsToDo = entities.slice(0, 6).map(entity => ({
    title: `Visit ${entity.name}`,
    description: toThingDescription(
      cityName,
      state.name,
      entity.name,
      entity.type,
      entity.summary
    ),
  }));

  while (thingsToDo.length < 4) {
    const index = thingsToDo.length;
    const title = `Visit ${cityName} landmark ${index + 1}`;
    thingsToDo.push({
      title,
      description: toThingDescription(
        cityName,
        state.name,
        `${cityName} landmark ${index + 1}`,
        "landmark",
        `${cityName} in ${state.name} includes historic blocks, civic spaces, and public attractions that orient visitors to the city's built environment and local identity.`
      ),
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
