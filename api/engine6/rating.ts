export const normalizeEngine6AggregateRating = (
  value: number | null | undefined
) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Number(value.toFixed(1));
};
