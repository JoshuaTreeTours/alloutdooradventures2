import type { Engine2Tour } from "../../engine2/data/loadEngine2";
import { isTour34849 } from "./isTour34849";

export type Tour34849OverrideContent = {
  whatYoullExperience: string;
  highlights: string[];
  meetingPickupSummary?: string;
  included: string[];
  notIncluded: string[];
  rulesAndRequirements: string[];
  faq?: Array<{ question: string; answer: string }>;
  whyThisLandscapeMatters?: string;
  schemaDescription: string;
};

type Input = {
  tour: Engine2Tour;
  pathname?: string;
  flagEnabled: boolean;
};

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

const firstSentence = (value: string) => {
  const sentence = value.match(/^(.+?[.!?])\s/)?.[1];
  return normalize(sentence ?? value);
};

const createSafeFallback = (tour: Engine2Tour): Tour34849OverrideContent => {
  const city = tour.geo.city || "Palm Springs";
  const region = tour.geo.region || "California";
  const whatYoullExperience = normalize(
    `${tour.name} is built around the active landscape where the San Andreas system shapes the desert floor near ${city}. You ride in an open-air Jeep with a guide who points out fault traces, uplifted terrain, and wash systems that keep changing after wind and rain events. Stops are timed for short walks, photos, and practical context on how geology controls where palms, wildlife, and travel corridors appear in this part of ${region}. Instead of a generic desert drive, this route is designed to explain what visitors are seeing in real time and why it matters in the Coachella Valley. Conditions can shift with weather and seasonal access, so exact stop order may vary while keeping the same overall fault-zone focus.`
  );

  const highlights = [
    "Travel through the San Andreas fault zone in an open-air Jeep with live guide narration.",
    "Stop at fault-related viewpoints where uplift, erosion, and sediment layers are visible.",
    "Learn how desert water patterns create palm oases and habitat pockets in dry terrain.",
    "Get route-specific context on regional geology instead of a one-size-fits-all tour script.",
    "Enjoy planned photo pauses and short interpretation walks when conditions allow.",
    "Return with practical recommendations for nearby canyons and desert landmarks.",
  ];

  return {
    whatYoullExperience,
    highlights,
    meetingPickupSummary:
      "Meeting details are shared by the operator before departure; pickup options vary by departure and confirmation.",
    included: [
      "Guided off-road Jeep touring in the Palm Springs fault-zone backcountry.",
      "Interpretive commentary focused on geology, ecology, and desert history.",
    ],
    notIncluded: [
      "Guide gratuity.",
      "Personal purchases, snacks, and optional add-ons not listed at booking.",
    ],
    rulesAndRequirements: [
      "Wear closed-toe shoes and sun-ready layers suitable for desert conditions.",
      "Follow guide instructions during all off-road travel and walking stops.",
      "Minimum age and mobility requirements are set by the operator and confirmed at booking.",
    ],
    whyThisLandscapeMatters: normalize(
      "This tour crosses one of North America's best-known active fault systems, where tectonic movement, flash flooding, and wind erosion are still reshaping the land today. Seeing these features in person makes the Coachella Valley's geology easier to understand than reading a map alone."
    ),
    schemaDescription: firstSentence(whatYoullExperience),
  };
};

export const getTour34849OverrideContent = ({
  tour,
  pathname,
  flagEnabled,
}: Input): Tour34849OverrideContent | null => {
  if (!flagEnabled) {
    return null;
  }

  if (!isTour34849(tour, pathname)) {
    return null;
  }

  if (!tour.bookingUrl) {
    if (typeof window === "undefined") {
      console.info("34849 override: bookingUrl missing");
    }
    return null;
  }

  return createSafeFallback(tour);
};
