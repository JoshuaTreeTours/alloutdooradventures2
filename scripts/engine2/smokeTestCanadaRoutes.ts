import { worldCountriesWithTours } from "../../src/data/worldIndex";
import {
  getEngine2CanadaProvinceIndex,
  getEngine2CanadaTourBySlug,
  getEngine2CanadaTours,
} from "../../src/engine2/data/loadEngine2";
import { buildEngine2Seo } from "../../src/engine2/seo/buildEngine2Seo";
import { buildSchemaGraph } from "../../src/engine2/schema/buildSchemaGraph";
import { buildCanadaActivityGroups } from "../../src/pages/destinations/world/canadaRouteData";
import {
  buildInternationalCityOptions,
  buildInternationalCountryOptions,
  CANADA_COUNTRY_NAME,
} from "../../src/pages/tours/internationalSelectorData";

const main = () => {
  const canadaOption = worldCountriesWithTours.find(
    country => country.slug === "canada"
  );
  if (!canadaOption) {
    throw new Error(
      "Canada was not available in the international country list"
    );
  }

  const provinces = getEngine2CanadaProvinceIndex();
  if (!provinces.length)
    throw new Error("Missing /destinations/world/canada province data");
  const province = provinces[0];
  const city = province.cities[0];
  if (!city) throw new Error("Missing city route data");

  const tours = getEngine2CanadaTours().filter(
    t =>
      t.sourceProvinceSlug === province.provinceSlug &&
      t.sourceCitySlug === city.citySlug
  );
  if (!tours.length) throw new Error("Missing city tour data");

  const tour = tours[0];
  const countryRoute = "/destinations/world/canada";
  const provinceRoute = `/destinations/world/canada/${province.provinceSlug}`;
  const cityRoute = `/destinations/world/canada/${province.provinceSlug}/${city.citySlug}`;

  const hasProvinceRouteData = provinces.some(
    entry => entry.provinceSlug === province.provinceSlug
  );
  if (!hasProvinceRouteData) {
    throw new Error(`Missing province route data for ${provinceRoute}`);
  }

  const hasCityRouteData = province.cities.some(
    entry => entry.citySlug === city.citySlug
  );
  if (!hasCityRouteData) {
    throw new Error(`Missing city route data for ${cityRoute}`);
  }

  const resolved = getEngine2CanadaTourBySlug(
    province.provinceSlug,
    city.citySlug,
    tour.slug
  );
  if (!resolved) throw new Error("Tour route did not resolve");

  const countries = buildInternationalCountryOptions([]);
  if (!countries.includes(CANADA_COUNTRY_NAME)) {
    throw new Error("International dropdown countries missing Canada");
  }

  const canadaCities = buildInternationalCityOptions({
    selectedCountry: CANADA_COUNTRY_NAME,
    selectedCanadaProvinceSlug: province.provinceSlug,
    internationalTours: [],
    canadaProvinces: provinces,
  });
  if (!canadaCities.length) {
    throw new Error("Canada city selector did not populate from province data");
  }

  const canadaCitiesWithoutProvince = buildInternationalCityOptions({
    selectedCountry: CANADA_COUNTRY_NAME,
    selectedCanadaProvinceSlug: "",
    internationalTours: [],
    canadaProvinces: provinces,
  });
  if (canadaCitiesWithoutProvince.length) {
    throw new Error("Canada city selector should require a province");
  }

  const countryActivities = buildCanadaActivityGroups(getEngine2CanadaTours());
  if (!countryActivities.length) {
    throw new Error("Expected at least one Canada activity card");
  }

  const seo = buildEngine2Seo(tour);
  if (!seo.title || /{{|placeholder/i.test(seo.title)) {
    throw new Error("Invalid title in view-source equivalent");
  }
  if (!seo.description || /{{|placeholder/i.test(seo.description)) {
    throw new Error("Invalid description in view-source equivalent");
  }

  const graph = buildSchemaGraph(tour, seo);
  const types = new Set(graph.map(node => node["@type"]));
  if (
    !types.has("TouristTrip") ||
    !types.has("Product") ||
    !types.has("BreadcrumbList")
  ) {
    throw new Error("Tour schema missing TouristTrip/Product/BreadcrumbList");
  }

  console.log("Canada smoke test passed", {
    countryRoute,
    provinceRoute,
    cityRoute,
    tourRoute: tour.seo.canonicalPath,
    dropdownHref: "/destinations/world/canada",
    activityRoute: `/destinations/world/canada/activities/${countryActivities[0].slug}`,
  });
};

main();
