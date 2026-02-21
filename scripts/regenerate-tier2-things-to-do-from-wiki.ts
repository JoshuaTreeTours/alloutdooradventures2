import fs from "node:fs";
import path from "node:path";
import { extractCityLandmarksFromTours } from "../src/utils/guides/extractCityLandmarksFromTours";
import { getWikiLandmarkCandidates } from "../src/utils/guides/wikiLandmarks";
import {
  wikiSummaryToThing,
  type WikiThingToDo,
} from "../src/utils/guides/wikiSummaryToThing";
import {
  flushWikiSummaryCache,
  getWikipediaSummary,
} from "../src/utils/wiki/wikiRest";
import {
  getLocalPoisForCity,
  getNearbyPoisForCity,
} from "../src/data/cityTopThings";
import { assertGuideHasNoWikiLanguage } from "../src/utils/guides/wikiLanguageGuard";
import { shouldPreserveGuideContent } from "../src/utils/guides/shouldPreserveGuideContent";

type GuideJson = {
  tier?: "tier1" | "tier2";
  city?: string;
  state?: string;
  seoLinks?: {
    wikipedia?: string;
    officialTourism?: string;
    reference?: string;
  };
  thingsToDo?: WikiThingToDo[];
};

type Report = {
  citiesUpdated: string[];
  citiesSkippedTier1: string[];
  citiesFallbackUsed: string[];
  failures: Array<{ city: string; reason: string }>;
};

const ROOT = path.resolve("src/data/guides/us");
const REPORT_PATH = path.resolve("reports/tier2-wiki-things-to-do.json");
const MIN_ITEMS = 4;
const MAX_ITEMS = 6;

const LANDMARK_HINT =
  /park|museum|beach|bridge|garden|district|harbor|bay|pier|island|trail|monument|square|market|cathedral|waterfront|observatory|zoo|aquarium|plaza|fort|falls|river|lake|mount|mountain|canyon|old town|boulevard/i;
const NON_LANDMARK_HINT =
  /\b(llc|inc|ltd|tour|guide|adventures?|rentals?|charters?)\b/i;

const isPlausibleLandmarkName = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed || trimmed.split(/\s+/).length < 2) return false;
  if (NON_LANDMARK_HINT.test(trimmed)) return false;
  if (LANDMARK_HINT.test(trimmed)) return true;
  const capitalized = (trimmed.match(/\b[A-Z][a-zA-Z'’.-]*\b/g) ?? []).length;
  return capitalized >= 2 && !/^(Visit|Explore)\b/.test(trimmed);
};

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

const parseSlugs = (filePath: string) => ({
  stateSlug: path.basename(path.dirname(filePath)),
  citySlug: path.basename(filePath, ".json"),
});

const normalize = (value: string) =>
  value.toLowerCase().replace(/\s+/g, " ").trim();

const buildFallbackThing = async (
  name: string,
  city: string
): Promise<WikiThingToDo | null> => wikiSummaryToThing(name, city);

const ensureFourItems = async (
  city: string,
  state: string,
  stateSlug: string,
  citySlug: string,
  existing: WikiThingToDo[],
  originalThings: WikiThingToDo[] | undefined
): Promise<WikiThingToDo[]> => {
  if (existing.length >= MIN_ITEMS) return existing.slice(0, MAX_ITEMS);

  const fallbackLandmarks = extractCityLandmarksFromTours(stateSlug, citySlug)
    .filter(item => isPlausibleLandmarkName(item.name))
    .slice(0, 12);
  const seen = new Set(existing.map(item => normalize(item.title)));
  const items = [...existing];

  for (const landmark of fallbackLandmarks) {
    if (seen.has(normalize(landmark.name))) continue;
    const thing = await buildFallbackThing(landmark.name, city);
    if (!thing) continue;
    items.push(thing);
    seen.add(normalize(thing.title));
    if (items.length >= MIN_ITEMS) break;
  }

  if (items.length >= MIN_ITEMS) return items.slice(0, MAX_ITEMS);

  for (const original of Array.isArray(originalThings) ? originalThings : []) {
    if (items.length >= MIN_ITEMS) break;
    if (!original?.title || seen.has(normalize(original.title))) continue;
    if (!isPlausibleLandmarkName(original.title)) continue;
    const fromOriginal = await buildFallbackThing(original.title, city);
    if (fromOriginal) {
      items.push(fromOriginal);
      seen.add(normalize(fromOriginal.title));
      continue;
    }

    const trimmed = original.description?.trim();
    if (!trimmed) continue;
    items.push({
      title: original.title,
      description: trimmed,
    });
    seen.add(normalize(original.title));
  }

  const poiNames = [
    ...getLocalPoisForCity(stateSlug, citySlug).map(poi => poi.name),
    ...getNearbyPoisForCity(stateSlug, citySlug, 50).map(poi => poi.name),
  ];

  for (const name of poiNames) {
    if (items.length >= MIN_ITEMS) break;
    if (!name || seen.has(normalize(name))) continue;
    if (!isPlausibleLandmarkName(name)) continue;
    const fromPoi = await buildFallbackThing(name, city);
    if (!fromPoi) continue;
    items.push(fromPoi);
    seen.add(normalize(fromPoi.title));
  }

  return items.slice(0, Math.max(MIN_ITEMS, Math.min(MAX_ITEMS, items.length)));
};

const run = async () => {
  const files = walkGuideFiles(ROOT);
  const report: Report = {
    citiesUpdated: [],
    citiesSkippedTier1: [],
    citiesFallbackUsed: [],
    failures: [],
  };

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const guide = JSON.parse(raw) as GuideJson;
    const { stateSlug, citySlug } = parseSlugs(file);
    const routeKey = `us/${stateSlug}/${citySlug}`;

    if (
      guide.tier !== "tier2" ||
      !guide.city ||
      !guide.state ||
      shouldPreserveGuideContent(guide)
    ) {
      report.citiesSkippedTier1.push(routeKey);
      continue;
    }

    const wikiCandidates = await getWikiLandmarkCandidates(
      guide.city,
      guide.state,
      12
    );

    const things: WikiThingToDo[] = [];
    const seen = new Set<string>();

    for (const candidateTitle of wikiCandidates.candidates.slice(0, 12)) {
      const item = await wikiSummaryToThing(candidateTitle, guide.city);
      if (!item) continue;
      const key = normalize(item.title);
      if (seen.has(key)) continue;
      if (normalize(item.title) === normalize(guide.city)) continue;
      things.push(item);
      seen.add(key);
      if (things.length >= MAX_ITEMS) break;
    }

    let finalThings = things;
    if (finalThings.length < MIN_ITEMS) {
      report.citiesFallbackUsed.push(routeKey);
      finalThings = await ensureFourItems(
        guide.city,
        guide.state,
        stateSlug,
        citySlug,
        finalThings,
        Array.isArray(guide.thingsToDo)
          ? (guide.thingsToDo as WikiThingToDo[])
          : undefined
      );
    }

    if (finalThings.length < MIN_ITEMS) {
      const existingCount = Array.isArray(guide.thingsToDo)
        ? guide.thingsToDo.length
        : 0;

      if (existingCount >= MIN_ITEMS) {
        finalThings = (guide.thingsToDo as WikiThingToDo[]).slice(0, MAX_ITEMS);
      } else {
        report.failures.push({
          city: routeKey,
          reason: `Generated only ${finalThings.length} items`,
        });
        continue;
      }
    }

    guide.thingsToDo = finalThings.slice(0, MAX_ITEMS).map(item => ({
      ...item,
      description: item.description,
      wikiUrl: item.wikiUrl,
    }));

    if (!guide.seoLinks) {
      guide.seoLinks = {};
    }

    if (!guide.seoLinks.wikipedia) {
      const cityTitle =
        wikiCandidates.cityPageTitle ?? `${guide.city}, ${guide.state}`;
      const citySummary = await getWikipediaSummary(cityTitle);
      if (citySummary?.pageUrl) {
        guide.seoLinks.wikipedia = citySummary.pageUrl;
      }
    }

    assertGuideHasNoWikiLanguage(guide, routeKey);
    fs.writeFileSync(file, `${JSON.stringify(guide, null, 2)}\n`, "utf8");
    report.citiesUpdated.push(routeKey);
  }

  flushWikiSummaryCache();
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Updated tier2 cities: ${report.citiesUpdated.length}`);
  console.log(`Skipped (tier1/non-tier2): ${report.citiesSkippedTier1.length}`);
  console.log(`Fallback used: ${report.citiesFallbackUsed.length}`);
  console.log(`Failures: ${report.failures.length}`);

  if (report.failures.length) {
    process.exitCode = 1;
  }
};

run();
