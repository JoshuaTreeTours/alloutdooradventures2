import { slugify } from "../utils/slugify";

import type { Engine6CategorySlug, Engine6Tour } from "./types";

const ENGINE6_META_DESCRIPTION_CLAMP_AT = 155;
const ENGINE6_BLOCKED_META_PATTERNS = [
  /public transportation options are available nearby/i,
  /confirmation will be received/i,
  /not wheelchair accessible/i,
  /most travelers can participate/i,
  /near public transportation/i,
  /infants must sit on laps/i,
  /service animals allowed/i,
  /not recommended for travelers/i,
  /this experience requires good weather/i,
];

export const ENGINE6_CATEGORY_LABELS: Record<Engine6CategorySlug, string> = {
  "off-road-tour": "Jeep Tour",
  "hiking-tour": "Hiking Tour",
  "bike-tour": "Bike Tour",
  "boat-tour": "Boat Tour",
  "paddle-tour": "Paddle Tour",
  "wildlife-tour": "Wildlife Tour",
  "snorkeling-tour": "Snorkeling Tour",
  "food-and-drink-tour": "Food & Drink Tour",
  "air-tour": "Air Tour",
  "sightseeing-tour": "Sightseeing Tour",
  "adventure-tour": "Adventure Tour",
  adventure: "Adventure Tour",
  hiking: "Hiking Tour",
  sightseeing: "Sightseeing Tour",
  wildlife: "Wildlife Tour",
  water: "Boat Tour",
};

export const formatEngine6CategoryLabel = (
  value: Engine6CategorySlug | string | null
): string | null => {
  if (!value) {
    return null;
  }

  const knownLabel = ENGINE6_CATEGORY_LABELS[value as Engine6CategorySlug];
  if (knownLabel) {
    return knownLabel;
  }

  return value.replace(/-/g, " ").replace(/\b\w/g, char => char.toUpperCase());
};

const ENGINE6_GENERATED_DESCRIPTION_PREFIX_PATTERN =
  /^[A-Za-z]+(?:[ -][A-Za-z]+)*\s+(?:guided tour|Bike tour|Boat tour|Hiking tour|Paddle tour|Air tour|Airboat Tours|Water Sports|Cruises And Sailing|Attractions And Museums|Multi Day Tours):\s*/i;

export const stripEngine6GeneratedDescriptionPrefix = (value: string) =>
  value
    .replace(ENGINE6_GENERATED_DESCRIPTION_PREFIX_PATTERN, "")
    .replace(/^[-:|\s]+/, "")
    .trim();

export const hasEngine6GeneratedDescriptionPrefix = (value: string) =>
  ENGINE6_GENERATED_DESCRIPTION_PREFIX_PATTERN.test(value.trim());

export const cleanEngine6Description = (text: string): string => {
  if (!text) {
    return "";
  }

  const cleaned = text
    .replace(/\.\./g, ".")
    .replace(/Best tour.*?reviews\./gi, "")
    .replace(/Rated\s*\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?[^.]*\./gi, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .trim();

  return stripEngine6GeneratedDescriptionPrefix(cleaned);
};

export const clampEngine6MetaDescription = (
  text: string,
  maxLength = ENGINE6_META_DESCRIPTION_CLAMP_AT
) => {
  if (text.length <= maxLength) {
    return text;
  }

  const clipped = text.slice(0, maxLength).trim();
  const lastWordBoundary = clipped.lastIndexOf(" ");
  const safeClipped =
    lastWordBoundary > 100 ? clipped.slice(0, lastWordBoundary) : clipped;

  return `${safeClipped.trim()}...`;
};

export const buildMetaDescription = (input: string | undefined | null) => {
  if (!input) {
    return "";
  }

  const clean = cleanEngine6Description(
    input
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );

  if (clean.length <= ENGINE6_META_DESCRIPTION_CLAMP_AT) {
    return clean;
  }

  return clampEngine6MetaDescription(clean);
};

export const buildEngine6MetaDescription = (description: string) =>
  buildMetaDescription(description);

const ENGINE6_TITLE_STOP_WORDS = new Set([
  "tour",
  "tours",
  "experience",
  "experiences",
  "trip",
  "trips",
  "activity",
  "activities",
]);

const toTitleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word[0]?.toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const normalizeEngine6ReadableTitle = (rawTitle: string) => {
  const compact = rawTitle.replace(/[_|]+/g, " ").replace(/\s+/g, " ").trim();
  const withoutStitching = compact
    .replace(/(\b\w+\b)\s+\1\b/gi, "$1")
    .replace(/\b(in)\s+([a-z][a-z\s]+?)\s+\1\s+\2\b/gi, "in $2")
    .replace(/\bjail\s+house\b/gi, "jailhouse")
    .replace(/\bapp\s+guided\b/gi, "App-Guided")
    .replace(/\bself\s+guided\b/gi, "Self-Guided")
    .replace(/\s+/g, " ")
    .trim();

  const words = withoutStitching.split(" ");
  if (words.length <= 2) {
    return withoutStitching;
  }

  const tail = words[words.length - 1] ?? "";
  if (tail.length <= 4 && !ENGINE6_TITLE_STOP_WORDS.has(tail.toLowerCase())) {
    return words.slice(0, -1).join(" ");
  }

  return withoutStitching;
};

export const buildEngine6SeoTitle = ({
  title,
  city,
  state,
}: {
  title: string;
  city: string;
  state: string;
}) => {
  const normalizedTitle = normalizeEngine6ReadableTitle(title);
  const normalizedCity = toTitleCase(city.trim());
  const normalizedState = toTitleCase(state.trim());
  const locationLabel = [normalizedCity, normalizedState]
    .filter(Boolean)
    .join(", ");

  if (!locationLabel) {
    return normalizedTitle;
  }

  const titleIncludesCity = normalizedTitle
    .toLowerCase()
    .includes(normalizedCity.toLowerCase());

  if (titleIncludesCity) {
    return normalizedTitle;
  }

  return `${normalizedTitle} | ${normalizedCity}`;
};

const ENGINE6_EDITORIAL_META_OVERRIDES: Record<string, string> = {
  "447486P2":
    "Enjoy Santa Barbara from a sunset yacht cruise with coastal views, fresh ocean air, and a relaxed harborfront atmosphere.",
  "331438P1":
    "Soar above Santa Barbara on a parasailing flight from Stearns Wharf with licensed captains and ocean views.",
  "398496P5":
    "See the Las Vegas Sphere and Strip landmarks on a guided drive with live narration and city context.",
  "190492P3":
    "Visit Zion and Bryce Canyon from Las Vegas on a full-day guided tour with scenic viewpoints and national park highlights.",
  "414460P1":
    "Explore Central Park by pedicab with a licensed local guide, landmark stops, and more park coverage in less time.",
};

const ENGINE6_META_MAX_LENGTH = 155;
const ENGINE6_META_MIN_TARGET_LENGTH = 120;
const ENGINE6_META_BANNED_PATTERNS = [
  /\.\.\./,
  /\b[A-Z0-9]{2,}\d+[A-Z0-9]*\b/,
  /\bThis route\b/i,
  /\bwith Our\b/,
  /\b(cruise|tour)\b[^.!?]{0,40}\b\1\b/i,
];

const removeBlockedOperationalFiller = (value: string) => {
  let cleaned = value;
  for (const pattern of ENGINE6_BLOCKED_META_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }
  return cleaned
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/^[,.;:!?\s-]+/, "")
    .trim();
};

export const isEngine6OperationalFiller = (value: string) =>
  ENGINE6_BLOCKED_META_PATTERNS.some(pattern => pattern.test(value));

const sentenceCase = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
};

const normalizeEngine6MetaText = (value: string) =>
  cleanEngine6Description(
    value
      .replace(/<[^>]*>/g, " ")
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/\s+/g, " ")
      .trim()
  );

const splitDescriptionSentences = (value: string) =>
  value
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

const chooseEngine6EditorialVerb = ({
  categoryLabel,
  title,
  sourceDescription,
}: {
  categoryLabel?: string | null;
  title: string;
  sourceDescription: string;
}) => {
  const category = (categoryLabel ?? "").toLowerCase();
  const identity = `${title} ${category} ${sourceDescription}`.toLowerCase();

  if (/parasail|paraglid|helicopter|flight|fly|air\s*tour/.test(identity)) {
    return "Soar";
  }
  if (/boat|cruise|sail|yacht|catamaran|harbor|bay/.test(identity)) {
    return "Enjoy";
  }
  if (/kayak|canoe|paddle|sup|emerald cave/.test(identity)) {
    return "Paddle";
  }
  if (/pedicab|bike|cycling|e-bike|segway|shopping cart|limo/.test(identity)) {
    return "Explore";
  }
  if (
    /zion|bryce|national park|museum|admission|ticket|attraction/.test(identity)
  ) {
    return "Visit";
  }
  if (/sphere|strip|landmark|driving|city tour|sightseeing/.test(identity)) {
    return "See";
  }
  if (/hiking|hike|walking/.test(identity)) {
    return "Hike";
  }
  if (/kayak|canoe|paddle|sup/.test(identity)) {
    return "Paddle";
  }
  if (/food|wine|tasting|brewery|drink/.test(identity)) {
    return "Taste";
  }
  return "Explore";
};

const trimTrailingMetaFragments = (value: string) =>
  value
    .replace(
      /\b(?:and|or|with|for|from|through|across|around|near|plus|including|while|during|on|in|at|to|by|of|the|a|an)$/i,
      ""
    )
    .replace(/[\s,;:—-]+$/g, "")
    .trim();

const ensureCompleteMetaSentence = (value: string) => {
  const normalized = value
    .replace(/\.\.\./g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .trim();
  const withoutTerminal = trimTrailingMetaFragments(
    normalized.replace(/[.!?]+$/g, "")
  );
  return `${sentenceCase(withoutTerminal)}.`;
};

const clampEngine6EditorialMeta = (value: string) => {
  let sentence = ensureCompleteMetaSentence(value);
  if (sentence.length <= ENGINE6_META_MAX_LENGTH) {
    return sentence;
  }

  const clipped = sentence.slice(0, ENGINE6_META_MAX_LENGTH - 1).trim();
  const lastSpace = clipped.lastIndexOf(" ");
  sentence = ensureCompleteMetaSentence(
    lastSpace > 90 ? clipped.slice(0, lastSpace) : clipped
  );

  while (sentence.length > ENGINE6_META_MAX_LENGTH) {
    const body = sentence.replace(/[.!?]$/g, "");
    const last = body.lastIndexOf(" ");
    if (last < 60) break;
    sentence = ensureCompleteMetaSentence(body.slice(0, last));
  }

  return sentence;
};

const extractEngine6DestinationPhrase = ({
  title,
  city,
  sourceDescription,
}: {
  title: string;
  city: string;
  sourceDescription: string;
}) => {
  const normalizedTitle = normalizeEngine6ReadableTitle(title);
  const rawCity = city.trim();
  const normalizedCity = /[:|]|\btour\b|\bexperience\b/i.test(rawCity)
    ? ""
    : rawCity;
  const text = `${normalizedTitle}. ${sourceDescription}`;

  if (/zion/i.test(text) && /bryce/i.test(text)) {
    return "Zion and Bryce Canyon from Las Vegas";
  }
  if (/central park/i.test(text)) {
    return "Central Park";
  }
  if (/sphere/i.test(text) && /strip/i.test(text)) {
    return "the Las Vegas Sphere and Strip landmarks";
  }
  if (/sphere/i.test(text)) {
    return "the Las Vegas Sphere";
  }
  if (
    /santa barbara/i.test(text) &&
    /coast|parasail|stearns wharf/i.test(text)
  ) {
    return "above Santa Barbara";
  }
  if (/santa barbara/i.test(text)) {
    return "Santa Barbara";
  }

  const titleSubject =
    /\b(?:of|on|through|around|at|to|in|above)\s+(?:the\s+)?(.+)$/i
      .exec(normalizedTitle)?.[1]
      ?.replace(/^the\s+/i, "")
      .trim();
  if (
    titleSubject &&
    titleSubject.length <= 48 &&
    !/[:|]|\btours?\b|\bexperience\b/i.test(titleSubject)
  ) {
    return titleSubject;
  }

  return normalizedCity || normalizedTitle;
};

const chooseEngine6ExperienceType = ({
  title,
  categoryLabel,
  sourceDescription,
}: {
  title: string;
  categoryLabel?: string | null;
  sourceDescription: string;
}) => {
  const identity =
    `${title} ${categoryLabel ?? ""} ${sourceDescription}`.toLowerCase();
  if (/parasail/.test(identity)) return "parasailing flight";
  if (/shopping cart|limo/.test(identity)) return "guided ride";
  if (/pedicab/.test(identity)) return "pedicab ride";
  if (/yacht/.test(identity)) return "yacht cruise";
  if (/cruise|boat|sail|catamaran/.test(identity)) return "boat cruise";
  if (/driving|drive/.test(identity)) return "guided drive";
  if (/zion|bryce|day trip|full-day/.test(identity))
    return "full-day guided tour";
  if (/bike|cycling|e-bike/.test(identity)) return "guided bike ride";
  if (/hike|hiking|walking/.test(identity)) return "guided hike";
  if (/kayak|canoe|paddle|emerald cave/.test(identity)) return "guided paddle";
  if (/food|wine|tasting/.test(identity)) return "tasting experience";
  return (categoryLabel ?? "guided experience").toLowerCase();
};

const chooseEngine6Differentiator = ({
  title,
  sourceDescription,
}: {
  title: string;
  sourceDescription: string;
}) => {
  const identity = `${title} ${sourceDescription}`.toLowerCase();
  if (/parasail|coast guard|licensed captain|stearns wharf/.test(identity)) {
    return "licensed captains and ocean views";
  }
  if (/yacht|sunset|happy hour|harbor|coastal/.test(identity)) {
    return "coastal views, fresh ocean air, and a relaxed harborfront atmosphere";
  }
  if (/red rock|emerald cave|kayak/.test(identity)) {
    return "scenic views, guide support, and easy logistics";
  }
  if (/sphere|strip|las vegas/.test(identity)) {
    return "live narration, local context, and traveler-friendly logistics";
  }
  if (/zion|bryce|national park/.test(identity)) {
    return "scenic viewpoints and national park highlights";
  }
  if (/central park|pedicab/.test(identity)) {
    return "a licensed local guide, landmark stops, and efficient park coverage";
  }
  if (/golden gate|bridge|bay|skyline/.test(identity)) {
    return "scenic views, guide support, and easy logistics";
  }
  return "local context, clear logistics, and a traveler-friendly pace";
};

const buildEngine6EditorialTemplate = ({
  title,
  city,
  categoryLabel,
  sourceDescription,
}: {
  title: string;
  city: string;
  categoryLabel?: string | null;
  sourceDescription: string;
}) => {
  const verb = chooseEngine6EditorialVerb({
    categoryLabel,
    title,
    sourceDescription,
  });
  const destination = extractEngine6DestinationPhrase({
    title,
    city,
    sourceDescription,
  });
  const experienceType = chooseEngine6ExperienceType({
    title,
    categoryLabel,
    sourceDescription,
  });
  const differentiator = chooseEngine6Differentiator({
    title,
    sourceDescription,
  });

  if (verb === "Soar") {
    return `${verb} ${destination} on a ${experienceType} with ${differentiator}`;
  }

  const connector = /^(Visit|See|Explore|Hike|Paddle|Taste)$/i.test(verb)
    ? "on"
    : "from";

  return `${verb} ${destination} ${connector} a ${experienceType} with ${differentiator}`;
};

const expandEngine6ShortMeta = (value: string) => {
  let sentence = ensureCompleteMetaSentence(value);
  if (sentence.length >= ENGINE6_META_MIN_TARGET_LENGTH) {
    return sentence;
  }

  const additions = [
    "with clear logistics and a traveler-friendly pace",
    "with local context and easy planning",
    "with scenic highlights and guide support",
  ];

  for (const addition of additions) {
    const expanded = ensureCompleteMetaSentence(
      `${sentence.replace(/[.!?]$/g, "")}, ${addition}`
    );
    if (expanded.length <= ENGINE6_META_MAX_LENGTH) {
      sentence = expanded;
      if (sentence.length >= ENGINE6_META_MIN_TARGET_LENGTH) break;
    }
  }

  return sentence;
};

export const buildEngine6OptimizedDescription = ({
  productCode,
  title,
  city,
  categoryLabel,
  sourceDescription,
}: {
  productCode?: string | null;
  title: string;
  city: string;
  categoryLabel?: string | null;
  sourceDescription: string;
}) => {
  const override = productCode
    ? ENGINE6_EDITORIAL_META_OVERRIDES[productCode]
    : undefined;
  if (override) {
    return clampEngine6EditorialMeta(override);
  }

  const cleanedSource = removeBlockedOperationalFiller(
    normalizeEngine6MetaText(sourceDescription)
  );
  const generated = buildEngine6EditorialTemplate({
    title,
    city,
    categoryLabel,
    sourceDescription: cleanedSource,
  });
  return expandEngine6ShortMeta(clampEngine6EditorialMeta(generated));
};

export const buildEngine6SeoDescription = ({
  productCode,
  title,
  city,
  categoryLabel,
  sourceDescription,
}: {
  productCode?: string | null;
  title: string;
  city: string;
  categoryLabel?: string | null;
  sourceDescription: string;
}) =>
  buildEngine6OptimizedDescription({
    productCode,
    title,
    city,
    categoryLabel,
    sourceDescription,
  });

const ENGINE6_LEGACY_OPTIMIZED_DESCRIPTION_MIN = 140;
const ENGINE6_LEGACY_OPTIMIZED_DESCRIPTION_MAX = 155;
const ENGINE6_LEGACY_ACTIVE_DESCRIPTION_START_PATTERN =
  /^(Explore|Ride|Paddle|Sail|Discover|Visit|Fly|See|Cruise|Hike|Kayak|Bike|Drive|Taste|Tour|Walk|Glide)\b/i;
const ENGINE6_LEGACY_GENERIC_MARKETING_LEAD_PATTERNS = [
  /^this\s+(?:private\s+)?(?:tour|experience|outing|activity)\s+(?:offers|provides|gives|is)\s+(?:an?\s+)?(?:unparalleled\s+opportunity\s+to\s+)?/i,
  /^this\s+[^.!?]{0,90}?\s+private\s+tour,?\s+(?:offers\s+)?(?:an?\s+)?(?:unparalleled\s+opportunity\s+(?:to|for\s+travelers\s+to)\s+)?/i,
  /^unparalleled\s+opportunity\s+(?:to|for\s+travelers\s+to)\s+/i,
  /^the\s+private\s+tour\s+"?[^"]+"?\s+combines\s+/i,
  /^join\s+us\s+for\s+(?:an?\s+)?/i,
  /^come\s+discover\s+/i,
  /^we\s+created\s+[^.!?]*[.!?]\s*/i,
  /^your\s+private\s+[^.!?]*?\s+will\s+showcase\s+/i,
];

const stripLegacyGenericMarketingLead = (value: string) => {
  let cleaned = value.trim();
  for (const pattern of ENGINE6_LEGACY_GENERIC_MARKETING_LEAD_PATTERNS) {
    cleaned = cleaned.replace(pattern, "").trim();
  }
  return sentenceCase(cleaned);
};

const chooseLegacyEngine6ExperienceVerb = ({
  categoryLabel,
  title,
  sourceDescription,
}: {
  categoryLabel?: string | null;
  title: string;
  sourceDescription: string;
}) => {
  const category = (categoryLabel ?? "").toLowerCase();
  const titleIdentity = `${title} ${category}`.toLowerCase();
  const identity = `${title} ${sourceDescription}`.toLowerCase();
  if (
    /bike|cycling|e-bike/.test(titleIdentity) ||
    /bike|cycling/.test(category)
  )
    return "Ride";
  if (
    /paddle|kayak|canoe|sup/.test(titleIdentity) ||
    /paddle|kayak|canoe|sup/.test(category)
  )
    return "Paddle";
  if (/\b(?:helicopter|paraglid|parasail(?:ing)?|flight|fly)\b/.test(identity))
    return "Fly";
  if (
    /\b(?:hiking|hike|walking)\b/.test(titleIdentity) ||
    /hiking|walk/.test(category)
  )
    return "Hike";
  if (
    /museum|admission|ticket|attraction|theme park|universal studios/.test(
      titleIdentity
    ) ||
    /museum|attraction/.test(category)
  )
    return "Visit";
  if (
    /sightseeing|celebrity|hollywood|beverly|landmark|city tour|private.*tour/.test(
      titleIdentity
    )
  )
    return "Explore";
  if (
    /boat|cruise|sail|yacht|catamaran|harbor/.test(titleIdentity) ||
    (/boat|water|cruise|sailing/.test(category) &&
      /boat|cruise|sail|yacht|catamaran|harbor|bay|water/.test(identity))
  )
    return "Sail";
  if (
    /food|drink|wine|tasting|chocolate/.test(identity) ||
    /food|drink|wine/.test(category)
  )
    return "Taste";
  return "Explore";
};

const ENGINE6_LEGACY_ATTRACTION_HINT_PATTERN =
  /\b(?:The\s+)?[A-Z][A-Za-z'’]+(?:\s+[A-Z][A-Za-z'’]+){0,4}\s+(?:Sign|Bridge|Bay|Harbor|Lake|Park|Canyon|Falls|Waterfalls|Glacier|Island|Pier|Wharf|Beach|Valley|Mountain|Mount|Museum|Studios?|Observatory|River)\b/;

const extractLegacyEngine6TitleSubject = (title: string, city: string) => {
  const readableTitle = normalizeEngine6ReadableTitle(title)
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+\d{4,}$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  const subject = /\b(?:of|on|through|around|at|to|in)\s+(?:the\s+)?(.+)$/i
    .exec(readableTitle)?.[1]
    ?.replace(/^the\s+/i, "")
    .trim();

  if (
    !subject ||
    subject.length < 4 ||
    subject.length > 70 ||
    subject.toLowerCase() === city.toLowerCase()
  )
    return null;
  return subject;
};

const extractLegacyEngine6PriorityAttraction = (value: string) => {
  const match = ENGINE6_LEGACY_ATTRACTION_HINT_PATTERN.exec(value);
  return match?.[0]?.replace(/^Iconic\s+/i, "").trim() ?? null;
};

const buildLegacyEngine6ExperienceLead = ({
  title,
  city,
  categoryLabel,
  sourceDescription,
}: {
  title: string;
  city: string;
  categoryLabel?: string | null;
  sourceDescription: string;
}) => {
  const verb = chooseLegacyEngine6ExperienceVerb({
    categoryLabel,
    title,
    sourceDescription,
  });
  const readableTitle = normalizeEngine6ReadableTitle(title)
    .replace(/\s+\d{4,}$/i, "")
    .trim();
  const normalizedCity = city.trim();
  const subject = extractLegacyEngine6TitleSubject(
    readableTitle,
    normalizedCity
  );

  if (subject && /^(Ride|Paddle|Sail|Fly|Hike)$/i.test(verb)) {
    const subjectIncludesCity =
      normalizedCity.length > 0 &&
      subject.toLowerCase().includes(normalizedCity.toLowerCase());
    return `${verb} ${subject}${normalizedCity && !subjectIncludesCity ? ` in ${normalizedCity}` : ""}`
      .replace(/\s+/g, " ")
      .trim();
  }

  const titleIncludesCity =
    normalizedCity.length > 0 &&
    readableTitle.toLowerCase().includes(normalizedCity.toLowerCase());
  const destination =
    titleIncludesCity || !normalizedCity
      ? readableTitle
      : `${readableTitle} in ${normalizedCity}`;
  return `${verb} ${destination}`.replace(/\s+/g, " ").trim();
};

const trimLegacyDescriptionToWordBoundary = (
  value: string,
  maxLength: number
) => {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  const clipped = normalized.slice(0, maxLength).trim();
  const lastSpace = clipped.lastIndexOf(" ");
  const safeClipped = lastSpace > 100 ? clipped.slice(0, lastSpace) : clipped;
  let cleaned = safeClipped.replace(/[,:;\s-]+$/, "").trim();
  cleaned = cleaned
    .replace(
      /\b(?:but\s+for\s+those|from\s+the|for\s+those|from|with|and|for|of|in|on|at|to|while|that|this|those|the|a|an)$/i,
      ""
    )
    .replace(/[,:;\s-]+$/, "")
    .trim();
  return cleaned;
};

export const buildEngine6LegacySeoDescription = ({
  title,
  city,
  categoryLabel,
  sourceDescription,
}: {
  title: string;
  city: string;
  categoryLabel?: string | null;
  sourceDescription: string;
}) => {
  const cleanedSource = stripLegacyGenericMarketingLead(
    stripEngine6GeneratedDescriptionPrefix(
      removeBlockedOperationalFiller(
        cleanEngine6Description(
          sourceDescription
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
        )
      )
    )
  );
  const sourceStartsActively =
    ENGINE6_LEGACY_ACTIVE_DESCRIPTION_START_PATTERN.test(cleanedSource);
  const priorityAttraction =
    extractLegacyEngine6PriorityAttraction(cleanedSource);
  const baseLead = buildLegacyEngine6ExperienceLead({
    title,
    city,
    categoryLabel,
    sourceDescription: cleanedSource,
  });
  const lead =
    priorityAttraction &&
    !baseLead.toLowerCase().includes(priorityAttraction.toLowerCase()) &&
    baseLead.length + priorityAttraction.length < 105
      ? `${baseLead} with ${priorityAttraction}`
      : baseLead;
  const sourceSentences = splitDescriptionSentences(cleanedSource);
  const primarySource = sourceSentences[0] ?? cleanedSource;
  const shouldUseSourceAsLead =
    sourceStartsActively &&
    (primarySource.toLowerCase().includes(city.toLowerCase()) ||
      primarySource.toLowerCase().includes(title.toLowerCase()) ||
      primarySource.length >= 80);
  const sourceRemainder = sourceSentences.filter(sentence => {
    const normalizedSentence = sentence.toLowerCase();
    const normalizedLead = lead.toLowerCase();
    return !(
      normalizedSentence.includes(normalizedLead) ||
      normalizedLead.includes(normalizedSentence.replace(/\.$/, ""))
    );
  });
  const parts = shouldUseSourceAsLead
    ? sourceSentences
    : [lead, ...sourceRemainder];
  let composed = parts
    .filter(Boolean)
    .join(". ")
    .replace(/\s+/g, " ")
    .replace(/\.\s*\./g, ".")
    .trim();
  if (composed && !/[.!?]$/.test(composed)) composed = `${composed}.`;
  if (composed.length < ENGINE6_LEGACY_OPTIMIZED_DESCRIPTION_MIN) {
    const category = (categoryLabel ?? "guided experience").toLowerCase();
    const guidePhrase = category.includes("guided")
      ? "local context"
      : "guide support, local context";
    composed =
      `${composed} Expect ${guidePhrase}, clear timing, and traveler-focused logistics for a smooth day.`
        .replace(/\s+/g, " ")
        .trim();
  }
  const trimmed = trimLegacyDescriptionToWordBoundary(
    composed,
    ENGINE6_LEGACY_OPTIMIZED_DESCRIPTION_MAX
  );
  return stripEngine6GeneratedDescriptionPrefix(trimmed)
    .replace(/[.!?,;:]+$/, "")
    .trim();
};

export const buildEngine6CanonicalPath = ({
  state,
  city,
  title,
}: {
  state: string;
  city: string;
  title: string;
}) =>
  `/destinations/${slugify(state)}/${slugify(city)}/tours/${slugify(title)}`;

export const buildEngine6Seo = (tour: Engine6Tour) => ({
  title: tour.seoTitle,
  description: tour.metaDescription,
  url: tour.canonicalPath,
  image: tour.resolvedImageUrl ?? "",
});
