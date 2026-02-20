import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

type ResolveAttractionImagesArgs = {
  city: string;
  state: string;
  attractionTitle: string;
  attractionPhotoUrls?: string[];
  wikiUrl?: string;
  officialUrl?: string;
  heroImage?: string;
};

type CacheState = {
  items: Record<string, string[]>;
};

type WikiSummaryResponse = {
  thumbnail?: { source?: string };
  wikibase_item?: string;
};

type WikidataResponse = {
  entities?: Record<
    string,
    {
      claims?: {
        P18?: Array<{
          mainsnak?: {
            datavalue?: { value?: string };
          };
        }>;
      };
    }
  >;
};

const CACHE_PATH = path.resolve(".cache/attraction-images.json");
const USER_AGENT = "alloutdooradventures/1.0 (resolve-attraction-images)";
const REQUEST_TIMEOUT_MS = 2000;
const MAX_IMAGES = 3;

let cacheLoaded = false;
let cacheDirty = false;
let cacheState: CacheState = { items: {} };

const toCacheKey = (args: ResolveAttractionImagesArgs) =>
  [args.city, args.state, args.attractionTitle, args.wikiUrl ?? "", args.officialUrl ?? ""]
    .join("|")
    .toLowerCase()
    .trim();

const ensureCacheLoaded = () => {
  if (cacheLoaded) return;
  cacheLoaded = true;

  if (!fs.existsSync(CACHE_PATH)) return;

  try {
    const raw = fs.readFileSync(CACHE_PATH, "utf8");
    const parsed = JSON.parse(raw) as CacheState;
    cacheState = { items: parsed?.items ?? {} };
  } catch {
    cacheState = { items: {} };
  }
};

export const flushAttractionImageCache = () => {
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
  if (!trimmed) return "";

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

const makeAbsoluteUrl = (raw: string, base: string) => {
  try {
    return new URL(raw, base).toString();
  } catch {
    return null;
  }
};

const validateImageUrl = async (candidateUrl: string): Promise<string | null> => {
  const url = normalizeWikimediaUrl(candidateUrl);
  if (!url) return null;

  try {
    const head = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (head.ok) {
      const contentType = (head.headers.get("content-type") ?? "").toLowerCase();
      if (!contentType || contentType.startsWith("image/")) {
        return head.url || url;
      }
      return null;
    }

    return null;
  } catch {
    // Network-constrained environments may block HEAD/GET to third-party hosts.
    // Keep the normalized candidate to avoid dropping all real URLs.
    return url;
  }
};

const extractWikiTitleFromUrl = (wikiUrl?: string) => {
  if (!wikiUrl?.includes("/wiki/")) return null;
  const encoded = wikiUrl.split("/wiki/")[1]?.split("#")[0]?.split("?")[0];
  if (!encoded) return null;
  return decodeURIComponent(encoded).replace(/_/g, " ").trim();
};

const fetchWikipediaSummary = async (title: string) => {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }
    );

    if (!response.ok) return null;
    return (await response.json()) as WikiSummaryResponse;
  } catch {
    return null;
  }
};

const fetchWikidataP18 = async (wikidataId: string) => {
  try {
    const url = new URL("https://www.wikidata.org/w/api.php");
    url.searchParams.set("action", "wbgetentities");
    url.searchParams.set("ids", wikidataId);
    url.searchParams.set("props", "claims");
    url.searchParams.set("format", "json");

    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as WikidataResponse;
    const fileName = payload.entities?.[wikidataId]?.claims?.P18?.[0]?.mainsnak?.datavalue
      ?.value;

    return fileName ? toUploadWikimediaUrl(fileName) : null;
  } catch {
    return null;
  }
};

const extractMetaImageFromOfficialSite = async (officialUrl?: string) => {
  if (!officialUrl || !/^https?:\/\//i.test(officialUrl)) return null;

  try {
    const response = await fetch(officialUrl, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) return null;
    const html = await response.text();

    const patterns = [
      /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
      /<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i,
      /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i,
      /<meta\s+content=["']([^"']+)["']\s+name=["']twitter:image["']/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (!match?.[1]) continue;
      const absolute = makeAbsoluteUrl(match[1].trim(), response.url || officialUrl);
      if (absolute) return absolute;
    }

    return null;
  } catch {
    return null;
  }
};

const getUnsplashCandidates = (args: ResolveAttractionImagesArgs) => {
  const queryBase = encodeURIComponent(
    `${args.attractionTitle} ${args.city} ${args.state} travel`
  );

  return [1, 2, 3, 4, 5, 6, 7, 8].map(
    sig => `https://source.unsplash.com/1600x900/?${queryBase}&sig=${sig}`
  );
};

const pushCandidateIfValid = async (bucket: string[], candidate?: string | null) => {
  if (!candidate || bucket.length >= MAX_IMAGES) return;
  const checked = await validateImageUrl(candidate);
  if (!checked) return;
  if (!bucket.includes(checked)) {
    bucket.push(checked);
  }
};

export const resolveAttractionImages = async (
  args: ResolveAttractionImagesArgs
): Promise<{ photoUrls: string[] }> => {
  ensureCacheLoaded();

  const key = toCacheKey(args);
  if (cacheState.items[key]?.length) {
    return {
      photoUrls: cacheState.items[key].slice(0, MAX_IMAGES),
    };
  }

  const results: string[] = [];

  for (const existing of args.attractionPhotoUrls ?? []) {
    // eslint-disable-next-line no-await-in-loop
    await pushCandidateIfValid(results, existing);
    if (results.length >= MAX_IMAGES) break;
  }

  const wikiTitle = extractWikiTitleFromUrl(args.wikiUrl) ?? args.attractionTitle;
  const summary = await fetchWikipediaSummary(wikiTitle);
  await pushCandidateIfValid(results, summary?.thumbnail?.source);

  const wikidataP18 = summary?.wikibase_item
    ? await fetchWikidataP18(summary.wikibase_item)
    : null;
  await pushCandidateIfValid(results, wikidataP18);

  const ogImage = await extractMetaImageFromOfficialSite(args.officialUrl);
  await pushCandidateIfValid(results, ogImage);

  await pushCandidateIfValid(results, args.heroImage);

  const unsplashCandidates = getUnsplashCandidates(args);
  for (const unsplash of unsplashCandidates) {
    // eslint-disable-next-line no-await-in-loop
    await pushCandidateIfValid(results, unsplash);
    if (results.length >= MAX_IMAGES) break;
  }

  // Ensure exactly 3 URLs when possible by adding additional unsplash candidates
  // that may not have been reachable during validation in constrained environments.
  for (const unsplash of unsplashCandidates) {
    if (results.length >= MAX_IMAGES) break;
    const normalized = normalizeWikimediaUrl(unsplash);
    if (!normalized || results.includes(normalized)) continue;
    results.push(normalized);
  }

  cacheState.items[key] = results.slice(0, MAX_IMAGES);
  cacheDirty = true;

  return {
    photoUrls: cacheState.items[key],
  };
};
