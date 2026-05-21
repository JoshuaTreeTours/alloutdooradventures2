import type { Tour } from "../data/tours.types";
import {
  isContaminatedProductId,
  isContaminatedTitle,
} from "../data/contaminatedTours";

const extractFareHarborItemId = (tour: Tour): string | null => {
  if (tour.bookingProvider !== "fareharbor") {
    return null;
  }

  const match = tour.bookingUrl.match(/\/items\/(\d+)/i);
  return match?.[1] ?? null;
};

const getTourProductId = (tour: Tour): string | null =>
  tour.productCode ?? extractFareHarborItemId(tour);

export const isContaminatedRelatedTour = (tour: Tour): boolean => {
  const productId = getTourProductId(tour);
  if (isContaminatedProductId(productId)) {
    return true;
  }

  return isContaminatedTitle(tour.title);
};

export const filterContaminatedRelatedTours = (tours: Tour[]): Tour[] =>
  tours.filter(tour => !isContaminatedRelatedTour(tour));
