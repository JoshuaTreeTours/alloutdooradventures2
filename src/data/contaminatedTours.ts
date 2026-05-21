const CONTAMINATED_ROUTE_PATHS = [
  "/destinations/united-states/alaska/anchorage/tours/14-day-kenyan-tribes-conservation-and-animals-517077",
  "/destinations/united-states/alaska/anchorage/tours/16-day-madagascar-palaces-parks-lemurs-and-baobabs-517088",
  "/destinations/united-states/alaska/anchorage/tours/19-day-tribes-and-rock-hewn-churches-of-ethiopia-517079",
  "/destinations/united-states/alaska/anchorage/tours/8-day-zanzibar-the-spice-island-mangroves-and-stonetown-517094",
  "/destinations/united-states/alaska/anchorage/tours/9-days-across-the-savannah-of-tanzania-520051",
] as const;

const CONTAMINATED_PRODUCT_IDS = ["517077", "517088", "517079", "517094", "520051"] as const;

const CONTAMINATED_SLUGS = [
  "14-day-kenyan-tribes-conservation-and-animals-517077",
  "16-day-madagascar-palaces-parks-lemurs-and-baobabs-517088",
  "19-day-tribes-and-rock-hewn-churches-of-ethiopia-517079",
  "8-day-zanzibar-the-spice-island-mangroves-and-stonetown-517094",
  "9-days-across-the-savannah-of-tanzania-520051",
] as const;

const CONTAMINATED_TITLES = [
  "14-Day Kenyan Tribes, Conservation and Animals",
  "16-Day Madagascar Palaces, Parks, Lemurs, and Baobabs",
  "19-Day Tribes and Rock Hewn Churches of Ethiopia",
  "8-Day Zanzibar - The Spice Island, Mangroves and Stonetown",
  "9 Days Across the Savannah of Tanzania",
] as const;

const normalizePath = (value: string) => value.trim().replace(/\/+$/, "").toLowerCase();
const normalizeString = (value: string) => value.trim().toLowerCase();

const CONTAMINATED_PATH_SET = new Set(CONTAMINATED_ROUTE_PATHS.map(normalizePath));
const CONTAMINATED_ID_SET = new Set(CONTAMINATED_PRODUCT_IDS.map(normalizeString));
const CONTAMINATED_SLUG_SET = new Set(CONTAMINATED_SLUGS.map(normalizeString));
const CONTAMINATED_TITLE_SET = new Set(CONTAMINATED_TITLES.map(normalizeString));

export const contaminatedRoutePaths = CONTAMINATED_ROUTE_PATHS;

export const isContaminatedPath = (path?: string | null) =>
  Boolean(path) && CONTAMINATED_PATH_SET.has(normalizePath(path!));

export const isContaminatedProductId = (value?: string | null) =>
  Boolean(value) && CONTAMINATED_ID_SET.has(normalizeString(value!));

export const isContaminatedSlug = (value?: string | null) =>
  Boolean(value) && CONTAMINATED_SLUG_SET.has(normalizeString(value!));

export const isContaminatedTitle = (value?: string | null) =>
  Boolean(value) && CONTAMINATED_TITLE_SET.has(normalizeString(value!));

export const isContaminatedTourRecord = (input: {
  canonicalPath?: string | null;
  productId?: string | null;
  slug?: string | null;
  title?: string | null;
}) =>
  isContaminatedPath(input.canonicalPath) ||
  isContaminatedProductId(input.productId) ||
  isContaminatedSlug(input.slug) ||
  isContaminatedTitle(input.title);

export const contaminatedProductIds = CONTAMINATED_PRODUCT_IDS;
