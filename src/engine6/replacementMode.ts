import type { Tour } from "../data/tours.types";

export type Engine6ReplacementEligibilitySnapshot = {
  legacyTitle: string;
  legacyPriceAmount: number;
  legacyMeetingPoint: string;
};

export type Engine6ReplacementModeConfig = {
  productCode: string;
  canonicalPath: string;
  bookingPath: string;
  eligibility: Engine6ReplacementEligibilitySnapshot;
};

const TITLE_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "at",
  "for",
  "from",
  "in",
  "of",
  "the",
  "to",
  "tour",
]);

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenizeTitle = (value: string) =>
  normalizeText(value)
    .split(" ")
    .filter(token => token && !TITLE_STOP_WORDS.has(token));

const normalizeMeetingPoint = (value: string) =>
  normalizeText(value)
    .replace(/\b(usa|united states)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const calculateTitleSimilarity = (left: string, right: string) => {
  const leftTokens = new Set(tokenizeTitle(left));
  const rightTokens = new Set(tokenizeTitle(right));

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  const overlap = [...leftTokens].filter(token => rightTokens.has(token));
  const union = new Set([...leftTokens, ...rightTokens]);

  return {
    ratio: overlap.length / union.size,
    overlapCount: overlap.length,
  };
};

const hasPriceProximity = (legacyPrice: number, engine6Price: number) => {
  const difference = Math.abs(legacyPrice - engine6Price);
  const allowedDifference = Math.max(25, legacyPrice * 0.2);
  return difference <= allowedDifference;
};

const hasMatchingMeetingPlace = (legacyMeeting: string, engine6Meeting: string) => {
  const normalizedLegacy = normalizeMeetingPoint(legacyMeeting);
  const normalizedEngine6 = normalizeMeetingPoint(engine6Meeting);

  if (!normalizedLegacy || !normalizedEngine6) {
    return false;
  }

  if (normalizedLegacy === normalizedEngine6) {
    return true;
  }

  if (
    normalizedLegacy.includes(normalizedEngine6) ||
    normalizedEngine6.includes(normalizedLegacy)
  ) {
    return true;
  }

  const legacyTokens = new Set(normalizedLegacy.split(" ").filter(Boolean));
  const engine6Tokens = new Set(normalizedEngine6.split(" ").filter(Boolean));
  const overlap = [...legacyTokens].filter(token => engine6Tokens.has(token));

  return overlap.length >= 2;
};

export type Engine6ReplacementEligibilityInput = {
  title: string;
  priceAmount: number | null;
  meetingPointText: string;
  config: Engine6ReplacementModeConfig;
};

export type Engine6ReplacementEligibilityResult = {
  eligible: boolean;
  titlePassed: boolean;
  pricePassed: boolean;
  meetingPointPassed: boolean;
};

export const evaluateEngine6ReplacementEligibility = ({
  title,
  priceAmount,
  meetingPointText,
  config,
}: Engine6ReplacementEligibilityInput): Engine6ReplacementEligibilityResult => {
  const titleSimilarity = calculateTitleSimilarity(
    config.eligibility.legacyTitle,
    title
  );
  const titlePassed =
    titleSimilarity.ratio >= 0.4 && titleSimilarity.overlapCount >= 3;
  const pricePassed =
    typeof priceAmount === "number" &&
    hasPriceProximity(config.eligibility.legacyPriceAmount, priceAmount);
  const meetingPointPassed = hasMatchingMeetingPlace(
    config.eligibility.legacyMeetingPoint,
    meetingPointText
  );

  return {
    eligible: titlePassed && pricePassed && meetingPointPassed,
    titlePassed,
    pricePassed,
    meetingPointPassed,
  };
};

const getLegacyTourPathFromBookingPath = (bookingPath: string) =>
  bookingPath.endsWith("/book")
    ? bookingPath.slice(0, -"/book".length)
    : bookingPath;

export const suppressLegacyFareHarborTour = (
  tour: Tour,
  engine6CanonicalPaths: Iterable<string>
) => {
  if (tour.engine === "engine6") {
    return false;
  }

  if (tour.bookingProvider !== "fareharbor") {
    return false;
  }

  const canonicalPath = `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`;

  const canonicalSet = new Set(engine6CanonicalPaths);
  return canonicalSet.has(canonicalPath);
};
