import fs from "node:fs";
import path from "node:path";
import { CITY_TIER1_SLUGS } from "../src/data/cityTier1";
import {
  flushAttractionImageCache,
  resolveAttractionImages,
} from "../src/utils/images/resolveAttractionImages";

type Thing = {
  title?: string;
  wikiUrl?: string;
  sourceUrl?: string;
  source_url?: string;
  photoUrls?: string[];
};

type Guide = {
  city?: string;
  state?: string;
  hero?: { image?: string };
  thingsToDo?: Thing[];
};

const ROOT = path.resolve("src/data/guides/us");

const walkFiles = (dir: string): string[] => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(full));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".json") && entry.name !== "index.json") {
      files.push(full);
    }
  }

  return files;
};

const tier1Set = new Set(CITY_TIER1_SLUGS);

const run = async () => {
  const files = walkFiles(ROOT).filter(file =>
    tier1Set.has(path.basename(file, ".json"))
  );

  let guidesUpdated = 0;
  let attractionsUpdated = 0;

  for (const file of files) {
    const guide = JSON.parse(fs.readFileSync(file, "utf8")) as Guide;
    if (!guide.city || !guide.state || !Array.isArray(guide.thingsToDo)) {
      continue;
    }

    let touched = false;

    for (const thing of guide.thingsToDo) {
      if (!thing.title) continue;

      const resolved = await resolveAttractionImages({
        city: guide.city,
        state: guide.state,
        attractionTitle: thing.title,
        attractionPhotoUrls: thing.photoUrls,
        wikiUrl: thing.wikiUrl,
        officialUrl: thing.sourceUrl ?? thing.source_url,
        heroImage: guide.hero?.image,
      });

      const next = resolved.photoUrls.slice(0, 3);
      const prev = Array.isArray(thing.photoUrls) ? thing.photoUrls : [];

      if (JSON.stringify(prev) !== JSON.stringify(next)) {
        thing.photoUrls = next;
        touched = true;
        attractionsUpdated += 1;
      }
    }

    if (touched) {
      fs.writeFileSync(file, `${JSON.stringify(guide, null, 2)}\n`, "utf8");
      guidesUpdated += 1;
    }
  }

  flushAttractionImageCache();

  console.log(`Tier1 guides checked for attraction images: ${files.length}`);
  console.log(`Guides updated: ${guidesUpdated}`);
  console.log(`Attractions updated: ${attractionsUpdated}`);
};

run().catch(error => {
  console.warn(`populate-guide-attraction-images failed: ${String(error)}`);
});
