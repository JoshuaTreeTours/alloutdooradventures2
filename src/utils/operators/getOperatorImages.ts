import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import operatorImageSources from "../../../data/operatorImageSources.json";

const CACHE_DIR = path.resolve("data/cache/operator-media");
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

type OperatorConfig = {
  match: string[];
  tourPages: string[];
};

type OperatorConfigMap = Record<string, OperatorConfig>;

const CONFIG = operatorImageSources as OperatorConfigMap;

const isValidImage = (url: string) => {
  const lowered = url.toLowerCase();
  if (!(lowered.startsWith("https://") || lowered.startsWith("http://"))) {
    return false;
  }
  if (
    ["data:image", "logo", "icon", "sprite", "favicon"].some(token =>
      lowered.includes(token)
    )
  ) {
    return false;
  }
  return (
    /(\.jpg|\.jpeg|\.png|\.webp)(\?|$)/i.test(lowered) ||
    lowered.includes("cdn")
  );
};

const normalizeUrl = (url: string, base: string) => {
  try {
    const normalized = new URL(url, base);
    if (normalized.protocol === "http:") normalized.protocol = "https:";
    return normalized.toString();
  } catch {
    return null;
  }
};

const cachePathFor = (url: string) =>
  path.join(
    CACHE_DIR,
    `${crypto.createHash("sha1").update(url).digest("hex")}.json`
  );

const readCachedPageImages = (url: string): string[] | null => {
  const cachePath = cachePathFor(url);
  if (!fs.existsSync(cachePath)) return null;
  const payload = JSON.parse(fs.readFileSync(cachePath, "utf-8")) as {
    fetchedAt: string;
    images: string[];
  };
  const fetchedAt = new Date(payload.fetchedAt).getTime();
  if (!Number.isFinite(fetchedAt) || Date.now() - fetchedAt > TTL_MS) {
    return null;
  }
  return payload.images;
};

const writeCachedPageImages = (url: string, images: string[]) => {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(
    cachePathFor(url),
    `${JSON.stringify({ fetchedAt: new Date().toISOString(), images }, null, 2)}\n`
  );
};

const parseOperatorHtmlImages = (html: string, pageUrl: string): string[] => {
  const images: string[] = [];

  const og = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
  );
  if (og?.[1]) {
    const normalized = normalizeUrl(og[1], pageUrl);
    if (normalized && isValidImage(normalized)) images.push(normalized);
  }

  for (const match of Array.from(
    html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)
  )) {
    const normalized = normalizeUrl(match[1], pageUrl);
    if (!normalized || !isValidImage(normalized)) continue;
    if (!images.includes(normalized)) images.push(normalized);
    if (images.length >= 8) break;
  }

  return images;
};

async function fetchOperatorPageImages(url: string): Promise<string[]> {
  const cached = readCachedPageImages(url);
  if (cached) return cached;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AllOutdoorAdventuresBot/1.0; +https://www.alloutdooradventures.com)",
      },
    });
    if (!response.ok) {
      writeCachedPageImages(url, []);
      return [];
    }
    const html = await response.text();
    const images = parseOperatorHtmlImages(html, url);
    writeCachedPageImages(url, images);
    return images;
  } catch {
    writeCachedPageImages(url, []);
    return [];
  }
}

export function bestOperatorMatchForTour(title: string): string | null {
  const titleLower = title.toLowerCase();

  for (const [domain, cfg] of Object.entries(CONFIG)) {
    if (cfg.match.some(keyword => titleLower.includes(keyword.toLowerCase()))) {
      return domain;
    }
  }

  return null;
}

export async function getOperatorImages(
  operatorDomain: string
): Promise<string[]> {
  const cfg = CONFIG[operatorDomain];
  if (!cfg) return [];

  const all: string[] = [];
  for (const page of cfg.tourPages) {
    const pageImages = await fetchOperatorPageImages(page);
    for (const image of pageImages) {
      if (!all.includes(image)) {
        all.push(image);
      }
    }
  }

  return all;
}
