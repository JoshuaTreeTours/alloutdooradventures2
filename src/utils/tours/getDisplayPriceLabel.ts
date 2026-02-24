const formatUsd = (value: number) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  });

  return formatter.format(value);
};

export const getDisplayPriceLabel = (input: {
  lowPrice?: number | string | null;
  price?: number | string | null;
}): string | null => {
  const lowPrice = Number(input.lowPrice);
  if (Number.isFinite(lowPrice) && lowPrice > 0) {
    return `From ${formatUsd(lowPrice)} per person`;
  }

  const price = Number(input.price);
  if (Number.isFinite(price) && price > 0) {
    return `From ${formatUsd(price)} per person`;
  }

  return null;
};
