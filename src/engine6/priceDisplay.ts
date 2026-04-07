export const formatEngine6Usd = (amount: number) => {
  const hasCents = Math.round(amount * 100) % 100 !== 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(amount);
};

export const formatEngine6StartingPriceLabel = (amount: number | null) =>
  typeof amount === "number" && Number.isFinite(amount) && amount > 0
    ? `Starting at ${formatEngine6Usd(amount)}`
    : "Check latest price";
