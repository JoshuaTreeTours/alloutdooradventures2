export const ENGINE6_HILO_PILOT_PRODUCT_CODE = "11069P1";
export const ENGINE6_HILO_PILOT_STATE_SLUG = "hawaii";
export const ENGINE6_HILO_PILOT_CITY_SLUG = "hilo";
export const ENGINE6_HILO_PILOT_TOUR_SLUG =
  "private-tour-hawaii-volcanoes-national-park-eco-tour-11069p1";

export const isEngine6HiloPilotRoute = (
  stateSlug: string,
  citySlug: string,
  tourSlug: string
) =>
  stateSlug === ENGINE6_HILO_PILOT_STATE_SLUG &&
  citySlug === ENGINE6_HILO_PILOT_CITY_SLUG &&
  tourSlug === ENGINE6_HILO_PILOT_TOUR_SLUG;
