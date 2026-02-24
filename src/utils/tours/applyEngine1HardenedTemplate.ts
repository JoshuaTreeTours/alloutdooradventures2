import type { Tour } from "../../data/tours.types";

const PARK_LANDMARKS: Record<string, string[]> = {
  "joshua-tree": [
    "Hidden Valley",
    "Keys View",
    "Skull Rock",
    "Barker Dam",
    "Jumbo Rocks",
    "Ryan Mountain",
    "Cholla Cactus Garden",
  ],
  "palm-springs": [
    "San Andreas Fault zone",
    "Indio Hills badlands",
    "Coachella Valley overlooks",
    "desert palm oases",
    "slot canyon corridors",
  ],
};

const FALLBACK_CITY_IMAGES: Record<string, string[]> = {
  "joshua-tree": [
    "https://cdn.filestackcontent.com/HRCEcRa9TJmx1IJAyXAr",
    "https://cdn.filestackcontent.com/dO0XzxdVSXeJgDAC5H5C",
    "https://cdn.filestackcontent.com/AuIFxsfS7ewtuucDaAB8",
  ],
  "palm-springs": [
    "https://cdn.filestackcontent.com/znXEhdhTgWLJ6FJEnfUQ",
    "https://cdn.filestackcontent.com/CrY70FqUSIelzMGF0HzQ",
    "https://cdn.filestackcontent.com/cwr3WkdQ6KLI6NOvCoIw",
  ],
};

type FAQ = { question: string; answer: string };

type ParsedFareHarborContent = {
  duration?: string;
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  faq?: Array<{ q: string; a: string }>;
  overview?: string;
};

export type HardenedEngine1Template = {
  heroTitle: string;
  heroSummary: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  highlights: string[];
  overviewParagraphs: string[];
  includes: string[];
  excludes: string[];
  faqs: FAQ[];
  schemaDescription: string;
  itinerary: string[];
  durationISO?: string;
  areaServed: string;
  secondaryImage?: string;
  secondaryImageAlt?: string;
  schemaImages: string[];
};

const toExperienceType = (tour: Tour) => {
  const haystack = [
    tour.title,
    ...(tour.tags ?? []),
    ...(tour.categories ?? []),
  ]
    .join(" ")
    .toLowerCase();

  if (/climb|boulder|rock/.test(haystack))
    return "guided hiking and climbing experience";
  if (/stargaz|night sky|astronom/.test(haystack))
    return "guided stargazing experience";
  if (/hike|trail|walk/.test(haystack)) return "guided hiking experience";
  if (/sightsee|scenic|viewpoint/.test(haystack))
    return "guided sightseeing experience";
  if (/jeep|4x4|off-?road/.test(haystack))
    return "guided off-road sightseeing experience";
  return "guided desert experience";
};

const toDurationIso = (duration?: string) => {
  if (!duration) return undefined;
  const hours = Number(
    (duration.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|hr|h)/i) ?? [])[1]
  );
  const minutes = Number(
    (duration.match(/(\d+)\s*(?:minutes?|mins?|min|m)/i) ?? [])[1]
  );
  const total =
    (Number.isFinite(hours) ? Math.round(hours * 60) : 0) +
    (Number.isFinite(minutes) ? minutes : 0);
  if (!total) return undefined;
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h && m) return `PT${h}H${m}M`;
  if (h) return `PT${h}H`;
  return `PT${m}M`;
};

const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

const buildOverview = (
  tour: Tour,
  experienceType: string,
  parsed?: ParsedFareHarborContent
) => {
  const parkName =
    tour.destination.citySlug === "joshua-tree"
      ? "Joshua Tree National Park"
      : "the Sonoran Desert transition zone near Palm Springs";
  const base = [
    `${tour.title} focuses on ${experienceType} routes through ${parkName}, where granitic monzogranite outcrops, alluvial fans, and creosote basins shape the terrain visitors move through during the day.`,
    `This area sits at the Mojave-Colorado Desert interface, so route conditions can shift quickly across elevation, wind exposure, and sun intensity. Guides pace each segment to match conditions while preserving clear line-of-sight interpretation at major formations and viewpoints.`,
    `${parsed?.overview ?? "The itinerary is structured around short movement segments and regular interpretation stops, so guests can understand geology, ecology, and park management context instead of only passing through viewpoints."}`,
    `Compared with self-drive visits, this format reduces navigation uncertainty and concentrates time at high-value locations such as ${PARK_LANDMARKS[tour.destination.citySlug]?.slice(0, 3).join(", ") ?? "core landmark corridors"}.`,
    `This tour is best for travelers who want a professionally guided day with clear pacing, park context, and practical field guidance on desert travel, photography timing, and terrain awareness.`,
  ];

  return base.slice(0, 5);
};

const buildFaqs = (tour: Tour, parsed?: ParsedFareHarborContent): FAQ[] => {
  const parkName =
    tour.destination.citySlug === "joshua-tree"
      ? "Joshua Tree National Park"
      : "the Palm Springs desert region";
  const parsedFaqs = parsed?.faq ?? [];
  const lookup = (matcher: RegExp, fallback: string) =>
    parsedFaqs.find(item => matcher.test(item.q))?.a ?? fallback;

  return [
    {
      question: `How difficult is the ${tour.title} tour?`,
      answer: lookup(
        /difficult|beginner|fitness|experience/i,
        "This trip is designed for general active-traveler fitness and uses a steady pace with guide-managed stops; review the booking page for current terrain and age thresholds."
      ),
    },
    {
      question: `What time of year is best for this ${parkName} tour?`,
      answer:
        "Fall through spring usually offers the most comfortable daytime temperatures in the desert. Summer departures are possible but require stricter hydration and sun-management planning.",
    },
    {
      question: "What should participants bring?",
      answer: lookup(
        /bring|wear|shoe|water|sun/i,
        "Bring closed-toe shoes, layered clothing, sun protection, and water. Add a warm layer for morning or sunset departures."
      ),
    },
    {
      question: "What is the cancellation policy?",
      answer: lookup(
        /cancel|refund|reschedul/i,
        "Cancellation and reschedule terms are listed in checkout for each departure and should be reviewed before payment."
      ),
    },
    {
      question: "Is this tour suitable for children?",
      answer: lookup(
        /child|kid|age|minimum/i,
        "Child eligibility depends on current operator requirements and route conditions; check the booking page for age minimums on your date."
      ),
    },
  ];
};

export const applyEngine1Template = (
  tourData: Tour,
  destinationData: { parsedFareHarbor?: ParsedFareHarborContent } = {}
): HardenedEngine1Template | null => {
  const isEligibleCity = ["joshua-tree", "palm-springs"].includes(
    tourData.destination.citySlug
  );
  if (!isEligibleCity || tourData.bookingProvider !== "fareharbor") {
    return null;
  }

  const parsed = destinationData.parsedFareHarbor;
  const experienceType = toExperienceType(tourData);
  const parkLabel =
    tourData.destination.citySlug === "joshua-tree"
      ? "Joshua Tree National Park"
      : "the Palm Springs desert region";
  const landmarks = PARK_LANDMARKS[tourData.destination.citySlug] ?? [];

  const highlights = unique([
    `Guided ${experienceType.replace("guided ", "")} through ${parkLabel}`,
    ...landmarks.slice(0, 4).map(landmark => `Route emphasis on ${landmark}`),
    ...(parsed?.highlights ?? []),
    "Interpretive stops covering desert geology, ecology, and land-use history",
    "Pacing calibrated to weather, group mobility, and daylight conditions",
  ]).slice(0, 7);

  const includes = unique([
    "Professional guide",
    parsed?.inclusions?.find(item => /equipment|gear/i.test(item)) ??
      (tourData.title.toLowerCase().includes("climb")
        ? "Technical equipment for guided activity"
        : "Any stated tour equipment for the selected departure"),
    parsed?.inclusions?.find(item => /water/i.test(item)) ??
      "Water or hydration support during guided segments",
    "Geology and landscape interpretation",
  ]);

  const excludes = unique([
    parsed?.exclusions?.find(item => /entrance|park fee/i.test(item)) ??
      "Joshua Tree National Park entrance fee (if applicable)",
    parsed?.exclusions?.find(item => /gratu/i.test(item)) ?? "Guide gratuities",
    parsed?.exclusions?.find(item =>
      /hotel|transport|pickup|drop/i.test(item)
    ) ??
      "Transportation to and from the meeting point unless explicitly listed",
  ]);

  const fallbackImages =
    FALLBACK_CITY_IMAGES[tourData.destination.citySlug] ?? [];
  const secondaryImage =
    (tourData.galleryImages ?? []).find(
      image => image !== tourData.heroImage
    ) ?? fallbackImages.find(image => image !== tourData.heroImage);

  const schemaImages = unique([
    tourData.heroImage,
    ...(tourData.galleryImages ?? []),
    ...fallbackImages,
  ]).slice(0, 5);

  const itinerary = unique([
    "Meet the guide, review route plan, and confirm safety expectations",
    `Travel to key ${parkLabel} viewpoints and formations with interpretation stops`,
    "Complete experience-specific activity segments at selected terrain zones",
    "Return to the starting area with recap, local recommendations, and next-step planning notes",
  ]);

  const overviewParagraphs = buildOverview(tourData, experienceType, parsed);

  return {
    heroTitle: `${tourData.title} in ${tourData.destination.city}, ${tourData.destination.state}`,
    heroSummary: `${tourData.title} is a ${experienceType} operating in ${parkLabel}. The route is designed around landmark-driven stops, practical desert pacing, and field interpretation from a professional local guide. Guests can expect clear logistics, terrain-aware movement, and context on geology and ecology rather than a generic sightseeing loop. This format is built for travelers who want to understand the landscape while covering high-value viewpoints in a single, structured outing.`,
    primaryCtaLabel: "Book This Tour",
    secondaryCtaLabel: "See Booking Options",
    highlights,
    overviewParagraphs,
    includes,
    excludes,
    faqs: buildFaqs(tourData, parsed),
    schemaDescription: overviewParagraphs.join(" "),
    itinerary,
    durationISO: toDurationIso(parsed?.duration ?? tourData.badges.duration),
    areaServed: parkLabel,
    secondaryImage,
    secondaryImageAlt: secondaryImage
      ? `${tourData.title} route landscape in ${parkLabel}`
      : undefined,
    schemaImages,
  };
};
