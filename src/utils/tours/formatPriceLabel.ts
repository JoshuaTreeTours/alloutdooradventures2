export const formatPriceLabel = (value: string | number | null | undefined) => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return `From $${Math.round(value)}`;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const cleaned = value.replace(/[$,]/g, "").trim();
  if (!cleaned) {
    return undefined;
  }

  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return `From $${Math.round(parsed)}`;
};

