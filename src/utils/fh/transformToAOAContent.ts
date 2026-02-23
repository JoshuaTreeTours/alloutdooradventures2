import type { ParsedFareHarborContent } from "./parseFareHarborHtml";

export type AOAEnrichedContent = {
  whatYoullExperience: string;
  highlights: string[];
  quickFacts?: {
    duration?: string;
    meetingPoint?: string;
    age?: string;
    groupSize?: string;
    cancellation?: string;
    accessibility?: string;
  };
  whatsIncluded?: string[];
  whatsNotIncluded?: string[];
  faq?: { q: string; a: string }[];
  pricing?: { label: string; price: string }[];
  schemaDescription: string;
};

const getIntentHook = (tourName: string) => {
  const name = tourName.toLowerCase();
  if (name.includes("fault") || name.includes("jeep")) {
    return "This route puts Palm Springs desert geology front and center with a guide leading the way.";
  }
  if (name.includes("canyon") || name.includes("oasis")) {
    return "This tour focuses on canyon terrain and palm oases that shape Palm Springs landscapes.";
  }
  if (name.includes("tram") || name.includes("tramway")) {
    return "This itinerary highlights Palm Springs elevation changes and big mountain-to-desert contrasts.";
  }
  if (name.includes("hike") || name.includes("trail")) {
    return "This guided outing is built for travelers who want to experience Palm Springs trails with local context.";
  }

  return "This Palm Springs guided tour is designed for travelers who want a structured, local-led experience.";
};

const buildFallbackHighlights = (tourName: string) => [
  `Guided format for ${tourName} in Palm Springs.`,
  "Local commentary that helps explain the area as you travel.",
  "Planned routing so you can focus on the experience instead of logistics.",
  "Time for photos at selected stops when conditions allow.",
  "A practical option for first-time visitors to Palm Springs.",
];

export const transformToAOAContent = ({
  tourName,
  city,
  parsed,
}: {
  tourName: string;
  city: string;
  parsed?: ParsedFareHarborContent | null;
}): AOAEnrichedContent => {
  const hook = getIntentHook(tourName);
  const detail = parsed?.activityDetails
    ? `Expect a guided pace with practical context: ${parsed.activityDetails}`
    : `You'll explore key areas around ${city} with a guide and a route built for sightseeing and learning.`;

  const factsSentence = [
    parsed?.duration ? `Duration is listed as ${parsed.duration}.` : null,
    parsed?.meetingPoint
      ? `Meeting point is ${parsed.meetingPoint}.`
      : "Meeting point details should be confirmed after booking.",
    parsed?.cancellationPolicy
      ? `Cancellation terms: ${parsed.cancellationPolicy}.`
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  const whatYoullExperience = [
    hook,
    `${tourName} is offered in ${city} as a guided tour with operator-managed pacing.`,
    detail,
    factsSentence,
    "Bring water, sun protection, and confirm final logistics directly with the operator before departure.",
  ]
    .filter(Boolean)
    .join(" ");

  const highlights =
    parsed?.highlights && parsed.highlights.length >= 3
      ? parsed.highlights.slice(0, 9)
      : buildFallbackHighlights(tourName);

  return {
    whatYoullExperience,
    highlights,
    quickFacts: {
      duration: parsed?.duration,
      meetingPoint: parsed?.meetingPoint,
      age: parsed?.ageMin,
      groupSize: parsed?.groupSize,
      cancellation: parsed?.cancellationPolicy,
      accessibility: parsed?.accessibilityNotes,
    },
    whatsIncluded: parsed?.included?.slice(0, 8),
    whatsNotIncluded: parsed?.notIncluded?.slice(0, 8),
    faq: parsed?.faq?.slice(0, 6),
    pricing: parsed?.pricing?.slice(0, 6),
    schemaDescription: `${tourName} is a guided tour in ${city} with route details and logistics based on verified operator-facing booking information. Confirm meeting instructions and inclusions before departure.`,
  };
};
