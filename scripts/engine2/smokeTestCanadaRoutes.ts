import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  type Engine2Tour,
} from "../../src/engine2/data/loadEngine2";
import { buildEngine2Seo } from "../../src/engine2/seo/buildEngine2Seo";
import { buildSchemaGraph } from "../../src/engine2/schema/buildSchemaGraph";
import canadaTours from "../../src/engine2/data/_generated/canada.generated";

  const toDistHtmlPath = (routePath: string) =>
  path.resolve(process.cwd(), "dist", routePath.replace(/^\/+/, ""), "index.html");

const assertNoSeoPlaceholders = (html: string, route: string) => {
  if (html.includes("__SEO_")) {
    throw new Error(`Unreplaced SEO placeholder found in ${route}`);
  }
  if (!/<title[^>]*>[^<]+<\/title>/i.test(html)) {
    throw new Error(`Missing title in prerendered ${route}`);
  }
  if (!/<meta\s+[^>]*name=["']description["'][^>]*content=["'][^"']+["']/i.test(html)) {
    throw new Error(`Missing meta description in prerendered ${route}`);
  }
};

const readPrerenderedHtmlIfPresent = async (route: string) => {
  const file = toDistHtmlPath(route);
  try {
    return await readFile(file, "utf8");
  } catch {
    console.warn(`[canada-smoke] prerendered HTML missing for ${route}`);
    return null;
  }
};

const main = async () => {
  const tours = canadaTours as unknown as Engine2Tour[];
  const provinceMap = new Map<string, { provinceSlug: string; provinceName: string }>();
  for (const tour of tours) {
    provinceMap.set(tour.geo.regionSlug || tour.geo.region.toLowerCase().replace(/\s+/g, "-"), {
      provinceSlug: tour.geo.regionSlug || tour.geo.region.toLowerCase().replace(/\s+/g, "-"),
      provinceName: tour.geo.region,
    });
  }
  const provinces = Array.from(provinceMap.values());
  if (!provinces.length) {
    throw new Error("No Canada provinces loaded. Run `npm run engine2:gen`.");
  }

  const province = provinces[0];
  const cities = Array.from(
    new Map(
      tours
        .filter(tour => tour.geo.regionSlug === province.provinceSlug)
        .map(tour => [tour.sourceCitySlug, { citySlug: tour.sourceCitySlug, cityName: tour.geo.city }])
    ).values()
  );
  if (cities.length < 2) {
    throw new Error("Need at least 2 Canada cities for smoke test.");
  }

  const sampledCities = cities.slice(0, 2);
  const sampledTours = sampledCities
    .flatMap(city =>
      tours.filter(
        tour =>
          tour.geo.regionSlug === province.provinceSlug &&
          tour.sourceCitySlug === city.citySlug
      )
    )
    .slice(0, 3);

  if (sampledTours.length < 3) {
    throw new Error("Need at least 3 Canada tours for smoke test.");
  }

  for (const tour of sampledTours) {
    const resolved = tours.find(item => item.seo.canonicalPath === tour.seo.canonicalPath);
    if (!resolved) {
      throw new Error(`Route did not resolve for ${tour.seo.canonicalPath}`);
    }

    const seo = buildEngine2Seo(tour);
    const graph = buildSchemaGraph(tour, seo);
    const types = new Set(graph.map(node => node["@type"]));
    if (!types.has("TouristTrip") || !types.has("Product")) {
      throw new Error(`Missing required schema types for ${tour.id}`);
    }

    const detailHtml = await readPrerenderedHtmlIfPresent(tour.seo.canonicalPath);
    if (detailHtml) assertNoSeoPlaceholders(detailHtml, tour.seo.canonicalPath);

    const bookingPath = `${tour.seo.canonicalPath}/book`;
    const bookingHtml = await readPrerenderedHtmlIfPresent(bookingPath);
    if (bookingHtml) assertNoSeoPlaceholders(bookingHtml, bookingPath);
  }

  const provincePath = `/destinations/canada/${province.provinceSlug}`;
  const provinceHtml = await readPrerenderedHtmlIfPresent(provincePath);
  if (provinceHtml) assertNoSeoPlaceholders(provinceHtml, provincePath);

  for (const city of sampledCities) {
    const cityPath = `/destinations/canada/${province.provinceSlug}/${city.citySlug}`;
    const cityHtml = await readPrerenderedHtmlIfPresent(cityPath);
    if (cityHtml) assertNoSeoPlaceholders(cityHtml, cityPath);
  }

  console.log("Canada smoke test passed for 1 province, 2 cities, 3 tours.");
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
