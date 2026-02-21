import fs from "node:fs";
import path from "node:path";
import {
  extractCityLandmarksFromTours,
  extractStateLandmarksFromTours,
  type CityLandmarkCandidate,
} from "../src/utils/guides/extractCityLandmarksFromTours";
import { getWikiLandmarkCandidates } from "../src/utils/guides/wikiLandmarks";
import {
  wikiSummaryToThing,
  type WikiThingToDo,
} from "../src/utils/guides/wikiSummaryToThing";
import { buildPalmSpringsStyleDescription } from "../src/utils/guides/buildPalmSpringsStyleDescription";
import {
  flushWikiSummaryCache,
  getWikipediaSummary,
} from "../src/utils/wiki/wikiRest";
import {
  getLocalPoisForCity,
  getNearbyPoisForCity,
} from "../src/data/cityTopThings";
import { cleanWikiLanguage } from "../src/utils/cleanWikiLanguage";
import { assertGuideHasNoWikiLanguage } from "../src/utils/guides/wikiLanguageGuard";
import { isTopGuide } from "../src/utils/guides/isTopGuide";

type GuideJson = {
  tier?: "tier1" | "tier2";
  isPruned?: boolean;
  city?: string;
  state?: string;
  seoLinks?: {
    wikipedia?: string;
    officialTourism?: string;
    reference?: string;
  };
  thingsToDo?: WikiThingToDo[];
};

type HawaiiConversionReportEntry = {
  city: string;
  thingsRewritten: number;
  avgWordCount: number;
  wikiLinksPresent: boolean;
  failures: string[];
};

type Report = {
  citiesUpdated: string[];
  citiesSkippedTier1: string[];
  citiesFallbackUsed: string[];
  failures: Array<{ city: string; reason: string }>;
};

const ROOT = path.resolve("src/data/guides/us");
const REPORT_PATH = path.resolve("reports/tier2-wiki-things-to-do.json");
const HAWAII_REPORT_PATH = path.resolve(
  "reports/hawaii-palm-springs-conversion.json"
);
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

const mapType = (name: string): CityLandmarkCandidate["type"] => {
  if (/park|trail|garden|falls|canyon/i.test(name)) return "park";
  if (/museum|aquarium|zoo|cathedral|market|observatory/i.test(name))
    return "museum";
  if (/beach|bay|pier|island|waterfront/i.test(name)) return "beach";
  if (/bridge/i.test(name)) return "bridge";
  if (/district|square|old town|plaza/i.test(name)) return "district";
  if (/harbor|marina/i.test(name)) return "harbor";
  if (/mountain|peak/i.test(name)) return "mountain";
  if (/river|lake/i.test(name)) return "river";
  if (/historic|fort|monument/i.test(name)) return "historic";
  return "other";
};

const normalize = (value: string) =>
  value.toLowerCase().replace(/\s+/g, " ").trim();

const parseRegionArg = () => {
  const idx = process.argv.indexOf("--region");
  if (idx === -1) return undefined;
  return process.argv[idx + 1]?.trim().toLowerCase();
};

const isHawaiiGuide = (filePath: string) => parseSlugs(filePath).stateSlug === "hawaii";

const countWords = (value: string) => value.split(/\s+/).filter(Boolean).length;

const HAWAII_CITY_WIKI_TITLES: Record<string, string[]> = {
  "hilo": ["Hilo", "Rainbow Falls (Hawaii)", "Liliʻuokalani Park and Gardens", "Hawaii Volcanoes National Park", "Akaka Falls State Park", "Wailuku River State Park"],
  "kailua-kona": ["Kailua-Kona, Hawaii", "Huliheʻe Palace", "Kaloko-Honokōhau National Historical Park", "Kealakekua Bay", "Kahaluʻu Bay", "Puʻuhonua o Hōnaunau National Historical Park"],
  "kihei": ["Kihei, Hawaii", "Mākena State Park", "Molokini", "Wailea", "Kamaole Beach Park", "Kealia Pond National Wildlife Refuge"],
  "kahului": ["Kahului, Hawaii", "Maui Arts and Cultural Center", "ʻĪao Valley", "Kanaha Beach Park", "Alexander & Baldwin Sugar Museum", "Maui Nui Botanical Gardens"],
  "haleiwa": ["Haleʻiwa", "Waimea Bay", "Banzai Pipeline", "Laniakea Beach", "Sunset Beach", "Kaʻena Point State Park"],
  "hanalei": ["Hanalei, Hawaii", "Hanalei Bay", "Hanalei National Wildlife Refuge", "Waiʻoli Mission District", "Na Pali Coast State Park", "Princeville, Hawaii"],
  "waikoloa-village": ["Waikoloa Village, Hawaii", "Anaehoʻomalu Bay", "Puʻukoholā Heiau National Historic Site", "Hāpuna Beach State Recreation Area", "Kohala, Hawaii", "Mauna Kea"],
  "wailea-makena": ["Wailea, Hawaii", "Mākena State Park", "Molokini", "Keawakapu Beach", "Polo Beach", "Mākena"],
  "lahaina": ["Lahaina, Hawaii", "Banyan Tree Park (Lahaina)", "Lahaina Historic District", "Kaanapali", "Maui", "Hawaiian Islands Humpback Whale National Marine Sanctuary"],
};

const getHawaiiTargetTitles = (citySlug: string) =>
  HAWAII_CITY_WIKI_TITLES[citySlug] ?? [];


const BANNED_FUZZY =
  /practical stop|easy recommendation|travelers? rank|coverage for|cross-?links?|article set|dataset|according to|this article|this page/i;

const toShortFactual = (title: string, city: string, description: string) => {
  const cleaned = cleanWikiLanguage(description).replace(/\s+/g, " ").trim();
  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => !BANNED_FUZZY.test(line))
    .slice(0, 3);

  if (sentences.length >= 2) {
    return sentences.join(" ");
  }

  const safeFirst = sentences[0] ?? `${title} is a recognized attraction in ${city}.`;
  return `${safeFirst} Visitors come here for its setting, local relevance, and well-known features.`;
};

const canonicalWikiUrl = (title: string, pageUrl?: string) => {
  if (pageUrl?.trim()) return pageUrl.trim();
  const normalized = title.trim().replace(/\s+/g, "_");
  if (!normalized) return undefined;
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(normalized).replace(
    /%5F/g,
    "_"
  )}`;
};

const buildFallbackThing = async (
  name: string,
  city: string
): Promise<WikiThingToDo | null> => {
  const summary = await getWikipediaSummary(name);
  if (!summary?.extract) return null;
  const firstSentence =
    summary.extract.split(/(?<=[.!?])\s+/)[0] ?? summary.extract;
  return {
    title: summary.title || name,
    description: toShortFactual(
      summary.title || name,
      city,
      `${summary.title || name} is a recognized landmark in or near ${city}. ${firstSentence}`
    ),
    wikiUrl: canonicalWikiUrl(summary.title || name, summary.pageUrl),
    imageUrl: summary.imageUrl,
  };
};

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
    if (fromPoi) {
      items.push(fromPoi);
      seen.add(normalize(fromPoi.title));
      continue;
    }

    items.push({
      title: name,
      description: toShortFactual(
        name,
        city,
        `${name} is a known local point of interest around ${city}. Visitors come here for its setting and notable local character.`
      ),
    });
    seen.add(normalize(name));
  }

  const textOnly = fallbackLandmarks
    .filter(item => !seen.has(normalize(item.name)))
    .filter(item => isPlausibleLandmarkName(item.name))
    .map(item => ({
      title: item.name,
      description: toShortFactual(
        item.name,
        city,
        `${item.name} is a well-known place in ${city}, ${state}. It is known for local character and helps visitors understand this part of the city.`
      ),
    }));

  items.push(...textOnly);

  return items.slice(0, Math.max(MIN_ITEMS, Math.min(MAX_ITEMS, items.length)));
};

const run = async () => {
  const region = parseRegionArg();
  const hawaiiMode = region === "hawaii";
  const files = walkGuideFiles(ROOT);
  const report: Report = {
    citiesUpdated: [],
    citiesSkippedTier1: [],
    citiesFallbackUsed: [],
    failures: [],
  };
  const hawaiiReport: HawaiiConversionReportEntry[] = [];

  for (const file of files) {
    if (hawaiiMode && !isHawaiiGuide(file)) {
      continue;
    }

    const raw = fs.readFileSync(file, "utf8");
    const guide = JSON.parse(raw) as GuideJson;
    const { stateSlug, citySlug } = parseSlugs(file);
    const routeKey = `us/${stateSlug}/${citySlug}`;

    if (hawaiiMode && getHawaiiTargetTitles(citySlug).length === 0) {
      report.citiesSkippedTier1.push(routeKey);
      continue;
    }

    if (
      guide.tier !== "tier2" ||
      guide.isPruned === true ||
      !guide.city ||
      !guide.state ||
      (!hawaiiMode && isTopGuide({ ...guide, slug: routeKey }))
    ) {
      report.citiesSkippedTier1.push(routeKey);
      continue;
    }

    const wikiCandidates = await getWikiLandmarkCandidates(guide.city, guide.state, 12);
    const preferredTitles = hawaiiMode
      ? getHawaiiTargetTitles(citySlug)
      : wikiCandidates.candidates.slice(0, 12);

    const things: WikiThingToDo[] = [];
    const seen = new Set<string>();

    for (const candidateTitle of preferredTitles) {
      if (hawaiiMode) {
        const key = normalize(candidateTitle);
        if (seen.has(key)) continue;
        things.push({
          title: candidateTitle,
          description: "",
          wikiUrl: canonicalWikiUrl(candidateTitle),
        });
        seen.add(key);
        if (things.length >= MAX_ITEMS) break;
        continue;
      }

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
    if (!hawaiiMode && finalThings.length < MIN_ITEMS) {
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

      if (!hawaiiMode && existingCount >= MIN_ITEMS) {
        finalThings = (guide.thingsToDo as WikiThingToDo[]).slice(0, MAX_ITEMS);
      } else {
        report.failures.push({
          city: routeKey,
          reason: `Generated only ${finalThings.length} items`,
        });
        continue;
      }
    }

    if (hawaiiMode) {
      const rewritten: WikiThingToDo[] = [];
      const failures: string[] = [];

      for (const item of finalThings.slice(0, MAX_ITEMS)) {
        const rewrittenThing = await buildPalmSpringsStyleDescription(
          item.title,
          guide.city,
          guide.state,
          { minWords: 120, maxWords: 220, maxAttempts: 4 }
        );

        if (!rewrittenThing) {
          failures.push(`Failed to build Palm Springs style description for ${item.title}`);
          continue;
        }

        rewritten.push({
          title: rewrittenThing.title,
          description: rewrittenThing.description,
          wikiUrl: rewrittenThing.wikiUrl,
        });
      }

      if (rewritten.length < MIN_ITEMS) {
        report.failures.push({
          city: routeKey,
          reason: `Palm Springs style conversion produced ${rewritten.length} items`,
        });
        hawaiiReport.push({
          city: guide.city,
          thingsRewritten: rewritten.length,
          avgWordCount: rewritten.length
            ? Math.round(
                rewritten
                  .map(item => countWords(item.description.split("\n\nSource:")[0] ?? item.description))
                  .reduce((sum, n) => sum + n, 0) / rewritten.length
              )
            : 0,
          wikiLinksPresent: rewritten.every(item => Boolean(item.wikiUrl)),
          failures,
        });
        continue;
      }

      guide.thingsToDo = rewritten;
      hawaiiReport.push({
        city: guide.city,
        thingsRewritten: rewritten.length,
        avgWordCount: Math.round(
          rewritten
            .map(item => countWords(item.description.split("\n\nSource:")[0] ?? item.description))
            .reduce((sum, n) => sum + n, 0) / rewritten.length
        ),
        wikiLinksPresent: rewritten.every(item => Boolean(item.wikiUrl)),
        failures,
      });
    } else {
      guide.thingsToDo = finalThings.slice(0, MAX_ITEMS).map(item => ({
        ...item,
        description: toShortFactual(item.title, guide.city!, item.description),
        wikiUrl: item.wikiUrl ? canonicalWikiUrl(item.title, item.wikiUrl) : undefined,
      }));
    }

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

    if (!hawaiiMode) {
      assertGuideHasNoWikiLanguage(guide, routeKey);
    }
    fs.writeFileSync(file, `${JSON.stringify(guide, null, 2)}\n`, "utf8");
    report.citiesUpdated.push(routeKey);
  }

  flushWikiSummaryCache();
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  if (hawaiiMode) {
    fs.mkdirSync(path.dirname(HAWAII_REPORT_PATH), { recursive: true });
    fs.writeFileSync(
      HAWAII_REPORT_PATH,
      `${JSON.stringify(hawaiiReport, null, 2)}\n`,
      "utf8"
    );
  }

  console.log(`Updated tier2 cities: ${report.citiesUpdated.length}`);
  console.log(`Skipped (tier1/non-tier2): ${report.citiesSkippedTier1.length}`);
  console.log(`Fallback used: ${report.citiesFallbackUsed.length}`);
  console.log(`Failures: ${report.failures.length}`);

  if (report.failures.length) {
    process.exitCode = 1;
  }
};

run();
