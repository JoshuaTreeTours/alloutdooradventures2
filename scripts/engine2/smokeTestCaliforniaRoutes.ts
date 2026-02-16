import { getAllEngine2Tours, getEngine2TourByPath } from "../../src/engine2/data/loadEngine2";
import { buildEngine2Seo } from "../../src/engine2/seo/buildEngine2Seo";
import { buildSchemaGraph } from "../../src/engine2/schema/buildSchemaGraph";

const main = () => {
  const tours = getAllEngine2Tours().slice(0, 3);

  if (tours.length < 3) {
    throw new Error("Need at least 3 Engine2 tours for smoke test.");
  }

  for (const tour of tours) {
    const resolved = getEngine2TourByPath(tour.seo.canonicalPath);
    if (!resolved) {
      throw new Error(`Route did not resolve for ${tour.seo.canonicalPath}`);
    }

    const seo = buildEngine2Seo(tour);
    if (!seo.title.includes(tour.name)) {
      throw new Error(`Title mismatch for ${tour.id}`);
    }
    if (!seo.description.trim()) {
      throw new Error(`Missing description for ${tour.id}`);
    }

    const graph = buildSchemaGraph(tour, seo);
    const types = new Set(graph.map(node => node["@type"]));
    if (!types.has("TouristTrip") || !types.has("Product")) {
      throw new Error(`Missing required schema types for ${tour.id}`);
    }
  }

  console.log(`Smoke test passed for ${tours.length} Engine2 sample tours.`);
};

main();
