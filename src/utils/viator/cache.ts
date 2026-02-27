import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const CACHE_DIR = path.resolve("data/cache/viator");
const TTL_MS = 14 * 24 * 60 * 60 * 1000;

type CachePayload = {
  fetchedAt: string;
  html: string;
  primaryImage?: string;
  images?: string[];
};

export const getViatorCacheKey = (viatorUrl: string) =>
  crypto.createHash("sha1").update(viatorUrl).digest("hex");

const getCachePath = (viatorUrl: string) =>
  path.join(CACHE_DIR, `${getViatorCacheKey(viatorUrl)}.json`);

export function readViatorCachedHtml(viatorUrl: string): string | null {
  const cachePath = getCachePath(viatorUrl);
  if (!fs.existsSync(cachePath)) return null;

  const parsed = JSON.parse(
    fs.readFileSync(cachePath, "utf-8")
  ) as CachePayload;
  const fetchedAt = new Date(parsed.fetchedAt).getTime();
  if (!Number.isFinite(fetchedAt) || Date.now() - fetchedAt > TTL_MS)
    return null;

  return parsed.html;
}

export function writeViatorCachedHtml(
  viatorUrl: string,
  html: string,
  media?: { primaryImage?: string; images?: string[] }
) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const cachePath = getCachePath(viatorUrl);
  const payload: CachePayload = {
    fetchedAt: new Date().toISOString(),
    html,
    primaryImage: media?.primaryImage,
    images: media?.images,
  };
  fs.writeFileSync(cachePath, JSON.stringify(payload, null, 2));
}
