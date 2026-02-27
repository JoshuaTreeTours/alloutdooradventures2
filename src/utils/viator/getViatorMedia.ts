import fs from "node:fs";
import path from "node:path";

import { fetchViatorHtml } from "./fetchViatorHtml";
import { parseViatorTour } from "./parseViatorTour";
import {
  getViatorCacheKey,
  readViatorCachedHtml,
  writeViatorCachedHtml,
} from "./cache";
import type { ViatorMedia } from "./types";

type ViatorMediaCachePayload = {
  viatorUrl: string;
  fetchedAt: string;
  primaryImage?: string;
  images: string[];
};

const MEDIA_CACHE_DIR = path.resolve("data/cache/viator-media");
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

const getMediaCachePath = (viatorUrl: string) =>
  path.join(MEDIA_CACHE_DIR, `${getViatorCacheKey(viatorUrl)}.json`);

const readMediaCache = (viatorUrl: string): ViatorMedia | null => {
  const cachePath = getMediaCachePath(viatorUrl);
  if (!fs.existsSync(cachePath)) return null;

  const payload = JSON.parse(
    fs.readFileSync(cachePath, "utf-8")
  ) as ViatorMediaCachePayload;
  const fetchedAt = new Date(payload.fetchedAt).getTime();
  if (!Number.isFinite(fetchedAt) || Date.now() - fetchedAt > TTL_MS) {
    return null;
  }

  return {
    primaryImage: payload.primaryImage,
    images: payload.images,
  };
};

const writeMediaCache = (viatorUrl: string, media: ViatorMedia) => {
  fs.mkdirSync(MEDIA_CACHE_DIR, { recursive: true });
  const payload: ViatorMediaCachePayload = {
    viatorUrl,
    fetchedAt: new Date().toISOString(),
    primaryImage: media.primaryImage,
    images: media.images,
  };
  fs.writeFileSync(
    getMediaCachePath(viatorUrl),
    `${JSON.stringify(payload, null, 2)}\n`
  );
};

export async function getViatorMedia(viatorUrl: string): Promise<ViatorMedia> {
  const cached = readMediaCache(viatorUrl);
  if (cached) {
    return cached;
  }

  const html =
    readViatorCachedHtml(viatorUrl) ?? (await fetchViatorHtml(viatorUrl));
  const parsed = parseViatorTour(html, viatorUrl);
  if (!readViatorCachedHtml(viatorUrl)) {
    writeViatorCachedHtml(viatorUrl, html, {
      primaryImage: parsed.primaryImage,
      images: parsed.images,
    });
  }
  const media: ViatorMedia = {
    primaryImage: parsed.primaryImage,
    images: parsed.images,
  };
  writeMediaCache(viatorUrl, media);
  return media;
}
