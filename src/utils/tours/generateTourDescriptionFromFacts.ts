import type { FhTourFacts } from "../fareharbor/fetchFhItemDetails";
import { jaccardTrigramSimilarity } from "../text/similarity";
import {
  isBadTokenString,
  sanitizeFhText,
  type FhTokenReplacements,
} from "../text/sanitizeFhText";

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
  const replacements: FhTokenReplacements = {
    itemName: fhFacts.title,
    durationText: fhFacts.durationText,
  };
  const title = sanitizeFhText(fhFacts.title ?? "Joshua Tree tour", replacements);
  const activity = pickActivityNoun(fhFacts);
  const firstOpeners = [
    `${title} is a ${activity} in ${destinationContext.city} for travelers who want clear logistics and place-based context.`,
    `Set in ${destinationContext.city}, ${title} focuses on a ${activity} format with practical planning details up front.`,
    `This ${activity} in ${destinationContext.city} centers on ${title} and keeps expectations specific from check-in onward.`,
  ];

  const cancellationText = sanitizeFhText(
    fhFacts.cancellationPolicy ?? "",
    replacements
  );
  const safeCancellation =
    cancellationText && !/flownode|policy\{|\{\s*"/i.test(cancellationText)
      ? cancellationText
      : "See booking page for cancellation terms.";

  const factsUsed = [
    fhFacts.durationText && `Duration is listed as ${sanitizeFhText(fhFacts.durationText, replacements)}.`,
    fhFacts.meetingPoint && `Meeting details point to ${sanitizeFhText(fhFacts.meetingPoint, replacements)}.`,
    fhFacts.groupSizeMax && `Group size may run up to ${fhFacts.groupSizeMax} guests.`,
    fhFacts.ageMin && `Minimum age guidance starts at ${fhFacts.ageMin}.`,
    fhFacts.accessibility && `Accessibility notes: ${sanitizeFhText(fhFacts.accessibility, replacements)}.`,
    `Cancellation terms: ${safeCancellation}.`,
  ].filter(Boolean) as string[];

  const highlights = Array.from(new Set([...(fhFacts.highlights ?? []), ...(fhFacts.itinerary ?? [])]))
    .map(item => sanitizeFhText(line(item), replacements))
    .filter(Boolean)
    .slice(0, 5);

  const logisticsBits = [
    fhFacts.durationText
      ? `Duration: ${sanitizeFhText(fhFacts.durationText, replacements)}`
      : undefined,
    fhFacts.meetingPoint
      ? `Meeting point: ${sanitizeFhText(fhFacts.meetingPoint, replacements)}`
      : undefined,
    fhFacts.ageMin ? `Minimum age: ${fhFacts.ageMin}+` : undefined,
    fhFacts.groupSizeMax ? `Group size: up to ${fhFacts.groupSizeMax}` : undefined,
    fhFacts.pricing?.pricePerPersonFrom ? `Pricing signal: from $${fhFacts.pricing.pricePerPersonFrom}` : undefined,
  ].filter(Boolean);

  const faqPairs: GeneratedFaq[] = [
    fhFacts.durationText
      ? { question: "How long is the tour?", answer: `FareHarbor lists a duration of ${sanitizeFhText(fhFacts.durationText, replacements)}.` }
      : null,
    fhFacts.meetingPoint
      ? { question: "Where does the tour meet?", answer: `The listed meeting point is ${sanitizeFhText(fhFacts.meetingPoint, replacements)}.` }
      : null,
    fhFacts.ageMin
      ? { question: "Is there a minimum age?", answer: `The listing indicates a minimum age of ${fhFacts.ageMin}.` }
      : null,
    fhFacts.cancellationPolicy
      ? { question: "What is the cancellation policy?", answer: safeCancellation }
      : null,
    fhFacts.accessibility
      ? { question: "Are there accessibility notes?", answer: sanitizeFhText(fhFacts.accessibility, replacements) }
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

  const heroSummary = sanitizeFhText(
    `${title} in ${destinationContext.city} is positioned as a ${activity} with details sourced directly from FareHarbor. ${fhFacts.durationText ? `Listed duration: ${sanitizeFhText(fhFacts.durationText, replacements)}.` : ""}`.trim(),
    replacements
  );

  const cleanLongDescription = sanitizeFhText(longDescription, replacements);
  const finalLongDescription =
    isBadTokenString(cleanLongDescription) || !cleanLongDescription
      ? `This guided experience in ${destinationContext.city} is booked through FareHarbor and includes all logistics details on the booking page.`
      : cleanLongDescription;

  return {
    heroSummary,
    longDescription: finalLongDescription,
    highlights,
    faqs: faqPairs
      .slice(0, 5)
      .map(item => ({
        question: sanitizeFhText(item.question, replacements),
        answer: sanitizeFhText(item.answer, replacements),
      }))
      .filter(
        item =>
          item.question.length > 0 &&
          item.answer.length > 0 &&
          !isBadTokenString(item.question) &&
          !isBadTokenString(item.answer)
      ),
  };
};
