import { alaskaFareHarborGeneratedContent } from "./alaskaFareHarborContent.generated";

export type AlaskaFareHarborContentRecord = {
  overview?: string;
  highlights?: string[];
  itinerary?: string[];
  duration?: string;
  difficulty?: string;
  distance?: string;
  elevationGain?: string;
  meetingLocation?: string;
  pickup?: "yes" | "no" | "unknown";
  maxGroupSize?: string;
  minimumAge?: string;
  included?: string[];
  notIncluded?: string[];
  requirements?: string[];
  cancellation?: string;
  faq?: Array<{ question: string; answer: string }>;
  sourceUrl?: string;
  sourceUpdatedAt?: string;
};

// High-confidence records can live here when the operator source is clearer
// than the public FareHarbor booking shell. Generated FareHarbor data is still
// merged underneath these records for fields not explicitly overridden.
const ALASKA_FAREHARBOR_MANUAL_CONTENT: Record<
  string,
  AlaskaFareHarborContentRecord
> = {
  "450268": {
    overview:
      "Leave the buses and boardwalks behind on a strenuous five-hour guided hike in the mountains just outside Denali National Park. Northern Epics chooses the route and pace for the group, climbing from boreal forest toward sub-alpine tundra for broad views of the Nenana River valley and Alaska Range while an expert naturalist interprets the ecology, geology, wildlife, and edible plants of the landscape.",
    highlights: [
      "Strenuous five-hour mountain hike just outside Denali National Park",
      "Route and pace tailored to the group, typically about 4–6 miles",
      "Typical elevation gain of about 1,500–3,000 feet",
      "Move from boreal forest into sub-alpine tundra above tree line",
      "Broad views toward the Nenana River valley and Alaska Range",
      "Expert naturalist guide with interpretation of local ecology and wildlife",
      "Free hotel or lodge pickup and return in the Denali area",
    ],
    itinerary: [
      "Pickup: approximately 5–20 minutes from your Denali-area hotel or lodge to the trailhead.",
      "Mountain hike: approximately 4.5 hours of strenuous hiking on a route selected for the group, climbing steep ridgelines through boreal forest toward sub-alpine tundra and high viewpoints.",
      "Return: approximately 5–20 minutes back to your hotel or requested Denali-area drop-off.",
    ],
    duration: "5 hours",
    difficulty: "Strenuous",
    distance: "Approximately 4–6 miles; route varies with the group",
    elevationGain: "Approximately 1,500–3,000 feet; route varies with the group",
    meetingLocation: "Pickup from Denali-area hotels and lodges",
    pickup: "yes",
    maxGroupSize: "8 people",
    minimumAge: "12 years",
    included: [
      "Expert naturalist hiking guide",
      "Free Denali-area hotel or lodge pickup and return",
    ],
    requirements: [
      "Minimum age is 12 years",
      "This is a strenuous hike on steep trails that can be loose or rocky",
      "Be prepared for changing mountain weather, including rain and high winds",
      "Bring comfortable hiking shoes, water, sunscreen, bug spray, and personal hiking essentials",
    ],
    cancellation: "Full refund for cancellations made any time before your guide arrives.",
    faq: [
      {
        question: "How difficult is the Into the Mountains Hike?",
        answer:
          "Northern Epics rates this five-hour tour as strenuous. The selected route can include steep, loose, or rocky trail sections and changing mountain weather, so guests should be comfortable with sustained uphill hiking.",
      },
      {
        question: "How far do we hike?",
        answer:
          "The route is tailored to the group rather than fixed to one mileage. A typical outing covers about 4–6 miles with roughly 1,500–3,000 feet of elevation gain, but the guide can adjust the route and pace.",
      },
      {
        question: "Is transportation included?",
        answer:
          "Yes. Northern Epics includes pickup from Denali-area hotels and lodges and returns guests after the hike. Exact pickup and drop-off timing is coordinated for the departure.",
      },
      {
        question: "What is the minimum age?",
        answer:
          "The minimum age for the Into the Mountains Hike is 12 because of the strenuous terrain and sustained climbing.",
      },
    ],
    sourceUrl: "https://www.northernepics.com/tours",
    sourceUpdatedAt: "2026-08-31",
  },
};

const mergeRecord = (
  generated?: AlaskaFareHarborContentRecord,
  manual?: AlaskaFareHarborContentRecord
): AlaskaFareHarborContentRecord | undefined => {
  if (!generated && !manual) return undefined;
  return {
    ...(generated ?? {}),
    ...(manual ?? {}),
  };
};

export const getAlaskaFareHarborRecord = (
  productId: string
): AlaskaFareHarborContentRecord | undefined =>
  mergeRecord(
    alaskaFareHarborGeneratedContent[productId],
    ALASKA_FAREHARBOR_MANUAL_CONTENT[productId]
  );
