import {
  getEngine2CanadaProvinceIndex,
  getEngine2CanadaTourBySlug,
  getEngine2CanadaTours,
} from "../../src/engine2/data/loadEngine2";
import { buildEngine2Seo } from "../../src/engine2/seo/buildEngine2Seo";
import { buildSchemaGraph } from "../../src/engine2/schema/buildSchemaGraph";

const main = () => {
  const provinces = getEngine2CanadaProvinceIndex();
  if (!provinces.length) throw new Error("Missing /destinations/world/canada province data");
  const province = provinces[0];
  const city = province.cities[0];
  if (!city) throw new Error("Missing city route data");

  const tours = getEngine2CanadaTours().filter(
    t => t.sourceProvinceSlug === province.provinceSlug && t.sourceCitySlug === city.citySlug
  );
  if (!tours.length) throw new Error("Missing city tour data");

  const tour = tours[0];
  const resolved = getEngine2CanadaTourBySlug(province.provinceSlug, city.citySlug, tour.slug);
  if (!resolved) throw new Error("Tour route did not resolve");

  const seo = buildEngine2Seo(tour);
  if (!seo.title || /{{|placeholder/i.test(seo.title)) throw new Error("Invalid title in view-source equivalent");
  if (!seo.description || /{{|placeholder/i.test(seo.description)) throw new Error("Invalid description in view-source equivalent");

  const graph = buildSchemaGraph(tour, seo);
  const types = new Set(graph.map(node => node["@type"]));
  if (!types.has("TouristTrip") || !types.has("Product") || !types.has("BreadcrumbList")) {
    throw new Error("Tour schema missing TouristTrip/Product/BreadcrumbList");
  }

  console.log("Canada smoke test passed", {
    countryRoute: "/destinations/world/canada",
    provinceRoute: `/destinations/world/canada/${province.provinceSlug}`,
    cityRoute: `/destinations/world/canada/${province.provinceSlug}/${city.citySlug}`,
    tourRoute: tour.seo.canonicalPath,
  });
};

main();
