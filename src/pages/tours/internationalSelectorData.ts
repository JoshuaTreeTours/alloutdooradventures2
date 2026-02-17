import type { Tour } from "../../data/tours.types";
import type { Engine2CanadaProvinceIndexEntry } from "../../engine2/data/loadEngine2";

export const CANADA_COUNTRY_NAME = "Canada";

export type SelectorOption = {
  name: string;
  slug: string;
};

export const buildInternationalCountryOptions = (
  internationalTours: Tour[]
): string[] => {
  const countrySet = new Set(
    internationalTours
      .map(tour => tour.destination.country)
      .filter((country): country is string => Boolean(country))
  );
  countrySet.add(CANADA_COUNTRY_NAME);
  return Array.from(countrySet).sort((a, b) => a.localeCompare(b));
};

export const buildInternationalCityOptions = ({
  selectedCountry,
  selectedCanadaProvinceSlug,
  internationalTours,
  canadaProvinces,
}: {
  selectedCountry: string;
  selectedCanadaProvinceSlug: string;
  internationalTours: Tour[];
  canadaProvinces: Engine2CanadaProvinceIndexEntry[];
}): SelectorOption[] => {
  if (!selectedCountry) {
    return [];
  }

  if (selectedCountry === CANADA_COUNTRY_NAME) {
    const selectedProvince = canadaProvinces.find(
      province => province.provinceSlug === selectedCanadaProvinceSlug
    );
    if (!selectedProvince) {
      return [];
    }

    return selectedProvince.cities
      .map(city => ({ name: city.cityName, slug: city.citySlug }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  return Array.from(
    new Set(
      internationalTours
        .filter(tour => tour.destination.country === selectedCountry)
        .map(tour => tour.destination.city)
    )
  )
    .sort((a, b) => a.localeCompare(b))
    .map(city => ({ name: city, slug: city }));
};
