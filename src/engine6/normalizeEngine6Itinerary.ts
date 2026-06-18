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

export const isEngine6TitleDescriptionMismatch = (
  title: string,
  description: string
) => {
  const normalizedTitle = normalizeComparableText(title);
  const normalizedDescription = normalizeComparableText(description);
  if (!normalizedTitle || !normalizedDescription) {
    return false;
  }

  return (
    normalizedTitle === normalizedDescription ||
    normalizedDescription.startsWith(`${normalizedTitle} `) ||
    normalizedDescription.includes(` ${normalizedTitle} `)
  );
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
    return enforceSingleSentence(stripEngine6AdmissionArtifacts(override));
  }

  const { item } = args;
  const title = item.title?.trim() || "This stop";
  const duration = item.duration?.trim();
  const sourceDescription = item.description?.trim() ?? "";
  const cleanedSource = stripEngine6AdmissionArtifacts(sourceDescription)
    .replace(/\s+/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(you will|you'll|we will|we'll)\b/gi, "")
    .trim();
  const sourceSentence =
    cleanedSource
      .split(/(?<!\b\d)[.!?]/)
      .map(part => part.trim())
      .find(part => part.length > 0) ?? "";
  const normalizedTitle = normalizeComparableText(title);
  const normalizedSentence = normalizeComparableText(sourceSentence);
  const repeatsTitle =
    normalizedTitle.length > 0 &&
    normalizedSentence.length > 0 &&
    (normalizedSentence === normalizedTitle ||
      normalizedSentence.includes(normalizedTitle));
  const polishedSourceSentence = sourceSentence
    .replace(/^(enjoy|experience|discover|visit|explore|see)\s+/i, "")
    .replace(/^take in\s+/i, "")
    .replace(/^check out\s+/i, "")
    .replace(/^pass(?: by)?\s+/i, "")
    .replace(/^you(?:'ll| will)\s+/i, "")
    .replace(/^he\s+(?=[A-Z])/, "The ")
    .replace(/^[a-z]/, match => match.toUpperCase())
    .replace(/[;:,]\s*$/, "")
    .trim();

  const durationClause = duration
    ? ` during the ${duration.replace(/[.!?]+$/g, "")} stop`
    : "";

  if (
    polishedSourceSentence &&
    !repeatsTitle &&
    !isAdmissionOnlyDescription(polishedSourceSentence) &&
    !isEngine6GenericItineraryDescription(polishedSourceSentence) &&
    !isEngine6TitleDescriptionMismatch(title, polishedSourceSentence)
  ) {
    return stripEngine6AdmissionArtifacts(`${polishedSourceSentence}.`)
      .replace(/\s+/g, " ")
      .replace(/\s+([;,.])/g, "$1")
      .replace(/\.\./g, ".")
      .trim();
  }

  const fallbackTitle = title
    .replace(
      /^(?:enjoy|experience|discover|visit|explore|see|head to|head|take in|check out|pass(?: by)?)\s+/i,
      ""
    )
    .replace(/^he\s+(?=[A-Z])/, "The ")
    .replace(/^[a-z]/, match => match.toUpperCase())
    .trim();
  const fallbackLead =
    item.stopType === "pass-by"
      ? `Pass ${fallbackTitle || title} as part of the route`
      : `Visit ${fallbackTitle || title}${durationClause}`;

  return stripEngine6AdmissionArtifacts(`${fallbackLead}.`)
    .replace(/\s+/g, " ")
    .replace(/\s+([;,.])/g, "$1")
    .replace(/\.\./g, ".")
    .trim();
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

    if (isEngine6TitleDescriptionMismatch(item.title, description)) {
      description = rewriteEngine6ItineraryDescriptionToSingleSentence({
        productCode: rewriteArgs?.productCode ?? "",
        item,
        index: index + 1,
        getDescriptionOverride: rewriteArgs?.getDescriptionOverride,
      });
    }

    const descriptionKey = normalizeComparableText(description);
    if (descriptionKey && seenDescriptions.has(descriptionKey)) {
      description = rewriteEngine6ItineraryDescriptionToSingleSentence({
        productCode: rewriteArgs?.productCode ?? "",
        item,
        index: index + seenDescriptions.size + 1,
        getDescriptionOverride: rewriteArgs?.getDescriptionOverride,
      });
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
    if (!description) {
      return false;
    }
    if (isEngine6GenericItineraryDescription(description)) {
      return false;
    }
    if (isEngine6TitleDescriptionMismatch(item.title, description)) {
      return false;
    }
    return true;
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
