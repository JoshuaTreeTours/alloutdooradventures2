import fs from "node:fs";
import path from "node:path";
import {
  extractLandmarkNameFromTitle,
  getLandmarkImage,
} from "../src/utils/guides/getLandmarkImage";

type GuideThing = {
  title: string;
  imageUrl?: string | null;
};

type Guide = {
  city?: string;
  thingsToDo?: GuideThing[];
};

const ROOT = path.resolve("src/data/guides/us");

const walkGuideFiles = (dir: string): string[] => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkGuideFiles(full));
      continue;
    }

    if (
      entry.isFile() &&
      entry.name.endsWith(".json") &&
      entry.name !== "index.json"
    ) {
      files.push(full);
    }
  }

  return files;
};

const run = async () => {
  const files = walkGuideFiles(ROOT);
  let updatedItems = 0;

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const guide = JSON.parse(raw) as Guide;

    if (
      !guide.city ||
      !Array.isArray(guide.thingsToDo) ||
      !guide.thingsToDo.length
    ) {
      continue;
    }

    let changed = false;
    for (const thing of guide.thingsToDo) {
      const landmarkName = extractLandmarkNameFromTitle(thing.title ?? "");
      const imageUrl = await getLandmarkImage(landmarkName, guide.city);
      if (imageUrl && imageUrl !== thing.imageUrl) {
        thing.imageUrl = imageUrl;
        updatedItems += 1;
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(file, `${JSON.stringify(guide, null, 2)}\n`, "utf8");
      console.log(`Updated: ${file}`);
    }
  }

  console.log(`Resolved images for ${updatedItems} Things-to-Do items.`);
};

run();
