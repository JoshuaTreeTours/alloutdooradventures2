import type { Tour } from "./tours.types";

export const getTourBookingPath = (tour: Tour) =>
  `/tours/${tour.destination.stateSlug}/${tour.destination.citySlug}/${tour.slug}/book`;
