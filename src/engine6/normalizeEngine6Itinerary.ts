import {
  isEngine6GenericItineraryDescription,
  normalizeEngine6ItineraryComparisonText,
} from "./itineraryGovernance";
import { stripEngine6AdmissionArtifacts } from "./seo";
import type { Engine6ItineraryItem } from "./types";

export type Engine6ItinerarySourceItem = Pick<
  Engine6ItineraryItem,
  "title" | "stopType" | "description" | "duration" | "admissionNote" | "sectionLabel"
>;

export type Engine6ItineraryBuildOptions = {
  getDescriptionOverride?: (
    productCode: string,
    index: number
  ) => string | undefined;
  itemOverrides?: Engine6ItinerarySourceItem[] | null;
};

const normalizeComparableText = (value: string) =>
  normalizeEngine6ItineraryComparisonText(value);

const titleWordTokens = (title: string) =>
  normalizeComparableText(title)
    .split(" ")
    .filter(token => token.length > 2);

const descriptionWordTokens = (description: string) =>
  normalizeComparableText(description)
    .split(" ")
    .filter(token => token.length > 2);

export const engine6DescriptionTitleTokenOverlapRatio = (
  title: string,
  description: string
) => {
  const descTokens = descriptionWordTokens(description);
  if (descTokens.length === 0) {
    return 0;
  }

  const titleTokenSet = new Set(titleWordTokens(title));
  if (titleTokenSet.size === 0) {
    return 0;
  }

  const overlappingTokenCount = descTokens.filter(token =>
    titleTokenSet.has(token)
  ).length;

  return overlappingTokenCount / descTokens.length;
};

export const engine6DescriptionTitleTokenOverlapExceedsThreshold = (
  title: string,
  description: string,
  threshold = 0.7
) => engine6DescriptionTitleTokenOverlapRatio(title, description) > threshold;

const WRAPPER_ONLY_DESCRIPTION_TOKENS = new Set([
  "includes",
  "about",
  "passes",
  "route",
  "pass",
  "timed",
  "stop",
  "itinerary",
  "without",
  "stopping",
  "near",
  "with",
  "for",
  "time",
]);

export const isEngine6TitleDescriptionMismatch = (
  title: string,
  description: string
) => {
  const normalizedTitle = normalizeComparableText(title);
  const normalizedDescription = normalizeComparableText(description);
  if (!normalizedTitle || !normalizedDescription) {
    return false;
  }

  if (
    normalizedTitle === normalizedDescription ||
    normalizedDescription.startsWith(`${normalizedTitle} `) ||
    normalizedDescription.includes(` ${normalizedTitle} `)
  ) {
    return true;
  }

  return engine6DescriptionTitleTokenOverlapExceedsThreshold(title, description);
};

export const descriptionAddsInformationBeyondTitle = (
  title: string,
  description: string
) => {
  const normalizedDescription = normalizeComparableText(description);
  if (!normalizedDescription) {
    return false;
  }

  if (engine6DescriptionTitleTokenOverlapExceedsThreshold(title, description)) {
    return false;
  }

  const titleTokens = titleWordTokens(title);
  if (titleTokens.length === 0) {
    return normalizedDescription.split(" ").filter(token => token.length > 2)
      .length >= 2;
  }

  const remainingTokens = normalizedDescription
    .split(" ")
    .filter(token => token.length > 2 && !titleTokens.includes(token))
    .filter(token => !WRAPPER_ONLY_DESCRIPTION_TOKENS.has(token));

  return remainingTokens.length >= 2;
};

const ROUTE_PLACEHOLDER_PATTERNS = [
  /^Visit\s+.+/i,
  /^Pass\s+.+\s+as part of the route\.?$/i,
  /^Scheduled stop on the tour route\.?$/i,
  /^Scenic pass-by along the tour route\.?$/i,
  /^Scheduled stop of about\b/i,
  /^Scheduled stop featuring\b/i,
  /^Route pass-by with\b/i,
  /\bover about Pass by\b/i,
  /\bscenic pass-by segment\b/i,
  /\bhistoric context\b/i,
  /\bguided route\b/i,
  /^This is a (?:scheduled stop|scenic pass-by)\b/i,
] as const;

const GENERIC_FALLBACK_CONTEXT_PATTERNS = [
  /^scenic views$/i,
  /^historic context$/i,
  /^wine-country context$/i,
  /^trail time$/i,
  /^wildlife viewing$/i,
  /^former prison site context$/i,
  /^app-guided format$/i,
  /^ferry access$/i,
  /\bcontext$/i,
  /\bguided route\b/i,
  /\bscenic pass-by segment\b/i,
] as const;

const isGenericFallbackContext = (context: string) => {
  const trimmed = context.trim();
  if (!trimmed) {
    return true;
  }
  return GENERIC_FALLBACK_CONTEXT_PATTERNS.some(pattern => pattern.test(trimmed));
};

export const isEngine6LowQualityItineraryDescription = (
  title: string,
  description: string
) => {
  const trimmed = description.trim();
  if (!trimmed) {
    return true;
  }

  if (ROUTE_PLACEHOLDER_PATTERNS.some(pattern => pattern.test(trimmed))) {
    return true;
  }

  if (isEngine6GenericItineraryDescription(trimmed)) {
    return true;
  }

  if (isEngine6TitleDescriptionMismatch(title, trimmed)) {
    return true;
  }

  if (!descriptionAddsInformationBeyondTitle(title, trimmed)) {
    return true;
  }

  return false;
};

const enforceSingleSentence = (value: string) => {
  const compact = value
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/,+/g, ",")
    .replace(/[;:]/g, ",")
    .trim();
  const firstSentence = compact.split(/(?<=[.!?])\s+/)[0]?.trim() ?? compact;
  return `${firstSentence.replace(/[.!?]+$/g, "")}.`;
};

const isAdmissionOnlyDescription = (value: string) =>
  /^(?:admission(?: ticket)?(?: included| free| not included)?|ticket included|ticket not included)\.?$/i.test(
    value.trim()
  );

const polishSourceSentence = (sourceSentence: string) =>
  sourceSentence
    .replace(/^(enjoy|experience|discover|visit|explore|see)\s+/i, "")
    .replace(/^take in\s+/i, "")
    .replace(/^check out\s+/i, "")
    .replace(/^pass(?: by)?\s+/i, "")
    .replace(/^you(?:'ll| will)\s+/i, "")
    .replace(/^he\s+(?=[A-Z])/, "The ")
    .replace(/^[a-z]/, match => match.toUpperCase())
    .replace(/[;:,]\s*$/, "")
    .trim();

const extractCleanSourceSentence = (sourceDescription: string) => {
  const cleanedSource = stripEngine6AdmissionArtifacts(sourceDescription)
    .replace(/\s+/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(you will|you'll|we will|we'll)\b/gi, "")
    .trim();

  return (
    cleanedSource
      .split(/(?<!\b\d)[.!?]/)
      .map(part => part.trim())
      .find(part => part.length > 0) ?? ""
  );
};

const PASS_BY_DURATION_PATTERN = /^pass(?:\s*-\s*by|\s+by)?$/i;

const normalizeUsableDuration = (duration: string | undefined) => {
  const trimmed = duration?.trim()?.replace(/[.!?]+$/g, "") ?? "";
  if (!trimmed || PASS_BY_DURATION_PATTERN.test(trimmed)) {
    return null;
  }
  return trimmed;
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const stripLeadingArticle = (value: string) =>
  value.replace(/^(?:the|a|an)\s+/i, "").trim();

const formatContextFragment = (value: string) =>
  stripLeadingArticle(value.trim())
    .replace(/^with\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();

const durationMentionedInText = (text: string, duration: string) => {
  const normalizedText = normalizeComparableText(text);
  const normalizedDuration = normalizeComparableText(duration);
  if (!normalizedText || !normalizedDuration) {
    return false;
  }

  if (normalizedText.includes(normalizedDuration)) {
    return true;
  }

  const durationMatch = duration.match(
    /(\d+(?:\.\d+)?)\s*(?:-| )?(minute|minutes|min|mins|hour|hours|hr|hrs)\b/i
  );
  if (!durationMatch) {
    return false;
  }

  const [, amount, unit] = durationMatch;
  const unitPattern =
    unit.startsWith("min") || unit === "mins"
      ? "(?:minute|minutes|min|mins)"
      : "(?:hour|hours|hr|hrs)";
  return new RegExp(
    `\\b${escapeRegExp(amount)}\\s*(?:-| )?${unitPattern}\\b`,
    "i"
  ).test(text);
};

const stripDurationFromContext = (context: string, duration: string) => {
  let cleaned = context;
  cleaned = cleaned.replace(
    new RegExp(`\\b(?:during|for)\\s+(?:a|an|the)?\\s*${escapeRegExp(duration)}\\b`, "gi"),
    ""
  );
  cleaned = cleaned.replace(
    /\b(?:during|for)\s+(?:a|an|the)?\s*[\d.]+\s*(?:-| )?(?:minute|minutes|min|mins|hour|hours|hr|hrs)\s*(?:stop|visit)?\b/gi,
    ""
  );
  return formatContextFragment(cleaned);
};

const formatPassByContext = (context: string) => {
  const fragment = formatContextFragment(context);
  if (!fragment) {
    return null;
  }
  if (/^(?:the|a|an)\s+/i.test(fragment)) {
    return fragment;
  }
  return `the ${fragment}`;
};

const formatWithClause = (clause: string) => {
  const trimmed = formatContextFragment(clause);
  const commentaryMatch = trimmed.match(/^commentary on\s+(.+)$/i);
  if (commentaryMatch?.[1]) {
    const topic = commentaryMatch[1].trim().replace(/\s+/g, "-");
    return `${topic}-history commentary`;
  }
  return trimmed;
};

const extractLocationSuffixFromSource = (
  polishedSource: string,
  title: string,
  duration: string | null
) => {
  let remainder = polishedSource.replace(
    new RegExp(escapeRegExp(title), "i"),
    ""
  );
  if (duration) {
    remainder = remainder.replace(new RegExp(escapeRegExp(duration), "gi"), "");
  }
  remainder = remainder.replace(
    /\b(?:during|for)\s+(?:a|an|the)?\s*[\d.]+\s*(?:-| )?(?:minute|minutes|min|mins|hour|hours|hr|hrs)\s*(?:stop|visit)?\b/gi,
    ""
  );
  remainder = formatContextFragment(
    remainder
      .replace(/^(?:photo stop|stop|visit|explore|see|enjoy|experience)\s*/i, "")
      .replace(/^[,:\s-]+/, "")
      .replace(/[,:\s-]+$/, "")
  );

  if (!remainder || !descriptionAddsInformationBeyondTitle(title, remainder)) {
    return null;
  }

  if (duration && durationMentionedInText(remainder, duration)) {
    remainder = stripDurationFromContext(remainder, duration);
  }

  if (!remainder) {
    return null;
  }

  if (/^(?:in|on|at|near|through|along|across|by|from|into|onto|toward|towards|within)\b/i.test(
    remainder
  )) {
    return ` ${remainder}`;
  }

  return ` in ${remainder}`;
};

const extractUsefulSourceFragment = (polishedSource: string, title: string) => {
  if (!polishedSource || isAdmissionOnlyDescription(polishedSource)) {
    return null;
  }

  const titleTokens = new Set(titleWordTokens(title));
  const tokens = polishedSource
    .split(/\s+/)
    .map(token => token.replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, ""))
    .filter(Boolean)
    .filter(token => {
      const normalized = token.toLowerCase();
      return (
        normalized.length > 2 &&
        !titleTokens.has(normalized) &&
        !/^(?:the|and|with|from|into|onto|that|this|there|their|your|will|can|for|you|our|are|has|have|guide|guests|guest|travelers|traveler|group|everyone|comfortable|make|sure|well|ll|stop|visit|photo|route|tour|during|about|minutes|minute|hours|hour|pass|passes|by)$/.test(
          normalized
        )
      );
    });

  if (tokens.length < 3) {
    return null;
  }

  const fragment = tokens.slice(0, 8).join(" ");
  return isGenericFallbackContext(fragment) ? null : fragment;
};

const resolveSourceDerivedContext = (
  sourceSentence: string,
  title: string,
  duration: string | null
) => {
  const polishedSource = polishSourceSentence(sourceSentence);
  if (!polishedSource || isAdmissionOnlyDescription(polishedSource)) {
    return null;
  }

  const suffix = extractLocationSuffixFromSource(
    polishedSource,
    title,
    duration
  );
  if (suffix) {
    const cleaned = formatContextFragment(suffix.trim());
    if (cleaned && !isGenericFallbackContext(cleaned)) {
      return cleaned;
    }
  }

  const fragment = extractUsefulSourceFragment(polishedSource, title);
  if (fragment) {
    const cleaned = duration
      ? stripDurationFromContext(fragment, duration)
      : formatContextFragment(fragment);
    if (cleaned && !isGenericFallbackContext(cleaned)) {
      return cleaned;
    }
  }

  return null;
};

const buildGenericNonDuplicativeFallback = (
  item: Engine6ItinerarySourceItem,
  variantIndex: number
) => {
  const duration = normalizeUsableDuration(item.duration);
  const admissionNote = item.admissionNote?.trim()?.toLowerCase();

  if (item.stopType === "pass-by") {
    return "This portion is viewed from the route without a scheduled stop.";
  }

  if (duration && admissionNote) {
    const variants = [
      `This scheduled stop includes about ${duration} in the itinerary with ${admissionNote}.`,
      `This scheduled stop includes about ${duration} in the itinerary, ${admissionNote}.`,
    ];
    return variants[variantIndex % variants.length] ?? variants[0]!;
  }

  if (duration) {
    return `This scheduled stop includes about ${duration} in the itinerary.`;
  }

  return "This is a scheduled stop with time included in the itinerary.";
};

const buildDestinationTimedStopSentence = (
  item: Engine6ItinerarySourceItem,
  variantIndex: number
) => buildGenericNonDuplicativeFallback(item, variantIndex);

const buildDestinationPassBySentence = (
  item: Engine6ItinerarySourceItem,
  variantIndex: number
) => buildGenericNonDuplicativeFallback(item, variantIndex);

const isAcceptableFallbackDescription = (
  title: string,
  description: string
) =>
  !engine6DescriptionTitleTokenOverlapExceedsThreshold(title, description) &&
  !isEngine6LowQualityItineraryDescription(title, description);

const finalizeFallbackCandidate = (
  title: string,
  item: Engine6ItinerarySourceItem,
  candidates: string[],
  variantIndex: number
) => {
  if (candidates.length === 0) {
    return enforceSingleSentence(
      stripEngine6AdmissionArtifacts(
        buildGenericNonDuplicativeFallback(item, variantIndex)
      )
    );
  }

  for (let offset = 0; offset < candidates.length; offset += 1) {
    const candidate = enforceSingleSentence(
      stripEngine6AdmissionArtifacts(
        candidates[(variantIndex + offset) % candidates.length]!
      )
    );
    if (isAcceptableFallbackDescription(title, candidate)) {
      return candidate;
    }
  }

  return enforceSingleSentence(
    stripEngine6AdmissionArtifacts(
      buildGenericNonDuplicativeFallback(item, variantIndex + candidates.length)
    )
  );
};

const buildTimedStopIncludesSentence = (
  item: Engine6ItinerarySourceItem,
  sourceSentence: string,
  variantIndex: number
) => {
  const title = item.title?.trim() || "This stop";
  const duration = normalizeUsableDuration(item.duration);
  const polishedSource = polishSourceSentence(sourceSentence);
  const andParts = polishedSource.split(/\s+and\s+/i);
  let withClause: string | null = null;
  let mainPart = polishedSource;

  if (andParts.length > 1) {
    const trailingPart = andParts[andParts.length - 1]?.trim() ?? "";
    if (
      /^(?:commentary|time|access|views|walk|photo stop|a photo stop)\b/i.test(
        trailingPart
      )
    ) {
      withClause = formatWithClause(trailingPart);
      mainPart = andParts.slice(0, -1).join(" and ").trim();
    }
  }

  if (!withClause) {
    const withMatch = polishedSource.match(/\bwith\s+(.+)$/i);
    if (withMatch?.[1]) {
      withClause = formatWithClause(withMatch[1]);
      mainPart = polishedSource.replace(/\bwith\s+.+$/i, "").trim();
    }
  }

  const meadowMatch = mainPart.match(/\bat\s+(.+?)\s+meadow\b/i);
  if (meadowMatch && duration) {
    const locationLabel = /\bel capitan\b/i.test(title)
      ? "El Capitan Meadow"
      : `${title} Meadow`;
    if (withClause) {
      return finalizeFallbackCandidate(
        title,
        item,
        [
          `Includes about ${duration} near ${locationLabel} with ${withClause}.`,
          `Includes about ${duration} at ${locationLabel} with ${withClause}.`,
        ],
        variantIndex
      );
    }
  }

  const locationSuffix = duration
    ? extractLocationSuffixFromSource(mainPart || polishedSource, title, duration)
    : null;
  if (locationSuffix && duration) {
    return finalizeFallbackCandidate(
      title,
      item,
      [
        `Includes about ${duration} at ${title}${locationSuffix}.`,
        withClause
          ? `Includes about ${duration} at ${title}${locationSuffix} with ${withClause}.`
          : `Includes about ${duration} at ${title}${locationSuffix}.`,
      ],
      variantIndex
    );
  }

  const context = resolveSourceDerivedContext(sourceSentence, title, duration);
  if (context && duration) {
    if (withClause) {
      return finalizeFallbackCandidate(
        title,
        item,
        [
          `Includes about ${duration} near ${title} with ${withClause}.`,
          `Includes about ${duration} at ${title} with ${withClause}.`,
        ],
        variantIndex
      );
    }

    const preposition = /^(?:in|on|at|near|through|along|across|by)\b/i.test(
      context
    )
      ? ""
      : " in ";
    return finalizeFallbackCandidate(
      title,
      item,
      [
        `Includes about ${duration} at ${title}${preposition}${context}.`,
        `Includes about ${duration} at ${title} with ${context}.`,
      ],
      variantIndex
    );
  }

  if (withClause && duration) {
    return finalizeFallbackCandidate(
      title,
      item,
      [`Includes about ${duration} near ${title} with ${withClause}.`],
      variantIndex
    );
  }

  return buildDestinationTimedStopSentence(item, variantIndex);
};

const buildPassByFallbackSentence = (
  item: Engine6ItinerarySourceItem,
  sourceSentence: string,
  variantIndex: number
) => {
  const title = item.title?.trim() || "This stop";
  const context = resolveSourceDerivedContext(sourceSentence, title, null);
  const formattedContext = context ? formatPassByContext(context) : null;

  if (formattedContext) {
    return finalizeFallbackCandidate(
      title,
      item,
      [
        `Passes by ${formattedContext}.`,
        `Route passes ${formattedContext}.`,
      ],
      variantIndex
    );
  }

  return buildDestinationPassBySentence(item, variantIndex);
};

const buildEngine6ContextualItineraryDescription = (
  item: Engine6ItinerarySourceItem,
  sourceSentence: string,
  variantIndex = 0
) => {
  const title = item.title?.trim() || "This stop";
  const sentence =
    item.stopType === "pass-by"
      ? buildPassByFallbackSentence(item, sourceSentence, variantIndex)
      : buildTimedStopIncludesSentence(item, sourceSentence, variantIndex);

  const normalized = enforceSingleSentence(stripEngine6AdmissionArtifacts(sentence));
  if (isAcceptableFallbackDescription(title, normalized)) {
    return normalized;
  }

  return enforceSingleSentence(
    stripEngine6AdmissionArtifacts(
      buildGenericNonDuplicativeFallback(item, variantIndex + 1)
    )
  );
};

export const rewriteEngine6ItineraryDescriptionToSingleSentence = (args: {
  productCode: string;
  item: Engine6ItinerarySourceItem;
  index: number;
  getDescriptionOverride?: Engine6ItineraryBuildOptions["getDescriptionOverride"];
}) => {
  const override = args.getDescriptionOverride?.(
    args.productCode,
    args.index
  );
  if (override) {
    const normalizedOverride = enforceSingleSentence(
      stripEngine6AdmissionArtifacts(override)
    );
    if (
      !isEngine6LowQualityItineraryDescription(args.item.title ?? "", normalizedOverride)
    ) {
      return normalizedOverride;
    }
  }

  const { item } = args;
  const title = item.title?.trim() || "This stop";
  const sourceDescription = item.description?.trim() ?? "";
  const sourceSentence = extractCleanSourceSentence(sourceDescription);
  const polishedSourceSentence = polishSourceSentence(sourceSentence);
  const normalizedTitle = normalizeComparableText(title);
  const normalizedSentence = normalizeComparableText(sourceSentence);
  const repeatsTitle =
    normalizedTitle.length > 0 &&
    normalizedSentence.length > 0 &&
    (normalizedSentence === normalizedTitle ||
      normalizedSentence.includes(normalizedTitle));

  if (
    polishedSourceSentence &&
    !repeatsTitle &&
    !isAdmissionOnlyDescription(polishedSourceSentence) &&
    !isEngine6GenericItineraryDescription(polishedSourceSentence) &&
    !isEngine6LowQualityItineraryDescription(title, polishedSourceSentence)
  ) {
    return stripEngine6AdmissionArtifacts(`${polishedSourceSentence}.`)
      .replace(/\s+/g, " ")
      .replace(/\s+([;,.])/g, "$1")
      .replace(/\.\./g, ".")
      .trim();
  }

  return buildEngine6ContextualItineraryDescription(
    item,
    sourceSentence,
    args.index
  );
};

export const dedupeEngine6ItineraryDescriptions = (
  items: Engine6ItineraryItem[],
  rewriteArgs?: Pick<
    Parameters<typeof rewriteEngine6ItineraryDescriptionToSingleSentence>[0],
    "productCode" | "getDescriptionOverride"
  >
): Engine6ItineraryItem[] => {
  const seenDescriptions = new Set<string>();

  return items.map((item, index) => {
    let description =
      item.description?.trim() ||
      rewriteEngine6ItineraryDescriptionToSingleSentence({
        productCode: rewriteArgs?.productCode ?? "",
        item,
        index,
        getDescriptionOverride: rewriteArgs?.getDescriptionOverride,
      });

    if (isEngine6LowQualityItineraryDescription(item.title, description)) {
      description = buildEngine6ContextualItineraryDescription(
        item,
        item.description ?? "",
        index + 1
      );
    }

    const descriptionKey = normalizeComparableText(description);
    if (descriptionKey && seenDescriptions.has(descriptionKey)) {
      description = buildEngine6ContextualItineraryDescription(
        item,
        item.description ?? "",
        index + seenDescriptions.size + 1
      );
    }

    if (descriptionKey) {
      seenDescriptions.add(normalizeComparableText(description));
    }

    return {
      ...item,
      description,
    };
  });
};

export const isEngine6StructuredItineraryUsable = (
  items: Engine6ItineraryItem[]
) => {
  if (items.length === 0) {
    return false;
  }

  const usableStops = items.filter(item => {
    const description = item.description?.trim() ?? "";
    return !isEngine6LowQualityItineraryDescription(item.title, description);
  });

  if (items.length >= 2) {
    return usableStops.length >= 2;
  }

  return usableStops.length === 1;
};

export const buildEngine6ItineraryFromExtracted = (
  productCode: string,
  extracted: Engine6ItinerarySourceItem[] | undefined | null,
  options?: Engine6ItineraryBuildOptions
): Engine6ItineraryItem[] => {
  if (options?.itemOverrides) {
    return options.itemOverrides.map(item => ({
      title: item.title,
      description: item.description,
      stopType: item.stopType,
      duration: item.duration,
      admissionNote: item.admissionNote,
      sectionLabel: item.sectionLabel,
    }));
  }

  if (!extracted?.length) {
    return [];
  }

  const mapped = extracted.map((item, index) => ({
    ...item,
    description: rewriteEngine6ItineraryDescriptionToSingleSentence({
      productCode,
      item,
      index,
      getDescriptionOverride: options?.getDescriptionOverride,
    }),
  }));

  return dedupeEngine6ItineraryDescriptions(mapped, {
    productCode,
    getDescriptionOverride: options?.getDescriptionOverride,
  });
};

export const resolveEngine6ItineraryForRender = (
  baseline: Engine6ItineraryItem[],
  candidate: Engine6ItineraryItem[] | null | undefined
): Engine6ItineraryItem[] => {
  if (isEngine6StructuredItineraryUsable(baseline)) {
    return baseline;
  }

  if (candidate && isEngine6StructuredItineraryUsable(candidate)) {
    return candidate;
  }

  if (baseline.length > 0) {
    return baseline;
  }

  return candidate ?? [];
};

export const resolveEngine6ItinerarySummaryForRender = (
  baseline: string | null | undefined,
  candidate: string | null | undefined,
  itinerary: Engine6ItineraryItem[]
): string | null => {
  if (itinerary.length >= 2) {
    return null;
  }

  const normalizedBaseline = baseline?.trim() ?? "";
  if (normalizedBaseline) {
    return normalizedBaseline;
  }

  const normalizedCandidate = candidate?.trim() ?? "";
  return normalizedCandidate || null;
};
