import type { Tour } from "./tours.types";
import { getCanonicalDestinationCitySlug } from "./destinationAliases";

export const getTourBookingPath = (tour: Tour) =>
  `/destinations/${tour.destination.stateSlug}/${getCanonicalDestinationCitySlug(
    tour.destination.stateSlug,
    tour.destination.citySlug
  )}/tours/${tour.slug}/book`;
