import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { getEngine3MissingHeroEntries } from "../src/engine3/listing/getEngine3ListingEntries";

async function main() {
  const missing = getEngine3MissingHeroEntries();
  const reportPath = path.resolve(process.cwd(), "reports/engine3-missing-hero.json");

  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(
    reportPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        total: missing.length,
        items: missing,
      },
      null,
      2
    ) + "\n",
    "utf8"
  );

  if (missing.length > 0) {
    console.warn(`[engine3] Missing Viator hero for ${missing.length} tour(s). See reports/engine3-missing-hero.json`);
  }
}

void main();
