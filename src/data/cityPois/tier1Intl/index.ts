import { normalizePlaceName } from "../../../utils/geo";
import type { IntlCityPoi } from "./types";
import { pois as edinburgh } from "./united-kingdom/edinburgh";
import { pois as rome } from "./italy/rome";
import { pois as florence } from "./italy/florence";
import { pois as barcelona } from "./spain/barcelona";
import { pois as madrid } from "./spain/madrid";
import { pois as lisbon } from "./portugal/lisbon";
import { pois as amsterdam } from "./netherlands/amsterdam";
import { pois as berlin } from "./germany/berlin";
import { pois as vienna } from "./austria/vienna";
import { pois as sydney } from "./australia/sydney";

export type { IntlCityPoi } from "./types";

export const tier1IntlCityPois: IntlCityPoi[] = [
  ...edinburgh,
  ...rome,
  ...florence,
  ...barcelona,
  ...madrid,
  ...lisbon,
  ...amsterdam,
  ...berlin,
  ...vienna,
  ...sydney,
];

const buildPoiIndex = () => {
  const index = new Map<string, IntlCityPoi[]>();
  tier1IntlCityPois.forEach((poi) => {
    const key = `${poi.countrySlug}/${poi.citySlug}`;
    const list = index.get(key) ?? [];
    list.push(poi);
    index.set(key, list);
  });
  return index;
};

let poiIndex: Map<string, IntlCityPoi[]> | null = null;

export const getTier1IntlPoisForCity = (
  countrySlug: string,
  citySlug: string,
) => {
  if (!poiIndex) {
    poiIndex = buildPoiIndex();
  }

  return poiIndex.get(`${countrySlug}/${citySlug}`) ?? [];
};

export const getTier1IntlPoiNameSet = (
  countrySlug: string,
  citySlug: string,
) =>
  new Set(
    getTier1IntlPoisForCity(countrySlug, citySlug).map((poi) =>
      normalizePlaceName(poi.name),
    ),
  );
