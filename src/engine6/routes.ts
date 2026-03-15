export const ENGINE6_PILOT_PRODUCT_CODE = "11069P1";
export const ENGINE6_PILOT_SLUG =
  "private-tour-hawaii-volcanoes-national-park-eco-tour-11069p1";
export const ENGINE6_PILOT_CANONICAL_PATH =
  "/destinations/hawaii/hilo/tours/private-tour-hawaii-volcanoes-national-park-eco-tour-11069p1";

export const isEngine6PilotTourRoute = (
  stateSlug: string,
  citySlug: string,
  tourSlug: string
) =>
  stateSlug === "hawaii" &&
  citySlug === "hilo" &&
  tourSlug === ENGINE6_PILOT_SLUG;
