import { normalizePlaceName } from "../../../../utils/geo";
import type { Tier1WorldCityPoi } from "./types";
import { pois as edinburgh } from "./united-kingdom/edinburgh";
import { pois as london } from "./united-kingdom/london";
import { pois as rome } from "./italy/rome";
import { pois as florence } from "./italy/florence";
import { pois as barcelona } from "./spain/barcelona";
import { pois as madrid } from "./spain/madrid";
import { pois as lisbon } from "./portugal/lisbon";
import { pois as amsterdam } from "./netherlands/amsterdam";
import { pois as berlin } from "./germany/berlin";
import { pois as vienna } from "./austria/vienna";
import { pois as paris } from "./france/paris";

export type { Tier1WorldCityPoi } from "./types";

const tier1IntlPoiMap: Record<string, Tier1WorldCityPoi[]> = {
  "united-kingdom/edinburgh": edinburgh,
  "united-kingdom/london": london,
  "italy/rome": rome,
  "italy/florence": florence,
  "spain/barcelona": barcelona,
  "spain/madrid": madrid,
  "portugal/lisbon": lisbon,
  "netherlands/amsterdam": amsterdam,
  "germany/berlin": berlin,
  "austria/vienna": vienna,
  "france/paris": paris,
};

export const tier1IntlCityPois = Object.values(tier1IntlPoiMap).flat();

export const getTier1IntlPoisForCity = (
  countrySlug: string,
  citySlug: string,
) => {
  return tier1IntlPoiMap[`${countrySlug}/${citySlug}`] ?? [];
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
