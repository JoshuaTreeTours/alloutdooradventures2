import { readFile } from "node:fs/promises";
import path from "node:path";

import { ENGINE2_DESTINATIONS } from "../../src/engine2/config/destinations";
import {
  getAllEngine2Tours,
  getEngine2TourById,
  getEngine2ToursBySourceCity,
} from "../../src/engine2/data/loadEngine2";
import { parseCsv } from "./csvUtils";

const REQUIRED_ITEM_ID = "34849";

const main = async () => {
  const destination = ENGINE2_DESTINATIONS.palmSprings;
  const tours = getAllEngine2Tours();
  const palmSpringsTours = getEngine2ToursBySourceCity(destination.citySlug);

  const requiredTour =
    getEngine2TourById(REQUIRED_ITEM_ID) ??
    getEngine2TourById(Number(REQUIRED_ITEM_ID));

  if (!requiredTour) {
    throw new Error(`Missing required item_id ${REQUIRED_ITEM_ID} in Engine2 index.`);
  }

  const palmSpringsIds = new Set(palmSpringsTours.map(tour => tour.id));
  if (!palmSpringsIds.has(REQUIRED_ITEM_ID)) {
    throw new Error(
      `Palm Springs tours are missing required item_id ${REQUIRED_ITEM_ID}.`
    );
  }

  const dedupedIds = new Set<string>();
  let maxRows = 0;

  for (const csvPathInput of destination.csvPaths) {
    const csvPath = path.resolve(process.cwd(), csvPathInput);
    const csvContents = await readFile(csvPath, "utf8");
    const rows = parseCsv(csvContents);

    maxRows = Math.max(maxRows, rows.length);
    rows.forEach(row => {
      const itemId = String(row.item_id ?? "").trim();
      if (itemId) dedupedIds.add(itemId);
    });
  }

  if (palmSpringsTours.length < dedupedIds.size) {
    throw new Error(
      `Palm Springs tours count ${palmSpringsTours.length} is below deduped CSV ids ${dedupedIds.size}.`
    );
  }

  if (palmSpringsTours.length < maxRows) {
    throw new Error(
      `Palm Springs tours count ${palmSpringsTours.length} is below max source CSV row count ${maxRows}.`
    );
  }

  console.log(
    `Palm Springs Engine2 CSV coverage verification passed (allTours=${tours.length}, palmSprings=${palmSpringsTours.length}, dedupedIds=${dedupedIds.size}, maxRows=${maxRows}).`
  );
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
