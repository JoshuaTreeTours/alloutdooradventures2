export type FareHarborStructuredData = {
  title?: string;
  description?: string;
  operator?: string;
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

const trimArray = (items?: string[]) =>
  (items ?? []).map(item => item.trim()).filter(Boolean);

export const transformFareHarborToAOAContent = (
  tourName: string,
  source: FareHarborStructuredData,
  supplierSource?: {
    description?: string;
    highlights?: string[];
  }
): AOAEnrichedTourContent => {
  const introHook = getHook(tourName);
  const authoritativeHighlights = trimArray(source.rawHighlights);
  const supplierHighlights = trimArray(supplierSource?.highlights);
  const highlights = Array.from(
    new Set([...authoritativeHighlights, ...supplierHighlights])
  ).slice(0, 8);
  const itinerary = trimArray(source.itinerary).slice(0, 6);
  const included = trimArray(source.included);
  const notIncluded = trimArray(source.notIncluded);
  const rules = trimArray(source.requirements);
  const duration = source.duration?.trim();
  const meetingLocation = source.meetingLocation?.trim();

  const authorityDescription = source.description?.trim();
  const supplierDescription = supplierSource?.description?.trim();
  const whatYoullExperience =
    authorityDescription ??
    supplierDescription ??
    `${introHook} with a guide who explains how Palm Springs geology, desert ecology, and route conditions shape the day. This tour balances scenic driving and stop-based interpretation so you are not just passing viewpoints. Expect a practical briefing at the start, followed by a steady pace that leaves time for photos and short walks where conditions allow. Guides typically connect major landmarks to the wider Coachella Valley story, including fault movement, canyons, and water in the desert. Group flow, weather, and seasonal access can shift exact stop timing, so details may vary by departure.`;

  return {
    quickFacts: {
      duration,
      startLocationArea: meetingLocation,
      pickup: source.pickup ?? "unknown",
      ageOrMinimumRequirements: rules.find(item =>
        /age|minimum|child|height|weight/i.test(item)
      ),
    },
    whatYoullExperience,
    experienceInDepth: [
      `After check-in, the guide sets expectations for terrain, temperature, and comfort stops before departure. From there, the route moves through Palm Springs-area desert corridors where road cuts and washes make geologic layers easier to read in the field.`,
      `As the trip develops, narration usually links landforms to present-day travel conditions: where erosion channels form, how wind and water shape canyons, and why oasis pockets exist in otherwise dry zones. Instead of generic commentary, the guide can answer questions tied to the exact sections you are traveling through.`,
      `When the itinerary includes walking segments, they are typically short and focused on observation points rather than endurance hiking. The result is an experience that feels both educational and scenic, with a clear sense of place specific to greater Palm Springs.`,
    ],
    highlights,
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
