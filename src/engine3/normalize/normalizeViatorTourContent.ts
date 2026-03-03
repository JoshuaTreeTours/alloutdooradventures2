import type { Engine2Tour } from "../../engine2/data/loadEngine2";
import {
  buildFactOverview,
  hasMinimumOverviewFacts,
} from "../content/buildFactOverview";
import {
  containsMetaLanguage,
  sanitizeAuthorityOverview,
} from "../content/authoritySanitizer";
import type { ViatorProductData } from "../types";

type NormalizeViatorTourContentInput = {
  productData?: ViatorProductData;
  storedTour?: Engine2Tour;
};

export type NormalizedViatorTourContent = {
  overview: string | null;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
};

const SENTENCE_TRIM_WORD_LIMIT = 140;
const MIN_OVERVIEW_WORDS = 110;
const MAX_HIGHLIGHTS = 10;

const cleanText = (value?: string | null): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.replace(/\s+/g, " ").trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");

const stripHtml = (value: string): string =>
  decodeHtmlEntities(value)
    .replace(/<\s*br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeSentenceKey = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const dedupeList = (values: Array<string | null | undefined>): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const cleaned = cleanText(typeof value === "string" ? stripHtml(value) : value);
    if (!cleaned) {
      continue;
    }

    const key = normalizeSentenceKey(cleaned);
    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(cleaned);
  }

  return result;
};

const sanitizeVoice = (value: string): string =>
  value
    .replace(/\bYou'll\b/g, "Travelers will")
    .replace(/\byou'll\b/g, "travelers will")
    .replace(/\bYou will\b/g, "Travelers will")
    .replace(/\byou will\b/g, "travelers will")
    .replace(/\bWe\b/g, "The operator")
    .replace(/\bwe\b/g, "the operator")
    .replace(/\bour\b/g, "the operator's")
    .replace(/\bOur\b/g, "The operator's")
    .replace(/\s+/g, " ")
    .trim();

const splitSentences = (value: string): string[] =>
  value
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

const wordCount = (value: string): number =>
  value.split(/\s+/).filter(Boolean).length;

const trimOverviewAtSentenceBoundary = (value: string): string => {
  if (wordCount(value) <= SENTENCE_TRIM_WORD_LIMIT) {
    return value;
  }

  const sentences = splitSentences(value);
  const kept: string[] = [];

  for (const sentence of sentences) {
    const candidate = [...kept, sentence].join(" ").trim();
    if (wordCount(candidate) > SENTENCE_TRIM_WORD_LIMIT) {
      break;
    }
    kept.push(sentence);
  }

  if (kept.length > 0) {
    return kept.join(" ");
  }

  return value
    .split(/\s+/)
    .slice(0, SENTENCE_TRIM_WORD_LIMIT)
    .join(" ")
    .trim();
};

const normalizeOverview = (source?: string | null): string | null => {
  const cleaned = cleanText(source);
  if (!cleaned) {
    return null;
  }

  const plainText = sanitizeVoice(stripHtml(cleaned));
  if (!plainText) {
    return null;
  }

  const trimmed = trimOverviewAtSentenceBoundary(plainText);
  return wordCount(trimmed) >= MIN_OVERVIEW_WORDS || splitSentences(trimmed).length > 1
    ? trimmed
    : plainText;
};

export const normalizeViatorTourContent = ({
  productData,
  storedTour,
}: NormalizeViatorTourContentInput): NormalizedViatorTourContent => {
  const highlights = dedupeList([
    ...(productData?.highlights ?? []),
    ...(storedTour?.content.highlights ?? []),
  ])
    .map(item => sanitizeVoice(item))
    .slice(0, MAX_HIGHLIGHTS);

  const inclusions = dedupeList([
    ...(productData?.inclusions ?? []),
    ...(productData?.included ?? []),
    ...(storedTour?.content.inclusions ?? []),
    ...(storedTour?.content.included ?? []),
  ]).map(item => sanitizeVoice(item));

  const exclusions = dedupeList([
    ...(productData?.exclusions ?? []),
    ...(productData?.notIncluded ?? []),
    ...(storedTour?.content.exclusions ?? []),
    ...(storedTour?.content.notIncluded ?? []),
  ]).map(item => sanitizeVoice(item));

  const parsedOverview =
    normalizeOverview(productData?.overview) ??
    normalizeOverview(productData?.description) ??
    normalizeOverview(storedTour?.content.overview) ??
    normalizeOverview(storedTour?.content.experienceText);
  const sanitizedOverview = sanitizeAuthorityOverview(parsedOverview);

  const shouldForceComposer = Boolean(
    !sanitizedOverview ||
      sanitizedOverview.length < 60 ||
      wordCount(sanitizedOverview) < 12 ||
      containsMetaLanguage(sanitizedOverview)
  );

  const factInput = {
    title: productData?.title ?? storedTour?.name,
    duration: productData?.duration ?? storedTour?.content.duration,
    city: storedTour?.geo.city,
    region: storedTour?.geo.region,
    highlights,
    inclusions,
    exclusions,
    meetingPoint:
      productData?.meetingPointDescription ??
      productData?.meetingPointText ??
      storedTour?.content.meetingPoint?.address ??
      storedTour?.content.meetingPoint?.instructions,
  };

  const hasFallbackFacts = hasMinimumOverviewFacts(factInput);
  const composedOverview = hasFallbackFacts ? buildFactOverview(factInput) : null;

  const overview =
    !shouldForceComposer &&
    sanitizedOverview &&
    wordCount(sanitizedOverview) >= MIN_OVERVIEW_WORDS
      ? sanitizedOverview
      : hasFallbackFacts
        ? composedOverview
        : null;

  return {
    overview,
    highlights,
    inclusions,
    exclusions,
  };
};
