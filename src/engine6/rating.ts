export const normalizeEngine6AggregateRating = (
  value: number | null | undefined
) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Number(value.toFixed(1));
};

export const formatEngine6AggregateRating = (
  value: number | null | undefined
) => {
  const normalized = normalizeEngine6AggregateRating(value);
  return normalized === null ? null : normalized.toFixed(1);
};
