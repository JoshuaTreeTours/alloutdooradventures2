import fs from "node:fs";
import path from "node:path";
import { getWikipediaSummary } from "./wikiRest";

type WikiImageArgs = {
  title?: string | null;
  wikidataId?: string | null;
};

type WikiDataEntityResponse = {
  entities?: Record<
    string,
    {
      claims?: {
        P18?: Array<{
          mainsnak?: {
            datavalue?: {
              value?: string;
            };
          };
        }>;
      };
    }
  >;
};

type CacheState = {
  images: Record<string, string[]>;
};

const CACHE_PATH = path.resolve(".cache/wiki-images.json");
const USER_AGENT = "alloutdooradventures/1.0 (wiki-images)";
const MAX_IMAGES = 3;

let cacheLoaded = false;
let cacheDirty = false;
let cacheState: CacheState = { images: {} };

const normalizeKey = (title?: string | null, wikidataId?: string | null) =>
  `${title?.trim().toLowerCase() ?? ""}::${wikidataId?.trim().toUpperCase() ?? ""}`;

const ensureCacheLoaded = () => {
  if (cacheLoaded) return;
  cacheLoaded = true;
  if (!fs.existsSync(CACHE_PATH)) return;

  try {
    const raw = fs.readFileSync(CACHE_PATH, "utf8");
    const parsed = JSON.parse(raw) as CacheState;
    cacheState = {
      images: parsed?.images ?? {},
    };
  } catch {
    cacheState = { images: {} };
  }
};

export const flushWikiImageCache = () => {
  ensureCacheLoaded();
  if (!cacheDirty) return;
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(CACHE_PATH, `${JSON.stringify(cacheState, null, 2)}\n`, "utf8");
  cacheDirty = false;
};

const toCommonsImageUrl = (fileName: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;

const readWikidataImage = async (wikidataId?: string | null) => {
  const id = wikidataId?.trim();
  if (!id) return null;

  try {
    const url = new URL("https://www.wikidata.org/w/api.php");
    url.searchParams.set("action", "wbgetentities");
    url.searchParams.set("ids", id);
    url.searchParams.set("props", "claims");
    url.searchParams.set("format", "json");

    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as WikiDataEntityResponse;
    const imageName = payload.entities?.[id]?.claims?.P18?.[0]?.mainsnak?.datavalue
      ?.value;

    return imageName ? toCommonsImageUrl(imageName) : null;
  } catch {
    return null;
  }
};

const readSummaryThumbnail = async (title?: string | null) => {
  const cleanTitle = title?.trim();
  if (!cleanTitle) return null;
  const summary = await getWikipediaSummary(cleanTitle);
  return summary?.thumbnailUrl ?? null;
};

export const getWikiImageUrls = async (
  args: WikiImageArgs
): Promise<string[]> => {
  ensureCacheLoaded();
  const key = normalizeKey(args.title, args.wikidataId);

  if (Object.prototype.hasOwnProperty.call(cacheState.images, key)) {
    return cacheState.images[key];
  }

  const candidates = [
    await readSummaryThumbnail(args.title),
    await readWikidataImage(args.wikidataId),
  ].filter((value): value is string => Boolean(value));

  const urls = Array.from(new Set(candidates)).slice(0, MAX_IMAGES);
  cacheState.images[key] = urls;
  cacheDirty = true;

  return urls;
};
