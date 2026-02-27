import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const CACHE_DIR = path.resolve("data/cache/viator-media");

export type ViatorMediaParseResult = {
  heroImageUrl: string | null;
  imageSource: "supplierImages[0].fullSizeImage.src" | "og:image" | "none";
  viatorRatingValue: number | null;
  viatorReviewCount: number | null;
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

const toNumberOrNull = (value: unknown): number | null => {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value)
        : Number.NaN;

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const parseJsonScriptCandidates = (html: string): unknown[] => {
  const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) ?? [];
  const parsed: unknown[] = [];
  for (const script of scripts) {
    const body = script
      .replace(/^<script[^>]*>/i, "")
      .replace(/<\/script>$/i, "")
      .trim();

    if (!body.startsWith("{") && !body.startsWith("[")) {
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

const parseJsonLdCandidates = (html: string): unknown[] => {
  const matches = html.match(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );
  if (!matches) {
    return [];
  }

  const nodes: unknown[] = [];
  for (const match of matches) {
    const body = match
      .replace(/^<script[^>]*>/i, "")
      .replace(/<\/script>$/i, "")
      .trim();
    try {
      nodes.push(JSON.parse(body));
    } catch {
      // ignore malformed json-ld blocks
    }
  }
  return nodes;
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

const deepFindReviewData = (
  input: unknown
): { viatorRatingValue: number | null; viatorReviewCount: number | null } => {
  if (!input || typeof input !== "object") {
    return { viatorRatingValue: null, viatorReviewCount: null };
  }

  if (Array.isArray(input)) {
    for (const item of input) {
      const found = deepFindReviewData(item);
      if (found.viatorRatingValue || found.viatorReviewCount) {
        return found;
      }
    }
    return { viatorRatingValue: null, viatorReviewCount: null };
  }

  const record = input as Record<string, unknown>;
  const aggregateRating =
    record.aggregateRating && typeof record.aggregateRating === "object"
      ? (record.aggregateRating as Record<string, unknown>)
      : null;
  if (aggregateRating) {
    const ratingFromAggregate = toNumberOrNull(aggregateRating.ratingValue);
    const countFromAggregate =
      toNumberOrNull(aggregateRating.reviewCount) ??
      toNumberOrNull(aggregateRating.ratingCount);

    if (ratingFromAggregate || countFromAggregate) {
      return {
        viatorRatingValue: ratingFromAggregate,
        viatorReviewCount: countFromAggregate,
      };
    }
  }

  const review =
    record.review && typeof record.review === "object"
      ? (record.review as Record<string, unknown>)
      : null;
  if (review) {
    const ratingFromReview =
      toNumberOrNull(review.rating) ?? toNumberOrNull(review.ratingValue);
    const countFromReview =
      toNumberOrNull(review.count) ?? toNumberOrNull(review.reviewCount);

    if (ratingFromReview || countFromReview) {
      return {
        viatorRatingValue: ratingFromReview,
        viatorReviewCount: countFromReview,
      };
    }
  }

  const nestedTour =
    record.tour && typeof record.tour === "object"
      ? (record.tour as Record<string, unknown>)
      : null;
  if (nestedTour) {
    const nestedFound = deepFindReviewData(nestedTour);
    if (nestedFound.viatorRatingValue || nestedFound.viatorReviewCount) {
      return nestedFound;
    }
  }

  for (const value of Object.values(record)) {
    const found = deepFindReviewData(value);
    if (found.viatorRatingValue || found.viatorReviewCount) {
      return found;
    }
  }

  return { viatorRatingValue: null, viatorReviewCount: null };
};

export const parseViatorMediaFromHtml = (
  html: string
): ViatorMediaParseResult => {
  const jsonCandidates = parseJsonScriptCandidates(html);

  let heroImageUrl: string | null = null;
  let imageSource: ViatorMediaParseResult["imageSource"] = "none";

  for (const node of jsonCandidates) {
    const supplierImage = deepFindSupplierImage(node);
    if (supplierImage) {
      heroImageUrl = supplierImage;
      imageSource = "supplierImages[0].fullSizeImage.src";
      break;
    }
  }

  if (!heroImageUrl) {
    const ogImage = html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
    )?.[1];
    const normalizedOgImage = toAbsoluteHttpsUrl(ogImage ?? null);
    if (normalizedOgImage) {
      heroImageUrl = normalizedOgImage;
      imageSource = "og:image";
    }
  }

  const jsonLdCandidates = parseJsonLdCandidates(html);
  let viatorRatingValue: number | null = null;
  let viatorReviewCount: number | null = null;

  for (const node of jsonLdCandidates) {
    const found = deepFindReviewData(node);
    if (found.viatorRatingValue || found.viatorReviewCount) {
      viatorRatingValue = found.viatorRatingValue;
      viatorReviewCount = found.viatorReviewCount;
      break;
    }
  }

  if (!viatorRatingValue || !viatorReviewCount) {
    for (const node of jsonCandidates) {
      const found = deepFindReviewData(node);
      viatorRatingValue = viatorRatingValue ?? found.viatorRatingValue;
      viatorReviewCount = viatorReviewCount ?? found.viatorReviewCount;

      if (viatorRatingValue && viatorReviewCount) {
        break;
      }
    }
  }

  return {
    heroImageUrl,
    imageSource,
    viatorRatingValue,
    viatorReviewCount,
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
