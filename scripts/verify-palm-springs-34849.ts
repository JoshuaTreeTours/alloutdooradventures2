import { getToursByCityUnified } from "../src/data/tours";
import { getEngine2TourByPath } from "../src/engine2/data/loadEngine2";
import { buildSchemaGraph } from "../src/engine2/schema/buildSchemaGraph";
import { buildEngine2Seo } from "../src/engine2/seo/buildEngine2Seo";

const EXPECTED_PATH =
  "/destinations/california/palm-springs/tours/shared-san-andreas-fault-jeep-tour-34849";

const fail = (message: string): never => {
  throw new Error(message);
};

const listing = getToursByCityUnified("california", "palm-springs");

const listingTour = listing.find(
  item =>
    item.href.includes("/tours/shared-san-andreas-fault-jeep-tour-34849") ||
    item.href === EXPECTED_PATH
);

if (!listingTour) {
  fail("Palm Springs listing is missing the expected 34849 tour link.");
}

const engine2Tour = getEngine2TourByPath(EXPECTED_PATH);
if (!engine2Tour) {
  fail("getEngine2TourByPath returned null for the expected canonical path.");
}

const seo = buildEngine2Seo(engine2Tour);
const graph = buildSchemaGraph(engine2Tour, seo);
const graphTypes = new Set(
  graph
    .map(node => node["@type"])
    .filter((type): type is string => typeof type === "string")
);

for (const requiredType of [
  "Product",
  "TouristTrip",
  "WebPage",
  "BreadcrumbList",
]) {
  if (!graphTypes.has(requiredType)) {
    fail(`Schema graph is missing required @type: ${requiredType}.`);
  }
}

console.log("verify:palm-springs-34849 passed");
