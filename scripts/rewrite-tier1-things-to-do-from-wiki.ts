import fs from "node:fs";
import path from "node:path";

import {
  buildWikiLandmarkDescription,
  TIER1_ATTRACTION_COUNT,
} from "../src/utils/guides/buildWikiLandmarkDescription";
import { jaccardSimilarity } from "../src/utils/guides/checkDescriptionSimilarity";
import { isGenericTravelAdvice } from "../src/utils/guides/isGenericTravelAdvice";
import { validateNoBoilerplate } from "../src/utils/guides/validateNoBoilerplate";
import { fetchWikiSummary, flushWikiSummaryCache } from "../src/utils/wiki/wikiSummary";

type ThingToDo = {
  title: string;
  description: string;
  wikiUrl?: string;
  source_url?: string;
};

type Guide = {
  tier?: "tier1" | "tier2";
  city?: string;
  state?: string;
  slug?: string;
  overview?: string[];
  thingsToDo?: ThingToDo[];
  travelTips?: string[];
};

type Report = {
  updatedGuides: string[];
  wikiItems: number;
  fallbackItems: number;
  failures: Array<{ file: string; reason: string }>;
  warnings: Array<{ file: string; reason: string }>;
  missingCities: string[];
};

const ROOT = path.resolve("src/data/guides/us");
const REPORT_PATH = path.resolve("reports/tier1-wiki-things-to-do.json");
const SIMILARITY_THRESHOLD = 0.7;
const MIN_DESCRIPTION_WORDS = 100;
const MIN_OVERVIEW_WORDS = 150;
const MAX_OVERVIEW_WORDS = 220;
const MAX_RETRIES_PER_TITLE = 1;

const TARGET_CITY_SLUGS = [
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
] as const;

const CITY_CANDIDATES: Record<string, string[]> = {
  "fort-lauderdale": [
    "Bonnet House",
    "Las Olas Boulevard",
    "Hugh Taylor Birch State Park",
    "Riverwalk Fort Lauderdale",
    "NSU Art Museum Fort Lauderdale",
    "Stranahan House",
    "Fort Lauderdale Beach",
    "Port Everglades",
  ],
  "key-west": [
    "Duval Street",
    "Ernest Hemingway House",
    "Southernmost point buoy",
    "Mallory Square",
    "Fort Zachary Taylor Historic State Park",
    "Key West Lighthouse",
    "Dry Tortugas National Park",
    "Truman Little White House",
  ],
  "palm-springs": [
    "Palm Springs Aerial Tramway",
    "Indian Canyons",
    "Tahquitz Canyon",
    "Moorten Botanical Garden and Cactarium",
    "Palm Springs Art Museum",
    "Mid-century modern architecture",
    "Agua Caliente Cultural Museum",
    "Coachella Valley Preserve",
  ],
  fairbanks: [
    "University of Alaska Museum of the North",
    "Morris Thompson Cultural and Visitors Center",
    "Pioneer Park (Fairbanks, Alaska)",
    "Creamer's Field",
    "Georgeson Botanical Garden",
    "Chena River",
    "Trans-Alaska Pipeline System",
    "Alaska Railroad",
  ],
  boulder: [
    "Pearl Street Mall",
    "Flatirons",
    "Chautauqua Park Historic District",
    "Boulder Creek",
    "University of Colorado Boulder",
    "National Center for Atmospheric Research",
    "Eldorado Canyon State Park",
    "Colorado Chautauqua",
  ],
  whitefish: [
    "Whitefish Mountain Resort",
    "Whitefish Lake",
    "Whitefish River",
    "Great Northern Railway Depot",
    "Glacier National Park",
    "Flathead National Forest",
    "Whitefish Theatre Company",
    "Alpine skiing",
  ],
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

    if (entry.isFile() && entry.name.endsWith(".json") && entry.name !== "index.json") {
      files.push(full);
    }
  }

  return files.sort();
};

const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const trimToWordRange = (text: string, minWords: number, maxWords: number): string => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length > maxWords) {
    return `${words.slice(0, maxWords).join(" ").replace(/[,:;\-]+$/g, "")}.`;
  }
  if (words.length >= minWords) {
    return text;
  }
  return text;
};

const buildOverviewFromSummary = (summary: string): string => {
  const sentences = summary
    .split(/(?<=[.!?])\s+/)
    .map(part => part.trim())
    .filter(Boolean);

  let overview = "";
  for (const sentence of sentences) {
    overview = `${overview} ${sentence}`.trim();
    if (wordCount(overview) >= MIN_OVERVIEW_WORDS) {
      break;
    }
  }

  if (wordCount(overview) < MIN_OVERVIEW_WORDS) {
    overview = summary;
  }

  return trimToWordRange(overview, MIN_OVERVIEW_WORDS, MAX_OVERVIEW_WORDS);
};

const isValidAttraction = (text: string) => {
  if (!validateNoBoilerplate(text)) return false;
  if (isGenericTravelAdvice(text)) return false;
  if (wordCount(text) < MIN_DESCRIPTION_WORDS) return false;
  return /(\b\d{3,4}\b|\b(?:mile|miles|acre|acres|feet|ft|km|square|opened|built|founded|established|designed)\b|\b(?:Park|Museum|River|District|Boulevard|Canyon|Mountain)\b)/i.test(text);
};

const findGuideBySlug = (files: string[], slug: string) => {
  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const guide = JSON.parse(raw) as Guide;
    const fileSlug = guide.slug?.split("/").pop() ?? path.basename(file, ".json");
    if (fileSlug === slug) {
      return { file, guide };
    }
  }
  return null;
};

const run = async () => {
  const report: Report = {
    updatedGuides: [],
    wikiItems: 0,
    fallbackItems: 0,
    failures: [],
    warnings: [],
    missingCities: [],
  };

  const files = walkGuideFiles(ROOT);

  for (const citySlug of TARGET_CITY_SLUGS) {
    const match = findGuideBySlug(files, citySlug);
    if (!match) {
      report.missingCities.push(citySlug);
      continue;
    }

    const { file, guide } = match;
    if (!guide.city || !guide.state || !Array.isArray(guide.thingsToDo)) {
      report.failures.push({ file, reason: "Missing city/state/thingsToDo" });
      continue;
    }

    const uniqueTitles = new Set<string>();
    const titleQueue: string[] = [];
    const updatedThings: ThingToDo[] = [];

    for (const item of guide.thingsToDo) {
      if (!item.title?.trim()) continue;
      if (uniqueTitles.has(item.title.toLowerCase())) continue;
      uniqueTitles.add(item.title.toLowerCase());
      titleQueue.push(item.title.trim());

      if (
        updatedThings.length < TIER1_ATTRACTION_COUNT &&
        item.wikiUrl &&
        isValidAttraction(item.description)
      ) {
        updatedThings.push({
          title: item.title.trim(),
          description: item.description,
          wikiUrl: item.wikiUrl,
          source_url: item.wikiUrl,
        });
      }
    }

    for (const seed of CITY_CANDIDATES[citySlug] ?? []) {
      if (!seed.trim()) continue;
      if (uniqueTitles.has(seed.toLowerCase())) continue;
      uniqueTitles.add(seed.toLowerCase());
      titleQueue.push(seed.trim());
    }

    for (const title of titleQueue) {
      if (updatedThings.length >= TIER1_ATTRACTION_COUNT) {
        break;
      }

      if (updatedThings.some(existing => existing.title.toLowerCase() === title.toLowerCase())) {
        continue;
      }

      let accepted: ThingToDo | null = null;
      for (let retryCount = 0; retryCount < MAX_RETRIES_PER_TITLE; retryCount += 1) {
        const result = await buildWikiLandmarkDescription({
          landmarkName: title,
          cityName: guide.city,
          stateName: guide.state,
          existingDescriptions: updatedThings.map(entry => entry.description),
        });

        if (!result.usedWiki || !result.wikiUrl) {
          continue;
        }

        if (!isValidAttraction(result.description)) {
          continue;
        }

        const similarities = updatedThings.map(existing =>
          jaccardSimilarity(result.description, existing.description)
        );
        const maxSimilarity = similarities.length ? Math.max(...similarities) : 0;
        if (maxSimilarity > SIMILARITY_THRESHOLD) {
          continue;
        }

        accepted = {
          title: result.name,
          description: result.description,
          wikiUrl: result.wikiUrl,
          source_url: result.wikiUrl,
        };
        report.wikiItems += 1;
        break;
      }

      if (accepted) {
        updatedThings.push(accepted);
      } else {
        report.fallbackItems += 1;
      }
    }

    if (updatedThings.length < TIER1_ATTRACTION_COUNT) {
      report.warnings.push({
        file,
        reason: `Only generated ${updatedThings.length}/${TIER1_ATTRACTION_COUNT} valid attractions`,
      });
    }

    let overviewParagraph = guide.overview?.[0] ?? "";
    const citySummary = await fetchWikiSummary(`${guide.city}, ${guide.state}`);
    if (citySummary.extract) {
      overviewParagraph = buildOverviewFromSummary(citySummary.extract);
    }

    guide.overview = [overviewParagraph];
    guide.travelTips = [];
    guide.thingsToDo = updatedThings;

    fs.writeFileSync(file, `${JSON.stringify(guide, null, 2)}\n`, "utf8");
    report.updatedGuides.push(file);
  }

  flushWikiSummaryCache();

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Updated tier1 guides: ${report.updatedGuides.length}`);
  console.log(`Items from wiki: ${report.wikiItems}`);
  console.log(`Items from fallback/rejected: ${report.fallbackItems}`);
  console.log(`Warnings: ${report.warnings.length}`);
  console.log(`Missing cities: ${report.missingCities.length}`);
  console.log(`Failures: ${report.failures.length}`);
};

run();
