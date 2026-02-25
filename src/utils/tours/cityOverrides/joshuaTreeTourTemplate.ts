import type { Engine2Tour } from "../../../engine2/data/loadEngine2";
import type { TourRewriteV3 } from "../../fh/transformToAOAContent";
import { selectContentImage } from "../selectContentImage";
import { ENGINE2_DEFAULT_IMAGE } from "../../../engine2/config/destinations";

type JoshuaTreeImageOverride = {
  preferredContentImageUrl?: string;
  wikiImageUrl?: string;
  attribution?: {
    source: string;
    title?: string;
  };
};

const JOSHUA_TREE_IMAGE_OVERRIDES: Record<string, JoshuaTreeImageOverride> = {
  "hike-and-climb-459591": {
    wikiImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Joshua_Tree_National_Park_road.jpg/1280px-Joshua_Tree_National_Park_road.jpg",
    attribution: {
      source: "Wikimedia Commons",
      title: "Joshua Tree National Park road",
    },
  },
};

const buildMeetingPoint = (tour: Engine2Tour) =>
  `${tour.geo.city}, ${tour.geo.region}`;

const buildFaqs = (tour: Engine2Tour, durationLabel: string) => [
  {
    question: `How long is ${tour.name}?`,
    answer: `I plan this outing around about ${durationLabel}, including check-in, route pacing, and return timing for your selected departure.`,
  },
  {
    question: "Is this tour beginner friendly?",
    answer:
      "Yes. I keep the pace practical, explain terrain and safety expectations early, and adapt stops so first-time visitors can enjoy Joshua Tree comfortably.",
  },
  {
    question: "What should I bring for Joshua Tree conditions?",
    answer:
      "I recommend sun protection, water, and closed-toe footwear with grip. Layers are smart because desert temperatures can shift quickly between morning, afternoon, and sunset windows.",
  },
  {
    question: "Where do we meet for departure?",
    answer: `Meeting details are shared after booking; expect a meetup in or near ${buildMeetingPoint(tour)} with final arrival instructions on your confirmation.`,
  },
  {
    question: "How do booking and cancellations work?",
    answer:
      "Use the booking page to confirm live availability, pricing, and policy timing for your departure. I always recommend reviewing cancellation terms before checkout.",
  },
];

export const isJoshuaTreeTour = (tourOrPath: Engine2Tour | string): boolean => {
  if (typeof tourOrPath === "string") {
    return tourOrPath.includes("/joshua-tree/") && tourOrPath.includes("/tours/");
  }

  return (
    tourOrPath.sourceCitySlug === "joshua-tree" ||
    tourOrPath.seo.canonicalPath.includes("/joshua-tree/")
  );
};

export const applyJoshuaTreeTemplate = (tour: Engine2Tour) => {
  if (!isJoshuaTreeTour(tour)) {
    return null;
  }

  const durationLabel = "half-day";
  const imageOverride = JOSHUA_TREE_IMAGE_OVERRIDES[tour.slug] ?? {};
  const contentImage = selectContentImage({
    heroImageUrl: tour.images.hero,
    preferredContentImageUrl: imageOverride.preferredContentImageUrl,
    wikiImageUrl: imageOverride.wikiImageUrl,
    fallbackImageUrl: ENGINE2_DEFAULT_IMAGE,
  });

  const description = [
    `I run ${tour.name} as a focused Joshua Tree field day, starting with clear logistics so you know exactly how the route, timing, and terrain flow before we head out.`,
    `From there, I guide the experience at a steady pace with practical local context on desert geology, trail surfaces, and weather patterns so you spend less time guessing and more time exploring.`,
    `I keep each segment adaptable to current conditions while preserving the big-view moments Joshua Tree is known for, including iconic rock formations, open sky lines, and high-desert transitions.`,
  ];

  const highlights = [
    `Fact-first route briefing for ${tour.name} before departure`,
    "Steady pacing that prioritizes comfort and clear wayfinding",
    "Guide-led context on Joshua Tree geology, ecology, and terrain",
    "Photo-ready stops across signature granite and desert landscapes",
    "Departure timing and stop flow tuned to daily conditions",
  ];

  const itinerary = [
    "Arrival and quick pre-departure orientation",
    "First segment through key desert viewpoints and formations",
    "Mid-tour interpretive stops with time for photos and questions",
    "Return segment with recap and practical next-step tips",
  ];

  const faq = buildFaqs(tour, durationLabel);

  const rewrite: TourRewriteV3 = {
    whatYoullExperience: description,
    highlights,
    faqs: faq,
    schemaDescription: description.slice(0, 2).join(" "),
    durationLabel,
    durationISO: undefined,
    pricing: {
      currency: tour.pricing?.currency || "USD",
      displayText: tour.pricing?.price,
    },
    meetingPoint: {
      rawText: buildMeetingPoint(tour),
      city: tour.geo.city,
      region: "CA",
      country: "US",
    },
  };

  return {
    description,
    highlights,
    faq,
    itinerary,
    contentImage,
    rewrite,
  };
};
