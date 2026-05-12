export const formatEngine6Usd = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatEngine6StartingPriceLabel = (amount: number | null) =>
  typeof amount === "number" && Number.isFinite(amount) && amount > 0
    ? `From ${formatEngine6Usd(amount)}`
    : "Check latest price";
