import type { Engine2Tour } from "../../engine2/data/loadEngine2";
import {
  transformFareHarborToAOAContent,
  type AOAEnrichedTourContent,
  type FareHarborStructuredData,
} from "./transformFareHarborToAOAContent";

const PALM_SPRINGS_SEEDS: Record<string, FareHarborStructuredData> = {
  "34849": {
    duration: "3 hours",
    meetingLocation: "Palm Desert / Palm Springs area",
    pickup: "unknown",
    rawHighlights: [
      "Travel by Jeep into the San Andreas fault zone with an interpretive guide",
      "Stop at fault-line viewpoints, washes, and date-palm oases",
      "Learn how tectonic movement shaped the Coachella Valley",
      "Watch for wildlife and desert-adapted plants in protected habitat",
      "Return with route context for nearby canyons and desert sites",
    ],
    itinerary: [
      "Check in and receive a terrain and safety briefing",
      "Drive toward the fault trace and exposed geologic formations",
      "Stop for short walks and viewpoint interpretation",
      "Continue through palm oases and active wash systems",
      "Return to Palm Springs area drop-off",
    ],
    included: ["Professional naturalist guide", "Open-air Jeep transportation"],
    requirements: [
      "Closed-toe shoes recommended",
      "Children must meet operator minimum age requirements",
    ],
  },
  "34897": {
    duration: "6-7 hours",
    meetingLocation: "Palm Springs area",
    pickup: "unknown",
    rawHighlights: [
      "Full-day guided route into Joshua Tree National Park",
      "Interpretation of transition zones between Mojave and Colorado deserts",
      "Stops at major rock formations and desert plant communities",
      "Time for photos and short guided walks at selected trailheads",
      "Narration on regional ecology and conservation history",
    ],
    itinerary: [
      "Meet guide in Palm Springs area and depart by touring vehicle",
      "Enter park and orient to geologic and ecological zones",
      "Visit signature formations and viewpoints",
      "Take short interpretive walks where conditions allow",
      "Return across Coachella Valley to starting area",
    ],
  },
  "43915": {
    duration: "3 hours",
    meetingLocation: "Palm Springs / Palm Desert",
    pickup: "unknown",
    rawHighlights: [
      "Private Jeep format for custom pacing through the fault zone",
      "Deeper one-on-one geology interpretation with your guide",
      "Flexible stop timing for family photos and questions",
      "Access to rugged desert tracks used by regional naturalists",
      "Focused commentary on local history and native plant systems",
    ],
  },
  "34899": {
    duration: "4 hours",
    meetingLocation: "Palm Springs area",
    pickup: "unknown",
    rawHighlights: [
      "Travel to Painted Canyon badlands and Mecca Hills scenery",
      "Observe layered sediments and color-banded canyon walls",
      "Explore narrow slot-like passages where footing permits",
      "Learn why wind and flash floods shape the route differently each season",
      "Guided Jeep access to areas difficult to reach independently",
    ],
  },
  "34891": {
    duration: "4 hours",
    meetingLocation: "Palm Springs area",
    pickup: "unknown",
    rawHighlights: [
      "Private Jeep transfer into Indian Canyons trail areas",
      "Guided walk among fan palms and stream-fed canyon corridors",
      "Commentary on Cahuilla history and desert water systems",
      "Flexible pace for photo stops and interpretive pauses",
      "Blend of driving and moderate walking in one outing",
    ],
  },
  "574370": {
    duration: "4 hours",
    meetingLocation: "Palm Springs area",
    pickup: "unknown",
    rawHighlights: [
      "Shared-group Indian Canyons route with guide narration",
      "Palm oasis viewpoints connected by short hiking sections",
      "Desert ecology focus on water, shade, and canyon microclimates",
      "Good introduction to Palm Springs backcountry for first-time visitors",
      "Efficient logistics without self-driving trailhead planning",
    ],
  },
};

export const isPalmSpringsTour = (tour: Engine2Tour) =>
  tour.sourceCitySlug === "palm-springs" ||
  /\/palm-springs\//.test(tour.seo.canonicalPath);

export const getPalmSpringsPilotContent = (
  tour: Engine2Tour
): AOAEnrichedTourContent | null => {
  const seed = PALM_SPRINGS_SEEDS[tour.id];
  if (!seed) {
    return null;
  }

  return transformFareHarborToAOAContent(tour.name, seed);
};
