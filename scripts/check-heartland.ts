import { getAllEngine2Tours } from "../src/engine2/data/loadEngine2";
import { getHeartlandDatasetSummaries } from "../src/engine2/data/heartlandTours";

const summaries = getHeartlandDatasetSummaries();
const allTours = getAllEngine2Tours();

console.log(`Discovered heartland datasets: ${summaries.length}`);
for (const summary of summaries) {
  console.log(`${summary.key}: ${summary.tourCount}`);
}

const datasetKeys = new Set(
  allTours
    .map(tour => tour.sourceDatasetKey)
    .filter((key): key is string => Boolean(key))
);

if (!datasetKeys.has("oregon")) {
  throw new Error("Expected Engine2 dataset key 'oregon' to be present.");
}

const hasAdditionalState = summaries.some(
  summary => summary.key !== "oregon" && summary.tourCount > 0
);

if (!hasAdditionalState) {
  throw new Error("Expected at least one non-Oregon heartland dataset with tours.");
}
