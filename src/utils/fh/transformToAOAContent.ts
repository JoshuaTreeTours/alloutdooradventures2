import type { ParsedTour } from "./parseFareHarborHtml";

export type TourRewriteV3_1 = {
  heroPriceText?: string;
  schemaPrice?: number;
  priceCurrency?: string;
  durationMinutes?: number;
  durationISO?: string;
  pricing?: {
    currency: string;
    low?: number;
    high?: number;
    displayText?: string;
    isAggregate?: boolean;
  };
  canonicalPath?: string;
  category?: {
    primary: string;
    tags?: string[];
  };
  meetingPoint?: {
    name?: string;
    addressLine1?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
    rawText?: string;
  };
  durationLabel?: string;
  whatYoullExperience: string[];
  highlights: string[];
  faqs?: Array<{ question: string; answer: string }>;
  schemaDescription: string;
};

export type TourRewriteV3 = TourRewriteV3_1;

const DEFAULT_CATEGORY = "Jeep tour (geology + nature walk)";
const DEFAULT_MEETING_POINT = "Metate Ranch — 38635 Monroe St, Indio, CA 92203";
const DEFAULT_DURATION = "3 hours";
const DEFAULT_PRICE = "$175 adult / $150 child";

export const CURATED_34849_FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "How long is the tour?",
    answer:
      "This Palm Springs San Andreas Fault tour runs about 3 hours from check-in through return. You’ll ride in an open-air Jeep and make short stops through the Indio Hills for geology interpretation and photos. Plan a little extra time at Metate Ranch for arrival and check-in.",
  },
  {
    question: "How many people do the Jeeps hold?",
    answer:
      "Each open-air Jeep is designed for small groups, with a maximum of 7 guests per vehicle on this Palm Springs San Andreas Fault route. That smaller size helps your guide keep the experience interactive while moving through Indio Hills terrain. Seating layouts can vary slightly by vehicle model.",
  },
  {
    question: "Do I need a reservation?",
    answer:
      "Yes, reservations are strongly recommended for this Palm Springs San Andreas Fault experience, especially in peak season. Booking ahead secures your preferred departure time and helps avoid sell-outs. Advance reservations are particularly helpful for morning open-air Jeep departures through the Indio Hills.",
  },
  {
    question: "Do you offer hotel pickup?",
    answer:
      "This Palm Springs San Andreas Fault tour generally meets on-site rather than offering hotel pickup. Most departures begin at Metate Ranch, where guests check in before boarding the open-air Jeep. Confirm current transportation details on your booking confirmation before arrival.",
  },
  {
    question: "Where do we meet?",
    answer:
      "The standard meeting point for this Palm Springs San Andreas Fault route is Metate Ranch at 38635 Monroe St, Indio, CA 92203. Arriving a bit early helps you check in and settle in before the open-air Jeep departs into the Indio Hills. Use your confirmation details for the latest arrival instructions.",
  },
  {
    question: "What is the cancellation policy?",
    answer:
      "For this Palm Springs San Andreas Fault tour, cancellations are typically accepted up to 48 hours before departure. Policies can vary by booking type, so always review the exact terms shown at checkout. The same 48-hour window usually applies to open-air Jeep departures from Metate Ranch.",
  },
  {
    question: "What ages are allowed?",
    answer:
      "This Palm Springs San Andreas Fault experience is generally open to ages 5 and up, following operator safety rules. Children must ride with a participating adult and should meet any posted requirements. Age suitability also depends on open-air Jeep conditions in the Indio Hills.",
  },
  {
    question: "Is it accessible for limited mobility?",
    answer:
      "Accessibility for this Palm Springs San Andreas Fault trip depends on current route conditions and guest mobility needs. The open-air Jeep ride is smooth in many sections, but terrain in the Indio Hills can include uneven stops and step-up entry. Contact the operator in advance so Metate Ranch staff can advise on the best fit.",
  },
];

const normalizeSentences = (value: string) =>
  value
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

const ensureSeoFaqAnswer = (answer: string) => {
  const withoutPhones = answer
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  const sentences = normalizeSentences(withoutPhones);
  const fallbackSentence =
    "This Palm Springs San Andreas Fault experience explores Indio Hills terrain by open-air Jeep from Metate Ranch.";
  const withCountGuard =
    sentences.length >= 2
      ? sentences.slice(0, 4)
      : [
          ...sentences,
          "You’ll visit Palm Springs desert terrain in the San Andreas Fault zone with a guided open-air Jeep route.",
        ];

  const merged = withCountGuard.join(" ");
  const hasPalmSprings = /palm springs/i.test(merged);
  const hasFault = /san andreas fault/i.test(merged);
  const hasRequiredTerm = /indio hills|metate ranch|open-air jeep/i.test(
    merged
  );
  const completed = [
    merged,
    !hasPalmSprings || !hasFault || !hasRequiredTerm ? fallbackSentence : "",
  ]
    .join(" ")
    .trim();

  return normalizeSentences(completed).slice(0, 4).join(" ");
};

const mergeFareHarborAndCuratedFaqs = (
  parsedFaqs: Array<{ question: string; answer: string }>,
  curatedFaqs: Array<{ question: string; answer: string }>
) => {
  const faqByQuestion = new Map<string, { question: string; answer: string }>();

  [...parsedFaqs, ...curatedFaqs].forEach(item => {
    const question = item.question.trim();
    if (!question) {
      return;
    }

    const key = question.toLowerCase();
    if (!faqByQuestion.has(key)) {
      faqByQuestion.set(key, {
        question,
        answer: ensureSeoFaqAnswer(item.answer),
      });
    }
  });

  return Array.from(faqByQuestion.values());
};

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

const parseDurationMinutes = (duration: string): number | undefined => {
  const trimmed = duration.trim();
  if (!trimmed) {
    return undefined;
  }

  const hourMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|hr|h)\b/i);
  const minuteMatch = trimmed.match(/(\d+)\s*(?:minutes?|mins?|min|m)\b/i);
  const hours = hourMatch?.[1] ? Number.parseFloat(hourMatch[1]) : 0;
  const minutes = minuteMatch?.[1] ? Number.parseInt(minuteMatch[1], 10) : 0;
  const totalMinutes = Math.round(hours * 60 + minutes);

  return Number.isFinite(totalMinutes) && totalMinutes > 0
    ? totalMinutes
    : undefined;
};

const toDurationISO = (durationMinutes?: number): string | undefined => {
  if (!durationMinutes || durationMinutes <= 0) {
    return undefined;
  }

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  if (hours && minutes) {
    return `PT${hours}H${minutes}M`;
  }
  if (hours) {
    return `PT${hours}H`;
  }
  return `PT${minutes}M`;
};

export const transformToAOAContent = (
  parsedTour: ParsedTour
): TourRewriteV3_1 => {
  const duration = parsedTour.duration || DEFAULT_DURATION;
  const meetingPoint = parsedTour.meetingPoint.rawText || DEFAULT_MEETING_POINT;
  const category = parsedTour.category.primary || DEFAULT_CATEGORY;
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
  const parsedFaqs = parsedTour.faq.map(item => ({
    question: item.q,
    answer: ensureSeoFaqAnswer(item.a),
  }));
  const mergedFaqs = mergeFareHarborAndCuratedFaqs(
    parsedFaqs,
    CURATED_34849_FAQS
  ).slice(0, 5);
  const durationMinutes = parseDurationMinutes(duration);
  const durationISO = toDurationISO(durationMinutes);
  const priceLow = [parsedTour.priceAdult, parsedTour.priceChild]
    .filter((price): price is number => typeof price === "number")
    .sort((a, b) => a - b)[0];
  const priceHigh = [parsedTour.priceAdult, parsedTour.priceChild]
    .filter((price): price is number => typeof price === "number")
    .sort((a, b) => b - a)[0];
  const isAggregate =
    typeof priceLow === "number" &&
    typeof priceHigh === "number" &&
    priceLow !== priceHigh;

  return {
    heroPriceText: priceLabel,
    schemaPrice: parsedTour.priceAdult,
    priceCurrency: "USD",
    durationMinutes,
    durationISO,
    pricing: {
      currency: "USD",
      low: priceLow,
      high: priceHigh,
      displayText: priceLabel,
      isAggregate,
    },
    category: parsedTour.category,
    meetingPoint: parsedTour.meetingPoint,
    durationLabel: duration,
    whatYoullExperience: paragraphs,
    highlights: uniqueHighlights,
    faqs: mergedFaqs,
    schemaDescription,
  };
};
