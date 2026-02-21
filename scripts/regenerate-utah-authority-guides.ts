import fs from "node:fs";
import path from "node:path";
import {
  buildAuthorityLandmark,
  getAuthorityLandmarkOverride,
  type AuthorityLandmarkSpec,
} from "../src/utils/guides/buildAuthorityLandmark";
import { isValidWikiImageUrl } from "../src/utils/wiki/wikiImageUrl";

const CITY_FILES = [
  "src/data/guides/us/utah/bryce-canyon-city.json",
  "src/data/guides/us/utah/hurricane.json",
  "src/data/guides/us/utah/moab.json",
  "src/data/guides/us/utah/springdale.json",
  "src/data/guides/us/utah/st-george.json",
] as const;

const CACHE_FILE = "scripts/data/utahAuthorityWikiCache.json";

const DEFAULT_CITY_IMAGES: Record<string, string> = {
  "bryce-canyon-city":
    "https://upload.wikimedia.org/wikipedia/commons/3/32/Bryce_Canyon_Utah_Aug_2013.jpg",
  hurricane:
    "https://upload.wikimedia.org/wikipedia/commons/f/f6/Sand_Hollow_State_Park.jpg",
  moab:
    "https://upload.wikimedia.org/wikipedia/commons/8/89/Delicate_arch_sunset.jpg",
  springdale:
    "https://upload.wikimedia.org/wikipedia/commons/8/89/Zion_angels_landing_view.jpg",
  "st-george":
    "https://upload.wikimedia.org/wikipedia/commons/7/7d/Snow_Canyon_State_Park_Utah.jpg",
};

const BAD_IMAGE_PATTERNS = [".svg", "Special:FilePath", "/wiki/File:"];
const BANNED_PHRASES = [
  "practical stop for understanding",
  "orientation stop",
  "surrounding area usually offers",
  "site gives visitors context",
  "identifiable design features",
];

type GuideThing = {
  title: string;
  description: string;
  wikiUrl: string;
  imageUrl: string;
};

type GuideJson = {
  city?: string;
  state?: string;
  thingsToDo?: GuideThing[];
};

type WikiSummaryResponse = {
  type?: string;
  title?: string;
  extract?: string;
  thumbnail?: { source?: string };
  originalimage?: { source?: string };
  content_urls?: { desktop?: { page?: string } };
};

type WikiCacheEntry = {
  extract: string;
  wikiUrl: string;
  imageUrl: string;
};

type WikiCacheMap = Record<string, WikiCacheEntry>;

const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

const hasBannedPhrase = (value: string) => {
  const lowered = value.toLowerCase();
  return BANNED_PHRASES.some(phrase => lowered.includes(phrase));
};

const isRenderableImage = (url?: string | null) => {
  if (!url || !isValidWikiImageUrl(url)) {
    return false;
  }
  return !BAD_IMAGE_PATTERNS.some(pattern => url.includes(pattern));
};

const canonicalWikiUrl = (summary: WikiSummaryResponse, title: string) =>
  summary.content_urls?.desktop?.page?.trim() ||
  `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/\s+/g, "_"))}`;

const readCache = () => {
  try {
    return JSON.parse(fs.readFileSync(path.resolve(CACHE_FILE), "utf8")) as WikiCacheMap;
  } catch {
    return {};
  }
};

const fetchWikiSummary = async (title: string): Promise<WikiSummaryResponse | null> => {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "alloutdooradventures/1.0 (utah-authority-guides)",
        },
        signal: AbortSignal.timeout(12000),
      }
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as WikiSummaryResponse;
    if (payload.type === "missing" || !payload.extract?.trim()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

const delay = async (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

const resolveSummary = async (
  landmark: AuthorityLandmarkSpec,
  cache: WikiCacheMap
): Promise<{
  extract: string;
  wikiUrl: string;
  title: string;
  originalImageUrl?: string;
  thumbnailUrl?: string;
} | null> => {
  for (const wikiTitle of landmark.wikiTitles) {
    const summary = await fetchWikiSummary(wikiTitle);
    await delay(180);

    if (!summary?.extract) {
      continue;
    }

    return {
      extract: summary.extract,
      wikiUrl: canonicalWikiUrl(summary, summary.title || wikiTitle),
      title: summary.title || wikiTitle,
      originalImageUrl: summary.originalimage?.source,
      thumbnailUrl: summary.thumbnail?.source,
    };
  }

  const cached = cache[landmark.name];
  if (!cached) {
    return null;
  }

  return {
    extract: cached.extract,
    wikiUrl: cached.wikiUrl,
    title: landmark.name,
    originalImageUrl: cached.imageUrl,
    thumbnailUrl: cached.imageUrl,
  };
};

const regenerateGuide = async (filePath: string, cache: WikiCacheMap) => {
  const raw = fs.readFileSync(filePath, "utf8");
  const guide = JSON.parse(raw) as GuideJson;
  const citySlug = path.basename(filePath, ".json");

  if (guide.state !== "Utah") {
    return { updated: false, failures: [`Skipped ${filePath}: not a Utah guide`] };
  }

  const landmarks = getAuthorityLandmarkOverride(citySlug, "utah");
  if (!landmarks) {
    return {
      updated: false,
      failures: [`Skipped ${filePath}: no Utah authority override configured`],
    };
  }

  const fallbackImageUrl = DEFAULT_CITY_IMAGES[citySlug] ?? null;
  const failures: string[] = [];
  const nextThings: GuideThing[] = [];

  for (const landmark of landmarks) {
    const summary = await resolveSummary(landmark, cache);
    if (!summary) {
      failures.push(`${citySlug}: failed to resolve summary for ${landmark.name}`);
      continue;
    }

    const built = buildAuthorityLandmark({
      citySlug,
      stateSlug: "Utah",
      landmarkSpec: landmark,
      wikiExtract: summary.extract,
      wikiUrl: summary.wikiUrl,
      pageTitle: summary.title,
      originalImageUrl: summary.originalImageUrl,
      thumbnailUrl: summary.thumbnailUrl,
      fallbackImageUrl,
    });

    if (!built) {
      failures.push(`${citySlug}: failed to build authority landmark for ${landmark.name}`);
      continue;
    }

    const descriptionWords = wordCount(built.description);
    if (descriptionWords < 60 || descriptionWords > 90) {
      failures.push(`${citySlug}: ${landmark.name} has ${descriptionWords} words`);
      continue;
    }

    if (hasBannedPhrase(built.description)) {
      failures.push(`${citySlug}: banned phrase in ${landmark.name}`);
      continue;
    }

    const resolvedImage = isRenderableImage(built.imageUrl)
      ? built.imageUrl
      : fallbackImageUrl;

    if (!isRenderableImage(resolvedImage)) {
      failures.push(`${citySlug}: invalid image for ${landmark.name}`);
      continue;
    }

    nextThings.push({ ...built, imageUrl: resolvedImage });
  }

  if (nextThings.length !== 5) {
    failures.push(`${citySlug}: produced ${nextThings.length} landmarks (expected 5)`);
    return { updated: false, failures };
  }

  guide.thingsToDo = nextThings;
  fs.writeFileSync(filePath, `${JSON.stringify(guide, null, 2)}\n`, "utf8");
  return { updated: true, failures };
};

const main = async () => {
  const cache = readCache();
  const allFailures: string[] = [];
  let updated = 0;

  for (const file of CITY_FILES) {
    const result = await regenerateGuide(path.resolve(file), cache);
    if (result.updated) {
      updated += 1;
    }
    allFailures.push(...result.failures);
  }

  console.log(`Utah authority guides updated: ${updated}/${CITY_FILES.length}`);
  if (allFailures.length) {
    console.log("Failures:");
    for (const failure of allFailures) {
      console.log(`- ${failure}`);
    }
    process.exitCode = 1;
  }
};

void main();
