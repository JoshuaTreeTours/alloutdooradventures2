import type { Tour } from "../../data/tours.types";
import type { ParsedTour } from "../fh/parseFareHarborHtml";

export type HikeClimbTemplateFaq = {
  question: string;
  answer: string;
};

export type HikeClimbTemplateModel = {
  title: string;
  priceLabel: string;
  durationLabel: string;
  durationISO?: string;
  meetingPointLabel: string;
  ageLabel: string;
  groupSizeLabel: string;
  cancellationLabel: string;
  highlights: string[];
  itinerarySteps: string[];
  faqs: HikeClimbTemplateFaq[];
  descriptionBlocks: string[];
  categoryLabel: string;
  schemaDescription: string;
  lowPrice?: number;
  highPrice?: number;
  heroPriceText?: string;
  meetingPoint: ParsedTour["meetingPoint"];
};

const FALLBACK = "Check booking page";

const dedupe = (items: string[]) =>
  Array.from(new Set(items.map(item => item.trim()).filter(Boolean)));

const toDurationISO = (durationText?: string) => {
  if (!durationText) return undefined;
  const hours = Number(
    (durationText.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|hr|h)/i) ?? [])[1]
  );
  const mins = Number(
    (durationText.match(/(\d+)\s*(?:minutes?|mins?|min|m)/i) ?? [])[1]
  );
  const total =
    (Number.isFinite(hours) ? Math.round(hours * 60) : 0) +
    (Number.isFinite(mins) ? mins : 0);

  if (!total) return undefined;

  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h && m) return `PT${h}H${m}M`;
  if (h) return `PT${h}H`;
  return `PT${m}M`;
};

const pickFaq = (faq: ParsedTour["faq"], pattern: RegExp) =>
  faq.find(item => pattern.test(item.q))?.a;

export const buildHikeClimbTemplateModel = ({
  tour,
  fareHarborItem,
}: {
  tour: Tour;
  fareHarborItem?: ParsedTour | null;
}): HikeClimbTemplateModel => {
  const parsed = fareHarborItem ?? null;
  const pricePoints = [parsed?.priceAdult, parsed?.priceChild].filter(
    (value): value is number => typeof value === "number"
  );
  const lowPrice = pricePoints.length ? Math.min(...pricePoints) : undefined;
  const highPrice = pricePoints.length ? Math.max(...pricePoints) : undefined;
  const heroPriceText = lowPrice ? `$${lowPrice.toFixed(0)} per person` : undefined;

  const durationLabel = parsed?.duration || tour.badges.duration || FALLBACK;
  const meetingPointLabel = parsed?.meetingPoint?.rawText || FALLBACK;
  const ageLabel = pickFaq(parsed?.faq ?? [], /age|kids|children|minimum/i) || FALLBACK;
  const groupSizeLabel =
    pickFaq(parsed?.faq ?? [], /group|people|size|participants/i) || FALLBACK;
  const cancellationLabel =
    pickFaq(parsed?.faq ?? [], /cancel|refund|reschedul/i) || FALLBACK;

  const highlights = dedupe([
    ...(parsed?.highlights ?? []),
    ...(parsed?.inclusions ?? []),
    "Guided hike approach through Joshua Tree desert terrain",
    "Climbing instruction on granite formations",
    "Safety briefing and systems review before climbing",
    "Small-group pacing focused on technique and comfort",
  ]).slice(0, 8);

  const itinerarySteps = dedupe([
    "Meet the guide, complete check-in, and review safety systems.",
    "Start a guided desert approach hike toward selected climbing terrain.",
    "Practice climbing movement, footwork, and route fundamentals on granite.",
    "Take a short break for water, photos, and coaching adjustments.",
    "Return to the meeting area for debrief and next-step recommendations.",
  ]).slice(0, 6);

  const descriptionBlocks = [
    `This guided hike-and-climb experience in Joshua Tree combines a desert approach hike with supervised climbing on granite formations. The route and terrain are selected to match daily conditions and the group's pace.`,
    `The trip is listed at ${durationLabel.toLowerCase() === FALLBACK.toLowerCase() ? FALLBACK.toLowerCase() : durationLabel} with meeting at ${meetingPointLabel === FALLBACK ? "the location shown on the booking page" : meetingPointLabel}.`,
    `Instruction focuses on movement fundamentals, safety systems, and route strategy. Inclusions, age requirements, and group limits can vary by departure and should be confirmed on the booking page.`,
  ].slice(0, 4);

  const faqs: HikeClimbTemplateFaq[] = [
    {
      question: "Is this tour suitable for beginners?",
      answer:
        pickFaq(parsed?.faq ?? [], /beginner|experience|fitness|level/i) ||
        "Beginners are typically welcome when they can handle uneven terrain and follow guide instructions; confirm current requirements on the booking page.",
    },
    {
      question: "How long is the experience?",
      answer:
        durationLabel === FALLBACK
          ? FALLBACK
          : `The listed duration is ${durationLabel}.`,
    },
    {
      question: "Where is the meeting point?",
      answer: meetingPointLabel,
    },
    {
      question: "What should participants bring?",
      answer:
        pickFaq(parsed?.faq ?? [], /wear|bring|shoe|water|sun/i) ||
        "Bring water, sun protection, and supportive footwear; review booking details for exact gear guidance.",
    },
    {
      question: "What is the cancellation policy?",
      answer: cancellationLabel,
    },
  ];

  const schemaDescription = descriptionBlocks.join(" ");

  return {
    title: tour.title,
    priceLabel: heroPriceText ? `From ${heroPriceText}` : FALLBACK,
    durationLabel,
    durationISO: toDurationISO(parsed?.duration || tour.badges.duration),
    meetingPointLabel,
    ageLabel,
    groupSizeLabel,
    cancellationLabel,
    highlights,
    itinerarySteps,
    faqs,
    descriptionBlocks,
    categoryLabel: "Hiking & climbing tour",
    schemaDescription,
    lowPrice,
    highPrice,
    heroPriceText,
    meetingPoint: parsed?.meetingPoint ?? {},
  };
};
