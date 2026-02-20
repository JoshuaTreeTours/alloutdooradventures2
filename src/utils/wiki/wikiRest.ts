import fs from "node:fs";
import path from "node:path";

type WikipediaSummary = {
  title?: string;
  extract?: string;
  type?: string;
  thumbnail?: {
    source?: string;
  };
  originalimage?: {
    source?: string;
  };
  content_urls?: {
    desktop?: { page?: string };
  };
};

type CacheEntry = {
  title: string;
  extract: string;
  pageUrl?: string;
  imageUrl?: string | null;
  type?: string;
};

type CacheState = {
  summaries: Record<string, CacheEntry | null>;
};

const CACHE_PATH = path.resolve(".cache/wiki-summaries.json");
const USER_AGENT = "alloutdooradventures/1.0 (wiki-things-to-do script)";

let cacheLoaded = false;
let cacheDirty = false;
let cacheState: CacheState = { summaries: {} };
let nextRequestAt = 0;

const ensureCacheLoaded = () => {
  if (cacheLoaded) return;
  cacheLoaded = true;
  if (!fs.existsSync(CACHE_PATH)) {
    cacheState = { summaries: {} };
    return;
  }

  try {
    const raw = fs.readFileSync(CACHE_PATH, "utf8");
    const parsed = JSON.parse(raw) as CacheState;
    cacheState = {
      summaries: parsed?.summaries ?? {},
    };
  } catch {
    cacheState = { summaries: {} };
  }
};

export const flushWikiSummaryCache = () => {
  ensureCacheLoaded();
  if (!cacheDirty) return;
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(
    CACHE_PATH,
    `${JSON.stringify(cacheState, null, 2)}\n`,
    "utf8"
  );
  cacheDirty = false;
};

const waitForSlot = async (requestsPerSecond = 8) => {
  const minDelayMs = Math.max(1, Math.floor(1000 / requestsPerSecond));
  const now = Date.now();
  if (now < nextRequestAt) {
    await new Promise(resolve => setTimeout(resolve, nextRequestAt - now));
  }
  nextRequestAt = Math.max(now, nextRequestAt) + minDelayMs;
};

const toCacheKey = (title: string) =>
  title.trim().toLowerCase().replace(/\s+/g, " ");

const normalizeSummary = (data: WikipediaSummary): CacheEntry | null => {
  const extract = data.extract?.trim();
  if (!extract) return null;

  return {
    title: data.title?.trim() || "",
    extract,
    pageUrl: data.content_urls?.desktop?.page,
    imageUrl: data.thumbnail?.source ?? data.originalimage?.source ?? null,
    type: data.type,
  };
};

export const getWikipediaSummary = async (
  title: string,
  options?: { requestsPerSecond?: number }
): Promise<CacheEntry | null> => {
  ensureCacheLoaded();
  const trimmed = title.trim();
  if (!trimmed) return null;

  const key = toCacheKey(trimmed);
  if (Object.prototype.hasOwnProperty.call(cacheState.summaries, key)) {
    return cacheState.summaries[key];
  }

  await waitForSlot(options?.requestsPerSecond ?? 8);

  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(trimmed)}`,
      {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(12000),
      }
    );

    if (!response.ok) {
      cacheState.summaries[key] = null;
      cacheDirty = true;
      return null;
    }

    const json = (await response.json()) as WikipediaSummary;
    const normalized = normalizeSummary(json);
    cacheState.summaries[key] = normalized;
    cacheDirty = true;
    return normalized;
  } catch {
    return null;
  }
};
