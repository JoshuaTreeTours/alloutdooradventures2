const RENTAL_KEYWORDS = [
  "bike rental",
  "kayak rental",
  "scooter rental",
  "rental",
  "hire",
  "equipment",
  "e-bike",
  "sup",
];

export const detectRental = (title: string): "tour" | "rental" => {
  const normalized = title.toLowerCase();

  return RENTAL_KEYWORDS.some(keyword => normalized.includes(keyword))
    ? "rental"
    : "tour";
};
