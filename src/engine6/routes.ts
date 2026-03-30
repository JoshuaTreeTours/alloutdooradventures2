export const ENGINE6_SPECIMEN_PRODUCT_CODE = "63657P1";
export const ENGINE6_SPECIMEN_ROUTE =
  "/destinations/california/santa-barbara/tours/santa-barbara-vineyard-to-table-taste-tour-by-e-bike";

export const ENGINE6_PARAGON_PRODUCT_CODE = "5119P13";
export const ENGINE6_PARAGON_ROUTE =
  "/destinations/nevada/las-vegas/tours/grand-canyon-west-6-in-1-tour-with-helicopter-and-landing";

export const ENGINE6_CATALINA_PRODUCT_CODE = "32779P2";

export const ENGINE6_ANTELOPE_PRODUCT_CODE = "60136P1";
export const ENGINE6_ANTELOPE_ROUTE =
  "/destinations/nevada/las-vegas/tours/antelope-canyon-horseshoe-bend-day-tour-from-las-vegas";
export const ENGINE6_EMERALD_CAVE_PRODUCT_CODE = "26719P8";
export const ENGINE6_EMERALD_CAVE_ROUTE =
  "/destinations/nevada/las-vegas/tours/emerald-cave-kayaking-tour";
export const ENGINE6_CATALINA_ROUTE =
  "/destinations/california/avalon/tours/yellow-semi-submarine-tour-of-catalina-island-from-avalon";

export const ENGINE6_YOSEMITE_PRODUCT_CODE = "36001P1";
export const ENGINE6_YOSEMITE_ROUTE =
  "/destinations/california/san-francisco/tours/yosemite-in-a-day-tour-from-san-francisco-36001p1";
export const ENGINE6_ANCHORAGE_PRIVATE_PRODUCT_CODE = "411138P3";
export const ENGINE6_ANCHORAGE_PRIVATE_ROUTE =
  "/destinations/alaska/anchorage/tours/glacier-view-and-wildlife-anchorage-adventure-tour";
export const ENGINE6_ANCHORAGE_SUNSET_PRODUCT_CODE = "100569P5";
export const ENGINE6_ANCHORAGE_GREENBELT_PRODUCT_CODE = "53474P8";
export const ENGINE6_ANCHORAGE_SUNSET_ROUTE =
  "/destinations/alaska/anchorage/tours/sunset-wilderness-wildlife-glacier-and-nature-free-photo-lessons-may-sept";
export const ENGINE6_ANCHORAGE_GREENBELT_ROUTE =
  "/destinations/alaska/anchorage/tours/anchorage-greenbelt-bike-tour-391155";
export const ENGINE6_NYC_PEDICAB_PRODUCT_CODE = "414460P1";
export const ENGINE6_NYC_PEDICAB_ROUTE =
  "/destinations/new-york/new-york/tours/1-hour-central-park-pedicab-tour-27491";
export const ENGINE6_NYC_BROOKLYN_BRIDGE_PRODUCT_CODE = "233384P2";
export const ENGINE6_NYC_BROOKLYN_BRIDGE_ROUTE =
  "/destinations/new-york/new-york/tours/brooklyn-bridge-and-waterfront-bike-tour-264853";

const ENGINE6_ROUTE_PRODUCT_CODE_BY_PATH: Record<string, string> = {
  [ENGINE6_SPECIMEN_ROUTE]: ENGINE6_SPECIMEN_PRODUCT_CODE,
  [ENGINE6_PARAGON_ROUTE]: ENGINE6_PARAGON_PRODUCT_CODE,
  [ENGINE6_CATALINA_ROUTE]: ENGINE6_CATALINA_PRODUCT_CODE,
  [ENGINE6_ANTELOPE_ROUTE]: ENGINE6_ANTELOPE_PRODUCT_CODE,
  [ENGINE6_EMERALD_CAVE_ROUTE]: ENGINE6_EMERALD_CAVE_PRODUCT_CODE,
  [ENGINE6_YOSEMITE_ROUTE]: ENGINE6_YOSEMITE_PRODUCT_CODE,
  [ENGINE6_ANCHORAGE_PRIVATE_ROUTE]: ENGINE6_ANCHORAGE_PRIVATE_PRODUCT_CODE,
  [ENGINE6_ANCHORAGE_SUNSET_ROUTE]: ENGINE6_ANCHORAGE_SUNSET_PRODUCT_CODE,
  [ENGINE6_ANCHORAGE_GREENBELT_ROUTE]: ENGINE6_ANCHORAGE_GREENBELT_PRODUCT_CODE,
  [ENGINE6_NYC_BROOKLYN_BRIDGE_ROUTE]: ENGINE6_NYC_BROOKLYN_BRIDGE_PRODUCT_CODE,
  [ENGINE6_NYC_PEDICAB_ROUTE]: ENGINE6_NYC_PEDICAB_PRODUCT_CODE,
};

export const ENGINE6_EXPLICIT_ROUTE_REPLACEMENTS = new Set<string>([
  ENGINE6_YOSEMITE_ROUTE,
  ENGINE6_ANCHORAGE_GREENBELT_ROUTE,
  ENGINE6_NYC_BROOKLYN_BRIDGE_ROUTE,
  ENGINE6_NYC_PEDICAB_ROUTE,
]);

export const resolveEngine6ProductCodeForPath = (path: string) =>
  ENGINE6_ROUTE_PRODUCT_CODE_BY_PATH[path] ?? ENGINE6_SPECIMEN_PRODUCT_CODE;

export const resolveEngine6PathForProductCode = (productCode: string) =>
  Object.entries(ENGINE6_ROUTE_PRODUCT_CODE_BY_PATH).find(
    ([, code]) => code === productCode
  )?.[0] ?? null;
