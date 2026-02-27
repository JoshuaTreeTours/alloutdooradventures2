import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const CACHE_DIR = path.resolve("data/cache/viator-media");

export type ViatorMediaParseResult = {
  heroImageUrl: string | null;
  imageSource: "supplierImages[0].fullSizeImage.src" | "og:image" | "none";
};

const toAbsoluteHttpsUrl = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!/^https:\/\//i.test(trimmed)) {
    return null;
  }
  return trimmed;
};

const parseJsonScriptCandidates = (html: string): unknown[] => {
  const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) ?? [];
  const parsed: unknown[] = [];
  for (const script of scripts) {
    const body = script
      .replace(/^<script[^>]*>/i, "")
      .replace(/<\/script>$/i, "")
      .trim();
    if (!body.startsWith("{")) {
      continue;
    }
    try {
      parsed.push(JSON.parse(body));
    } catch {
      // ignore non-JSON script blocks
    }
  }
  return parsed;
};

const deepFindSupplierImage = (input: unknown): string | null => {
  if (!input || typeof input !== "object") {
    return null;
  }

  if (Array.isArray(input)) {
    for (const item of input) {
      const found = deepFindSupplierImage(item);
      if (found) return found;
    }
    return null;
  }

  const candidate = input as Record<string, unknown>;
  const supplierImages = candidate.supplierImages;
  if (Array.isArray(supplierImages)) {
    const first = supplierImages[0] as
      | { fullSizeImage?: { src?: string } }
      | undefined;
    const value = toAbsoluteHttpsUrl(first?.fullSizeImage?.src);
    if (value) {
      return value;
    }
  }

  for (const value of Object.values(candidate)) {
    const found = deepFindSupplierImage(value);
    if (found) return found;
  }

  return null;
};

export const parseViatorMediaFromHtml = (
  html: string
): ViatorMediaParseResult => {
  const jsonCandidates = parseJsonScriptCandidates(html);
  for (const node of jsonCandidates) {
    const supplierImage = deepFindSupplierImage(node);
    if (supplierImage) {
      return {
        heroImageUrl: supplierImage,
        imageSource: "supplierImages[0].fullSizeImage.src",
      };
    }
  }

  const ogImage = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
  )?.[1];
  const normalizedOgImage = toAbsoluteHttpsUrl(ogImage ?? null);

  if (normalizedOgImage) {
    return {
      heroImageUrl: normalizedOgImage,
      imageSource: "og:image",
    };
  }

  return {
    heroImageUrl: null,
    imageSource: "none",
  };
};

export const getViatorMediaCacheKey = (sourceUrl: string) =>
  crypto.createHash("sha256").update(sourceUrl.trim()).digest("hex");

export const readViatorMediaCache = (
  sourceUrl: string
): ViatorMediaParseResult | null => {
  const cacheKey = getViatorMediaCacheKey(sourceUrl);
  const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);
  if (!fs.existsSync(cachePath)) {
    return null;
  }
  const parsed = JSON.parse(fs.readFileSync(cachePath, "utf8")) as {
    media?: ViatorMediaParseResult;
  };
  return parsed.media ?? null;
};
