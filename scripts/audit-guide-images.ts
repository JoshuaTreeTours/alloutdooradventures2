import fs from "node:fs";
import path from "node:path";
import { CITY_TIER1_SLUGS } from "../src/data/cityTier1";

type Thing = {
  title?: string;
  photoUrls?: string[];
  photoUrl?: string;
  image?: string;
  imageUrl?: string;
};

type Guide = {
  city?: string;
  state?: string;
  thingsToDo?: Thing[];
};

type MissingEntry = {
  city: string;
  state: string;
  attraction: string;
};

const ROOT = path.resolve("src/data/guides/us");
const REPORT_PATH = path.resolve("reports/guide-image-audit.json");

const walkJsonFiles = (dir: string): string[] => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkJsonFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".json") && entry.name !== "index.json") {
      files.push(fullPath);
    }
  }

  return files;
};

const run = () => {
  const tier1Sample = new Set(CITY_TIER1_SLUGS.slice(0, 20));
  const files = walkJsonFiles(ROOT).filter(file =>
    tier1Sample.has(path.basename(file, ".json"))
  );

  let totalAttractions = 0;
  let attractionsWithImages = 0;
  const missingImages: MissingEntry[] = [];
  const guidesWithoutAnyImages: string[] = [];

  for (const file of files) {
    const guide = JSON.parse(fs.readFileSync(file, "utf8")) as Guide;
    const city = guide.city ?? path.basename(file, ".json");
    const state = guide.state ?? path.basename(path.dirname(file));
    const things = Array.isArray(guide.thingsToDo) ? guide.thingsToDo : [];

    let guideHasImage = false;

    for (const thing of things) {
      totalAttractions += 1;
      const images = [
        ...(Array.isArray(thing.photoUrls) ? thing.photoUrls : []),
        ...(thing.photoUrl ? [thing.photoUrl] : []),
        ...(thing.image ? [thing.image] : []),
        ...(thing.imageUrl ? [thing.imageUrl] : []),
      ].filter(Boolean);

      if (images.length > 0) {
        attractionsWithImages += 1;
        guideHasImage = true;
      } else {
        missingImages.push({
          city,
          state,
          attraction: thing.title ?? "(untitled)",
        });
      }
    }

    if (!guideHasImage) {
      guidesWithoutAnyImages.push(`${city}, ${state}`);
    }
  }

  const report = {
    sampled_guides: files.length,
    total_attractions: totalAttractions,
    attractions_with_images: attractionsWithImages,
    guides_without_any_images: guidesWithoutAnyImages,
    missing_images: missingImages,
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Sampled guides: ${files.length}`);
  console.log(`Total attractions: ${totalAttractions}`);
  console.log(`Attractions with images: ${attractionsWithImages}`);
  console.log(`Guides without any images: ${guidesWithoutAnyImages.length}`);
};

run();
