import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("src/data/guides/us");
const EXPECTED_ATTRACTIONS = 8;
const MIN_WORDS = 100;

const TARGET_CITY_SLUGS = new Set([
  "las-vegas",
  "orlando",
  "tampa",
  "fort-lauderdale",
  "key-west",
  "palm-springs",
  "monterey",
  "carmel",
  "lake-tahoe",
  "anchorage",
  "fairbanks",
  "jackson",
  "jackson-hole",
  "moab",
  "park-city",
  "boulder",
  "aspen",
  "flagstaff",
  "bozeman",
  "whitefish",
]);

const walkGuideFiles = (dir: string): string[] => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkGuideFiles(full));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".json") && entry.name !== "index.json") {
      files.push(full);
    }
  }

  return files;
};

const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const hasImageFields = (value: unknown): boolean => {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(hasImageFields);

  for (const [key, nested] of Object.entries(value)) {
    if (
      ["images", "photoUrls", "thumbnail", "thumbnailUrl", "heroImage", "map", "maps"].includes(
        key
      )
    ) {
      return true;
    }
    if (hasImageFields(nested)) {
      return true;
    }
  }

  return false;
};

const errors: string[] = [];
const foundCities = new Set<string>();

for (const file of walkGuideFiles(ROOT)) {
  const guide = JSON.parse(fs.readFileSync(file, "utf8")) as {
    slug?: string;
    city?: string;
    thingsToDo?: Array<{ title?: string; description?: string; wikiUrl?: string; source_url?: string }>;
  };

  const slug = guide.slug?.split("/").pop() ?? path.basename(file, ".json");
  if (!TARGET_CITY_SLUGS.has(slug)) {
    continue;
  }

  foundCities.add(slug);

  if (!Array.isArray(guide.thingsToDo)) {
    errors.push(`${slug}: missing thingsToDo array`);
    continue;
  }

  if (guide.thingsToDo.length !== EXPECTED_ATTRACTIONS) {
    errors.push(`${slug}: expected ${EXPECTED_ATTRACTIONS} attractions, found ${guide.thingsToDo.length}`);
  }

  for (let index = 0; index < guide.thingsToDo.length; index += 1) {
    const item = guide.thingsToDo[index];
    const wc = wordCount(item.description ?? "");
    if (wc < MIN_WORDS) {
      errors.push(`${slug}: attraction ${index + 1} has ${wc} words (<${MIN_WORDS})`);
    }

    if (!(item.wikiUrl && /^https?:\/\//.test(item.wikiUrl))) {
      errors.push(`${slug}: attraction ${index + 1} missing valid wikiUrl`);
    }

    if (hasImageFields(item)) {
      errors.push(`${slug}: attraction ${index + 1} contains image field(s)`);
    }
  }
}

for (const citySlug of Array.from(TARGET_CITY_SLUGS)) {
  if (!foundCities.has(citySlug)) {
    errors.push(`${citySlug}: guide file not found`);
  }
}

if (errors.length) {
  console.error("Tier-1 final validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Validated ${foundCities.size} target Tier-1 city guides.`);
