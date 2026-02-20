import fs from "node:fs";
import path from "node:path";
import { cleanLandmarkText, ensureLength } from "../src/utils/guides/cleanLandmarkText";

type ThingToDo = {
  title?: string;
  description?: string;
};

type GuideJson = {
  tier?: "tier1" | "tier2";
  city?: string;
  state?: string;
  thingsToDo?: ThingToDo[];
};

const ROOT = path.resolve("src/data/guides/us");

const walkGuideFiles = (dir: string): string[] => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkGuideFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".json") && entry.name !== "index.json") {
      files.push(fullPath);
    }
  }

  return files;
};

const inferEntityType = (title: string) => {
  if (/park|trail|canyon|falls|creek|garden/i.test(title)) return "park";
  if (/museum|observatory|cathedral|market|zoo|aquarium/i.test(title)) return "museum";
  if (/beach|bay|island|pier|boardwalk|waterfront/i.test(title)) return "beach";
  if (/bridge/i.test(title)) return "bridge";
  if (/district|old town|square/i.test(title)) return "district";
  if (/harbor|marina/i.test(title)) return "harbor";
  if (/mountain|peak/i.test(title)) return "mountain";
  if (/river|lake/i.test(title)) return "river";
  if (/historic|monument/i.test(title)) return "historic";
  return "other";
};

const run = () => {
  const files = walkGuideFiles(ROOT);
  let updatedGuides = 0;
  let updatedItems = 0;

  for (const file of files) {
    const json = JSON.parse(fs.readFileSync(file, "utf8")) as GuideJson;
    if (json.tier !== "tier2" || !json.city || !json.state || !Array.isArray(json.thingsToDo)) {
      continue;
    }

    let changed = false;
    json.thingsToDo = json.thingsToDo.map(item => {
      if (!item?.description) {
        return item;
      }

      const cleanedDescription = ensureLength(
        cleanLandmarkText(item.description),
        json.city as string,
        json.state as string,
        inferEntityType(item.title ?? "")
      );

      if (cleanedDescription !== item.description) {
        changed = true;
        updatedItems += 1;
      }

      return {
        ...item,
        description: cleanedDescription,
      };
    });

    if (changed) {
      fs.writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`, "utf8");
      updatedGuides += 1;
    }
  }

  console.log(`Tier-2 guides updated: ${updatedGuides}`);
  console.log(`Tier-2 thingsToDo descriptions updated: ${updatedItems}`);
};

run();
