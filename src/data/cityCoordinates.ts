import { states } from "./destinations";

export type CityCoordinates = {
  lat: number;
  lng: number;
};

const CITY_COORDINATE_OVERRIDES: Record<string, CityCoordinates> = {
  "california/joshua-tree": { lat: 34.1347, lng: -116.3131 },
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
