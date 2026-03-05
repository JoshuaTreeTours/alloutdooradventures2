import type { Engine4ViatorApiTour, Engine4ViatorTourRecord } from "../types";

const cleanText = (value?: string | null) => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const firstParagraph = (text?: string): string | undefined => {
  const clean = cleanText(text);
  if (!clean) return undefined;
  return clean
    .split(/\n{2,}|(?<=[.!?])\s+/)
    .slice(0, 2)
    .join(" ");
};

const dedupe = (items: Array<string | undefined>): string[] => {
  const seen = new Set<string>();
  return items
    .map(item => cleanText(item))
    .filter((item): item is string => Boolean(item))
    .filter(item => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

export const normalizeItinerary = (apiTour?: Engine4ViatorApiTour) =>
  (apiTour?.itinerary ?? []).filter(item => cleanText(item.title));

export const buildOverview = (input: {
  apiTour?: Engine4ViatorApiTour;
  destination: Engine4ViatorTourRecord["destination"];
  title: string;
  itinerary: Array<{ title: string; description?: string; duration?: string }>;
}): string => {
  const { apiTour, destination, title, itinerary } = input;
  const itinerarySummary = itinerary
    .slice(0, 3)
    .map(stop => stop.title)
    .join(", ");

  const candidates = dedupe([
    cleanText(apiTour?.descriptionLong),
    firstParagraph(apiTour?.whatToExpect),
    firstParagraph(itinerary.map(step => step.description).find(Boolean)),
    cleanText(apiTour?.description),
  ]);

  const base =
    candidates[0] ??
    `${title} explores ${destination.city} with a guided format and local context.`;

  const supplement = dedupe([
    candidates[1],
    itinerarySummary
      ? `Featured stops include ${itinerarySummary}.`
      : undefined,
  ]);

  return [base, ...supplement].join(" ").trim();
};

export const buildHighlights = (input: {
  apiTour?: Engine4ViatorApiTour;
  itinerary: Array<{ title: string; description?: string; duration?: string }>;
  duration?: string;
}): string[] => {
  const { apiTour, itinerary, duration } = input;
  const highlights = dedupe([
    ...itinerary.slice(0, 3).map(stop => `Stop: ${stop.title}`),
    ...itinerary
      .map(stop => firstParagraph(stop.description))
      .filter((item): item is string => Boolean(item))
      .slice(0, 2),
    firstParagraph(apiTour?.whatToExpect),
    firstParagraph(apiTour?.descriptionLong),
    ...(apiTour?.inclusions ?? []).slice(0, 2).map(item => `Includes ${item}`),
    duration ? `Duration: ${duration}` : undefined,
    cleanText(apiTour?.cancellationPolicy)
      ? `Cancellation: ${apiTour?.cancellationPolicy}`
      : undefined,
  ]);

  return highlights.slice(0, 8);
};

export const buildFaqs = (input: {
  apiTour?: Engine4ViatorApiTour;
  meetingPointFull?: string;
  duration?: string;
  cancellationPolicy?: string;
}): Array<{ question: string; answer: string }> => {
  const { apiTour, meetingPointFull, duration, cancellationPolicy } = input;

  const faqs: Array<{ question: string; answer: string } | undefined> = [
    meetingPointFull
      ? {
          question: "Where is the meeting point?",
          answer: `The listed meeting point is ${meetingPointFull}.`,
        }
      : undefined,
    duration
      ? {
          question: "How long is this tour?",
          answer: `The experience lasts about ${duration}.`,
        }
      : undefined,
    cancellationPolicy
      ? {
          question: "What is the cancellation policy?",
          answer: cancellationPolicy,
        }
      : undefined,
    (apiTour?.additionalInfo ?? []).length
      ? {
          question: "What should I bring?",
          answer: (apiTour?.additionalInfo ?? []).slice(0, 2).join(" "),
        }
      : undefined,
    (apiTour?.exclusions ?? []).length
      ? {
          question: "What is not included?",
          answer: `Exclusions may include ${(apiTour?.exclusions ?? []).slice(0, 2).join(" and ")}.`,
        }
      : undefined,
  ];

  return faqs.filter(
    (item): item is { question: string; answer: string } => !!item
  );
};
