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
export const ENGINE6_NYC_CLASSIC_MANHATTAN_EBIKE_PRODUCT_CODE = "3156P13";
export const ENGINE6_NYC_CLASSIC_MANHATTAN_EBIKE_ROUTE =
  "/destinations/new-york/new-york/tours/best-of-nyc-electric-bike-tour-202168";
export const ENGINE6_SAN_DIEGO_ZOO_COMBO_PRODUCT_CODE = "3097SDZSP_2VISIT";
export const ENGINE6_SAN_DIEGO_ZOO_COMBO_ROUTE =
  "/destinations/california/san-diego/tours/san-diego-zoo-and-safari-park-2-visit-pass-ticket";
export const ENGINE6_SAN_DIEGO_JOSHUA_TREE_PRODUCT_CODE = "447234P3";
export const ENGINE6_SAN_DIEGO_JOSHUA_TREE_ROUTE =
  "/destinations/california/san-diego/tours/joshua-tree-national-park-day-trip-from-san-diego";
export const ENGINE6_SAN_DIEGO_SUNSET_SAILING_PRODUCT_CODE = "5584233P1";
export const ENGINE6_SAN_DIEGO_SUNSET_SAILING_ROUTE =
  "/destinations/california/san-diego/tours/spectacular-sunset-sail-on-san-diego-bay";
export const ENGINE6_PALM_SPRINGS_SUNRISE_HIKE_PRODUCT_CODE = "327321P1";
export const ENGINE6_PALM_SPRINGS_SUNRISE_HIKE_ROUTE =
  "/destinations/california/palm-springs/tours/mountain-sunrise-hike-and-meditation-in-palm-springs";

import type { Engine6ReplacementModeConfig } from "./replacementMode";

const ENGINE6_REPLACEMENT_MODE_CONFIGS: Engine6ReplacementModeConfig[] = [
  {
    productCode: ENGINE6_ANCHORAGE_GREENBELT_PRODUCT_CODE,
    canonicalPath: ENGINE6_ANCHORAGE_GREENBELT_ROUTE,
    bookingPath: `${ENGINE6_ANCHORAGE_GREENBELT_ROUTE}/book`,
    eligibility: {
      legacyTitle: "Anchorage Greenbelt Bike Tour",
      legacyPriceAmount: 159,
      legacyMeetingPoint: "Dena’ina Civic and Convention Center, Anchorage, AK",
    },
  },
  {
    productCode: ENGINE6_NYC_PEDICAB_PRODUCT_CODE,
    canonicalPath: ENGINE6_NYC_PEDICAB_ROUTE,
    bookingPath: `${ENGINE6_NYC_PEDICAB_ROUTE}/book`,
    eligibility: {
      legacyTitle: "VIP Central Park Pedicab Guided Tour",
      legacyPriceAmount: 50,
      legacyMeetingPoint: "10 Central Park South, New York, NY",
    },
  },
  {
    productCode: ENGINE6_NYC_BROOKLYN_BRIDGE_PRODUCT_CODE,
    canonicalPath: ENGINE6_NYC_BROOKLYN_BRIDGE_ROUTE,
    bookingPath: `${ENGINE6_NYC_BROOKLYN_BRIDGE_ROUTE}/book`,
    eligibility: {
      legacyTitle: "Brooklyn Bridge Waterfront Guided Bike Tour",
      legacyPriceAmount: 62,
      legacyMeetingPoint: "Lower Manhattan, New York City",
    },
  },
  {
    productCode: ENGINE6_NYC_CLASSIC_MANHATTAN_EBIKE_PRODUCT_CODE,
    canonicalPath: ENGINE6_NYC_CLASSIC_MANHATTAN_EBIKE_ROUTE,
    bookingPath: `${ENGINE6_NYC_CLASSIC_MANHATTAN_EBIKE_ROUTE}/book`,
    eligibility: {
      legacyTitle: "Classic Manhattan Electric Bike Tour",
      legacyPriceAmount: 103,
      legacyMeetingPoint: "79 Chambers Street, New York, NY",
    },
  },
];

const ENGINE6_REPLACEMENT_MODE_BY_PRODUCT_CODE: Record<
  string,
  Engine6ReplacementModeConfig
> = Object.fromEntries(
  ENGINE6_REPLACEMENT_MODE_CONFIGS.map(config => [config.productCode, config])
);

const ENGINE6_ROUTE_PRODUCT_CODE_ENTRIES = [
  [ENGINE6_SPECIMEN_ROUTE, ENGINE6_SPECIMEN_PRODUCT_CODE],
  [ENGINE6_PARAGON_ROUTE, ENGINE6_PARAGON_PRODUCT_CODE],
  [ENGINE6_CATALINA_ROUTE, ENGINE6_CATALINA_PRODUCT_CODE],
  [ENGINE6_ANTELOPE_ROUTE, ENGINE6_ANTELOPE_PRODUCT_CODE],
  [ENGINE6_EMERALD_CAVE_ROUTE, ENGINE6_EMERALD_CAVE_PRODUCT_CODE],
  [ENGINE6_YOSEMITE_ROUTE, ENGINE6_YOSEMITE_PRODUCT_CODE],
  [ENGINE6_ANCHORAGE_PRIVATE_ROUTE, ENGINE6_ANCHORAGE_PRIVATE_PRODUCT_CODE],
  [ENGINE6_ANCHORAGE_SUNSET_ROUTE, ENGINE6_ANCHORAGE_SUNSET_PRODUCT_CODE],
  [ENGINE6_ANCHORAGE_GREENBELT_ROUTE, ENGINE6_ANCHORAGE_GREENBELT_PRODUCT_CODE],
  [ENGINE6_NYC_BROOKLYN_BRIDGE_ROUTE, ENGINE6_NYC_BROOKLYN_BRIDGE_PRODUCT_CODE],
  [ENGINE6_NYC_PEDICAB_ROUTE, ENGINE6_NYC_PEDICAB_PRODUCT_CODE],
  [
    ENGINE6_NYC_CLASSIC_MANHATTAN_EBIKE_ROUTE,
    ENGINE6_NYC_CLASSIC_MANHATTAN_EBIKE_PRODUCT_CODE,
  ],
  [ENGINE6_SAN_DIEGO_ZOO_COMBO_ROUTE, ENGINE6_SAN_DIEGO_ZOO_COMBO_PRODUCT_CODE],
  [
    ENGINE6_SAN_DIEGO_JOSHUA_TREE_ROUTE,
    ENGINE6_SAN_DIEGO_JOSHUA_TREE_PRODUCT_CODE,
  ],
  [
    ENGINE6_SAN_DIEGO_SUNSET_SAILING_ROUTE,
    ENGINE6_SAN_DIEGO_SUNSET_SAILING_PRODUCT_CODE,
  ],
  [
    ENGINE6_PALM_SPRINGS_SUNRISE_HIKE_ROUTE,
    ENGINE6_PALM_SPRINGS_SUNRISE_HIKE_PRODUCT_CODE,
  ],
] as const;

const ENGINE6_ROUTE_PRODUCT_CODE_BY_PATH: Record<string, string> =
  Object.fromEntries(ENGINE6_ROUTE_PRODUCT_CODE_ENTRIES);

const ENGINE6_PATH_BY_PRODUCT_CODE: Record<string, string> = Object.fromEntries(
  ENGINE6_ROUTE_PRODUCT_CODE_ENTRIES.map(([path, productCode]) => [
    productCode,
    path,
  ])
);

export const ENGINE6_EXPLICIT_ROUTE_REPLACEMENTS = new Set<string>([
  ENGINE6_YOSEMITE_ROUTE,
  ...ENGINE6_REPLACEMENT_MODE_CONFIGS.map(config => config.canonicalPath),
]);

export const resolveEngine6ProductCodeForPath = (path: string) =>
  ENGINE6_ROUTE_PRODUCT_CODE_BY_PATH[path] ?? null;

export const resolveEngine6PathForProductCode = (productCode: string) =>
  ENGINE6_PATH_BY_PRODUCT_CODE[productCode] ?? null;

export const resolveEngine6ReplacementMode = (productCode: string) =>
  ENGINE6_REPLACEMENT_MODE_BY_PRODUCT_CODE[productCode] ?? null;

export const isEngine6CanonicalPath = (path: string) =>
  Boolean(resolveEngine6ProductCodeForPath(path));

export const engine6ReplacementModeConfigs = ENGINE6_REPLACEMENT_MODE_CONFIGS;
