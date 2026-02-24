import { formatPriceLabel } from "./formatPriceLabel";

type JoshuaTreeTemplateInput = {
  title: string;
  city?: string;
  state?: string;
  citySlug?: string;
  canonicalPath?: string;
  lowPrice?: string | number | null;
  duration?: string;
  meetingPoint?: string;
  age?: string;
  groupSize?: string;
  cancellation?: string;
  highlights?: string[];
  itinerary?: string[];
  inclusions?: string[];
  category?: string;
  tags?: string[];
};

export type JoshuaTreeTemplateOutput = {
  priceLabel?: string;
  description: string;
  logistics: {
    duration?: string;
    meetingPoint?: string;
    age?: string;
    groupSize?: string;
    cancellation?: string;
    priceLabel?: string;
  };
  highlights: string[];
  itinerarySteps: string[];
  faq: { q: string; a: string }[];
};

const uniq = (items: string[], max: number) => {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const raw of items) {
    const value = raw.replace(/[.;:!?]+$/g, "").trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(value);
    if (output.length >= max) break;
  }

  return output;
};

const classifyCategory = (input: JoshuaTreeTemplateInput) => {
  const haystack = [
    input.title,
    input.category,
    ...(input.tags ?? []),
    ...(input.highlights ?? []),
  ]
    .join(" ")
    .toLowerCase();

  if (/climb|boulder/.test(haystack)) return "climbing";
  if (/horse|riding|trail ride/.test(haystack)) return "horseback riding";
  if (/star|astronomy|night/.test(haystack)) return "stargazing";
  if (/camp/.test(haystack)) return "camping";
  return "hiking";
};

export const isJoshuaTreeTour = ({
  citySlug,
  city,
  canonicalPath,
  title,
}: {
  citySlug?: string;
  city?: string;
  canonicalPath?: string;
  title?: string;
}) => {
  const values = [citySlug, city, canonicalPath, title]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return values.includes("joshua-tree") || values.includes("joshua tree");
};

export const buildJoshuaTreeTemplate = (
  input: JoshuaTreeTemplateInput
): JoshuaTreeTemplateOutput => {
  const priceLabel = formatPriceLabel(input.lowPrice);
  const category = classifyCategory(input);
  const durationText = input.duration ? ` over ${input.duration}` : "";

  const description = [
    `${input.title} is a guided ${category} experience in Joshua Tree, California with routes and stops focused on desert scenery and geology.`,
    input.inclusions?.length
      ? `The outing is guide-led and may include ${input.inclusions
          .slice(0, 3)
          .join(", ")}.`
      : "The outing is led by a local guide with practical trip planning and on-route context tailored to current conditions.",
    input.duration
      ? `Pacing is structured${durationText}, with steady movement and breaks that suit participants prepared for outdoor activity in desert terrain.`
      : "Pacing is designed for outdoor travelers with moderate fitness expectations and time for orientation, activity segments, and return travel.",
    input.meetingPoint
      ? `Departures start near ${input.meetingPoint}, which keeps logistics clear before the tour moves to activity areas.`
      : "The format emphasizes small-group flow, time at key viewpoints, and a clear finish point for departure planning.",
  ].join(" ");

  const factualHighlights = uniq(
    [
      ...(input.highlights ?? []),
      ...(input.inclusions ?? []),
      `${category[0].toUpperCase()}${category.slice(1)} format in Joshua Tree terrain`,
      input.duration ? `Duration: ${input.duration}` : "",
      input.meetingPoint ? `Meeting point: ${input.meetingPoint}` : "",
    ],
    10
  );

  const itinerarySteps = uniq(
    input.itinerary?.length
      ? input.itinerary
      : [
          "Meet the guide, confirm logistics, and review conditions for the day.",
          category === "stargazing"
            ? "Travel to a dark-sky viewing location and set up for sky orientation."
            : category === "horseback riding"
              ? "Complete safety briefing and begin a guided trail segment through Joshua Tree terrain."
              : category === "climbing"
                ? "Approach activity areas and review safety systems and movement basics."
                : category === "camping"
                  ? "Arrive at the site, organize camp setup, and review camp procedures."
                  : "Begin a guided trail segment that highlights key rock formations and desert plants.",
          category === "stargazing"
            ? "Observe major constellations and celestial objects with guide interpretation."
            : category === "climbing"
              ? "Complete guided climbing segments with technique coaching and pacing breaks."
              : "Continue through the core experience segment with guide commentary and planned stops.",
          "Wrap up with return logistics and recommendations for the rest of your Joshua Tree visit.",
        ],
    6
  );

  const logistics = {
    duration: input.duration ?? "See booking page",
    meetingPoint: input.meetingPoint ?? "See booking page",
    age: input.age ?? "See booking page",
    groupSize: input.groupSize ?? "See booking page",
    cancellation: input.cancellation ?? "See booking page",
    priceLabel,
  };

  const faq = [
    {
      q: "What does this Joshua Tree tour include?",
      a: input.inclusions?.length
        ? `Inclusions may cover ${input.inclusions.slice(0, 3).join(", " )}; confirm the exact list for your departure during booking.`
        : "Inclusions vary by departure and operator, so review the booking details for the exact list before reserving.",
    },
    {
      q: "How long is the experience and what is the pace?",
      a: input.duration
        ? `The listed duration is ${input.duration}, with a guide-managed pace and planned stops.`
        : "Duration is listed on the booking page, and guides manage pacing around conditions and group needs.",
    },
    {
      q: "Where is the meeting point?",
      a: input.meetingPoint
        ? `The meeting point is ${input.meetingPoint}.`
        : "Meeting instructions are provided on the booking page for each departure.",
    },
    {
      q: "Are there age or group size requirements?",
      a: [input.age ? `Age: ${input.age}.` : "", input.groupSize ? `Group size: ${input.groupSize}.` : ""]
        .join(" ")
        .trim() || "Age limits and group size policies are listed on the booking page.",
    },
    {
      q: "What is the cancellation policy?",
      a: input.cancellation
        ? input.cancellation
        : "Cancellation terms depend on departure timing and are listed on the booking page.",
    },
  ];

  return {
    priceLabel,
    description,
    logistics,
    highlights: factualHighlights.length ? factualHighlights : ["Guided Joshua Tree outdoor experience"],
    itinerarySteps: itinerarySteps.length ? itinerarySteps : ["See booking page for itinerary details."],
    faq,
  };
};
