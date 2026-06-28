import { extractEngine6OverviewNamedLocations } from "./overviewGovernance";
import {
  cleanEngine6Description,
  stripEngine6GeneratedDescriptionPrefix,
} from "./seo";

export const MERCHANT_DESCRIPTION_FORBIDDEN_PATTERNS = [
  /\ba food-focused guided outing\b/i,
  /\ba water-based guided outing\b/i,
  /\ba guided cycling outing\b/i,
  /\ba city sightseeing outing\b/i,
  /\ba park-focused guided outing\b/i,
  /\ba guided destination outing\b/i,
  /\ban aerial sightseeing outing\b/i,
  /\ban off-road guided outing\b/i,
  /\ba guided hiking outing\b/i,
  /\bthe route emphasizes\b/i,
  /\bthe experience emphasizes\b/i,
  /\bscheduled stops include\b/i,
  /\blandmarks referenced\b/i,
  /\btravel is organized as\b/i,
  /\bcentered on\b.*\bdestination landmarks\b/i,
  /\bsurrounding destination landmarks\b/i,
  /\bthe route combines\b/i,
  /\bdestination interpretation throughout the route\b/i,
  /\bexpect a route shaped around\b/i,
  /\bthe format is designed to read as destination guidance\b/i,
  /\bcity landmarks, neighborhood transitions\b/i,
  /\btrip is fully private with travelers guests only\b/i,
  /\bthe outing typically lasts\b/i,
  /\bthe route includes\b/i,
  /\bremains the reviewed focus for this itinerary row\b/i,
  /\bkeeping the description aligned to the displayed stop\b/i,
] as const;

export const MERCHANT_DESCRIPTION_MIN_WORDS = 100;
export const MERCHANT_DESCRIPTION_MAX_WORDS = 150;
export const MERCHANT_DESCRIPTION_EXPANDED_MAX_WORDS = 175;

const splitOverviewSentences = (value: string) =>
  value
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

const countWords = (value: string) =>
  value.trim().split(/\s+/).filter(Boolean).length;

const normalizeMerchantSentence = (value: string) => {
  const cleaned = value
    .replace(/\s+/g, " ")
    .replace(/\.\.\.+/g, ".")
    .replace(/\s+([,.;!?])/g, "$1")
    .trim();

  if (!cleaned) {
    return "";
  }

  const withoutDangling = cleaned.replace(/[,:;\s-]+$/g, "").trim();
  return /[.!?]$/.test(withoutDangling)
    ? withoutDangling
    : `${withoutDangling}.`;
};

export const isMerchantDescriptionTemplateSentence = (sentence: string) =>
  MERCHANT_DESCRIPTION_FORBIDDEN_PATTERNS.some(pattern => pattern.test(sentence));

const formatMerchantLocationList = (locations: string[]) => {
  const cleaned = locations
    .map(location => location.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (cleaned.length === 0) {
    return "";
  }
  if (cleaned.length === 1) {
    return cleaned[0];
  }
  if (cleaned.length === 2) {
    return `${cleaned[0]} and ${cleaned[1]}`;
  }

  return `${cleaned.slice(0, -1).join(", ")}, and ${cleaned[cleaned.length - 1]}`;
};

const normalizeExtractedLocation = (location: string) =>
  location
    .replace(/^and\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();

const dedupeLocations = (locations: string[]) => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const location of locations) {
    const normalized = normalizeExtractedLocation(location);
    if (!normalized) {
      continue;
    }

    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(normalized);
  }

  return result.sort((left, right) => left.localeCompare(right));
};

const filterSubsumedLocations = (locations: string[]) =>
  locations.filter((location, index) => {
    const normalized = location.toLowerCase();
    return !locations.some((other, otherIndex) => {
      if (index === otherIndex) {
        return false;
      }

      const otherNormalized = other.toLowerCase();
      return (
        normalized.includes(otherNormalized) &&
        normalized.length > otherNormalized.length
      );
    });
  });

const isMerchantDescriptionTemplateOverview = (overviewText: string) =>
  MERCHANT_DESCRIPTION_FORBIDDEN_PATTERNS.some(pattern => pattern.test(overviewText));

const extractTemplateOverviewLandmarks = (overviewText: string) => {
  const landmarkSentences = [
    /centered on ([^.]+?)(?:\s+and surrounding destination landmarks|\.\s|$)/i,
    /The route emphasizes ([^.]+)\./i,
    /Scheduled stops include ([^.]+)\./i,
    /Landmarks referenced in the route include ([^.]+)\./i,
  ];

  const extracted: string[] = [];

  for (const pattern of landmarkSentences) {
    const match = pattern.exec(overviewText);
    if (!match?.[1]) {
      continue;
    }

    extracted.push(
      ...match[1]
        .split(/\s*,\s*|\s+and\s+/i)
        .map(item => normalizeExtractedLocation(item))
        .filter(item => item.length >= 3)
    );
  }

  return dedupeLocations(extracted);
};

const inferMerchantActivityPhrase = ({
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
    return "wine-and-food experience";
  }
  if (/surf/.test(identity)) {
    return "surf lesson";
  }
  if (/kayak|paddle|parasail|sail|yacht|boat|cruise|harbor|airboat/.test(identity)) {
    return "on-the-water experience";
  }
  if (/bike|e-bike|cycling|segway|trolley|pedicab/.test(identity)) {
    return "guided ride";
  }
  if (/helicopter|flight|air tour|paraglid/.test(identity)) {
    return "aerial sightseeing experience";
  }
  if (/hike|hiking|scrambl|climb|trail/.test(identity)) {
    return "guided outdoor adventure";
  }
  if (/jeep|4x4|off-road|humvee/.test(identity)) {
    return "off-road adventure";
  }
  if (/stargaz|astronomy|night sky/.test(identity)) {
    return "stargazing experience";
  }
  if (/national park|state park|wildlife|whale|desert|canyon/.test(identity)) {
    return "scenic guided outing";
  }
  if (/city|sightseeing|landmark|neighborhood|downtown|bus tour/.test(identity)) {
    return "city sightseeing tour";
  }
  if (categoryLabel?.trim()) {
    return `${categoryLabel.trim().toLowerCase()} experience`;
  }

  return "guided tour";
};

const buildMerchantDescriptionFromExtractedLandmarks = ({
  title,
  city,
  state,
  categoryLabel,
  overviewText,
}: {
  title: string;
  city: string;
  state: string;
  categoryLabel?: string | null;
  overviewText: string;
}) => {
  const locationLabel = `${city}, ${state}`.replace(/\s+/g, " ").trim();
  const activity = inferMerchantActivityPhrase({
    title,
    categoryLabel,
    overviewText,
  });
  const landmarks = filterSubsumedLocations(
    dedupeLocations(
      isMerchantDescriptionTemplateOverview(overviewText)
        ? extractTemplateOverviewLandmarks(overviewText)
        : extractEngine6OverviewNamedLocations({
            sourceOverview: overviewText,
            highlights: [],
            itinerary: [],
          })
    ).filter(location => {
      const normalized = location.toLowerCase();
      return (
        normalized.length >= 4 &&
        !normalized.includes("guided outing") &&
        !normalized.includes("destination landmarks") &&
        !title.toLowerCase().includes(normalized)
      );
    })
  );

  const sentences = [
    normalizeMerchantSentence(
      `${title} is a ${activity} in ${locationLabel}.`
    ),
  ];

  if (landmarks.length > 0) {
    sentences.push(
      normalizeMerchantSentence(
        `Travelers explore ${formatMerchantLocationList(landmarks.slice(0, 5))} with guide-led context along the route.`
      )
    );
  }

  if (/private|your guests only|fully private/i.test(overviewText)) {
    sentences.push(
      normalizeMerchantSentence(
        "The outing is reserved for your group with a private format."
      )
    );
  }

  return sentences.join(" ").trim();
};

const trimToWordBudget = (
  sentences: string[],
  maxWords = MERCHANT_DESCRIPTION_MAX_WORDS
) => {
  const selected: string[] = [];

  for (const sentence of sentences) {
    const candidate = [...selected, sentence].join(" ");
    if (countWords(candidate) > maxWords && selected.length > 0) {
      break;
    }
    selected.push(sentence);
    if (countWords(candidate) >= MERCHANT_DESCRIPTION_MIN_WORDS) {
      break;
    }
  }

  return selected.join(" ").trim();
};

export const buildMerchantDescriptionFromOverview = ({
  title,
  city,
  state,
  categoryLabel,
  overviewText,
}: {
  title: string;
  city: string;
  state: string;
  categoryLabel?: string | null;
  overviewText?: string | null;
}) => {
  const normalizedOverview = stripEngine6GeneratedDescriptionPrefix(
    cleanEngine6Description(overviewText ?? "")
  ).trim();

  if (!normalizedOverview) {
    const locationLabel = city.trim();
    return normalizeMerchantSentence(
      `${title}${locationLabel ? ` in ${locationLabel}` : ""} is a guided experience with details aligned to the product page.`
    );
  }

  const editorialSentences = splitOverviewSentences(normalizedOverview).filter(
    sentence => !isMerchantDescriptionTemplateSentence(sentence)
  );

  const usableSentences = editorialSentences
    .map(normalizeMerchantSentence)
    .filter(Boolean);

  if (usableSentences.length > 0) {
    const composed = trimToWordBudget(
      usableSentences,
      countWords(usableSentences.join(" ")) > MERCHANT_DESCRIPTION_EXPANDED_MAX_WORDS
        ? MERCHANT_DESCRIPTION_MAX_WORDS
        : MERCHANT_DESCRIPTION_EXPANDED_MAX_WORDS
    );

    if (countWords(composed) >= MERCHANT_DESCRIPTION_MIN_WORDS) {
      return composed;
    }

    if (countWords(usableSentences.join(" ")) >= 40) {
      return usableSentences.join(" ").trim();
    }
  }

  const recomposed = buildMerchantDescriptionFromExtractedLandmarks({
    title,
    city,
    state,
    categoryLabel,
    overviewText: normalizedOverview,
  });

  if (countWords(recomposed) >= 40) {
    return recomposed;
  }

  return usableSentences.join(" ").trim() || recomposed;
};
