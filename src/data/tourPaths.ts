import type { Tour } from "./tours.types";

export const getTourBookingPath = (tour: Tour) =>
  `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}/book`;
