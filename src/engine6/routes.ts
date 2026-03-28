export const ENGINE6_SPECIMEN_PRODUCT_CODE = "63657P1";
export const ENGINE6_SPECIMEN_ROUTE =
  "/destinations/california/santa-barbara/tours/santa-barbara-vineyard-to-table-taste-tour-by-e-bike";

export const ENGINE6_PARAGON_PRODUCT_CODE = "5119P13";
export const ENGINE6_PARAGON_ROUTE =
  "/destinations/nevada/las-vegas/tours/grand-canyon-west-6-in-1-tour-with-helicopter-and-landing";

const ENGINE6_ROUTE_PRODUCT_CODE_BY_PATH: Record<string, string> = {
  [ENGINE6_SPECIMEN_ROUTE]: ENGINE6_SPECIMEN_PRODUCT_CODE,
  [ENGINE6_PARAGON_ROUTE]: ENGINE6_PARAGON_PRODUCT_CODE,
};

export const resolveEngine6ProductCodeForPath = (path: string) =>
  ENGINE6_ROUTE_PRODUCT_CODE_BY_PATH[path] ?? ENGINE6_SPECIMEN_PRODUCT_CODE;
