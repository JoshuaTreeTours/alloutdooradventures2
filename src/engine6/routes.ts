export type Engine6RouteSpec = {
  productCode: string;
  route: string;
  listingId: string;
  stateSlug: string;
  citySlug: string;
  activitySlugs: string[];
};

export const ENGINE6_ROUTE_SPECS: Engine6RouteSpec[] = [
  {
    productCode: "163873P16",
    route:
      "/destinations/utah/springdale/tours/east-zion-top-of-the-world-jeep-tour",
    listingId: "engine6-163873P16",
    stateSlug: "utah",
    citySlug: "springdale",
    activitySlugs: ["detours"],
  },
  {
    productCode: "132218P75",
    route:
      "/destinations/nevada/las-vegas/tours/grand-canyon-skywalk-hoover-dam-day-trip-from-las-vegas",
    listingId: "engine6-132218P75",
    stateSlug: "nevada",
    citySlug: "las-vegas",
    activitySlugs: ["detours"],
  },
  {
    productCode: "73781P4",
    route:
      "/destinations/nevada/las-vegas/tours/red-rock-canyon-and-seven-magic-mountains-tour",
    listingId: "engine6-73781P4",
    stateSlug: "nevada",
    citySlug: "las-vegas",
    activitySlugs: ["detours"],
  },
];

export const ENGINE6_SPECIMEN_PRODUCT_CODE = "163873P16";
export const ENGINE6_SPECIMEN_ROUTE = ENGINE6_ROUTE_SPECS[0].route;
export const ENGINE6_GRAND_CANYON_PRODUCT_CODE = "132218P75";
export const ENGINE6_GRAND_CANYON_ROUTE = ENGINE6_ROUTE_SPECS[1].route;
export const ENGINE6_PRODUCTION_ROUTE_SPECS = ENGINE6_ROUTE_SPECS.filter(
  spec => spec.productCode !== ENGINE6_SPECIMEN_PRODUCT_CODE
);

export const getEngine6RouteSpecByProductCode = (productCode: string) =>
  ENGINE6_ROUTE_SPECS.find(
    spec => spec.productCode.toUpperCase() === productCode.trim().toUpperCase()
  ) ?? null;
