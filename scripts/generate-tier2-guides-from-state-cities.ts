import fs from "node:fs";
import path from "node:path";
import { generateTier2Guide } from "../src/utils/guides/generateTier2Guide";
import { getStateTopCities } from "../src/utils/guides/getStateTopCities";

const guidesRoot = path.resolve("src/data/guides/us");

type ExistingGuide = {
  tier: "tier1" | "tier2";
};

const readExistingGuide = (filePath: string): ExistingGuide | null => {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
    tier?: string;
  };
  return {
    tier: raw.tier === "tier2" ? "tier2" : "tier1",
  };
};

const run = async () => {
  const topCities = getStateTopCities();

  let created = 0;
  let skippedTier1 = 0;
  let skippedTier2 = 0;
  const exceptions: string[] = [];

  for (const city of topCities) {
    const stateDir = path.join(guidesRoot, city.stateSlug);
    const guidePath = path.join(stateDir, `${city.citySlug}.json`);
    const existing = readExistingGuide(guidePath);

    if (existing?.tier === "tier1") {
      skippedTier1 += 1;
      continue;
    }

    if (existing?.tier === "tier2") {
      skippedTier2 += 1;
      continue;
    }

    const result = await generateTier2Guide(
      city.stateSlug,
      city.citySlug,
      city.cityName
    );

    if (result.usedHeroFallback) {
      exceptions.push(`${city.stateSlug}/${city.citySlug}`);
    }

    fs.mkdirSync(stateDir, { recursive: true });
    fs.writeFileSync(
      guidePath,
      `${JSON.stringify(result.guide, null, 2)}\n`,
      "utf8"
    );
    created += 1;
  }

  console.log("Tier-2 generation report");
  console.log(`Top city references: ${topCities.length}`);
  console.log(`Created: ${created}`);
  console.log(`Skipped (tier1): ${skippedTier1}`);
  console.log(`Skipped (already tier2): ${skippedTier2}`);
  console.log(`Exceptions (hero fallback used): ${exceptions.length}`);
  if (exceptions.length) {
    console.log(exceptions.join("\n"));
  }
};

run();
