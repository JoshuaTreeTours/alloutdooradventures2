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
  meetingPoint: ViatorMeetingPoint | null;
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

  const maybeParse = (candidate: string) => {
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

    if (body.startsWith("{") || body.startsWith("[")) {
      maybeParse(body);
      continue;
    }

    const objectMatch = body.match(/([\[{][\s\S]*[\]}])/);
    if (objectMatch?.[1]) {
      maybeParse(objectMatch[1]);
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

const toMeetingPoint = (input: unknown): ViatorMeetingPoint | null => {
  if (!input || typeof input !== "object") {
    return null;
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
    return null;
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
  input: unknown
): ViatorMeetingPoint | null => {
  if (!input || typeof input !== "object") {
    return null;
  }

  if (Array.isArray(input)) {
    for (const item of input) {
      const found = findMeetingPointInObject(item);
      if (found) {
        return found;
      }
    }
    return null;
  }

  const record = input as Record<string, unknown>;

  const directMeetingPoint = toMeetingPoint(record.meetingPoint);
  if (directMeetingPoint) {
    return directMeetingPoint;
  }

  const logistics =
    record.logistics && typeof record.logistics === "object"
      ? (record.logistics as Record<string, unknown>)
      : null;
  const logisticsMeetingPoint = toMeetingPoint(logistics?.meetingPoint);
  if (logisticsMeetingPoint) {
    return logisticsMeetingPoint;
  }

  const meetingAndPickup =
    record.meetingAndPickup && typeof record.meetingAndPickup === "object"
      ? (record.meetingAndPickup as Record<string, unknown>)
      : null;
  const meetingAndPickupPoint = toMeetingPoint(meetingAndPickup?.meetingPoint);
  if (meetingAndPickupPoint) {
    return meetingAndPickupPoint;
  }

  const locations = Array.isArray(record.locations)
    ? (record.locations as Array<Record<string, unknown>>)
    : [];
  const locationMatch = locations.find(
    location =>
      typeof location === "object" &&
      String(location.type ?? "").toUpperCase() === "MEETING_POINT"
  );
  const locationsMeetingPoint = toMeetingPoint(locationMatch);
  if (locationsMeetingPoint) {
    return locationsMeetingPoint;
  }

  for (const value of Object.values(record)) {
    const found = findMeetingPointInObject(value);
    if (found) {
      return found;
    }
  }

  return null;
};

export const parseViatorMediaFromHtml = (
  html: string,
  sourceUrl?: string
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

  let meetingPoint: ViatorMeetingPoint | null = null;
  for (const node of jsonCandidates) {
    meetingPoint = findMeetingPointInObject(node);
    if (meetingPoint) {
      break;
    }
  }

  if (sourceUrl?.includes(TARGET_VIATOR_TOUR_FRAGMENT)) {
    console.info("[viator-parser:meeting-point]", {
      sourceUrl,
      pathMatched: Boolean(meetingPoint),
      meetingPoint,
    });
  }

  return {
    heroImageUrl,
    imageSource,
    viatorRatingValue,
    viatorReviewCount,
    meetingPoint,
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
