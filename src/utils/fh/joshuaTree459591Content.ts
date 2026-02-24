import type { TourRewriteV3_1 } from "./transformToAOAContent";

export type Jt459591Override = TourRewriteV3_1 & {
  logistics: {
    duration?: string;
    meetingPoint?: string;
    age?: string;
    groupSize?: string;
    cancellation?: string;
  };
};

const TOUR_SLUG = "hike-and-climb-459591";

const STATIC_OVERRIDE: Jt459591Override = {
  heroPriceText: "$229 per person",
  schemaPrice: 229,
  priceCurrency: "USD",
  pricing: {
    currency: "USD",
    low: 229,
    high: 289,
    displayText: "$229 per person",
    isAggregate: true,
  },
  durationLabel: "4 hours",
  durationISO: "PT4H",
  meetingPoint: {
    rawText: "Joshua Tree, CA",
    city: "Joshua Tree",
    region: "CA",
    country: "US",
  },
  whatYoullExperience: [
    "I love this Joshua Tree hike and climb because it combines a guided approach hike with real climbing movement on granite, so the day feels like one connected adventure.",
    "The pace is steady and practical, with your guide adapting to group comfort while still keeping the route focused on the terrain and conditions that make Joshua Tree distinct.",
    "You get hands-on coaching throughout the climbing portion, from movement basics to safety systems, so first-time climbers and returning climbers both leave with useful technique.",
  ],
  highlights: [
    "Guided desert hike to climbing areas in Joshua Tree",
    "Climbing instruction on granite formations",
    "Safety briefing and gear-use coaching",
    "Route pacing adjusted for current group comfort",
    "Photo opportunities and desert interpretation",
  ],
  faqs: [
    {
      question:
        "Is this suitable for beginners and what fitness level should I have?",
      answer:
        "Yes. Beginners are welcome, and your guide adjusts instruction and pacing to group ability; check booking page for exact details.",
    },
    {
      question: "What ages are allowed on the Hike & Climb tour?",
      answer: "Check booking page for exact details.",
    },
    {
      question: "What should I wear and bring for Joshua Tree conditions?",
      answer:
        "Wear sun-ready layers and supportive shoes, and bring water; check booking page for exact details.",
    },
    {
      question: "How long is the tour and what is included?",
      answer:
        "The listed duration is about 4 hours. Inclusions vary by departure, so check booking page for exact details.",
    },
    {
      question: "How do reservations and cancellations work?",
      answer: "Check booking page for exact details.",
    },
  ],
  schemaDescription:
    "Joshua Tree guided hike and climb experience with safety systems, paced instruction, and granite route coaching.",
  logistics: {
    duration: "4 hours",
    meetingPoint: "Joshua Tree, CA",
    age: "Check booking page",
    groupSize: "Check booking page",
    cancellation: "Check booking page",
  },
};

export const getJoshuaTree459591Override = (
  canonicalPath: string
): Jt459591Override | null => {
  if (!canonicalPath.endsWith(TOUR_SLUG)) {
    return null;
  }

  return STATIC_OVERRIDE;
};
