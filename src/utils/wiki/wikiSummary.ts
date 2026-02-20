import fs from "node:fs";
import path from "node:path";

type SummaryResponse = {
  title?: string;
  extract?: string;
  type?: string;
  content_urls?: {
    desktop?: {
      page?: string;
    };
  };
};

type CacheState = {
  summaries: Record<string, { extract: string | null; url: string | null }>;
};

const CACHE_PATH = path.resolve(".cache/wiki-summaries.json");
const REQUESTS_PER_SECOND = 8;
const USER_AGENT = "alloutdooradventures/1.0 (tier1-wiki-things-to-do)";

let cacheLoaded = false;
let cacheDirty = false;
let cacheState: CacheState = { summaries: {} };
let nextRequestAt = 0;

const normalizeTitle = (title: string) =>
  title
    .trim()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ");

const ensureCacheLoaded = () => {
  if (cacheLoaded) {
    return;
  }

  cacheLoaded = true;
  if (!fs.existsSync(CACHE_PATH)) {
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
  if (!cacheDirty) {
    return;
  }

  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(
    CACHE_PATH,
    `${JSON.stringify(cacheState, null, 2)}\n`,
    "utf8"
  );
  cacheDirty = false;
};

const waitForRequestSlot = async () => {
  const minDelayMs = Math.ceil(1000 / REQUESTS_PER_SECOND);
  const now = Date.now();
  if (now < nextRequestAt) {
    await new Promise(resolve => setTimeout(resolve, nextRequestAt - now));
  }
  nextRequestAt = Math.max(now, nextRequestAt) + minDelayMs;
};

export const fetchWikiSummary = async (
  title: string
): Promise<{ extract: string | null; url: string | null }> => {
  ensureCacheLoaded();

  const trimmed = title.trim();
  if (!trimmed) {
    return { extract: null, url: null };
  }

  const lookupKey = normalizeTitle(trimmed);
  const cached = cacheState.summaries[lookupKey];
  if (cached) {
    return cached;
  }

  await waitForRequestSlot();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(trimmed)}`,
      {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": USER_AGENT,
        },
      }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      const empty = { extract: null, url: null };
      cacheState.summaries[lookupKey] = empty;
      cacheDirty = true;
      return empty;
    }

    const payload = (await response.json()) as SummaryResponse;
    const normalizedTitle = payload.title
      ? normalizeTitle(payload.title)
      : lookupKey;

    const result = {
      extract: payload.extract?.trim() || null,
      url: payload.content_urls?.desktop?.page || null,
    };

    if (payload.type === "missing" || !result.extract) {
      cacheState.summaries[lookupKey] = { extract: null, url: null };
      cacheDirty = true;
      return { extract: null, url: null };
    }

    cacheState.summaries[normalizedTitle] = result;
    cacheState.summaries[lookupKey] = result;
    cacheDirty = true;

    return result;
  } catch {
    return { extract: null, url: null };
  }
};
