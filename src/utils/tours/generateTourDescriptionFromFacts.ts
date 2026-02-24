import type { FhTourFacts } from "../fareharbor/fetchFhItemDetails";
import { jaccardTrigramSimilarity } from "../text/similarity";

type GeneratedFaq = { question: string; answer: string };

export type GeneratedTourContent = {
  heroSummary: string;
  longDescription: string;
  highlights: string[];
  faqs: GeneratedFaq[];
};

const pickActivityNoun = (facts: FhTourFacts) => {
  const text = `${facts.title ?? ""} ${(facts.highlights ?? []).join(" ")}`.toLowerCase();
  if (/stargaz|night sky|astronomy/.test(text)) return "stargazing tour";
  if (/horse|ride|equestrian/.test(text)) return "guided horseback outing";
  if (/hike|trail|walk|climb/.test(text)) return "guided hike";
  if (/photo|photography/.test(text)) return "guided photography outing";
  return "guided outdoor tour";
};

const line = (value?: string) => (value ? value.trim().replace(/\s+/g, " ") : "");

export const generateTourDescriptionFromFacts = ({
  fhFacts,
  destinationContext,
  previousDescriptions = [],
}: {
  fhFacts: FhTourFacts;
  destinationContext: { city: string; region: string };
  keywords?: string[];
  previousDescriptions?: string[];
}): GeneratedTourContent => {
  const title = fhFacts.title ?? "Joshua Tree tour";
  const activity = pickActivityNoun(fhFacts);
  const firstOpeners = [
    `${title} is a ${activity} in ${destinationContext.city} for travelers who want clear logistics and place-based context.`,
    `Set in ${destinationContext.city}, ${title} focuses on a ${activity} format with practical planning details up front.`,
    `This ${activity} in ${destinationContext.city} centers on ${title} and keeps expectations specific from check-in onward.`,
  ];

  const factsUsed = [
    fhFacts.durationText && `Duration is listed as ${fhFacts.durationText}.`,
    fhFacts.meetingPoint && `Meeting details point to ${fhFacts.meetingPoint}.`,
    fhFacts.groupSizeMax && `Group size may run up to ${fhFacts.groupSizeMax} guests.`,
    fhFacts.ageMin && `Minimum age guidance starts at ${fhFacts.ageMin}.`,
    fhFacts.accessibility && `Accessibility notes: ${fhFacts.accessibility}.`,
    fhFacts.cancellationPolicy && `Cancellation terms: ${fhFacts.cancellationPolicy}.`,
  ].filter(Boolean) as string[];

  const highlights = Array.from(new Set([...(fhFacts.highlights ?? []), ...(fhFacts.itinerary ?? [])]))
    .map(line)
    .filter(Boolean)
    .slice(0, 5);

  const logisticsBits = [
    fhFacts.durationText ? `Duration: ${fhFacts.durationText}` : undefined,
    fhFacts.meetingPoint ? `Meeting point: ${fhFacts.meetingPoint}` : undefined,
    fhFacts.ageMin ? `Minimum age: ${fhFacts.ageMin}+` : undefined,
    fhFacts.groupSizeMax ? `Group size: up to ${fhFacts.groupSizeMax}` : undefined,
    fhFacts.pricing?.pricePerPersonFrom ? `Pricing signal: from $${fhFacts.pricing.pricePerPersonFrom}` : undefined,
  ].filter(Boolean);

  const faqPairs: GeneratedFaq[] = [
    fhFacts.durationText
      ? { question: "How long is the tour?", answer: `FareHarbor lists a duration of ${fhFacts.durationText}.` }
      : null,
    fhFacts.meetingPoint
      ? { question: "Where does the tour meet?", answer: `The listed meeting point is ${fhFacts.meetingPoint}.` }
      : null,
    fhFacts.ageMin
      ? { question: "Is there a minimum age?", answer: `The listing indicates a minimum age of ${fhFacts.ageMin}.` }
      : null,
    fhFacts.cancellationPolicy
      ? { question: "What is the cancellation policy?", answer: fhFacts.cancellationPolicy }
      : null,
    fhFacts.accessibility
      ? { question: "Are there accessibility notes?", answer: fhFacts.accessibility }
      : null,
  ].filter(Boolean) as GeneratedFaq[];

  let openerIndex = 0;
  let longDescription = "";
  while (openerIndex < firstOpeners.length) {
    const p1 = firstOpeners[openerIndex];
    const p2 = highlights.length
      ? `Highlights focus on ${highlights.slice(0, 3).join("; ")}.`
      : `The listing emphasizes route-based interpretation and paced stops across ${destinationContext.region}.`;
    const p3 = logisticsBits.length
      ? `Logistics include ${logisticsBits.join("; ")}.`
      : `Logistics vary by departure; confirm timing and meeting details in booking.`;
    const p4 = factsUsed.length
      ? `Operational details include ${factsUsed.slice(0, 3).join(" ")}`
      : "Operational terms are defined in FareHarbor at time of booking.";
    longDescription = [p1, p2, p3, p4].join("\n\n");

    const tooSimilar = previousDescriptions.some(prev => jaccardTrigramSimilarity(prev, longDescription) > 0.78);
    if (!tooSimilar) break;
    openerIndex += 1;
  }

  const heroSummary = `${title} in ${destinationContext.city} is positioned as a ${activity} with details sourced directly from FareHarbor. ${fhFacts.durationText ? `Listed duration: ${fhFacts.durationText}.` : ""}`.trim();

  return {
    heroSummary,
    longDescription,
    highlights,
    faqs: faqPairs.slice(0, 5),
  };
};
