import { fetchFareHarborHtml } from "./fetchFareHarborHtml";
import { parseFareHarborHtml } from "./parseFareHarborHtml";
import { resolveFareHarborUrlFromBookPage } from "./resolveFareHarborUrlFromBookPage";
import type { TourRewriteV3_1 } from "./transformToAOAContent";

export type Jt459591Override = TourRewriteV3_1 & {
  logistics: {
    duration?: string;
    meetingPoint?: string;
    age?: string;
    groupSize?: string;
    cancellation?: string;
  };
};

const TOUR_SLUG = "hike-and-climb-459591";

const pickFaqAnswer = (
  faqs: Array<{ q: string; a: string }>,
  matcher: RegExp
): string | undefined => faqs.find(item => matcher.test(item.q))?.a;

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

export const getJoshuaTree459591Override = (
  canonicalPath: string
): Jt459591Override | null => {
  if (!canonicalPath.endsWith(TOUR_SLUG)) {
    return null;
  }

  const fareHarborUrl = resolveFareHarborUrlFromBookPage(
    `${canonicalPath}/book`
  );
  if (!fareHarborUrl) return null;

  const fareHarborHtml = fetchFareHarborHtml(fareHarborUrl);
  if (!fareHarborHtml) return null;

  const parsed = parseFareHarborHtml(fareHarborHtml);
  const duration = parsed.duration || undefined;
  const meetingPoint = parsed.meetingPoint.rawText || undefined;
  const heroPriceText =
    parsed.priceLabel || parsed.pricing.find(item => /\$\d+/.test(item));
  const pricePoints = [parsed.priceAdult, parsed.priceChild].filter(
    (value): value is number => typeof value === "number"
  );
  const lowPrice = pricePoints.length ? Math.min(...pricePoints) : undefined;
  const highPrice = pricePoints.length ? Math.max(...pricePoints) : undefined;

  const logistics = {
    duration,
    meetingPoint,
    age:
      pickFaqAnswer(parsed.faq, /age|kids|children|minimum/i) ??
      "Age guidance is listed on the booking page for each departure.",
    groupSize:
      pickFaqAnswer(parsed.faq, /group|people|size|participants/i) ??
      "Small-group departures are typical; check the booking page for exact limits.",
    cancellation:
      pickFaqAnswer(parsed.faq, /cancel|refund|reschedul/i) ??
      "Cancellation and reschedule terms are provided at checkout.",
  };

  const whatYoullExperience = [
    `I love this Joshua Tree hike and climb because it combines a guided desert approach hike with real climbing movement on park granite, so your day feels like one continuous adventure rather than two separate activities.`,
    `The route and pace are shaped by ${duration ? `${duration.toLowerCase()} timing` : "current departure timing"} and conditions, with your guide selecting terrain that matches the group while still delivering classic Joshua Tree scenery, boulder features, and technique-focused instruction.`,
    `You get hands-on coaching throughout the climbing portion, plus safety systems, route strategy, and movement tips that help both first-timers and returning climbers build confidence on rock.`,
    `Before departure, review ${meetingPoint ? `the meeting point at ${meetingPoint}` : "the listed meeting point"}, bring sun-ready layers, water, and supportive shoes, and use the /book page details for the latest check-in, inclusions, and cancellation terms.`,
  ];

  const highlights = [
    "Guided hike approach through Joshua Tree desert terrain to climbing zones",
    "Climbing on Joshua Tree granite formations with guide supervision",
    "Technique coaching focused on footwork, balance, and body positioning",
    "Safety briefing and gear-use instruction before climbing begins",
    "Route selection adjusted to conditions and group comfort",
    "Photo-ready desert landscapes, boulder gardens, and park views",
    "Small-group pacing that leaves time for questions and repeats",
    ...parsed.highlights,
  ].slice(0, 10);

  const faqs = [
    {
      question:
        "Is this suitable for beginners and what fitness level should I have?",
      answer:
        "Yes. Beginners are welcome, and this guided trip can work for first-time climbers with steady hiking ability; review current pacing notes on the booking page before reserving.",
    },
    {
      question: "What ages are allowed on the Hike & Climb tour?",
      answer: logistics.age,
    },
    {
      question: "What should I wear and bring for Joshua Tree conditions?",
      answer:
        pickFaqAnswer(parsed.faq, /wear|bring|shoe|water|sun/i) ??
        "Plan for sun exposure with layers, supportive shoes, and water; use the booking confirmation for any tour-specific gear requirements.",
    },
    {
      question: "How long is the tour and what is included?",
      answer: `${duration ? `The listed duration is ${duration}. ` : ""}${parsed.inclusions.length ? `Inclusions may include ${parsed.inclusions.slice(0, 3).join(", ")}. ` : ""}Always verify exact inclusions on the booking page for your selected departure.`,
    },
    {
      question: "How do reservations and cancellations work?",
      answer: logistics.cancellation,
    },
  ];

  return {
    heroPriceText,
    schemaPrice: parsed.priceAdult,
    priceCurrency: "USD",
    pricing: {
      currency: "USD",
      low: lowPrice,
      high: highPrice,
      displayText: heroPriceText,
      isAggregate:
        typeof lowPrice === "number" &&
        typeof highPrice === "number" &&
        lowPrice !== highPrice,
    },
    durationLabel: duration,
    durationISO: toDurationISO(duration),
    meetingPoint: parsed.meetingPoint,
    whatYoullExperience,
    highlights: Array.from(new Set(highlights)),
    faqs,
    schemaDescription: whatYoullExperience.slice(0, 3).join(" "),
    logistics,
  };
};
