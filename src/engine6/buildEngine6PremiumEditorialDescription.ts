import { extractEngine6OverviewNamedLocations } from "./overviewGovernance";
import {
  cleanEngine6Description,
  stripEngine6AdmissionArtifacts,
  stripEngine6GeneratedDescriptionPrefix,
} from "./seo";
import type { Engine6Tour } from "./types";

export const ENGINE6_EDITORIAL_DESCRIPTION_MIN_WORDS = 90;
export const ENGINE6_EDITORIAL_DESCRIPTION_MAX_WORDS = 140;
export const ENGINE6_EDITORIAL_DESCRIPTION_MIN_CHARS = 500;
export const ENGINE6_EDITORIAL_DESCRIPTION_MAX_CHARS = 800;

export const ENGINE6_EDITORIAL_FORBIDDEN_PATTERNS = [
  /\ba food-focused guided outing\b/i,
  /\ba water-based guided outing\b/i,
  /\ba guided cycling outing\b/i,
  /\ba city sightseeing outing\b/i,
  /\ba park-focused guided outing\b/i,
  /\ba guided destination outing\b/i,
  /\ban aerial sightseeing outing\b/i,
  /\ban off-road guided outing\b/i,
  /\ba guided hiking outing\b/i,
  /\bguided outing\b/i,
  /\bcentered on\b/i,
  /\borganized around\b/i,
  /\bdestination features\b/i,
  /\bguide-led context\b/i,
  /\bsurrounding landmarks\b/i,
  /\bsightseeing & city tours\b/i,
  /\bwater-based experience\b/i,
  /\boutdoor adventure in\b/i,
  /\btravelers explore\b/i,
  /\bthe route includes\b/i,
  /\bthe route emphasizes\b/i,
  /\bthe experience emphasizes\b/i,
  /\bscheduled stops include\b/i,
  /\blandmarks referenced\b/i,
  /\btravel is organized as\b/i,
  /\bdestination interpretation throughout the route\b/i,
  /\bexpect a route shaped around\b/i,
  /\bthe format is designed to read as destination guidance\b/i,
  /\bcity landmarks, neighborhood transitions\b/i,
  /\bHighlights include\b/i,
  /\bIncluded elements cover\b/i,
  /\bThe experience typically lasts\b/i,
  /\bThe outing typically lasts\b/i,
  /\bThe route combines\b/i,
  /\blandscape features and scenic viewpoints\b/i,
  /\bneighborhood landmarks and open views\b/i,
  /\bguided experience\b/i,
  /\bclear logistics\b/i,
  /\bmemorable local stops\b/i,
  /\btraveler-friendly pace\b/i,
  /\beasy logistics\b/i,
  /\bdetails aligned to the product page\b/i,
] as const;

const EDITORIAL_OPENING_VARIANTS = [
  (city: string, activity: string) =>
    `Spend your time in ${city} on ${activity.startsWith("a ") || activity.startsWith("an ") ? activity : `a ${activity}`}.`,
  (city: string, activity: string) =>
    `${city} opens up on ${activity.startsWith("a ") || activity.startsWith("an ") ? activity : `a ${activity}`}.`,
  (city: string, activity: string) =>
    `This ${city} outing is built around ${activity.replace(/^a /, "").replace(/^an /, "")}.`,
  (city: string, activity: string) =>
    `From ${city}, you set out on ${activity.startsWith("a ") || activity.startsWith("an ") ? activity : `a ${activity}`}.`,
  (city: string, activity: string) =>
    `${activity.startsWith("a ") || activity.startsWith("an ") ? activity.charAt(0).toUpperCase() + activity.slice(1) : `A ${activity}`} in ${city} puts the focus on the places you actually see along the way.`,
] as const;

const countWords = (value: string) =>
  value.trim().split(/\s+/).filter(Boolean).length;

const normalizeSentence = (value: string) => {
  const cleaned = stripEngine6AdmissionArtifacts(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\.\.\.+/g, ".")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/^[,.;:!?\s-]+/, "")
    .trim();

  if (!cleaned) return "";
  const withoutDangling = cleaned.replace(/[,:;\s-]+$/g, "").trim();
  return /[.!?]$/.test(withoutDangling)
    ? withoutDangling
    : `${withoutDangling}.`;
};

const isForbiddenEditorialPhrase = (value: string) =>
  ENGINE6_EDITORIAL_FORBIDDEN_PATTERNS.some(pattern => pattern.test(value));

const splitSentences = (value: string) =>
  value
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

const formatLandmarkList = (values: string[]) => {
  const cleaned = values
    .map(value => value.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (cleaned.length === 0) return "";
  if (cleaned.length === 1) return cleaned[0];
  if (cleaned.length === 2) return `${cleaned[0]} and ${cleaned[1]}`;
  return `${cleaned.slice(0, -1).join(", ")}, and ${cleaned[cleaned.length - 1]}`;
};

const dedupeValues = (values: string[]) => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = value.replace(/\s+/g, " ").trim();
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }

  return result;
};

const summarizeList = (values: string[], limit = 5) =>
  dedupeValues(
    values
      .map(value =>
        value
          .replace(/\bguided experience\b/gi, "guided visit")
          .replace(/\bPrivate guided experience\b/gi, "Private Met visit")
          .trim()
      )
      .filter(value => value.length >= 3 && !isForbiddenEditorialPhrase(value))
  ).slice(0, limit);

const hashProductCode = (productCode: string) =>
  productCode.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

const inferActivityPhrase = ({
  title,
  categoryLabel,
  overviewText,
}: {
  title: string;
  categoryLabel?: string | null;
  overviewText: string;
}) => {
  const identity = `${title} ${categoryLabel ?? ""} ${overviewText}`.toLowerCase();

  if (/wine|vineyard|tasting|culinary|food tour|chef/.test(identity)) {
    return "a wine-country tasting day";
  }
  if (/surf/.test(identity)) return "a surf lesson on local breaks";
  if (/kayak|paddle|parasail|snorkel/.test(identity)) {
    return "a paddle along the shoreline";
  }
  if (/sail|yacht|boat|cruise|harbor|whale|airboat|speedboat/.test(identity)) {
    if (/airboat|swamp|bayou/.test(identity)) {
      return "an airboat run through swamp channels";
    }
    return "a harbor cruise";
  }
  if (/helicopter|flight|air tour|paraglid/.test(identity)) {
    return "an aerial tour";
  }
  if (/segway/.test(identity)) return "a Segway ride through key districts";
  if (/bike|e-bike|cycling|trolley|pedicab/.test(identity)) {
    return "a two-wheeled city route";
  }
  if (/hike|hiking|scrambl|climb|trail/.test(identity)) {
    return "a guided trail day";
  }
  if (/jeep|4x4|off-road|humvee|atv/.test(identity)) {
    return "an off-road desert run";
  }
  if (/stargaz|astronomy|night sky/.test(identity)) {
    return "a stargazing session under dark skies";
  }
  if (/national park|state park|wildlife|desert|canyon|zoo|safari/.test(identity)) {
    return "a park-focused day trip";
  }
  if (/museum|metropolitan|admission|zoo|aquarium/.test(identity)) {
    return "a curated visit to major attractions";
  }
  if (/private/.test(identity)) return "a private sightseeing day";
  if (/city|sightseeing|landmark|neighborhood|downtown|bus tour|coach/.test(identity)) {
    return "a landmark-focused city circuit";
  }
  if (categoryLabel?.trim()) {
    return `a ${categoryLabel.trim().toLowerCase()}`;
  }

  return "a locally guided day out";
};

const cleanEditorialSource = (value: string, title: string) => {
  if (/\.\.\.|…/.test(value)) return "";

  let cleaned = stripEngine6GeneratedDescriptionPrefix(
    cleanEngine6Description(value)
  )
    .replace(/\.\.\.+/g, ".")
    .replace(/\s+/g, " ")
    .trim();

  const readableTitle = title.replace(/\s+\d{4,}$/i, "").trim();
  if (readableTitle) {
    cleaned = cleaned
      .replace(
        new RegExp(
          `^${readableTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+(?:is|offers|provides|gives|takes|brings|combines|features)\\s+`,
          "i"
        ),
        ""
      )
      .replace(
        new RegExp(
          `^${readableTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[,;:\\s-]+`,
          "i"
        ),
        ""
      )
      .trim();
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

const appendSentenceIfUseful = (sentences: string[], sentence: string) => {
  const normalized = normalizeSentence(sentence);
  if (!normalized) return false;
  if (isForbiddenEditorialPhrase(normalized)) return false;
  if (countWords(normalized) < 4) return false;

  const candidateKey = normalized.toLowerCase();
  if (
    sentences.some(existing => {
      const existingKey = existing.toLowerCase();
      return (
        existingKey.includes(candidateKey) || candidateKey.includes(existingKey)
      );
    })
  ) {
    return false;
  }

  const candidate = [...sentences, normalized].join(" ");
  if (countWords(candidate) > ENGINE6_EDITORIAL_DESCRIPTION_MAX_WORDS) {
    return false;
  }

  sentences.push(normalized);
  return true;
};

const buildItineraryNarrative = (
  stops: Array<{ title: string; description?: string | null }>
) => {
  const titles = summarizeList(stops.map(stop => stop.title).filter(Boolean), 5);
  if (titles.length === 0) return "";

  if (titles.length === 1) {
    return normalizeSentence(`Expect time at ${titles[0]}.`);
  }

  const connectors = [
    `Stops along the way include ${formatLandmarkList(titles)}.`,
    `The day moves through ${formatLandmarkList(titles)}.`,
    `You spend meaningful time at ${formatLandmarkList(titles)}.`,
    `Major pauses come at ${formatLandmarkList(titles)}.`,
  ];

  return normalizeSentence(connectors[titles.length % connectors.length]);
};

const buildHighlightsNarrative = (highlights: string[]) => {
  const items = summarizeList(highlights, 3);
  if (items.length === 0) return "";
  return normalizeSentence(
    `Particular attention goes to ${formatLandmarkList(items)}.`
  );
};

const buildInclusionsNarrative = (included: string[]) => {
  const items = summarizeList(
    included.filter(item => !/pickup|pick-up|hotel/i.test(item)),
    3
  );
  if (items.length === 0) return "";
  return normalizeSentence(`${formatLandmarkList(items)} are part of the booking.`);
};

const buildDurationNarrative = ({
  durationText,
  categoryLabel,
}: {
  durationText?: string | null;
  categoryLabel?: string | null;
}) => {
  const duration = durationText?.trim();
  if (!duration) return "";

  const category = categoryLabel?.trim().toLowerCase();
  if (category) {
    return normalizeSentence(`Plan on roughly ${duration} for this ${category}.`);
  }

  return normalizeSentence(`Plan on roughly ${duration} on the ground.`);
};

const buildTransportNarrative = (included: string[]) => {
  const transport = included.find(item =>
    /transport|ferry|shuttle|coach|bus|van|pickup|pick-up|round.?trip/i.test(item)
  );
  if (!transport) return "";
  return normalizeSentence(`${transport.replace(/[.!?]+$/g, "")} keeps the day moving.`);
};

const buildExperienceOpening = ({
  productCode,
  title,
  city,
  categoryLabel,
  overviewText,
  itineraryStops,
}: {
  productCode: string;
  title: string;
  city: string;
  categoryLabel?: string | null;
  overviewText: string;
  itineraryStops: Array<{ title: string; description?: string | null }>;
}) => {
  const activity = inferActivityPhrase({ title, categoryLabel, overviewText });
  const variant =
    EDITORIAL_OPENING_VARIANTS[
      hashProductCode(productCode) % EDITORIAL_OPENING_VARIANTS.length
    ];
  const opening = normalizeSentence(variant(city.trim(), activity));

  const itineraryTitles = summarizeList(
    itineraryStops.map(stop => stop.title).filter(Boolean),
    3
  );
  if (itineraryTitles.length === 0) {
    const overviewLocations = summarizeList(
      extractEngine6OverviewNamedLocations({
        sourceOverview: overviewText,
        highlights: [],
        itinerary: itineraryStops,
      }),
      3
    );
    if (overviewLocations.length > 0) {
      return normalizeSentence(
        `${opening.replace(/\.$/, "")}, with time built around ${formatLandmarkList(overviewLocations)}.`
      );
    }
  }

  if (itineraryTitles.length > 0) {
    return normalizeSentence(
      `${opening.replace(/\.$/, "")}, beginning with ${itineraryTitles[0]}.`
    );
  }

  return opening;
};

const trimToCharBudget = (value: string, maxChars = ENGINE6_EDITORIAL_DESCRIPTION_MAX_CHARS) => {
  if (value.length <= maxChars) {
    return value;
  }

  const clipped = value.slice(0, maxChars).trim();
  const lastWordBoundary = clipped.lastIndexOf(" ");
  const safe =
    lastWordBoundary > maxChars * 0.7
      ? clipped.slice(0, lastWordBoundary)
      : clipped;

  return `${safe.replace(/[,.;:\s-]+$/g, "").trim()}.`;
};

const padToMinimumEditorialLength = ({
  sentences,
  itineraryStops,
  highlights,
  included,
  durationText,
  categoryLabel,
}: {
  sentences: string[];
  itineraryStops: Array<{ title: string; description?: string | null }>;
  highlights: string[];
  included: string[];
  durationText?: string | null;
  categoryLabel?: string | null;
}) => {
  const paddingCandidates = [
    buildItineraryNarrative(itineraryStops),
    buildHighlightsNarrative(highlights),
    buildInclusionsNarrative(included),
    buildTransportNarrative(included),
    buildDurationNarrative({ durationText, categoryLabel }),
    ...itineraryStops.flatMap(stop =>
      splitSentences(
        cleanEditorialSource(
          stop.description ?? stop.title,
          stop.title
        )
      ).slice(0, 1)
    ),
  ];

  for (const candidate of paddingCandidates) {
    if (trimToCharBudget(sentences.join(" ")).length >= ENGINE6_EDITORIAL_DESCRIPTION_MIN_CHARS) {
      break;
    }
    appendSentenceIfUseful(sentences, candidate);
  }

  return sentences;
};

const trimToWordBudget = (sentences: string[]) => {
  const selected: string[] = [];

  for (const sentence of sentences) {
    const candidate = [...selected, sentence].join(" ");
    if (
      countWords(candidate) > ENGINE6_EDITORIAL_DESCRIPTION_MAX_WORDS &&
      selected.length > 0
    ) {
      break;
    }
    selected.push(sentence);
    if (countWords(candidate) >= ENGINE6_EDITORIAL_DESCRIPTION_MIN_WORDS) {
      break;
    }
  }

  if (
    selected.length > 0 &&
    countWords(selected.join(" ")) < ENGINE6_EDITORIAL_DESCRIPTION_MIN_WORDS
  ) {
    return sentences.slice(0, Math.min(sentences.length, selected.length + 2));
  }

  return selected.length > 0 ? selected : sentences.slice(0, 1);
};

export const buildEngine6PremiumEditorialDescription = ({
  productCode,
  title,
  city,
  categoryLabel,
  overviewText,
  description,
  itineraryStops = [],
  highlights = [],
  included = [],
  durationText,
}: {
  productCode: string;
  title: string;
  city: string;
  categoryLabel?: string | null;
  overviewText?: string | null;
  description?: string | null;
  itineraryStops?: Array<{ title: string; description?: string | null }>;
  highlights?: string[];
  included?: string[];
  durationText?: string | null;
}) => {
  const normalizedOverview = cleanEditorialSource(overviewText ?? "", title);
  const normalizedDescription = cleanEditorialSource(description ?? "", title);
  const sourceText = normalizedOverview || normalizedDescription;

  const editorialSentences = splitSentences(sourceText).filter(
    sentence =>
      !isForbiddenEditorialPhrase(sentence) &&
      countWords(sentence) >= 6 &&
      !/^this (?:tour|activity|experience)\b/i.test(sentence)
  );

  const curatedOverview = editorialSentences.join(" ").trim();
  if (
    curatedOverview.length >= ENGINE6_EDITORIAL_DESCRIPTION_MIN_CHARS &&
    countWords(curatedOverview) >= ENGINE6_EDITORIAL_DESCRIPTION_MIN_WORDS &&
    !isForbiddenEditorialPhrase(curatedOverview)
  ) {
    return trimToCharBudget(curatedOverview);
  }

  const sentences: string[] = [];
  appendSentenceIfUseful(
    sentences,
    buildExperienceOpening({
      productCode,
      title,
      city,
      categoryLabel,
      overviewText: sourceText,
      itineraryStops,
    })
  );

  for (const sentence of editorialSentences.slice(0, 3)) {
    if (countWords(sentences.join(" ")) >= ENGINE6_EDITORIAL_DESCRIPTION_MIN_WORDS) {
      break;
    }
    appendSentenceIfUseful(sentences, sentence);
  }

  const supportingSentences = [
    buildItineraryNarrative(itineraryStops),
    ...itineraryStops.flatMap(stop =>
      splitSentences(
        cleanEditorialSource(
          [stop.title, stop.description].filter(Boolean).join(". "),
          title
        )
      ).slice(0, 1)
    ),
    buildHighlightsNarrative(highlights),
    buildInclusionsNarrative(included),
    buildTransportNarrative(included),
    buildDurationNarrative({ durationText, categoryLabel }),
  ];

  for (const sentence of supportingSentences) {
    if (countWords(sentences.join(" ")) >= ENGINE6_EDITORIAL_DESCRIPTION_MIN_WORDS) {
      break;
    }
    appendSentenceIfUseful(sentences, sentence);
  }

  if (sentences.length === 0) {
    appendSentenceIfUseful(
      sentences,
      buildExperienceOpening({
        productCode,
        title,
        city,
        categoryLabel,
        overviewText: title,
        itineraryStops,
      })
    );
  }

  padToMinimumEditorialLength({
    sentences,
    itineraryStops,
    highlights,
    included,
    durationText,
    categoryLabel,
  });

  const composed = trimToCharBudget(
    trimToWordBudget(sentences).join(" ").trim()
  );
  return composed.replace(/\s+/g, " ").replace(/\s+([,.;!?])/g, "$1");
};

export const buildEngine6PremiumEditorialDescriptionFromTour = (
  tour: Engine6Tour
) =>
  buildEngine6PremiumEditorialDescription({
    productCode: tour.productCode,
    title: tour.title,
    city: tour.city,
    categoryLabel: tour.categoryLabel,
    overviewText: tour.overviewText,
    description: tour.description || tour.metaDescription || tour.seoDescription,
    itineraryStops: tour.itinerary,
    highlights: tour.highlights,
    included: tour.included,
    durationText: tour.durationText,
  });
