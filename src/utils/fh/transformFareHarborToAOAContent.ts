import { getPalmSpringsAuthorityContext } from "../palmSprings/getPalmSpringsAuthorityContext";

export type FareHarborStructuredData = {
  title?: string;
  duration?: string;
  meetingLocation?: string;
  included?: string[];
  notIncluded?: string[];
  requirements?: string[];
  cancellation?: string;
  pickup?: "yes" | "no" | "unknown";
  itinerary?: string[];
  faq?: Array<{ question: string; answer: string }>;
  rawHighlights?: string[];
};

export type AOAEnrichedTourContent = {
  quickFacts?: {
    duration?: string;
    startLocationArea?: string;
    pickup?: "yes" | "no" | "unknown";
    difficulty?: string;
    ageOrMinimumRequirements?: string;
  };
  whatYoullExperience?: string;
  experienceInDepth?: string[];
  highlights?: string[];
  whyThisLandscapeMatters?: string[];
  schemaContextSentence?: string;
  itineraryOutline?: string[];
  whoItsFor?: string[];
  included?: string[];
  notIncluded?: string[];
  rulesAndRequirements?: string[];
  cancellationSummary?: string;
  faq?: Array<{ question: string; answer: string }>;
};

const hookByEntity: Array<{ match: RegExp; hook: string }> = [
  { match: /fault/i, hook: "Trace the San Andreas fault zone" },
  { match: /canyon/i, hook: "Follow canyon roads into desert oases" },
  {
    match: /joshua/i,
    hook: "Travel from Palm Springs into Joshua Tree landscapes",
  },
  { match: /jeep/i, hook: "Ride into Palm Springs backcountry by Jeep" },
  { match: /oasis/i, hook: "Explore palm-lined oases in arid terrain" },
];

const getHook = (tourName: string) => {
  const matched = hookByEntity.find(entry => entry.match.test(tourName));
  return matched?.hook ?? `See a different side of Palm Springs on ${tourName}`;
};

const openingTemplates = [
  (hook: string) =>
    `${hook} while a guide interprets the geology and ecology that shape Palm Springs routes.`,
  (hook: string) =>
    `Built around place-based interpretation, this outing starts with ${hook.toLowerCase()} and connects each stop to local geology.`,
  (hook: string) =>
    `From the first segment, ${hook.toLowerCase()} becomes a framework for understanding Palm Springs terrain and desert systems.`,
  (hook: string) =>
    `${hook} and use each stop to map how tectonics, water, and climate define the Coachella Valley.`,
];

const hashString = (value: string) =>
  value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

const buildOpeningSentence = (tourName: string, introHook: string) => {
  const template =
    openingTemplates[hashString(tourName) % openingTemplates.length];
  return template(introHook);
};

const trimArray = (items?: string[]) =>
  (items ?? []).map(item => item.trim()).filter(Boolean);

export const transformFareHarborToAOAContent = (
  tourName: string,
  source: FareHarborStructuredData,
  options?: {
    tourSlug?: string;
    tourCategory?: string;
  }
): AOAEnrichedTourContent => {
  const introHook = getHook(tourName);
  const openingSentence = buildOpeningSentence(tourName, introHook);
  const highlights = trimArray(source.rawHighlights).slice(0, 8);
  const itinerary = trimArray(source.itinerary).slice(0, 6);
  const included = trimArray(source.included);
  const notIncluded = trimArray(source.notIncluded);
  const rules = trimArray(source.requirements);
  const duration = source.duration?.trim();
  const meetingLocation = source.meetingLocation?.trim();
  const authorityContext = getPalmSpringsAuthorityContext({
    title: tourName,
    slug: options?.tourSlug,
    category: options?.tourCategory,
  });
  const authoritySentences = [
    ...(authorityContext.geology ?? []),
    ...(authorityContext.environment ?? []),
    ...(authorityContext.locationContext ?? []),
    ...(authorityContext.activityContext ?? []),
  ];
  const authorityForDepth = authoritySentences.slice(0, 2);
  const authorityForHighlights = [
    ...(authorityContext.activityContext ?? []),
    ...(authorityContext.geology ?? []),
    ...(authorityContext.environment ?? []),
    ...(authorityContext.locationContext ?? []),
  ]
    .filter(item => !highlights.includes(item))
    .slice(0, 3);
  const mergedHighlights = [...highlights, ...authorityForHighlights].slice(
    0,
    10
  );
  const landscapeMatters = [
    ...(authorityContext.geology ?? []).slice(0, 2),
    ...(authorityContext.environment ?? []).slice(0, 2),
    ...(authorityContext.locationContext ?? []).slice(0, 1),
  ];
  const schemaContextSentence = authoritySentences[0];

  return {
    quickFacts: {
      duration,
      startLocationArea: meetingLocation,
      pickup: source.pickup ?? "unknown",
      ageOrMinimumRequirements: rules.find(item =>
        /age|minimum|child|height|weight/i.test(item)
      ),
    },
    whatYoullExperience: `${openingSentence} This tour balances scenic driving and stop-based interpretation so you are not just passing viewpoints. Expect a practical briefing at the start, followed by a steady pace that leaves time for photos and short walks where conditions allow. Guides typically connect major landmarks to the wider Coachella Valley story, including fault movement, canyons, and water in the desert. Group flow, weather, and seasonal access can shift exact stop timing, so details may vary by departure.`,
    experienceInDepth: [
      `After check-in, the guide sets expectations for terrain, temperature, and comfort stops before departure. From there, the route moves through Palm Springs-area desert corridors where road cuts and washes make geologic layers easier to read in the field.`,
      `As the trip develops, narration usually links landforms to present-day travel conditions: where erosion channels form, how wind and water shape canyons, and why oasis pockets exist in otherwise dry zones. Instead of generic commentary, the guide can answer questions tied to the exact sections you are traveling through.`,
      `When the itinerary includes walking segments, they are typically short and focused on observation points rather than endurance hiking. The result is an experience that feels both educational and scenic, with a clear sense of place specific to greater Palm Springs.`,
      ...authorityForDepth,
    ],
    highlights: mergedHighlights,
    whyThisLandscapeMatters: landscapeMatters.length
      ? landscapeMatters
      : undefined,
    schemaContextSentence,
    itineraryOutline: itinerary.length
      ? itinerary
      : [
          "Meet guide and review route logistics before departure",
          "Travel into Palm Springs desert terrain with live interpretation",
          "Stop at key viewpoints for photos and short ground-level exploration",
          "Return with local recommendations for the rest of your day",
        ],
    whoItsFor: [
      "Travelers who want context on desert geology, not only scenic photos",
      "First-time Palm Springs visitors building orientation early in their trip",
      "Couples, families, and small groups who prefer guided logistics",
      "Guests comfortable with variable desert temperatures and light outdoor movement",
    ],
    included,
    notIncluded,
    rulesAndRequirements: rules,
    cancellationSummary: source.cancellation
      ? `Cancellation terms are set by the operator and can vary by departure window. ${source.cancellation}`
      : undefined,
    faq: source.faq?.filter(item => item.question && item.answer).slice(0, 5),
  };
};
