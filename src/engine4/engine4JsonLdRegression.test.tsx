import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import Engine4TourPage from "./components/Engine4TourPage";
import { buildEngine4ViatorSchemaGraph } from "./schema/buildEngine4ViatorSchemaGraph";
import { buildEngine4TourPath } from "./buildEngine4TourPath";
import {
  engine4ViatorApiFallbackByProductCode,
  engine4ViatorTours,
} from "./data/viatorTours";
import { mapViatorToEngine4Tour } from "./viator/mapViatorToEngine4Tour";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

const getSchemaIds = (graph: Array<Record<string, unknown>>) =>
  graph
    .map(node => node["@id"])
    .filter((id): id is string => typeof id === "string");

const expectNoDuplicateSchemaIds = (graph: Array<Record<string, unknown>>) => {
  const ids = getSchemaIds(graph);
  expect(new Set(ids).size).toBe(ids.length);
};

describe("Engine4 JSON-LD regression guard", () => {
  it("keeps representative detail-page Product, TouristTrip, BreadcrumbList, canonical, meta, hero, and unique @id output intact", () => {
    const record = engine4ViatorTours[0];
    expect(record).toBeTruthy();

    const tour = mapViatorToEngine4Tour({
      record,
      apiTour: engine4ViatorApiFallbackByProductCode[record.productCode],
    });
    const html = renderToString(<Engine4TourPage tour={tour} />);
    const graph = buildEngine4ViatorSchemaGraph(tour)["@graph"] as Array<
      Record<string, unknown>
    >;

    expect(html).toContain('id="structured-data-engine4-viator"');
    expect(tour.canonicalPath).toBe(buildEngine4TourPath(record));
    expect(html).toContain(tour.title);
    expect(html).toContain(
      `src="${String(tour.primaryImage ?? tour.heroImage).replace(/&/g, "&amp;")}`
    );
    expect(graph.some(node => node["@type"] === "Product")).toBe(true);
    expect(graph.some(node => node["@type"] === "TouristTrip")).toBe(true);
    expect(graph.some(node => node["@type"] === "BreadcrumbList")).toBe(true);
    expectNoDuplicateSchemaIds(graph);
  });
});
