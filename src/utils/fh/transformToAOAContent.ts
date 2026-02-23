import type { ParsedFareHarborFields } from "./parseFareHarborHtml";

type TourMetadata = {
  title: string;
  destination?: string;
  category?: string;
};

export type AOAEnrichedContent = {
  whatYoullExperience: string;
  highlights: string[];
  quickFacts?: {
    duration?: string;
    location?: string;
    pickup?: string;
    age?: string;
    groupSize?: string;
    accessibility?: string;
    cancellation?: string;
  };
  meetingPickupSummary?: string;
  whatsIncluded?: string[];
  notIncluded?: string[];
  faq?: { q: string; a: string }[];
  pricing?: { label: string; price: string }[];
  schemaDescription: string;
};

const FORBIDDEN_BOILERPLATE = [
  "quick photo stop",
  "perfect for everyone",
  "something for everyone",
];

const scrub = (value?: string) => value?.replace(/\s+/g, " ").trim() ?? "";

const buildFallbackNarrative = (meta: TourMetadata, parsed: ParsedFareHarborFields) => {
  const location = scrub(parsed.meetingPoint) || meta.destination || "Palm Springs";
  const duration = scrub(parsed.duration);
  const descriptor = [meta.category, duration].filter(Boolean).join(" ").trim();
  return `${meta.title} is a ${descriptor || "guided"} experience based around ${location}. Expect a structured outing with practical guidance, route context, and clear timing for each segment.`;
};

const ensureUniqueCopy = (text: string, fallback: string) => {
  const lower = text.toLowerCase();
  if (FORBIDDEN_BOILERPLATE.some(phrase => lower.includes(phrase))) {
    return fallback;
  }
  return text;
};

export const transformToAOAContent = (
  parsed: ParsedFareHarborFields,
  meta: TourMetadata
): AOAEnrichedContent => {
  const baseDescription = scrub(parsed.description);
  const location = scrub(parsed.meetingPoint) || meta.destination || "Palm Springs";

  const draft = [
    `${meta.title} focuses on ${location} with a guide-led format that keeps logistics clear from check-in through return.`,
    baseDescription
      ? `The route centers on ${baseDescription.charAt(0).toLowerCase()}${baseDescription.slice(1)}.`
      : `The itinerary emphasizes local terrain, practical pacing, and context on the surrounding Coachella Valley landscape.`,
    `You can expect a sequence of planned stops rather than unstructured wandering, so each segment has a purpose.`,
    `Guides typically adapt timing to weather and group flow while keeping the core landmarks and interpretation intact.`,
  ].join(" ");

  const fallbackNarrative = buildFallbackNarrative(meta, parsed);
  const whatYoullExperience = ensureUniqueCopy(draft, fallbackNarrative);

  const highlights = (parsed.highlights ?? [])
    .map(scrub)
    .filter(Boolean)
    .slice(0, 8);

  const generatedHighlights = highlights.length
    ? highlights
    : [
        `Guided route structure for ${meta.title}`,
        `Local context tied to ${location}`,
        parsed.duration ? `Trip length around ${parsed.duration}` : "Clear pace from start to finish",
        "Practical recommendations for conditions and comfort",
        "Designed for visitors who want factual interpretation",
      ];

  const schemaDescription = whatYoullExperience.split(".").slice(0, 2).join(".").trim() + ".";

  return {
    whatYoullExperience,
    highlights: generatedHighlights,
    quickFacts: {
      duration: scrub(parsed.duration) || undefined,
      location: location || undefined,
      pickup: scrub(parsed.pickup) || undefined,
      age: scrub(parsed.ageMin) || undefined,
      groupSize: scrub(parsed.groupSize) || undefined,
      accessibility: scrub(parsed.accessibility) || undefined,
      cancellation: scrub(parsed.cancellation) || undefined,
    },
    meetingPickupSummary:
      scrub(parsed.meetingPoint) || scrub(parsed.pickup)
        ? `Meeting is coordinated around ${location}.${
            parsed.pickup ? ` Pickup details: ${scrub(parsed.pickup)}.` : ""
          }`
        : undefined,
    whatsIncluded: (parsed.included ?? []).map(scrub).filter(Boolean),
    notIncluded: (parsed.notIncluded ?? []).map(scrub).filter(Boolean),
    faq: parsed.faq?.map(item => ({ q: scrub(item.q), a: scrub(item.a) })).filter(item => item.q && item.a),
    pricing: parsed.pricing?.map(item => ({ label: scrub(item.label), price: scrub(item.price) })).filter(item => item.label && item.price),
    schemaDescription,
  };
};
