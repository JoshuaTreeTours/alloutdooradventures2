const REMOVED_TOUR_IDS = new Set([
  "34849",
  "34897",
  "43915",
  "34899",
  "34891",
  "574370",
]);

const REMOVED_OPERATOR_NAMES = new Set([
  "desert adventures red jeep tours",
  "red jeep tours",
  "red jeep company",
]);

const REMOVED_OPERATOR_SHORTNAMES = new Set(["red-jeep"]);

type IsTourRemovedArgs = {
  tourId?: string | null;
  operatorName?: string | null;
  operatorShortName?: string | null;
};

const normalize = (value?: string | null) => value?.trim().toLowerCase() ?? "";

export const isTourRemoved = ({
  tourId,
  operatorName,
  operatorShortName,
}: IsTourRemovedArgs) => {
  if (tourId && REMOVED_TOUR_IDS.has(tourId)) {
    return true;
  }

  const normalizedOperator = normalize(operatorName);
  if (normalizedOperator && REMOVED_OPERATOR_NAMES.has(normalizedOperator)) {
    return true;
  }

  const normalizedShortName = normalize(operatorShortName);
  return Boolean(
    normalizedShortName && REMOVED_OPERATOR_SHORTNAMES.has(normalizedShortName)
  );
};

export const getTourIdFromSlug = (tourSlug: string) => {
  const match = tourSlug.match(/-(\d+)$/);
  return match?.[1] ?? null;
};

export const isRemovedTourSlug = (tourSlug: string) =>
  isTourRemoved({ tourId: getTourIdFromSlug(tourSlug) });

export const getRemovedTourIds = () => Array.from(REMOVED_TOUR_IDS);
