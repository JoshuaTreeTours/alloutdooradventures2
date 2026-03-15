export const ENGINE6_PILOT_PRODUCT_CODE = "421920P2";
export const ENGINE6_PILOT_TOUR_SLUG =
  "epic-zipline-tour-over-the-santa-ynez-valley-421920p2";

export const ENGINE6_PILOT_CANONICAL_PATH =
  "/destinations/california/santa-barbara/tours/epic-zipline-tour-over-the-santa-ynez-valley-421920p2";

export const isEngine6PilotRoute = (
  stateSlug: string,
  citySlug: string,
  tourSlug: string
): boolean =>
  stateSlug === "california" &&
  citySlug === "santa-barbara" &&
  tourSlug === ENGINE6_PILOT_TOUR_SLUG;
