import crypto from "node:crypto";
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
const FALLBACK_IMAGE_URL = "/images/default-attraction.svg";

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

const normalizeFileName = (fileName: string) => fileName.trim().replace(/ /g, "_");

const toUploadWikimediaUrl = (fileName: string) => {
  const normalized = normalizeFileName(fileName);
  const hash = crypto.createHash("md5").update(normalized).digest("hex");
  return `https://upload.wikimedia.org/wikipedia/commons/${hash[0]}/${hash.slice(
    0,
    2
  )}/${encodeURIComponent(normalized)}`;
};

const normalizeWikimediaUrl = (url: string) => {
  const trimmed = url.trim();

  if (trimmed.startsWith("https://upload.wikimedia.org/")) {
    return trimmed;
  }

  const specialPathMatch = trimmed.match(/Special:FilePath\/([^?#]+)/i);
  if (specialPathMatch?.[1]) {
    return toUploadWikimediaUrl(decodeURIComponent(specialPathMatch[1]));
  }

  const filePageMatch = trimmed.match(/\/wiki\/File:([^?#]+)/i);
  if (filePageMatch?.[1]) {
    return toUploadWikimediaUrl(decodeURIComponent(filePageMatch[1]));
  }

  return trimmed;
};

const isValidImageUrl = async (url: string) => {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      headers: {
        "User-Agent": USER_AGENT,
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) return false;
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType && !contentType.toLowerCase().startsWith("image/")) {
      return false;
    }

    return true;
  } catch {
    try {
      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: {
          "User-Agent": USER_AGENT,
          Range: "bytes=0-0",
        },
        signal: AbortSignal.timeout(12000),
      });

      if (!response.ok) return false;
      const contentType = response.headers.get("content-type") ?? "";
      return contentType.toLowerCase().startsWith("image/");
    } catch {
      return false;
    }
  }
};

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

    return imageName ? toUploadWikimediaUrl(imageName) : null;
  } catch {
    return null;
  }
};

const readSummaryThumbnail = async (title?: string | null) => {
  const cleanTitle = title?.trim();
  if (!cleanTitle) return null;
  const summary = await getWikipediaSummary(cleanTitle);
  return summary?.thumbnailUrl ? normalizeWikimediaUrl(summary.thumbnailUrl) : null;
};

export const getWikiImageUrls = async (
  args: WikiImageArgs
): Promise<string[]> => {
  ensureCacheLoaded();
  const key = normalizeKey(args.title, args.wikidataId);

  if (Object.prototype.hasOwnProperty.call(cacheState.images, key)) {
    return cacheState.images[key];
  }

  const rawCandidates = [
    await readSummaryThumbnail(args.title),
    await readWikidataImage(args.wikidataId),
  ].filter((value): value is string => Boolean(value));

  const normalizedCandidates = Array.from(
    new Set(rawCandidates.map(normalizeWikimediaUrl).filter(Boolean))
  ).slice(0, MAX_IMAGES);

  const validated: string[] = [];
  for (const candidate of normalizedCandidates) {
    // Validate with HEAD/GET probe and only keep healthy image URLs.
    // eslint-disable-next-line no-await-in-loop
    if (await isValidImageUrl(candidate)) {
      validated.push(candidate);
    }
  }

  const urls = validated.length ? validated : [FALLBACK_IMAGE_URL];
  cacheState.images[key] = urls;
  cacheDirty = true;

  return urls;
};
