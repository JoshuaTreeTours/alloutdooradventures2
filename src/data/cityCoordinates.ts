import { CITY_TIER1_INTL } from "./cityTier1Intl";
import { states } from "./destinations";

export type CityCoordinates = {
  lat: number;
  lng: number;
};

const CITY_COORDINATE_OVERRIDES: Record<string, CityCoordinates> = {
  "california/joshua-tree": { lat: 34.1347, lng: -116.3131 },
  "california/newport-beach": { lat: 33.6189, lng: -117.9298 },
  "california/laguna-beach": { lat: 33.5427, lng: -117.7854 },
  "california/anaheim": { lat: 33.8366, lng: -117.9143 },
  "california/long-beach": { lat: 33.7701, lng: -118.1937 },
  "california/san-jose": { lat: 37.3382, lng: -121.8863 },
  "california/sacramento": { lat: 38.5816, lng: -121.4944 },
  "illinois/chicago": { lat: 41.8781, lng: -87.6298 },
  "arizona/phoenix": { lat: 33.4484, lng: -112.074 },
  "massachusetts/boston": { lat: 42.3601, lng: -71.0589 },
  "new-york/new-york": { lat: 40.7128, lng: -74.006 },
  "district-of-columbia/washington": { lat: 38.9072, lng: -77.0369 },
};

const buildCityCoordinateIndex = () => {
  const index = new Map<string, CityCoordinates>();

  states.forEach((state) => {
    state.cities.forEach((city) => {
      index.set(`${state.slug}/${city.slug}`, { lat: city.lat, lng: city.lng });
    });
  });

  Object.entries(CITY_COORDINATE_OVERRIDES).forEach(([key, value]) => {
    index.set(key, value);
  });

  CITY_TIER1_INTL.forEach((city) => {
    if (city.lat !== undefined && city.lng !== undefined) {
      index.set(`${city.countrySlug}/${city.citySlug}`, {
        lat: city.lat,
        lng: city.lng,
      });
    }
  });

  return index;
};

let cityCoordinateIndex: Map<string, CityCoordinates> | null = null;

export const getCityCoordinates = (
  parentSlug: string,
  citySlug: string,
): CityCoordinates | null => {
  if (!cityCoordinateIndex) {
    cityCoordinateIndex = buildCityCoordinateIndex();
  }

  return cityCoordinateIndex.get(`${parentSlug}/${citySlug}`) ?? null;
};
