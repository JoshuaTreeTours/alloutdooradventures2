import fs from "node:fs";
import path from "node:path";

type SummaryResponse = {
  query?: {
    pages?: Record<
      string,
      {
        title?: string;
        extract?: string;
        thumbnail?: {
          source?: string;
        };
        original?: {
          source?: string;
        };
        canonicalurl?: string;
        fullurl?: string;
        pageid?: number;
        missing?: boolean;
      }
    >;
  };
};

type CacheState = {
  summaries: Record<
    string,
    { extract: string | null; url: string | null; imageUrl: string | null }
  >;
};

const CACHE_PATH = path.resolve(".cache/wiki-summaries.json");
const REQUESTS_PER_SECOND = 8;
const USER_AGENT = "alloutdooradventures/1.0 (tier1-wiki-things-to-do)";

let cacheLoaded = false;
let cacheDirty = false;
let cacheState: CacheState = { summaries: {} };
let nextRequestAt = 0;

const normalizeTitle = (title: string) =>
  title.trim().toLowerCase().replace(/_/g, " ").replace(/\s+/g, " ");

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
): Promise<{
  extract: string | null;
  url: string | null;
  imageUrl: string | null;
}> => {
  ensureCacheLoaded();

  const trimmed = title.trim();
  if (!trimmed) {
    return { extract: null, url: null, imageUrl: null };
  }

  const lookupKey = normalizeTitle(trimmed);
  const cached = cacheState.summaries[lookupKey];
  if (cached) {
    return cached;
  }

  await waitForRequestSlot();

  try {
    const apiUrl = new URL("https://en.wikipedia.org/w/api.php");
    apiUrl.searchParams.set("action", "query");
    apiUrl.searchParams.set("format", "json");
    apiUrl.searchParams.set("prop", "extracts|pageimages|info");
    apiUrl.searchParams.set("titles", trimmed);
    apiUrl.searchParams.set("exintro", "true");
    apiUrl.searchParams.set("explaintext", "true");
    apiUrl.searchParams.set("redirects", "true");
    apiUrl.searchParams.set("inprop", "url");
    apiUrl.searchParams.set("pithumbsize", "1200");

    const request = fetch(apiUrl.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
    });

    const response = (await Promise.race([
      request,
      new Promise<null>(resolve => setTimeout(() => resolve(null), 5000)),
    ])) as Response | null;

    if (!response || !response.ok) {
      const empty = { extract: null, url: null, imageUrl: null };
      cacheState.summaries[lookupKey] = empty;
      cacheDirty = true;
      return empty;
    }

    const payload = (await response.json()) as SummaryResponse;
    const pages = payload.query?.pages ? Object.values(payload.query.pages) : [];
    const page = pages.find(entry => !entry.missing && entry.extract?.trim());

    if (!page || !page.extract?.trim()) {
      const empty = { extract: null, url: null, imageUrl: null };
      cacheState.summaries[lookupKey] = empty;
      cacheDirty = true;
      return empty;
    }

    const normalizedTitle = page.title ? normalizeTitle(page.title) : lookupKey;
    const result = {
      extract: page.extract.trim(),
      url: page.fullurl ?? page.canonicalurl ?? null,
      imageUrl: page.thumbnail?.source ?? page.original?.source ?? null,
    };

    cacheState.summaries[normalizedTitle] = result;
    cacheState.summaries[lookupKey] = result;
    cacheDirty = true;

    return result;
  } catch {
    return { extract: null, url: null, imageUrl: null };
  }
};
