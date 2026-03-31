import type { Tour } from "../data/tours.types";

export const suppressLegacyFareHarborTour = (
  tour: Tour,
  engine6CanonicalPaths: Iterable<string>
) => {
  if (tour.engine === "engine6") {
    return false;
  }

  if (tour.bookingProvider !== "fareharbor") {
    return false;
  }

  const canonicalPath = `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`;

  const canonicalSet = new Set(engine6CanonicalPaths);
  return canonicalSet.has(canonicalPath);
};
