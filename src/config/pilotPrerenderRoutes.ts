export const PILOT_TOUR_ROUTES = [
  "/destinations/oregon/portland/tours/gorge-ous-sunset-multnomah-falls-waterfall-tour-from-portland-462223",
  "/destinations/georgia/savannah/tours/historical-bike-tour-keep-your-bike-after-362767",
  "/destinations/california/palm-springs/tours/shared-indian-canyons-hiking-tour-by-jeep-574370",
] as const;

export const PILOT_BOOKING_ROUTES = PILOT_TOUR_ROUTES.map(
  route => `${route}/book`
);

export const PILOT_PRERENDER_ROUTES = [
  ...PILOT_TOUR_ROUTES,
  ...PILOT_BOOKING_ROUTES,
] as const;

export const isPilotTourRoute = (route: string) =>
  PILOT_TOUR_ROUTES.includes(route as (typeof PILOT_TOUR_ROUTES)[number]);
