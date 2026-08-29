export type Tier1IntlCity = {
  countrySlug: string;
  citySlug: string;
  cityName: string;
  lat?: number;
  lng?: number;
};

export const CITY_TIER1_INTL: Tier1IntlCity[] = [
  {
    countrySlug: "mexico",
    citySlug: "cancun",
    cityName: "Cancun",
    lat: 21.1619,
    lng: -86.8515,
  },
  {
    countrySlug: "scotland",
    citySlug: "edinburgh",
    cityName: "Edinburgh",
    lat: 55.9533,
    lng: -3.1883,
  },
  {
    countrySlug: "italy",
    citySlug: "rome",
    cityName: "Rome",
    lat: 41.9028,
    lng: 12.4964,
  },
  {
    countrySlug: "italy",
    citySlug: "venice",
    cityName: "Venice",
    lat: 45.4408,
    lng: 12.3155,
  },
  {
    countrySlug: "italy",
    citySlug: "florence",
    cityName: "Florence",
    lat: 43.7696,
    lng: 11.2558,
  },
  {
    countrySlug: "spain",
    citySlug: "barcelona",
    cityName: "Barcelona",
    lat: 41.3874,
    lng: 2.1686,
  },
  {
    countrySlug: "spain",
    citySlug: "madrid",
    cityName: "Madrid",
    lat: 40.4168,
    lng: -3.7038,
  },
  {
    countrySlug: "portugal",
    citySlug: "lisbon",
    cityName: "Lisbon",
    lat: 38.7223,
    lng: -9.1393,
  },
  {
    countrySlug: "netherlands",
    citySlug: "amsterdam",
    cityName: "Amsterdam",
    lat: 52.3676,
    lng: 4.9041,
  },
  {
    countrySlug: "germany",
    citySlug: "berlin",
    cityName: "Berlin",
    lat: 52.52,
    lng: 13.405,
  },
  {
    countrySlug: "austria",
    citySlug: "vienna",
    cityName: "Vienna",
    lat: 48.2082,
    lng: 16.3738,
  },
  {
    countrySlug: "australia",
    citySlug: "sydney",
    cityName: "Sydney",
    lat: -33.8688,
    lng: 151.2093,
  },
];

const tier1IntlSet = new Set(
  CITY_TIER1_INTL.map((city) => `${city.countrySlug}/${city.citySlug}`),
);

export const isTier1IntlCity = (countrySlug: string, citySlug: string) =>
  tier1IntlSet.has(`${countrySlug}/${citySlug}`);

export const getTier1IntlCityCoordinates = (
  countrySlug: string,
  citySlug: string,
) =>
  CITY_TIER1_INTL.find(
    (city) =>
      city.countrySlug === countrySlug && city.citySlug === citySlug,
  ) ?? null;
