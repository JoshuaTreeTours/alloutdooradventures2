import { writeFileSync } from "node:fs";

import { tours } from "../src/data/tours";
import { engine6ResolvedTours } from "../src/engine6/registry";
import { buildEngine6SchemaGraph } from "../src/engine6/schema/buildEngine6SchemaGraph";
import { resolveTourSchemaActivityLabel } from "../src/schema/resolveTourSchemaActivityLabel";

const GENERIC_TOURIST_TYPES = new Set([
  "Adventure travelers",
  "Outdoor enthusiasts",
  "General travelers",
]);

type SchemaValues = {
  productCategory?: unknown;
  touristType?: unknown;
};

const readGraphValues = (
  graph: Array<Record<string, unknown>>
): SchemaValues => {
  const product = graph.find(node => node["@type"] === "Product");
  const trip = graph.find(node => node["@type"] === "TouristTrip");

  return {
    productCategory: product?.category,
    touristType: trip?.touristType,
  };
};

const legacyTours = tours.filter(tour => tour.engine !== "engine6");

const legacyResults = legacyTours.map(tour => {
  const resolvedActivity = resolveTourSchemaActivityLabel(tour);
  const before = {
    productCategory: tour.primaryCategory,
    touristType: "Adventure travelers",
  };
  const after = {
    productCategory: resolvedActivity ?? undefined,
    touristType: resolvedActivity ?? undefined,
  };

  return {
    id: tour.id,
    title: tour.title,
    path: `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`,
    resolvedActivity,
    before,
    after,
  };
});

const engine6Results = engine6ResolvedTours.map(tour => {
  const graph = buildEngine6SchemaGraph(tour)["@graph"] as Array<
    Record<string, unknown>
  >;
  const after = readGraphValues(graph);
  const resolvedActivity = tour.activityCategories[0]?.label ?? null;

  return {
    id: tour.productCode,
    title: tour.title,
    path: tour.canonicalPath,
    resolvedActivity,
    after,
  };
});

const combinedAfter = [...legacyResults, ...engine6Results];
const productCategoryMissingCount = combinedAfter.filter(
  result => !result.after.productCategory
).length;
const touristTypeGenericFallbackCount = combinedAfter.filter(
  result =>
    typeof result.after.touristType === "string" &&
    GENERIC_TOURIST_TYPES.has(result.after.touristType)
).length;
const categoryTouristTypeMismatchCount = combinedAfter.filter(
  result => result.after.productCategory !== result.after.touristType
).length;

const changedLegacyResults = legacyResults.filter(
  result =>
    result.resolvedActivity &&
    (result.before.productCategory !== result.after.productCategory ||
      result.before.touristType !== result.after.touristType)
);
const exampleResults: typeof changedLegacyResults = [];
const exampleActivityLabels = new Set<string>();

for (const result of changedLegacyResults) {
  if (
    result.resolvedActivity &&
    !exampleActivityLabels.has(result.resolvedActivity)
  ) {
    exampleResults.push(result);
    exampleActivityLabels.add(result.resolvedActivity);
  }

  if (exampleResults.length >= 20) break;
}

for (const result of changedLegacyResults) {
  if (exampleResults.length >= 20) break;
  if (!exampleResults.includes(result)) {
    exampleResults.push(result);
  }
}

const examples = exampleResults.map(result => ({
  title: result.title,
  path: result.path,
  resolvedActivity: result.resolvedActivity,
  before: result.before,
  after: result.after,
}));

const report = {
  totalLegacyToursScanned: legacyTours.length,
  totalEngine6ToursScanned: engine6ResolvedTours.length,
  productCategoryMissingCount,
  touristTypeGenericFallbackCount,
  categoryTouristTypeMismatchCount,
  examples,
};

writeFileSync(
  "reports/schema-activity-parity-scan.json",
  `${JSON.stringify(report, null, 2)}\n`
);
console.log(JSON.stringify(report, null, 2));
