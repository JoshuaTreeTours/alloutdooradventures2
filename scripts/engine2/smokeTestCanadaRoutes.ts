import { worldCountriesWithTours } from "../../src/data/worldIndex";
import {
  getEngine2CanadaProvinceIndex,
  getEngine2CanadaTourBySlug,
  getEngine2CanadaTours,
} from "../../src/engine2/data/loadEngine2";
import { buildEngine2Seo } from "../../src/engine2/seo/buildEngine2Seo";
import { buildSchemaGraph } from "../../src/engine2/schema/buildSchemaGraph";
import { buildCanadaActivityGroups } from "../../src/pages/destinations/world/canadaRouteData";

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
  const resolved = getEngine2CanadaTourBySlug(
    province.provinceSlug,
    city.citySlug,
    tour.slug
  );
  if (!resolved) throw new Error("Tour route did not resolve");

  if (!provinces[0].cities.length) {
    throw new Error("Expected at least one province city chip entry");
  }

  const countryActivities = buildCanadaActivityGroups(getEngine2CanadaTours());
  if (!countryActivities.length) {
    throw new Error("Expected at least one Canada activity card");
  }

  const seo = buildEngine2Seo(tour);
  if (!seo.title || /{{|placeholder/i.test(seo.title))
    throw new Error("Invalid title in view-source equivalent");
  if (!seo.description || /{{|placeholder/i.test(seo.description))
    throw new Error("Invalid description in view-source equivalent");

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
    countryRoute: "/destinations/world/canada",
    provinceRoute: `/destinations/world/canada/${province.provinceSlug}`,
    cityRoute: `/destinations/world/canada/${province.provinceSlug}/${city.citySlug}`,
    tourRoute: tour.seo.canonicalPath,
    dropdownHref: "/destinations/world/canada",
    activityRoute: `/destinations/world/canada/activities/${countryActivities[0].slug}`,
  });
};

main();
