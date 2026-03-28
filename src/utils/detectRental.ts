const RENTAL_KEYWORDS = [
  "rental",
  "rentals",
  "bike rental",
  "kayak rental",
  "equipment rental",
];

const TOUR_SIGNAL_KEYWORDS = ["tour", "guided"];

export const detectRental = (title: string): "tour" | "rental" => {
  const normalized = title.toLowerCase();
  const isRental = RENTAL_KEYWORDS.some(keyword => normalized.includes(keyword));
  const isClearlyTour = TOUR_SIGNAL_KEYWORDS.some(keyword =>
    normalized.includes(keyword)
  );

  return isRental && !isClearlyTour ? "rental" : "tour";
};
