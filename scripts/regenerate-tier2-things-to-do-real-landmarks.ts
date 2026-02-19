import fs from "node:fs";
import path from "node:path";
import {
  buildTier2ThingsToDo,
  type Tier2ThingToDo,
} from "../src/utils/guides/buildTier2ThingsToDo";
import {
  extractCityLandmarksFromTours,
  extractStateLandmarksFromTours,
  type CityLandmarkCandidate,
  type LandmarkType,
} from "../src/utils/guides/extractCityLandmarksFromTours";
import { validateThingsToDo } from "../src/utils/guides/validateThingsToDo";
import { flushWikiImageCache, getWikiImageUrls } from "../src/utils/wiki/getWikiImage";
import {
  getLocalPoisForCity,
  getNearbyPoisForCity,
} from "../src/data/cityTopThings";

type GuideJson = {
  tier?: "tier1" | "tier2";
  city?: string;
  state?: string;
  thingsToDo?: Tier2ThingToDo[];
};

const ROOT = path.resolve("src/data/guides/us");
const OVERRIDES_PATH = path.resolve(
  "src/data/guides/overrides/tier2LandmarksOverrides.json"
);

const overrides = JSON.parse(fs.readFileSync(OVERRIDES_PATH, "utf8")) as Record<
  string,
  string[]
>;

const typeFromName = (name: string): LandmarkType => {
  if (/park|trail|canyon|falls|creek|garden/i.test(name)) return "park";
  if (/museum|observatory|cathedral|market|zoo|aquarium/i.test(name))
    return "museum";
  if (/beach|bay|island|pier|boardwalk|waterfront/i.test(name)) return "beach";
  if (/bridge/i.test(name)) return "bridge";
  if (/district|old town|square/i.test(name)) return "district";
  if (/harbor|marina/i.test(name)) return "harbor";
  if (/mountain|peak/i.test(name)) return "mountain";
  if (/river|lake/i.test(name)) return "river";
  if (/historic|monument/i.test(name)) return "historic";
  return "other";
};

const walkGuideFiles = (dir: string): string[] => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkGuideFiles(fullPath));
      continue;
    }
    if (
      entry.isFile() &&
      entry.name.endsWith(".json") &&
      entry.name !== "index.json"
    ) {
      files.push(fullPath);
    }
  }

  return files;
};

const parseSlugs = (filePath: string) => {
  const stateSlug = path.basename(path.dirname(filePath));
  const citySlug = path.basename(filePath, ".json");
  return { stateSlug, citySlug };
};

const fallbackLandmarksFromPois = (
  stateSlug: string,
  citySlug: string
): CityLandmarkCandidate[] => {
  const local = getLocalPoisForCity(stateSlug, citySlug).map((poi, index) => ({
    name: poi.name,
    type: typeFromName(poi.name),
    score: 80 - index,
  }));

  const nearby = getNearbyPoisForCity(stateSlug, citySlug, 40)
    .slice(0, 8)
    .map((poi, index) => ({
      name: poi.name,
      type: typeFromName(poi.name),
      score: 60 - index,
    }));

  return [...local, ...nearby];
};

const run = async () => {
  const files = walkGuideFiles(ROOT);
  let updated = 0;
  let usedOverrides = 0;
  const failingCities: string[] = [];
  const validationFailures: string[] = [];

  for (const file of files) {
    const json = JSON.parse(fs.readFileSync(file, "utf8")) as GuideJson;
    if (json.tier !== "tier2" || !json.city || !json.state) {
      continue;
    }

    const { stateSlug, citySlug } = parseSlugs(file);
    const routeKey = `us/${stateSlug}/${citySlug}`;

    let landmarks: CityLandmarkCandidate[] = extractCityLandmarksFromTours(
      stateSlug,
      citySlug
    );

    if (landmarks.length < 4) {
      const overrideNames = overrides[routeKey] ?? [];
      if (overrideNames.length) {
        usedOverrides += 1;
        landmarks = overrideNames.map((name, index) => ({
          name,
          type: typeFromName(name),
          score: 100 - index,
        }));
      } else {
        landmarks = [
          ...landmarks,
          ...fallbackLandmarksFromPois(stateSlug, citySlug),
        ];
      }
    }

    const things = buildTier2ThingsToDo(json.city, json.state, landmarks).slice(
      0,
      6
    );

    for (const thing of things) {
      const photoUrls = await getWikiImageUrls({ title: thing.title });
      if (photoUrls.length) {
        thing.photoUrls = photoUrls;
      }
    }

    if (things.length < 4) {
      failingCities.push(routeKey);
      continue;
    }

    const failures = validateThingsToDo(things, json.city, json.state);
    if (failures.length) {
      validationFailures.push(`${routeKey}: ${failures.join(" | ")}`);
      continue;
    }

    json.thingsToDo = things;
    fs.writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`, "utf8");
    updated += 1;
  }

  console.log(`Tier-2 guides updated: ${updated}`);
  console.log(`Cities using overrides: ${usedOverrides}`);
  console.log(`Cities failing (<4 landmarks): ${failingCities.length}`);
  if (failingCities.length) {
    console.log(failingCities.join("\n"));
  }

  flushWikiImageCache();

  console.log(`Validation failures: ${validationFailures.length}`);
  if (validationFailures.length) {
    console.log(validationFailures.join("\n"));
    process.exitCode = 1;
  }
};

run();
