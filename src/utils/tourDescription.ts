const normalizeText = (text: string) => text.replace(/\s+/g, " ").trim();

const clampDescription = (text: string, maxLength = 300) => {
  if (text.length <= maxLength) {
    return text;
  }

  const trimmed = text.slice(0, maxLength - 1);
  const lastSpace = trimmed.lastIndexOf(" ");
  const safeTrim = lastSpace > 180 ? trimmed.slice(0, lastSpace) : trimmed;

  return `${safeTrim.trim()}…`;
};

const titleCaseSlug = (value?: string) => {
  if (!value) {
    return "";
  }

  return value
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const TOKENIZED_SLUG_PATTERN = /\b[a-z0-9]{2,}(?:-[a-z0-9]{2,}){4,}\b/gi;

const VARIANT_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bpick\s*[- ]?up\b/i, label: "Pick-up" },
  { pattern: /\bdrop\s*[- ]?off\b/i, label: "Drop-off" },
  { pattern: /\bone\s*[- ]?way\b/i, label: "One-way" },
];

const getPalmSpringsSpecificDetails = (title: string) => {
  const lower = title.toLowerCase();

  if (lower.includes("jeep") || lower.includes("hummer")) {
    return {
      duration: "approximately 3 hours",
      detail:
        "travel through desert canyons and San Andreas Fault formations in a 4×4 vehicle",
    };
  }

  if (lower.includes("bike")) {
    return {
      duration: "approximately 2–3 hours",
      detail:
        "guided ride through Palm Springs neighborhoods and scenic desert routes",
    };
  }

  return {
    duration: "a half-day experience",
    detail: "guided exploration of desert landscapes and local highlights",
  };
};
type DescriptionInputs = {
  baseDescription: string;
  tourName: string;
  cityName?: string;
  stateName?: string;
  citySlug?: string;
  stateSlug?: string;
  tourId: string | number;
  tourSlug?: string;
  variantLabel?: string;
  isDuplicate?: boolean;
  diagnosticsLabel?: string;
};

export type TourDescriptionBuildResult = {
  description: string;
  didDedupe: boolean;
  slugGuardTriggered: boolean;
};

const stripTokenizedFragments = (value: string, tourSlug?: string) => {
  let cleaned = value.replace(TOKENIZED_SLUG_PATTERN, " ");
  if (tourSlug) {
    const escaped = tourSlug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleaned = cleaned.replace(new RegExp(escaped, "gi"), " ");
  }
  return normalizeText(cleaned);
};

export const looksTokenizedSlug = (value: string, tourSlug?: string) => {
  const normalized = normalizeText(value.toLowerCase());
  TOKENIZED_SLUG_PATTERN.lastIndex = 0;
  if (TOKENIZED_SLUG_PATTERN.test(normalized)) {
    return true;
  }

  if (!tourSlug) {
    return false;
  }

  return normalized.includes(tourSlug.toLowerCase());
};

export const extractVariantLabel = (input?: string) => {
  if (!input) {
    return undefined;
  }

  for (const { pattern, label } of VARIANT_PATTERNS) {
    if (pattern.test(input)) {
      return label;
    }
  }

  return undefined;
};

export const normalizeDescriptionForDedupe = (value?: string) =>
  normalizeText(value ?? "").toLowerCase();

export const shouldLogTourDescriptionDiagnostics = () =>
  process.env.NODE_ENV === "development" ||
  process.env.TOUR_DESCRIPTION_DEBUG === "1";

export const buildTourDescriptionResult = ({
  baseDescription,
  tourName,
  cityName,
  stateName,
  citySlug,
  stateSlug,
  tourId,
  tourSlug,
  variantLabel,
  isDuplicate = false,
  diagnosticsLabel,
}: DescriptionInputs): TourDescriptionBuildResult => {
  const cleanBase = stripTokenizedFragments(baseDescription, tourSlug);
  const cleanName = normalizeText(tourName || "Tour");
  const city = normalizeText(cityName || titleCaseSlug(citySlug));
  const state = normalizeText(stateName || titleCaseSlug(stateSlug));
  const location = city && state ? `${city}, ${state}` : city || state;
  const normalizedVariant = VARIANT_PATTERNS.find(
    ({ label }) => label === variantLabel
  )?.label;

  let description = cleanBase;
  if (isDuplicate) {
    const suffixParts = [
      `${cleanName}${location ? ` (${location})` : ""}`,
      `ID ${tourId}`,
    ];
    if (normalizedVariant) {
      suffixParts.push(normalizedVariant);
    }
    description = `${cleanBase} — ${suffixParts.join(" · ")}`;
  }

  description = normalizeText(description);
  let slugGuardTriggered = false;
  if (looksTokenizedSlug(description, tourSlug)) {
    slugGuardTriggered = true;
    const safeBase = stripTokenizedFragments(cleanBase, tourSlug);
    description = normalizeText(
      `${safeBase} ${cleanName}${location ? ` (${location})` : ""} · ID ${tourId}`
    );
  }

  const isPalmSpringsTour =
    citySlug === "palm-springs" ||
    location.toLowerCase().includes("palm springs");

  if (isPalmSpringsTour) {
    const { duration, detail } = getPalmSpringsSpecificDetails(cleanName);
    description = `${description} This tour lasts ${duration} and includes ${detail}.`;
  }

  description = clampDescription(description, 300);

  const didDedupe = isDuplicate;
  if (
    (didDedupe || slugGuardTriggered) &&
    shouldLogTourDescriptionDiagnostics()
  ) {
    console.warn(
      `[tour-description] ${diagnosticsLabel ?? cleanName}: dedupe=${didDedupe} slugGuard=${slugGuardTriggered}`
    );
  }

  return {
    description,
    didDedupe,
    slugGuardTriggered,
  };
};

export const buildTourDescription = (inputs: DescriptionInputs) =>
  buildTourDescriptionResult(inputs).description;

export const extractTourBaseDescription = (tour: {
  shortDescription?: string;
  badges?: { tagline?: string };
  longDescription?: string;
}) =>
  normalizeText(
    tour.shortDescription ?? tour.badges?.tagline ?? tour.longDescription ?? ""
  );
