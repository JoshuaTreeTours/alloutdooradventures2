import { readFile } from "node:fs/promises";
import path from "node:path";

import { ENGINE2_DESTINATIONS } from "../../src/engine2/config/destinations";
import { getAllEngine2Tours } from "../../src/engine2/data/loadEngine2";
import { parseCsv, toSourceCitySlug } from "./csvUtils";

export const runCityCsvCoverageAudit = async () => {
  const tours = getAllEngine2Tours();
  const failures: string[] = [];

  for (const destination of Object.values(ENGINE2_DESTINATIONS)) {
    const csvPath = path.resolve(process.cwd(), destination.csvPath);
    const csvContents = await readFile(csvPath, "utf8");
    const rows = parseCsv(csvContents);
    const sourceCitySlug = toSourceCitySlug(destination.csvPath);

    const toursForCity = tours.filter(
      tour => tour.sourceCitySlug === sourceCitySlug
    );
    const producedIds = new Set(toursForCity.map(tour => tour.id));

    const expectedItemIds = rows
      .map(row => row.item_id?.trim())
      .filter((itemId): itemId is string => Boolean(itemId));

    const missingItemIds = expectedItemIds.filter(
      itemId => !producedIds.has(itemId)
    );

    console.log(
      `[${path.basename(destination.csvPath)}] rows=${rows.length} produced=${toursForCity.length} missing=${missingItemIds.length}`
    );

    if (missingItemIds.length > 0) {
      console.log(`  Missing item_ids: ${missingItemIds.join(", ")}`);
      failures.push(
        `${destination.csvPath}: ${missingItemIds.length} rows missing from Engine2 output`
      );
    }
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
