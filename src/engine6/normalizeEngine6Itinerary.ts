import { normalizeEngine6ItineraryComparisonText } from "./itineraryGovernance";
import { normalizeEngine6ItineraryStopFields } from "./itineraryTitleDescription";
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

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const isEngine6BannedItineraryPlaceholder = (
  title: string,
  description: string
) => {
  const trimmed = description.trim();
  if (!trimmed) {
    return false;
  }

  if (/^By\.?$/i.test(trimmed)) {
    return true;
  }

  if (/^Historic context\.?$/i.test(trimmed)) {
    return true;
  }

  if (/^Scenic pass-by segment\.?$/i.test(trimmed)) {
    return true;
  }

  if (/\bscenic pass-by segment\b/i.test(trimmed)) {
    return true;
  }

  if (/\bhistoric context\b/i.test(trimmed)) {
    return true;
  }

  if (/^Pass\s+.+\s+as part of the route\.?$/i.test(trimmed)) {
    return true;
  }

  const normalizedTitle = title.trim();
  if (normalizedTitle) {
    const escapedTitle = escapeRegExp(normalizedTitle);
    if (
      new RegExp(
        `^Visit\\s+${escapedTitle}\\s+during\\s+(?:the\\s+)?(?:\\d|[\\w-]+\\s+)*stop\\.?$`,
        "i"
      ).test(trimmed)
    ) {
      return true;
    }
  }

  if (
    /^Visit\s+.+\s+during\s+(?:the\s+)?(?:\d+\s*(?:hour|hours|minute|minutes|hr|hrs|min|mins)\s*)?stop\.?$/i.test(
      trimmed
    )
  ) {
    return true;
  }

  if (
    /^This portion is viewed from the route without a scheduled stop\.?$/i.test(
      trimmed
    )
  ) {
    return true;
  }

  if (/^This scheduled stop includes about\b/i.test(trimmed)) {
    return true;
  }

  if (
    /^This is a scheduled stop with time included in the itinerary\.?$/i.test(
      trimmed
    )
  ) {
    return true;
  }

  return false;
};

export const isEngine6PureTitleRestatement = (
  title: string,
  description: string
) => {
  const normalizedTitle = normalizeComparableText(title);
  const normalizedDescription = normalizeComparableText(description);
  if (!normalizedTitle || !normalizedDescription) {
    return false;
  }

  return normalizedDescription === normalizedTitle;
};

export const isEngine6TitleDescriptionMismatch = (
  title: string,
  description: string
) => isEngine6PureTitleRestatement(title, description);

export const descriptionAddsInformationBeyondTitle = (
  title: string,
  description: string
) => {
  const normalizedDescription = normalizeComparableText(description);
  if (!normalizedDescription) {
    return false;
  }

  return normalizedDescription !== normalizeComparableText(title);
};

export const isEngine6LowQualityItineraryDescription = (
  title: string,
  description: string
) => {
  const trimmed = description.trim();
  if (!trimmed) {
    return true;
  }

  return isEngine6BannedItineraryPlaceholder(title, trimmed);
};

const normalizeSupplierDescription = (sourceDescription: string) => {
  const cleaned = stripEngine6AdmissionArtifacts(sourceDescription)
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "";
  }

  const sentences = cleaned
    .split(/(?<!\b\d)[.!?]/)
    .map(part => part.trim())
    .filter(part => part.length > 0)
    .slice(0, 2);

  return sentences
    .map(sentence => {
      const withoutTrailingPunctuation = sentence.replace(/[.!?]+$/g, "");
      return withoutTrailingPunctuation
        ? `${withoutTrailingPunctuation}.`
        : "";
    })
    .filter(Boolean)
    .join(" ");
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
  if (override?.trim()) {
    const normalizedOverride = normalizeSupplierDescription(override);
    if (
      normalizedOverride &&
      !isEngine6BannedItineraryPlaceholder(
        args.item.title ?? "",
        normalizedOverride
      )
    ) {
      return normalizedOverride;
    }
  }

  const sourceDescription = args.item.description?.trim() ?? "";
  if (!sourceDescription) {
    return "";
  }

  const normalizedSource = normalizeSupplierDescription(sourceDescription);
  if (
    !normalizedSource ||
    isEngine6BannedItineraryPlaceholder(args.item.title ?? "", normalizedSource)
  ) {
    return "";
  }

  return normalizedSource;
};

export const dedupeEngine6ItineraryDescriptions = (
  items: Engine6ItineraryItem[],
  rewriteArgs?: Pick<
    Parameters<typeof rewriteEngine6ItineraryDescriptionToSingleSentence>[0],
    "productCode" | "getDescriptionOverride"
  >
): Engine6ItineraryItem[] =>
  items.map((item, index) => {
    const description =
      item.description?.trim() ||
      rewriteEngine6ItineraryDescriptionToSingleSentence({
        productCode: rewriteArgs?.productCode ?? "",
        item,
        index,
        getDescriptionOverride: rewriteArgs?.getDescriptionOverride,
      });

    return {
      ...item,
      description,
    };
  });

export const isEngine6StructuredItineraryUsable = (
  items: Engine6ItineraryItem[]
) => {
  if (items.length === 0) {
    return false;
  }

  const usableStops = items.filter(item => {
    const title = item.title?.trim() ?? "";
    if (!title) {
      return false;
    }

    const description = item.description?.trim() ?? "";
    if (!description) {
      return true;
    }

    return !isEngine6BannedItineraryPlaceholder(item.title, description);
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

  const mapped = extracted.map((item, index) => {
    const normalizedFields = normalizeEngine6ItineraryStopFields(item);

    return {
      ...item,
      ...normalizedFields,
      description: rewriteEngine6ItineraryDescriptionToSingleSentence({
        productCode,
        item: {
          ...item,
          ...normalizedFields,
        },
        index,
        getDescriptionOverride: options?.getDescriptionOverride,
      }),
    };
  });

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
