import type { ParsedTour } from "./parseFareHarborHtml";

export type AOAOverrideContent = {
  categoryLabel?: string;
  meetingPointLabel?: string;
  priceAdult?: number;
  priceChild?: number;
  priceLabel?: string;
  durationLabel?: string;
  whatYoullExperience: string[];
  highlights: string[];
  schemaDescription: string;
};

const DEFAULT_CATEGORY = "Jeep tour (geology + nature walk)";
const DEFAULT_MEETING_POINT = "Metate Ranch — 38635 Monroe St, Indio, CA 92203";
const DEFAULT_DURATION = "3 hours";
const DEFAULT_PRICE = "$175 adult / $150 child";

const derivePriceLabel = (
  pricing: string[],
  priceAdult?: number,
  priceChild?: number,
  parsedPriceLabel?: string
) => {
  if (parsedPriceLabel) {
    return parsedPriceLabel;
  }

  if (priceAdult && priceChild) {
    return `$${priceAdult.toFixed(0)} adult / $${priceChild.toFixed(0)} child`;
  }

  const text = pricing.join(" | ");
  const adult = text.match(/adult[^$]*(\$\d+)/i)?.[1] ?? "";
  const child = text.match(/child[^$]*(\$\d+)/i)?.[1] ?? "";

  if (adult && child) {
    return `${adult} adult / ${child} child`;
  }

  if (adult) {
    return `From ${adult} per adult`;
  }

  const fallback = pricing.find(item => /\$\d+/.test(item));
  return fallback ?? `From ${DEFAULT_PRICE}`;
};

export const transformToAOAContent = (
  parsedTour: ParsedTour
): AOAOverrideContent => {
  const duration = parsedTour.duration || DEFAULT_DURATION;
  const meetingPoint = parsedTour.meetingPoint || DEFAULT_MEETING_POINT;
  const category = parsedTour.category || DEFAULT_CATEGORY;
  const priceLabel = derivePriceLabel(
    parsedTour.pricing,
    parsedTour.priceAdult,
    parsedTour.priceChild,
    parsedTour.priceLabel
  );

  const paragraphs = [
    `This ${category.toLowerCase()} explores the San Andreas Fault in the Palm Springs and Coachella Valley region aboard an open-air Jeep through the Indio Hills fault zone, desert canyons, and active wash systems.`,
    `The route runs about ${duration} and departs from ${meetingPoint}, where guides cover terrain, weather, and safety before entering the geologic corridor.`,
    "Along the drive, guides interpret tectonic plate movement, uplifted rock layers, seismology markers, and groundwater-fed palm oasis habitat, with short stops for field observation and photos near narrow slot canyon walls.",
    "Guests also hear local context on the historic Cahuilla village landscape, canyon drainage patterns, and how erosion shapes the same ridges, arroyos, and fan palms seen across the greater Coachella Valley geology system.",
  ];

  const highlights = [
    "Open-air Jeep Scrambler/CJ-8 style fault-zone drive through the Indio Hills",
    "San Andreas Fault zone stops with tectonic plate and seismology interpretation",
    "Short walk segments near slot canyon formations and eroded desert canyons",
    "Palm oasis viewpoints linked to groundwater and wash-system dynamics",
    "Cahuilla village and regional desert history context from the guide",
    "Small-group pacing for questions, photos, and geology-focused discussion",
    ...parsedTour.highlights,
  ];

  const uniqueHighlights = Array.from(new Set(highlights)).slice(0, 10);
  const schemaDescription = `${paragraphs[0]} ${paragraphs[1]} ${paragraphs[2]}`;

  return {
    categoryLabel: category,
    meetingPointLabel: meetingPoint,
    priceAdult: parsedTour.priceAdult,
    priceChild: parsedTour.priceChild,
    priceLabel,
    durationLabel: duration,
    whatYoullExperience: paragraphs,
    highlights: uniqueHighlights,
    schemaDescription,
  };
};
