export const formatCurrency = (amount: number, currency = "USD") => {
  if (!Number.isFinite(amount)) {
    return null;
  }

  const fractionDigits = Number.isInteger(amount) ? 0 : 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
};

export const formatStartingPrice = (
  amount?: number,
  currency?: string,
) => {
  if (amount === undefined || amount === null) {
    return null;
  }

  return formatCurrency(amount, currency ?? "USD");
};
