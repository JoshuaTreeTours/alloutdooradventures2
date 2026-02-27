import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const CACHE_DIR = path.resolve("data/cache/viator-media");
const TARGET_VIATOR_TOUR_FRAGMENT = "d648-2335P1";

export type ViatorMeetingPoint = {
  name?: string | null;
  address?: string | null;
  instructions?: string | null;
  mapsUrl?: string | null;
};

export type ViatorMediaParseResult = {
  heroImageUrl: string | null;
  imageSource: "supplierImages[0].fullSizeImage.src" | "og:image" | "none";
  viatorRatingValue: number | null;
  viatorReviewCount: number | null;
  meetingPoint?: ViatorMeetingPoint;
};

type ViatorDepartureLocation = {
  title?: string;
  description?: string;
  instructions?: string;
  googleMapsUrl?: string;
};

export function extractMeetingPointFromViatorPayload(payload: any) {
  const loc: ViatorDepartureLocation | undefined =
    payload?.departureAndReturnLocations?.departureLocations?.[0];

  const description =
    typeof loc?.description === "string" ? loc.description.trim() : "";
  if (!description) return null;

  return {
    title: typeof loc?.title === "string" ? loc.title.trim() : undefined,
    address: description,
    instructions:
      typeof loc?.instructions === "string"
        ? loc.instructions.trim()
        : undefined,
    mapsUrl:
      typeof loc?.googleMapsUrl === "string"
        ? loc.googleMapsUrl.trim()
        : undefined,
  };
}

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

const decodeQuotedString = (quotedLiteral: string): string | null => {
  try {
    return JSON.parse(
      `"${quotedLiteral.replace(/\\/g, "\\\\").replace(/\"/g, '\\\"')}"`
    );
  } catch {
    return null;
  }
};

const extractJsonLikeBlocks = (body: string): string[] => {
  const blocks: string[] = [];
  const stack: string[] = [];
  let startIndex = -1;
  let inString = false;
  let quoteChar = "";
  let isEscaped = false;

  for (let i = 0; i < body.length; i += 1) {
    const char = body[i];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
        continue;
      }
      if (char === "\\") {
        isEscaped = true;
        continue;
      }
      if (char === quoteChar) {
        inString = false;
        quoteChar = "";
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      quoteChar = char;
      continue;
    }

    if (char === "{" || char === "[") {
      if (stack.length === 0) {
        startIndex = i;
      }
      stack.push(char === "{" ? "}" : "]");
      continue;
    }

    if (char === "}" || char === "]") {
      const expectedClose = stack[stack.length - 1];
      if (expectedClose !== char) {
        stack.length = 0;
        startIndex = -1;
        continue;
      }

      stack.pop();
      if (stack.length === 0 && startIndex >= 0) {
        blocks.push(body.slice(startIndex, i + 1));
        startIndex = -1;
      }
    }
  }

  return blocks;
};

const parseJsonScriptCandidates = (html: string): unknown[] => {
  const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) ?? [];
  const parsed: unknown[] = [];

  const tryParse = (candidate: string) => {
    const value = candidate.trim();
    if (!value) {
      return;
    }

    try {
      parsed.push(JSON.parse(value));
    } catch {
      // ignore invalid JSON fragments
    }
  };

  for (const script of scripts) {
    const body = script
      .replace(/^<script[^>]*>/i, "")
      .replace(/<\/script>$/i, "")
      .trim();

    if (!body) {
      continue;
    }

    if (body.startsWith("{") || body.startsWith("[")) {
      tryParse(body);
    }

    for (const block of extractJsonLikeBlocks(body)) {
      tryParse(block);
    }

    const jsonParseMatches = body.matchAll(
      /JSON\.parse\(\s*['"]([\s\S]*?)['"]\s*\)/g
    );

    for (const match of jsonParseMatches) {
      const raw = match[1];
      if (!raw) {
        continue;
      }
      const decoded = decodeQuotedString(raw);
      if (decoded) {
        tryParse(decoded);
      }
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

  for (const value of Object.values(record)) {
    const found = deepFindReviewData(value);
    if (found.viatorRatingValue || found.viatorReviewCount) {
      return found;
    }
  }

  return { viatorRatingValue: null, viatorReviewCount: null };
};

const toMeetingPoint = (input: unknown): ViatorMeetingPoint | undefined => {
  if (!input || typeof input !== "object") {
    return undefined;
  }

  const record = input as Record<string, unknown>;
  const addressRecord =
    record.address && typeof record.address === "object"
      ? (record.address as Record<string, unknown>)
      : null;

  const addressLineParts = [
    typeof record.addressLine1 === "string" ? record.addressLine1.trim() : null,
    typeof record.addressLine2 === "string" ? record.addressLine2.trim() : null,
    typeof record.streetAddress === "string"
      ? record.streetAddress.trim()
      : null,
    addressRecord && typeof addressRecord.streetAddress === "string"
      ? addressRecord.streetAddress.trim()
      : null,
    addressRecord && typeof addressRecord.addressLocality === "string"
      ? addressRecord.addressLocality.trim()
      : null,
    addressRecord && typeof addressRecord.addressRegion === "string"
      ? addressRecord.addressRegion.trim()
      : null,
    addressRecord && typeof addressRecord.postalCode === "string"
      ? addressRecord.postalCode.trim()
      : null,
    addressRecord && typeof addressRecord.addressCountry === "string"
      ? addressRecord.addressCountry.trim()
      : null,
  ].filter((value): value is string => Boolean(value));

  const explicitAddress =
    typeof record.formattedAddress === "string"
      ? record.formattedAddress.trim()
      : typeof record.fullAddress === "string"
        ? record.fullAddress.trim()
        : typeof record.address === "string"
          ? record.address.trim()
          : null;

  const address =
    explicitAddress ||
    (addressLineParts.length ? addressLineParts.join(", ") : null);

  const mapsUrl =
    toAbsoluteHttpsUrl(record.mapsUrl) ??
    toAbsoluteHttpsUrl(record.googleMapsUrl) ??
    toAbsoluteHttpsUrl(record.mapUrl);

  const hasStructuredAddress =
    typeof record.addressLine1 === "string" ||
    typeof record.streetAddress === "string" ||
    Boolean(addressRecord?.streetAddress) ||
    Boolean(addressRecord?.addressLocality);

  if (!address && !hasStructuredAddress && !mapsUrl) {
    return undefined;
  }

  return {
    name:
      typeof record.name === "string"
        ? record.name.trim()
        : typeof record.locationName === "string"
          ? record.locationName.trim()
          : null,
    address,
    instructions:
      typeof record.instructions === "string"
        ? record.instructions.trim()
        : typeof record.description === "string"
          ? record.description.trim()
          : null,
    mapsUrl,
  };
};

const findMeetingPointInObject = (
  input: unknown,
  currentPath = "root"
): { meetingPoint?: ViatorMeetingPoint; sourcePath: string } => {
  if (!input || typeof input !== "object") {
    return { sourcePath: "none" };
  }

  if (Array.isArray(input)) {
    for (let i = 0; i < input.length; i += 1) {
      const found = findMeetingPointInObject(input[i], `${currentPath}[${i}]`);
      if (found.meetingPoint) {
        return found;
      }
    }
    return { sourcePath: "none" };
  }

  const record = input as Record<string, unknown>;

  const departureMeetingPoint = extractMeetingPointFromViatorPayload(record);
  if (departureMeetingPoint?.address || departureMeetingPoint?.mapsUrl) {
    return {
      meetingPoint: {
        name: departureMeetingPoint.title,
        address: departureMeetingPoint.address,
        instructions: departureMeetingPoint.instructions,
        mapsUrl: departureMeetingPoint.mapsUrl,
      },
      sourcePath: `${currentPath}.departureAndReturnLocations.departureLocations[0]`,
    };
  }

  const directMeetingPoint = toMeetingPoint(record.meetingPoint);
  if (directMeetingPoint) {
    return {
      meetingPoint: directMeetingPoint,
      sourcePath: `${currentPath}.meetingPoint`,
    };
  }

  const locations = Array.isArray(record.locations)
    ? (record.locations as Array<Record<string, unknown>>)
    : [];
  const locationIndex = locations.findIndex(
    location =>
      typeof location === "object" &&
      String(location.type ?? "").toUpperCase() === "MEETING_POINT"
  );
  if (locationIndex >= 0) {
    const locationsMeetingPoint = toMeetingPoint(locations[locationIndex]);
    if (locationsMeetingPoint) {
      return {
        meetingPoint: locationsMeetingPoint,
        sourcePath: `${currentPath}.locations[${locationIndex}]`,
      };
    }
  }

  for (const [key, value] of Object.entries(record)) {
    const found = findMeetingPointInObject(value, `${currentPath}.${key}`);
    if (found.meetingPoint) {
      return found;
    }
  }

  return { sourcePath: "none" };
};

export const parseViatorMediaFromHtml = (
  html: string,
  sourceUrl?: string
): ViatorMediaParseResult => {
  const jsonCandidates = parseJsonScriptCandidates(html);
  const jsonLdCandidates = parseJsonLdCandidates(html);
  const allEmbeddedJson = [...jsonCandidates, ...jsonLdCandidates];

  let heroImageUrl: string | null = null;
  let imageSource: ViatorMediaParseResult["imageSource"] = "none";

  for (const node of allEmbeddedJson) {
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

  let viatorRatingValue: number | null = null;
  let viatorReviewCount: number | null = null;

  for (const node of allEmbeddedJson) {
    const found = deepFindReviewData(node);
    viatorRatingValue = viatorRatingValue ?? found.viatorRatingValue;
    viatorReviewCount = viatorReviewCount ?? found.viatorReviewCount;

    if (viatorRatingValue && viatorReviewCount) {
      break;
    }
  }

  let meetingPoint: ViatorMeetingPoint | undefined;
  let sourcePath = "none";

  for (const node of allEmbeddedJson) {
    const found = findMeetingPointInObject(node);
    if (found.meetingPoint) {
      meetingPoint = found.meetingPoint;
      sourcePath = found.sourcePath;
      break;
    }
  }

  if (sourceUrl?.includes(TARGET_VIATOR_TOUR_FRAGMENT)) {
    console.log("MeetingPointSource:", sourcePath);
  }

  return {
    heroImageUrl,
    imageSource,
    viatorRatingValue,
    viatorReviewCount,
    ...(meetingPoint ? { meetingPoint } : {}),
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
