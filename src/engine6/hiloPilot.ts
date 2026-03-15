export const ENGINE6_HILO_PILOT_PRODUCT_CODE = "11069P1";
export const ENGINE6_HILO_PILOT_STATE_SLUG = "hawaii";
export const ENGINE6_HILO_PILOT_CITY_SLUG = "hilo";
export const ENGINE6_HILO_PILOT_TOUR_SLUG =
  "private-tour-hawaii-volcanoes-national-park-eco-tour-11069p1";

export const ENGINE6_HILO_PILOT_API_PATH = "/api/engine6/viator-product";

export const ENGINE6_HILO_PRICE_PATHS = [
  "fromPrice",
  "priceFrom",
  "pricing.summary.fromPrice",
  "pricing.summary.fromPriceFormatted",
  "pricing.fromPrice",
  "pricing.price.from",
  "pricing.priceFrom",
  "pricing.amount",
  "pricing.amounts.from",
  "pricing.amounts.fromPrice",
  "price.amount",
  "price.formatted",
  "offers.fromPrice",
  "offer.fromPrice",
  "bookingOptions.0.price.fromPrice",
  "bookingOptions.0.price.amount",
  "bookableItems.0.seasonalPricingRecords.0.pricingDetails.0.price.original.recommendedRetailPrice",
  "bookableItems.0.seasonalPricingRecords.0.pricingDetails.0.price.partnerNetPrice",
] as const;

export const isEngine6HiloPilotRoute = (
  stateSlug: string,
  citySlug: string,
  tourSlug: string
) =>
  stateSlug === ENGINE6_HILO_PILOT_STATE_SLUG &&
  citySlug === ENGINE6_HILO_PILOT_CITY_SLUG &&
  tourSlug === ENGINE6_HILO_PILOT_TOUR_SLUG;
