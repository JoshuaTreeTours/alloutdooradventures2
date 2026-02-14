import { readFile } from "node:fs/promises";
import path from "node:path";

import { getTourById, getToursByCity } from "../../src/engine2/data/loadEngine2";
import { parseCsv } from "./csvUtils";

const REQUIRED_ITEM_ID = 34849;

const main = async () => {
  const baseCsvPath = path.resolve(process.cwd(), "data/palm-springs.csv");
  const baseCsv = await readFile(baseCsvPath, "utf8");
  const previousCount = parseCsv(baseCsv).length;

  const requiredTour = getTourById(REQUIRED_ITEM_ID);
  if (!requiredTour) {
    throw new Error(
      `Verification failed: missing required Palm Springs item_id ${REQUIRED_ITEM_ID}.`
    );
  }

  const palmSpringsTours = getToursByCity("california", "palm-springs");
  if (palmSpringsTours.length < previousCount) {
    throw new Error(
      `Verification failed: Palm Springs tours dropped from ${previousCount} to ${palmSpringsTours.length}.`
    );
  }

  console.log(
    `Verified Palm Springs jeep merge: item_id ${REQUIRED_ITEM_ID} present, ${palmSpringsTours.length} tours (baseline ${previousCount}).`
  );
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
