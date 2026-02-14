import { readFile } from "node:fs/promises";
import path from "node:path";

import { ENGINE2_DESTINATIONS } from "../../src/engine2/config/destinations";
import { getAllEngine2Tours } from "../../src/engine2/data/loadEngine2";
import { parseCsv } from "./csvUtils";

const REQUIRED_PALM_SPRINGS_ITEM_ID = "34849";

export const runCityCsvCoverageAudit = async () => {
  const tours = getAllEngine2Tours();
  const failures: string[] = [];

  for (const destination of Object.values(ENGINE2_DESTINATIONS)) {
    const sourceCitySlug = destination.citySlug;
    const toursForCity = tours.filter(
      tour => tour.sourceCitySlug === sourceCitySlug
    );
    const producedIds = new Set(toursForCity.map(tour => tour.id));

    const expectedItemIds = new Set<string>();

    for (const csvPathInput of destination.csvPaths) {
      const csvPath = path.resolve(process.cwd(), csvPathInput);
      const csvContents = await readFile(csvPath, "utf8");
      const rows = parseCsv(csvContents);

      rows
        .map(row => row.item_id?.trim())
        .filter((itemId): itemId is string => Boolean(itemId))
        .forEach(itemId => expectedItemIds.add(itemId));

      console.log(
        `[${path.basename(csvPathInput)}] rows=${rows.length} sourceCitySlug=${sourceCitySlug}`
      );
    }

    const missingItemIds = Array.from(expectedItemIds).filter(
      itemId => !producedIds.has(itemId)
    );

    console.log(
      `[${destination.key}] unique_expected=${expectedItemIds.size} produced=${toursForCity.length} missing=${missingItemIds.length}`
    );

    if (toursForCity.length < expectedItemIds.size) {
      failures.push(
        `${destination.key}: produced tour count ${toursForCity.length} is less than expected deduped item count ${expectedItemIds.size}`
      );
    }

    if (missingItemIds.length > 0) {
      console.log(`  Missing item_ids: ${missingItemIds.join(", ")}`);
      failures.push(
        `${destination.key}: missing item_ids -> ${missingItemIds.join(", ")}`
      );
    }
  }

  const palmSpringsTours = tours.filter(tour => tour.sourceCitySlug === "palm-springs");
  const palmSpringsIds = new Set(palmSpringsTours.map(tour => tour.id));

  if (!palmSpringsIds.has(REQUIRED_PALM_SPRINGS_ITEM_ID)) {
    failures.push(
      `Regression assertion failed: Palm Springs output must include item_id ${REQUIRED_PALM_SPRINGS_ITEM_ID}`
    );
  }

  if (failures.length > 0) {
    const message = [
      "Engine2 CSV coverage audit failed:",
      ...failures.map(failure => `- ${failure}`),
    ].join("\n");
    throw new Error(message);
  }

  console.log("\nEngine2 CSV coverage audit passed with 0 missing rows.");
};

if (import.meta.url === `file://${process.argv[1]}`) {
  runCityCsvCoverageAudit().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
