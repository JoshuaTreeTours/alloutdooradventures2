import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { tours } from "../src/data/tours";
import { getAllEngine2Tours } from "../src/engine2/data/loadEngine2";
import { buildWikiQueries } from "../src/utils/wiki/buildWikiQueries";
import { selectBestWikiImage } from "../src/utils/wiki/selectBestWikiImage";
import {
  getFileInfo,
  searchFiles,
  type WikiFileInfo,
} from "../src/utils/wiki/wikiClient";
import type { WikiImageEntry, WikiImageIndex } from "../src/utils/wiki/types";

type TourInput = {
  tourId: string;
  title: string;
  city?: string;
  region?: string;
  keywords: string[];
  primaryCategory?: string;
};

type CacheEntry = {
  updatedAt: string;
  selected?: WikiFileInfo;
};

const OUTPUT_FILE = path.resolve("data/wikiImages.json");
const CACHE_DIR = path.resolve("data/wikiCache");
const CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const normalizeId = (value: string) => {
  const match = value.match(/(\d{3,})/);
  return match?.[1] ?? value;
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  let limit: number | undefined;
  let onlyTourIds: string[] = [];

  for (const arg of args) {
    if (arg.startsWith("--limit=")) {
      limit = Number(arg.split("=")[1]) || undefined;
    }
    if (arg.startsWith("--tourIds=")) {
      onlyTourIds = arg
        .split("=")[1]
        .split(",")
        .map(id => normalizeId(id.trim()))
        .filter(Boolean);
    }
  }

  return { limit, onlyTourIds };
};

const loadTourInputs = (): TourInput[] => {
  const engine1 = tours.map(tour => ({
    tourId: normalizeId(tour.id),
    title: tour.title,
    city: tour.destination.city,
    region: tour.destination.state,
    keywords: [tour.primaryCategory ?? "", ...(tour.tags ?? [])].filter(Boolean),
    primaryCategory: tour.primaryCategory,
  }));

  const engine2 = getAllEngine2Tours().map(tour => ({
    tourId: normalizeId(tour.id),
    title: tour.name,
    city: tour.geo.city,
    region: tour.geo.region,
    keywords: [tour.provider.shortName, ...(tour.content.highlights ?? [])].filter(Boolean),
    primaryCategory: "adventure",
  }));

  const byId = new Map<string, TourInput>();
  for (const item of [...engine1, ...engine2]) {
    if (!item.tourId || byId.has(item.tourId)) {
      continue;
    }
    byId.set(item.tourId, item);
  }

  return Array.from(byId.values());
};

const readCache = async (tourId: string) => {
  try {
    const cachePath = path.join(CACHE_DIR, `${tourId}.json`);
    const raw = await readFile(cachePath, "utf8");
    const parsed = JSON.parse(raw) as CacheEntry;
    const age = Date.now() - new Date(parsed.updatedAt).getTime();
    if (age <= CACHE_MAX_AGE_MS) {
      return parsed;
    }
  } catch {
    // ignore cache miss
  }

  return null;
};

const writeCache = async (tourId: string, payload: CacheEntry) => {
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(
    path.join(CACHE_DIR, `${tourId}.json`),
    JSON.stringify(payload, null, 2),
    "utf8",
  );
};

const toIndexEntry = (selected: WikiFileInfo): WikiImageEntry => ({
  url: selected.url,
  sourcePage: selected.sourcePage,
  author: selected.author,
  licenseShort: selected.licenseShort,
  licenseUrl: selected.licenseUrl,
  attributionText: `Photo by ${selected.author} / ${selected.licenseShort}`,
  provider: "wikimedia",
});

const buildWikiImageIndex = async () => {
  const { limit, onlyTourIds } = parseArgs();
  const inputs = loadTourInputs().filter(item =>
    onlyTourIds.length ? onlyTourIds.includes(item.tourId) : true,
  );
  const selectedInputs = typeof limit === "number" ? inputs.slice(0, limit) : inputs;

  const index: WikiImageIndex = {};

  for (const input of selectedInputs) {
    const cached = await readCache(input.tourId);
    if (cached?.selected) {
      index[input.tourId] = toIndexEntry(cached.selected);
      continue;
    }

    const queries = buildWikiQueries({
      title: input.title,
      city: input.city,
      region: input.region,
      keywords: input.keywords,
      primaryCategory: input.primaryCategory,
    });

    const fileTitles: string[] = [];
    for (const query of queries) {
      try {
        const titles = await searchFiles(query);
        fileTitles.push(...titles);
      } catch (error) {
        console.warn(`Search failed for ${input.tourId} (${query})`, error);
      }
    }

    const seen = new Set<string>();
    const uniqueTitles = fileTitles.filter(title => {
      if (seen.has(title)) {
        return false;
      }
      seen.add(title);
      return true;
    });

    const candidates: WikiFileInfo[] = [];
    for (const title of uniqueTitles.slice(0, 8)) {
      try {
        const info = await getFileInfo(title);
        if (info) {
          candidates.push(info);
        }
      } catch (error) {
        console.warn(`File info failed for ${input.tourId} (${title})`, error);
      }
    }

    const selected = selectBestWikiImage(candidates, {
      city: input.city,
      region: input.region,
    });

    await writeCache(input.tourId, {
      updatedAt: new Date().toISOString(),
      selected: selected ?? undefined,
    });

    if (selected) {
      index[input.tourId] = toIndexEntry(selected);
    }
  }

  await writeFile(OUTPUT_FILE, JSON.stringify(index, null, 2), "utf8");
  console.info(`Wrote ${Object.keys(index).length} entries to data/wikiImages.json`);
};

buildWikiImageIndex().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
