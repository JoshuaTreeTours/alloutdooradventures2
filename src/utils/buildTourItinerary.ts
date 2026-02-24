export type TourItineraryInput = {
  tourTitle?: string;
  cityName?: string | null;
  placeName?: string | null;
  departureLocationName?: string | null;
  departureAddress?: string | null;
  duration?: string | null;
  highlights?: string[] | null;
  experienceText?: string | null;
};

type TourItineraryListItem = {
  "@type": "ListItem";
  position: number;
  name: string;
};

export type TourItinerary = {
  "@type": "ItemList";
  itemListElement: TourItineraryListItem[];
};

const normalizeText = (value?: string | null) => value?.trim() ?? "";

const toShortLine = (value: string) =>
  value
    .replace(/\s+/g, " ")
    .replace(/[;:]+/g, ",")
    .replace(/\.+/g, ".")
    .trim();

const hasKeyword = (value: string, patterns: RegExp[]) =>
  patterns.some(pattern => pattern.test(value));

const pickHighlight = (highlights: string[], patterns: RegExp[]) => {
  for (const highlight of highlights) {
    if (hasKeyword(highlight, patterns)) {
      return toShortLine(highlight);
    }
  }
  return "";
};

const pickExperiencePhrase = (experienceText: string, patterns: RegExp[]) => {
  const sentences = experienceText
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

  for (const sentence of sentences) {
    if (hasKeyword(sentence, patterns)) {
      return toShortLine(sentence);
    }
  }

  return "";
};

const dedupeSteps = (steps: string[]) => {
  const seen = new Set<string>();

  return steps.filter(step => {
    const key = step.toLowerCase();
    if (!step || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const buildTourItinerary = (input: TourItineraryInput): TourItinerary => {
  const departureLocationName = normalizeText(input.departureLocationName);
  const placeName = normalizeText(input.placeName);
  const cityName = normalizeText(input.cityName);
  const duration = normalizeText(input.duration);
  const highlights = (input.highlights ?? []).map(item => item.trim()).filter(Boolean);
  const experienceText = normalizeText(input.experienceText);

  const locationLabel = departureLocationName || placeName || cityName || "meeting point";
  const citySuffix = cityName && departureLocationName ? ` (${cityName})` : "";

  const steps: string[] = [
    departureLocationName
      ? `Meet at ${departureLocationName}${citySuffix} and safety briefing`
      : `Meet at ${locationLabel} and check in`,
  ];

  const driveStep =
    pickHighlight(highlights, [/open-air/i, /jeep/i, /fault/i, /indio\s+hills/i, /drive/i]) ||
    pickExperiencePhrase(experienceText, [/fault\s+zone/i, /open-air/i, /jeep/i, /drive/i]);
  if (driveStep) {
    steps.push(driveStep);
  }

  const stopStep =
    pickHighlight(highlights, [/stop/i, /walk/i, /slot\s+canyon/i, /photo/i, /canyon/i]) ||
    pickExperiencePhrase(experienceText, [/slot\s+canyon/i, /photo/i, /stop/i, /walk/i]);
  if (stopStep) {
    steps.push(stopStep);
  }

  const contextStep =
    pickHighlight(highlights, [/oasis/i, /ecolog/i, /history/i, /cahuilla/i, /habitat/i]) ||
    pickExperiencePhrase(experienceText, [/oasis/i, /history/i, /ecolog/i, /habitat/i]);
  if (contextStep) {
    steps.push(contextStep);
  }

  if (steps.length < 2) {
    steps.push(
      duration
        ? `Guided drive and interpretation over about ${duration}`
        : "Guided drive with geology and local interpretation"
    );
  }

  steps.push(`Return to ${locationLabel}`);

  const normalized = dedupeSteps(steps).slice(0, 5);
  const minimumSteps =
    normalized.length >= 3
      ? normalized
      : [
          steps[0],
          duration
            ? `Guided drive and interpretation over about ${duration}`
            : "Guided drive and interpretation",
          `Return to ${locationLabel}`,
        ];

  return {
    "@type": "ItemList",
    itemListElement: minimumSteps.slice(0, 5).map((name, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
    })),
  };
};
