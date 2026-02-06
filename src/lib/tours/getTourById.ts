import { tours } from "../../data/tours";
import type { Tour } from "../../data/tours.types";

export type NormalizedTour = Tour;

export function getTourById(id: string | number): NormalizedTour | null {
  const normalizedId = String(id).trim();
  if (!normalizedId) {
    return null;
  }

  return tours.find(tour => {
    if (tour.id === normalizedId) {
      return true;
    }

    const match = tour.id.match(/-(\d+)$/);
    return Boolean(match?.[1] && match[1] === normalizedId);
  }) ?? null;
}
