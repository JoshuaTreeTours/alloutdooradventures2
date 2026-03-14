import type { Tour } from "../data/tours.types";
import { detectRental } from "./detectRental";

export const isRentalTour = (
  tour: Pick<
    Tour,
    "type" | "title" | "primaryCategory" | "categories" | "activitySlugs"
  >
) => {
  if (tour.type === "rental") {
    return true;
  }

  if (tour.primaryCategory === "rentals") {
    return true;
  }

  if (
    tour.categories?.includes("rentals") ||
    tour.activitySlugs.includes("rentals")
  ) {
    return true;
  }

  return detectRental(tour.title) === "rental";
};
