import type { Engine4TourViewModel } from "../types";

const cleanText = (value?: string | null) => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const dedupe = (items: Array<string | undefined>): string[] => {
  const seen = new Set<string>();
  return items
    .map(item => cleanText(item))
    .filter((item): item is string => Boolean(item))
    .filter(item => {
      const key = item.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
};

const detectFormat = (tour: Engine4TourViewModel): string => {
  const haystack = [tour.title, tour.description, tour.whatToExpect]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (haystack.includes("e-bike") || haystack.includes("ebike"))
    return "e-bike";
  if (haystack.includes("jeep")) return "jeep";
  if (haystack.includes("walk") || haystack.includes("walking"))
    return "walking";
  if (haystack.includes("hike") || haystack.includes("trail")) return "hiking";
  if (haystack.includes("bike") || haystack.includes("cycling")) return "bike";

  return "guided";
};

const stopNames = (tour: Engine4TourViewModel) =>
  dedupe((tour.itinerary ?? []).map(stop => stop.title));

const itinerarySummary = (tour: Engine4TourViewModel): string | undefined => {
  const stops = stopNames(tour);
  if (stops.length >= 3) {
    return `The route visits ${stops[0]}, ${stops[1]}, and ${stops[2]}.`;
  }
  if (stops.length === 2) {
    return `The route visits ${stops[0]} and ${stops[1]}.`;
  }
  if (stops.length === 1) {
    return `A featured stop is ${stops[0]}.`;
  }
  return undefined;
};

const firstParagraph = (text?: string): string | undefined => {
  const clean = cleanText(text);
  if (!clean) return undefined;
  return clean
    .split(/\n{2,}|(?<=[.!?])\s+/)
    .slice(0, 2)
    .join(" ");
};

export const buildOverview = (tour: Engine4TourViewModel): string => {
  const format = detectFormat(tour);
  const durationPart = cleanText(tour.duration)
    ? `The experience runs for about ${tour.duration}.`
    : undefined;
  const routePart = itinerarySummary(tour);
  const experiencePart =
    firstParagraph(tour.whatToExpect) ??
    firstParagraph(tour.descriptionLong) ??
    firstParagraph(tour.description) ??
    firstParagraph(tour.overview);

  const inclusionPart =
    tour.inclusions && tour.inclusions.length > 0
      ? `Included features may cover ${tour.inclusions.slice(0, 2).join(" and ")}.`
      : undefined;

  const sentences = dedupe([
    `${tour.title} is a ${format} tour in ${tour.city} designed around local routes and key points of interest.`,
    durationPart,
    routePart,
    experiencePart,
    inclusionPart,
  ]);

  return sentences.join(" ");
};

export const buildHighlights = (tour: Engine4TourViewModel): string[] => {
  const highlights: string[] = [];

  (tour.itinerary ?? []).forEach(stop => {
    if (highlights.length < 5 && stop.title) {
      highlights.push(`Visit ${stop.title}`);
    }
  });

  [tour.whatToExpect, tour.description, tour.descriptionLong]
    .map(firstParagraph)
    .filter((item): item is string => Boolean(item))
    .forEach(text => {
      if (highlights.length < 6) {
        highlights.push(text);
      }
    });

  (tour.inclusions ?? []).forEach(item => {
    if (highlights.length < 7) {
      highlights.push(`Includes ${item}`);
    }
  });

  if (tour.cancellationPolicy && highlights.length < 8) {
    highlights.push(`Cancellation: ${tour.cancellationPolicy}`);
  }

  if (tour.duration && highlights.length < 8) {
    highlights.push(`Duration: ${tour.duration}`);
  }

  return dedupe(highlights).slice(0, 8);
};

export const buildFaqs = (
  tour: Engine4TourViewModel
): Array<{ question: string; answer: string }> => {
  const faqs: Array<{ question: string; answer: string } | undefined> = [
    tour.meetingPoint
      ? {
          question: "Where does the tour start?",
          answer: `The listed start point is ${tour.meetingPoint}.`,
        }
      : undefined,
    tour.duration
      ? {
          question: "How long is the tour?",
          answer: `The tour duration is approximately ${tour.duration}.`,
        }
      : undefined,
    tour.cancellationPolicy
      ? {
          question: "What is the cancellation policy?",
          answer: tour.cancellationPolicy,
        }
      : undefined,
    (tour.additionalInfo ?? []).length > 0
      ? {
          question: "What should I bring?",
          answer: `Additional tour notes include: ${(tour.additionalInfo ?? []).slice(0, 2).join(" ")}`,
        }
      : undefined,
    {
      question: "Is the tour suitable for beginners?",
      answer:
        cleanText(tour.whatToExpect) ??
        cleanText(tour.description) ??
        "The route is guided, so review the activity details to match your comfort level.",
    },
  ];

  return faqs.filter((item): item is { question: string; answer: string } =>
    Boolean(item)
  );
};
