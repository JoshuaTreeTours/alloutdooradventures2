import {
  JOSHUA_TREE_KNOWLEDGE_BASE,
  type JoshuaTreeTourType,
} from "../../content/joshuaTree/knowledgeBase";
import type { FhTourFacts } from "../fareharbor/fetchFhItemDetails";
import { sanitizeFhText } from "../text/sanitizeFhText";

type InputTour = {
  id: string;
  slug: string;
  title: string;
  tags?: string[];
  categories?: string[];
  operatorName?: string;
};

export type JoshuaTreeComposedContent = {
  heroSummary: string;
  whatYoullExperience: string[];
  highlights: string[];
  faqs: Array<{ question: string; answer: string }>;
  practicalNotes?: string[];
};

const bannedPhrases = [
  "This guided outdoor tour",
  "centers on",
  "from check-in onward",
].map(item => item.toLowerCase());

const hash = (value: string) => {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
};

const rotate = <T,>(items: T[], seed: number) => {
  if (!items.length) return items;
  const offset = seed % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
};

const inferTourType = (tour: InputTour): JoshuaTreeTourType => {
  const haystack = [tour.title, tour.slug, ...(tour.tags ?? []), ...(tour.categories ?? [])]
    .join(" ")
    .toLowerCase();

  if (/stargaz|night sky|astronom/.test(haystack)) return "stargazing";
  if (/climb|boulder|rock/.test(haystack)) return "climb";
  if (/private/.test(haystack) && /sunset/.test(haystack)) return "private-sunset";
  if (/private/.test(haystack)) return "family-easy";
  if (/sightsee|tour|scenic|drive/.test(haystack)) return "sightseeing";
  if (/family|easy|kids|visitor pass/.test(haystack)) return "family-easy";
  return "hike";
};

const clean = (text?: string) => sanitizeFhText(text ?? "").trim();

const seasonFromMonth = (d = new Date()) => {
  const m = d.getMonth() + 1;
  if ([12, 1, 2].includes(m)) return "winter" as const;
  if ([3, 4, 5].includes(m)) return "spring" as const;
  if ([6, 7, 8].includes(m)) return "summer" as const;
  return "fall" as const;
};

const withFallback = (value: string, fallback: string) => (value.trim() ? value : fallback);

export const composeJoshuaTreeTourContent = ({
  fhFacts,
  tour,
  destination,
}: {
  fhFacts: FhTourFacts | null;
  tour: InputTour;
  destination: { city: "Joshua Tree"; region: "Joshua Tree National Park" };
}): JoshuaTreeComposedContent => {
  const type = inferTourType(tour);
  const kb = JOSHUA_TREE_KNOWLEDGE_BASE[type];
  const seed = hash(`${tour.id}:${tour.slug}`);
  const title = clean(fhFacts?.title) || clean(tour.title) || "Joshua Tree experience";
  const duration = clean(fhFacts?.durationText);
  const meeting = clean(fhFacts?.meetingPoint);
  const cancellation =
    clean(fhFacts?.cancellationPolicy) || "See booking page for cancellation terms.";
  const groupMax = fhFacts?.groupSizeMax;
  const ageMin = fhFacts?.ageMin;
  const isPrivate = Boolean(fhFacts?.pricing?.isPrivate || /private/i.test(tour.title));

  const paragraphTemplates = [
    [
      `${title} is designed as a ${type.replace("-", " ")} experience in ${destination.city}, with logistics anchored in FareHarbor booking details.${duration ? ` Listed duration is ${duration}.` : " Duration varies by departure and is confirmed at booking."}`,
      `${rotate(kb.narrativeParagraphs, seed)[0]} ${rotate(kb.geologyEcologyBullets, seed)[0]}`,
      `${rotate(kb.narrativeParagraphs, seed + 1)[1] ?? kb.narrativeParagraphs[1]} ${rotate(kb.safetyLogisticsBullets, seed + 2)[0]}`,
      `${rotate(kb.narrativeParagraphs, seed + 2)[2] ?? kb.narrativeParagraphs[2]} ${meeting ? `Meeting details currently reference ${meeting}.` : "Meeting instructions are finalized in booking confirmation."}`,
      `${isPrivate ? "The private format supports pacing adjustments for your group." : "Shared departures typically follow a structured pace so all participants can keep timing and safety aligned."} ${typeof groupMax === "number" ? `Group size can run up to ${groupMax}.` : "Group size depends on departure configuration."}`,
      `${kb.seasonalNotes[seasonFromMonth()][0] ?? "Seasonal conditions can shift quickly in the desert, so review forecasts and prepare layers."}`,
    ],
    [
      `${title} operates in ${destination.region} conditions where sun, wind, and surface temperature can change quickly over a single outing.${duration ? ` FareHarbor currently lists ${duration}.` : " Duration details appear in the selected booking slot."}`,
      `${rotate(kb.geologyEcologyBullets, seed)[1] ?? kb.geologyEcologyBullets[0]} ${rotate(kb.narrativeParagraphs, seed)[0]}`,
      `${rotate(kb.safetyLogisticsBullets, seed)[1] ?? kb.safetyLogisticsBullets[0]} ${rotate(kb.narrativeParagraphs, seed + 1)[1] ?? kb.narrativeParagraphs[1]}`,
      `${meeting ? `Current meeting instructions identify ${meeting}.` : "Meeting and timing instructions are supplied during checkout."} ${typeof ageMin === "number" ? `The listing notes a minimum age of ${ageMin}.` : "Age guidance can vary by operator settings and should be reviewed before booking."}`,
      `${isPrivate ? "Private groups usually get more flexibility in stop timing and movement rhythm." : "Public departures usually keep a consistent rhythm to support mixed participant needs."} ${clean(fhFacts?.accessibility) ? `Accessibility note: ${clean(fhFacts?.accessibility)}.` : "Accessibility and pace should be reviewed in booking notes for the selected date."}`,
      `${kb.seasonalNotes[seasonFromMonth()][0] ?? "Expect seasonal variation in comfort and pacing."}`,
    ],
  ];

  let paragraphs = rotate(paragraphTemplates, seed)[0]
    .map(item => withFallback(clean(item), ""))
    .filter(Boolean)
    .slice(0, 7);

  if (
    paragraphs.some(p => bannedPhrases.some(phrase => p.toLowerCase().includes(phrase)))
  ) {
    paragraphs = rotate(paragraphTemplates, seed + 1)[0]
      .map(item => withFallback(clean(item), ""))
      .filter(Boolean)
      .slice(0, 7);
  }

  const fhHighlightSeeds = [
    duration ? `Duration listed in FareHarbor: ${duration}` : "Duration is confirmed by departure in FareHarbor",
    meeting ? `Meeting details currently listed as: ${meeting}` : "Meeting details are provided at booking confirmation",
    fhFacts?.inclusions?.length
      ? `Inclusions listed by operator: ${fhFacts.inclusions.slice(0, 2).join(", ")}`
      : "Inclusions vary by departure and are shown in FareHarbor",
    fhFacts?.exclusions?.length
      ? `Common exclusions listed: ${fhFacts.exclusions.slice(0, 2).join(", ")}`
      : "Exclusions and optional extras are clarified at checkout",
    typeof groupMax === "number"
      ? `Group size signal: up to ${groupMax} participants`
      : "Group size depends on booking configuration",
    isPrivate ? "Tour format appears to be private or private-ready" : "Tour format appears to be shared departure",
  ].map(clean);

  const kbSpecificHighlights = rotate(
    [
      ...kb.safetyLogisticsBullets,
      ...kb.geologyEcologyBullets,
      ...(kb.photographyNotes ?? []),
      tour.operatorName ? `Operated by ${tour.operatorName}` : "",
    ].map(clean).filter(Boolean),
    seed
  );

  const highlights = Array.from(new Set([...fhHighlightSeeds, ...kbSpecificHighlights]))
    .filter(Boolean)
    .slice(0, 8);

  const faqs = [
    {
      question: "How long is this Joshua Tree tour?",
      answer: duration
        ? `FareHarbor currently lists a duration of ${duration}.`
        : "Duration can vary by departure and is shown on the booking page before checkout.",
    },
    {
      question: "Where do participants meet?",
      answer: meeting
        ? `Current booking details indicate the meeting point as ${meeting}.`
        : "Meeting instructions are confirmed in FareHarbor during booking.",
    },
    {
      question: "What should participants bring?",
      answer: rotate(kb.safetyLogisticsBullets, seed).slice(0, 3).join(" "),
    },
    {
      question: "Is this suitable for beginners or mixed fitness levels?",
      answer:
        type === "climb"
          ? "Many climbing-focused departures use progressive coaching and pacing, but the exact level is confirmed by the operator in booking details."
          : "Most guided departures use managed pacing and breaks; participants should review current operator notes for movement level expectations.",
    },
    {
      question: "What is included with booking?",
      answer: fhFacts?.inclusions?.length
        ? `Listed inclusions include ${fhFacts.inclusions.slice(0, 4).join(", ")}.`
        : "Inclusions are operator-defined and shown in FareHarbor for each departure.",
    },
    {
      question: "How do cancellations work?",
      answer: cancellation,
    },
    {
      question: "Are park fees included?",
      answer:
        "Park entry fees may apply depending on the tour format and operator policy; verify fee handling on the booking page.",
    },
    {
      question: "How does weather affect this experience?",
      answer: kb.seasonalNotes[seasonFromMonth()][0] ?? "Desert weather can shift quickly, so departure timing and pacing may be adjusted for safety.",
    },
    {
      question: "Is this private or shared?",
      answer: isPrivate
        ? "FareHarbor indicators suggest a private format, though final booking options are shown at checkout."
        : "The current listing appears to be shared, with final format and availability shown during booking.",
    },
  ]
    .map(item => ({ question: clean(item.question), answer: clean(item.answer) }))
    .filter(item => item.question && item.answer)
    .slice(0, 10);

  const practicalNotes = rotate(kb.safetyLogisticsBullets, seed)
    .map(clean)
    .slice(0, 7);

  const heroSummary = clean(
    `${title} is a ${type.replace("-", " ")} experience in ${destination.city}. ${duration ? `FareHarbor lists approximately ${duration}.` : "Timing is confirmed in booking for each departure."}`
  );

  return {
    heroSummary,
    whatYoullExperience: paragraphs,
    highlights,
    faqs,
    practicalNotes,
  };
};
