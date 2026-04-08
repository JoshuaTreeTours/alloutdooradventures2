import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export const ENGINE6_HERO_SELECTION_VERSION = "engine6-v2-deterministic";

export type Engine6HeroSourceType = "api-primary" | "api-gallery" | "none";

export type Engine6HeroQualityClassification =
  | "caption"
  | "product-media"
  | "splice"
  | "thumbnail"
  | "none";

export type Engine6HeroVariantType =
  | "CAPTION"
  | "PRODUCT_MEDIA"
  | "SPLICE"
  | "THUMBNAIL"
  | "UNKNOWN";

export type Engine6HeroCandidate = {
  productCode?: string | null;
  productUrl?: string | null;
  candidateUrl?: string;
  normalizedUrl?: string;
  variantType?: Engine6HeroVariantType;
  width?: number | null;
  height?: number | null;
  sourceFieldPath?: string | null;
  sourceHost?: string | null;
  isSameProduct?: boolean;
  rawCandidateMetadata?: Record<string, unknown>;
  selectionVersion?: string;
  sourceType: Engine6HeroSourceType;
  sourceProductCode?: string | null;
  sourceProductUrl?: string | null;
  fieldPath?: string | null;
  variantPath?: string | null;
  host?: string | null;
  qualityClassification?: Engine6HeroQualityClassification | null;
  candidateProductCode?: string | null;
  candidateSourceProductUrl?: string | null;
  familyKey?: string | null;
  path?: string;
  url?: string;
};

export type Engine6RejectedHeroCandidate = {
  url: string;
  sourceType: Engine6HeroSourceType;
  reason:
    | "foreign-product"
    | "missing-product-scope"
    | "missing-source-field-path"
    | "invalid-url"
    | "malformed"
    | "untrusted-media-host"
    | "irrelevant-placeholder"
    | "unresolvable";
  candidateProductCode: string | null;
  candidateSourceProductUrl: string | null;
  fieldPath: string | null;
};

export type Engine6ResolvedHero = {
  heroUrl: string | null;
  heroSourceType: Engine6HeroSourceType;
  heroQualityClassification: Engine6HeroQualityClassification;
  fallbackTriggered: boolean;
  finalCandidate: Engine6HeroCandidate | null;
  rejectedForeignCandidates: Engine6RejectedHeroCandidate[];
  captionPrecedenceApplied: boolean;
  candidateFamilyIdentityDeterminable: boolean;
  selectedFromCache: boolean;
  selectionVersion: string;
  resolutionReason: string;
  rejectedCandidateCount: number;
};

export type Engine6ResolvedHeroCacheRecord = {
  productCode: string;
  productUrl: string | null;
  resolvedHeroUrl: string | null;
  heroSourceType: Engine6HeroSourceType;
  resolvedAt: string;
  productPayloadHash: string;
  selectionVersion: string;
  resolutionReason: string;
  rejectedCandidateCount: number;
  sourceFieldPath: string | null;
  sourceProductCode: string | null;
  sourceProductUrl: string | null;
  sourceHost: string | null;
  variantType: Engine6HeroVariantType;
  width: number | null;
  height: number | null;
  variantPath: string | null;
};

const getDefaultCachePath = () =>
  process.env.VITEST
    ? path.join(tmpdir(), "engine6-resolved-hero-cache.test.json")
    : path.join(process.cwd(), "data", "engine6", "resolved-hero-cache.json");

type RecordLike = Record<string, unknown>;
type PathSegment = string | number;

const asRecord = (value: unknown): RecordLike | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordLike)
    : null;

const readPath = (root: unknown, pathSegments: PathSegment[]): unknown => {
  let cursor = root;
  for (const segment of pathSegments) {
    if (typeof segment === "number") {
      if (!Array.isArray(cursor)) return undefined;
      cursor = cursor[segment];
      continue;
    }
    if (!cursor || typeof cursor !== "object") return undefined;
    cursor = (cursor as RecordLike)[segment];
  }
  return cursor;
};

const formatFieldPath = (pathSegments: PathSegment[]) =>
  `product${pathSegments
    .map(segment => (typeof segment === "number" ? `[${segment}]` : `.${segment}`))
    .join("")}`;

const normalizeProductCode = (value: unknown) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return normalized || null;
};

const normalizeProductUrl = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    parsed.hash = "";
    parsed.search = "";
    parsed.pathname = parsed.pathname.replace(/\/+$/, "") || "/";
    return parsed.toString();
  } catch {
    return null;
  }
};

const extractProductPayload = (payload: unknown) => {
  const root = asRecord(payload);
  const product = asRecord(root?.product) ?? root;
  return product;
};

const sanitizeImageUrl = (value: string): string => {
  const trimmed = value.trim().replace(/[)\]}>"'.,;:]+$/g, "");
  return trimmed;
};

const normalizeCandidateUrl = (value: string): string => {
  const sanitized = sanitizeImageUrl(value);
  try {
    const parsed = new URL(sanitized);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return sanitized;
  }
};

const parseNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const variantTypeFromUrlAndPath = (url: string, sourceFieldPath: string | null): Engine6HeroVariantType => {
  const lowered = url.toLowerCase();
  const pathLowered = (sourceFieldPath ?? "").toLowerCase();
  if (lowered.includes("caption.jpg") || pathLowered.includes("caption")) return "CAPTION";
  if (lowered.includes("attractions-splice")) return "SPLICE";
  if (pathLowered.includes("thumb") || lowered.includes("thumbnail")) return "THUMBNAIL";
  if (pathLowered.includes("product.media.images") || lowered.includes("/photo-o/") || lowered.includes("/photo-s/")) return "PRODUCT_MEDIA";
  return "UNKNOWN";
};

const classificationFromVariantType = (
  variantType: Engine6HeroVariantType
): Engine6HeroQualityClassification => {
  if (variantType === "CAPTION") return "caption";
  if (variantType === "SPLICE") return "splice";
  if (variantType === "THUMBNAIL") return "thumbnail";
  if (variantType === "PRODUCT_MEDIA" || variantType === "UNKNOWN") return "product-media";
  return "none";
};

const isTrustedHost = (value: string) => {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return (
      host === "cdn.filestackcontent.com" ||
      host === "www.filepicker.io" ||
      host === "dynamic-media.tacdn.com" ||
      host === "media.tacdn.com" ||
      host === "media-cdn.tripadvisor.com" ||
      host === "dynamic-media-cdn.tripadvisor.com" ||
      host.endsWith(".tacdn.com") ||
      host.endsWith(".tripadvisor.com")
    );
  } catch {
    return false;
  }
};

const extractSourceHost = (value: string) => {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
};

const isLikelyResolvable = (url: string) => /\.(jpg|jpeg|png|webp|avif)(\?|$)/i.test(url);

const buildCandidate = (args: {
  productCode: string | null;
  productUrl: string | null;
  candidateUrl: string;
  sourceFieldPath: string | null;
  variantPath?: string | null;
  width: number | null;
  height: number | null;
  metadata: Record<string, unknown>;
}): Engine6HeroCandidate => {
  const normalizedUrl = normalizeCandidateUrl(args.candidateUrl);
  const variantType = variantTypeFromUrlAndPath(normalizedUrl, args.sourceFieldPath);
  const sourceHost = extractSourceHost(normalizedUrl);
  return {
    productCode: args.productCode,
    productUrl: args.productUrl,
    candidateUrl: args.candidateUrl,
    normalizedUrl,
    variantType,
    width: args.width,
    height: args.height,
    sourceFieldPath: args.sourceFieldPath,
    sourceHost,
    isSameProduct: true,
    rawCandidateMetadata: args.metadata,
    selectionVersion: ENGINE6_HERO_SELECTION_VERSION,
    sourceType: "api-primary",
    sourceProductCode: args.productCode,
    sourceProductUrl: args.productUrl,
    fieldPath: args.sourceFieldPath,
    variantPath: args.variantPath ?? null,
    host: sourceHost,
    qualityClassification: classificationFromVariantType(variantType),
    candidateProductCode: args.productCode,
    candidateSourceProductUrl: args.productUrl,
    path: args.sourceFieldPath ?? undefined,
    url: normalizedUrl,
  };
};

export const extractEngine6HeroCandidatesFromProductPayload = (
  payload: unknown
): Engine6HeroCandidate[] => {
  const product = extractProductPayload(payload);
  if (!product) return [];

  const productCode = normalizeProductCode(product.productCode);
  const productUrl = normalizeProductUrl(
    product.productUrl ?? product.productURL ?? product.webUrl ?? product.url
  );

  const images = readPath(product, ["media", "images"]);
  if (!Array.isArray(images)) return [];

  const candidates: Engine6HeroCandidate[] = [];

  for (let i = 0; i < images.length; i += 1) {
    const image = asRecord(images[i]);
    if (!image) continue;

    const variantsRecord = asRecord(image.variants);
    if (variantsRecord) {
      for (const [variantKey, rawVariant] of Object.entries(variantsRecord)) {
        const variant = asRecord(rawVariant);
        if (!variant) continue;
        const candidateUrl =
          typeof variant.url === "string"
            ? variant.url
            : typeof variant.src === "string"
              ? variant.src
              : null;
        if (!candidateUrl) continue;

        candidates.push(
          buildCandidate({
            productCode,
            productUrl,
            candidateUrl,
            sourceFieldPath: formatFieldPath(["media", "images", i, "variants", variantKey, "url"]),
            variantPath: formatFieldPath(["media", "images", i, "variants", variantKey]),
            width: parseNumber(variant.width),
            height: parseNumber(variant.height),
            metadata: {
              variantKey,
              imageIndex: i,
              source: "product.media.images.variants",
            },
          })
        );
      }
    }

    const variantsArray = Array.isArray(image.variants) ? image.variants : [];
    for (let v = 0; v < variantsArray.length; v += 1) {
      const variant = asRecord(variantsArray[v]);
      if (!variant) continue;
      const candidateUrl =
        typeof variant.url === "string"
          ? variant.url
          : typeof variant.src === "string"
            ? variant.src
            : null;
      if (!candidateUrl) continue;
      candidates.push(
        buildCandidate({
          productCode,
          productUrl,
          candidateUrl,
          sourceFieldPath: formatFieldPath(["media", "images", i, "variants", v, "url"]),
          variantPath: formatFieldPath(["media", "images", i, "variants", v]),
          width: parseNumber(variant.width),
          height: parseNumber(variant.height),
          metadata: {
            imageIndex: i,
            variantIndex: v,
            source: "product.media.images.variants-array",
          },
        })
      );
    }

    const directUrl =
      typeof image.url === "string"
        ? image.url
        : typeof image.src === "string"
          ? image.src
          : typeof image.imageUrl === "string"
            ? image.imageUrl
            : null;
    if (directUrl) {
      candidates.push(
        buildCandidate({
          productCode,
          productUrl,
          candidateUrl: directUrl,
          sourceFieldPath: formatFieldPath(["media", "images", i, "url"]),
          variantPath: formatFieldPath(["media", "images", i]),
          width: parseNumber(image.width),
          height: parseNumber(image.height),
          metadata: { imageIndex: i, source: "product.media.images.direct" },
        })
      );
    }
  }

  const deduped: Engine6HeroCandidate[] = [];
  const seen = new Set<string>();
  for (const candidate of candidates) {
    const key = `${candidate.normalizedUrl}|${candidate.sourceFieldPath ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(candidate);
  }

  return deduped;
};

const validateCandidate = (args: {
  candidate: Engine6HeroCandidate;
  currentProductCode: string | null;
  currentProductUrl: string | null;
}): Engine6RejectedHeroCandidate["reason"] | null => {
  const { candidate, currentProductCode, currentProductUrl } = args;
  if (!candidate.sourceFieldPath) return "missing-source-field-path";
  const candidateCode = normalizeProductCode(candidate.productCode ?? candidate.sourceProductCode);
  const candidateUrlProduct = normalizeProductUrl(candidate.productUrl ?? candidate.sourceProductUrl);

  if (!candidateCode && !candidateUrlProduct) return "missing-product-scope";

  if (
    (currentProductCode && candidateCode && currentProductCode !== candidateCode) ||
    (currentProductUrl && candidateUrlProduct && currentProductUrl !== candidateUrlProduct)
  ) {
    return "foreign-product";
  }

  const normalizedUrl = candidate.normalizedUrl ?? candidate.candidateUrl ?? candidate.url;
  if (!normalizedUrl) return "invalid-url";
  try {
    const parsed = new URL(normalizedUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return "invalid-url";
    }
  } catch {
    return "invalid-url";
  }

  if (/\s/.test(normalizedUrl)) return "malformed";
  if (!isTrustedHost(normalizedUrl)) return "untrusted-media-host";
  if (!isLikelyResolvable(normalizedUrl)) return "unresolvable";
  if (/\/placeholder\//i.test(normalizedUrl)) return "irrelevant-placeholder";

  return null;
};

const scoreVariant = (variantType: Engine6HeroVariantType) => {
  if (variantType === "CAPTION") return 0;
  if (variantType === "PRODUCT_MEDIA") return 1;
  if (variantType === "SPLICE") return 2;
  if (variantType === "THUMBNAIL") return 3;
  return 4;
};

const scoreCandidate = (candidate: Engine6HeroCandidate) => {
  const width = candidate.width ?? 0;
  const height = candidate.height ?? 0;
  return {
    variantScore: scoreVariant(candidate.variantType ?? "UNKNOWN"),
    area: width * height,
    width,
    lexical: candidate.normalizedUrl ?? candidate.candidateUrl ?? candidate.url ?? "",
  };
};

const toRejected = (
  candidate: Engine6HeroCandidate,
  reason: Engine6RejectedHeroCandidate["reason"]
): Engine6RejectedHeroCandidate => ({
  url: candidate.normalizedUrl ?? candidate.candidateUrl ?? candidate.url ?? "",
  sourceType: candidate.sourceType,
  reason,
  candidateProductCode: normalizeProductCode(candidate.productCode ?? candidate.sourceProductCode),
  candidateSourceProductUrl: normalizeProductUrl(candidate.productUrl ?? candidate.sourceProductUrl),
  fieldPath: candidate.sourceFieldPath ?? candidate.fieldPath ?? candidate.path ?? null,
});

const payloadHash = (payload: unknown) =>
  createHash("sha256").update(JSON.stringify(payload ?? null)).digest("hex");

const loadCache = async (cachePath: string) => {
  try {
    const raw = await readFile(cachePath, "utf8");
    const parsed = JSON.parse(raw) as Record<string, Engine6ResolvedHeroCacheRecord>;
    return parsed;
  } catch {
    return {} as Record<string, Engine6ResolvedHeroCacheRecord>;
  }
};

const writeCache = async (
  cachePath: string,
  cache: Record<string, Engine6ResolvedHeroCacheRecord>
) => {
  await mkdir(path.dirname(cachePath), { recursive: true });
  await writeFile(cachePath, JSON.stringify(cache, null, 2));
};

const fromCacheRecord = (record: Engine6ResolvedHeroCacheRecord): Engine6ResolvedHero => ({
  heroUrl: record.resolvedHeroUrl,
  heroSourceType: record.heroSourceType,
  heroQualityClassification:
    record.heroSourceType === "none" ? "none" : "product-media",
  fallbackTriggered: record.resolvedHeroUrl === null,
  finalCandidate: record.resolvedHeroUrl
    ? {
        productCode: record.sourceProductCode,
        productUrl: record.sourceProductUrl,
        candidateUrl: record.resolvedHeroUrl,
        normalizedUrl: record.resolvedHeroUrl,
        variantType: record.variantType,
        width: record.width,
        height: record.height,
        sourceFieldPath: record.sourceFieldPath,
        sourceHost: record.sourceHost,
        isSameProduct: true,
        rawCandidateMetadata: { cache: true },
        selectionVersion: record.selectionVersion,
        sourceType: record.heroSourceType,
        sourceProductCode: record.sourceProductCode,
        sourceProductUrl: record.sourceProductUrl,
        fieldPath: record.sourceFieldPath,
        variantPath: record.variantPath,
        host: record.sourceHost,
      }
    : null,
  rejectedForeignCandidates: [],
  captionPrecedenceApplied: false,
  candidateFamilyIdentityDeterminable: false,
  selectedFromCache: true,
  selectionVersion: record.selectionVersion,
  resolutionReason: `${record.resolutionReason}:cache-hit`,
  rejectedCandidateCount: record.rejectedCandidateCount,
});

const toCacheRecord = (args: {
  productCode: string;
  productUrl: string | null;
  payload: unknown;
  resolved: Engine6ResolvedHero;
}): Engine6ResolvedHeroCacheRecord => ({
  productCode: args.productCode,
  productUrl: args.productUrl,
  resolvedHeroUrl: args.resolved.heroUrl,
  heroSourceType: args.resolved.heroSourceType,
  resolvedAt: new Date().toISOString(),
  productPayloadHash: payloadHash(args.payload),
  selectionVersion: ENGINE6_HERO_SELECTION_VERSION,
  resolutionReason: args.resolved.resolutionReason,
  rejectedCandidateCount: args.resolved.rejectedCandidateCount,
  sourceFieldPath:
    args.resolved.finalCandidate?.sourceFieldPath ??
    args.resolved.finalCandidate?.fieldPath ??
    null,
  sourceProductCode:
    normalizeProductCode(
      args.resolved.finalCandidate?.productCode ??
        args.resolved.finalCandidate?.sourceProductCode
    ) ?? args.productCode,
  sourceProductUrl:
    normalizeProductUrl(
      args.resolved.finalCandidate?.productUrl ??
        args.resolved.finalCandidate?.sourceProductUrl
    ) ?? args.productUrl,
  sourceHost:
    args.resolved.finalCandidate?.sourceHost ?? args.resolved.finalCandidate?.host ?? null,
  variantType: args.resolved.finalCandidate?.variantType ?? "UNKNOWN",
  width: args.resolved.finalCandidate?.width ?? null,
  height: args.resolved.finalCandidate?.height ?? null,
  variantPath: args.resolved.finalCandidate?.variantPath ?? null,
});

export const invalidateEngine6HeroCache = async (
  productCode: string,
  cachePath = getDefaultCachePath()
) => {
  const normalizedProductCode = normalizeProductCode(productCode);
  if (!normalizedProductCode) return;
  const cache = await loadCache(cachePath);
  delete cache[normalizedProductCode];
  await writeCache(cachePath, cache);
};

export const resolveHero = (
  productPayload: unknown
): Engine6ResolvedHero => {
  const product = extractProductPayload(productPayload);
  const productCode = normalizeProductCode(product?.productCode);
  const productUrl = normalizeProductUrl(
    product?.productUrl ?? product?.productURL ?? product?.webUrl ?? product?.url
  );

  const extractedCandidates = extractEngine6HeroCandidatesFromProductPayload(productPayload);
  const rejected: Engine6RejectedHeroCandidate[] = [];
  const valid: Engine6HeroCandidate[] = [];

  for (const candidate of extractedCandidates) {
    const rejection = validateCandidate({
      candidate,
      currentProductCode: productCode,
      currentProductUrl: productUrl,
    });
    if (rejection) {
      rejected.push(toRejected(candidate, rejection));
      continue;
    }
    valid.push(candidate);
  }

  valid.sort((a, b) => {
    const sa = scoreCandidate(a);
    const sb = scoreCandidate(b);
    if (sa.variantScore !== sb.variantScore) return sa.variantScore - sb.variantScore;
    if (sb.area !== sa.area) return sb.area - sa.area;
    if (sb.width !== sa.width) return sb.width - sa.width;
    return sa.lexical.localeCompare(sb.lexical);
  });

  const selected = valid[0] ?? null;

  return {
    heroUrl: selected?.normalizedUrl ?? null,
    heroSourceType: selected?.sourceType ?? "none",
    heroQualityClassification: selected
      ? classificationFromVariantType(selected.variantType ?? "UNKNOWN")
      : "none",
    fallbackTriggered: !selected,
    finalCandidate: selected,
    rejectedForeignCandidates: rejected,
    captionPrecedenceApplied:
      Boolean(selected) &&
      selected?.variantType === "CAPTION" &&
      valid.some(v => v.variantType !== "CAPTION"),
    candidateFamilyIdentityDeterminable: valid.length > 0,
    selectedFromCache: false,
    selectionVersion: ENGINE6_HERO_SELECTION_VERSION,
    resolutionReason: selected
      ? `selected-${(selected.variantType ?? "UNKNOWN").toLowerCase()}`
      : "no-valid-same-product-candidate",
    rejectedCandidateCount: rejected.length,
  };
};

export const resolveHeroWithCache = async (args: {
  productPayload: unknown;
  cachePath?: string;
}) => {
  const cachePath = args.cachePath ?? getDefaultCachePath();
  const product = extractProductPayload(args.productPayload);
  const productCode = normalizeProductCode(product?.productCode);
  const productUrl = normalizeProductUrl(
    product?.productUrl ?? product?.productURL ?? product?.webUrl ?? product?.url
  );

  if (!productCode) {
    return resolveHero(args.productPayload);
  }

  const hash = payloadHash(args.productPayload);
  const cache = await loadCache(cachePath);
  const existing = cache[productCode];
  if (
    existing &&
    existing.productPayloadHash === hash &&
    existing.selectionVersion === ENGINE6_HERO_SELECTION_VERSION &&
    (existing.resolvedHeroUrl === null || isLikelyResolvable(existing.resolvedHeroUrl))
  ) {
    return fromCacheRecord(existing);
  }

  const resolved = resolveHero(args.productPayload);
  cache[productCode] = toCacheRecord({
    productCode,
    productUrl,
    payload: args.productPayload,
    resolved,
  });
  await writeCache(cachePath, cache);

  return resolved;
};

export const resolveProductScopedHero = ({
  currentProductCode,
  currentSourceProductUrl,
  candidates,
}: {
  currentProductCode?: string | null;
  currentSourceProductUrl?: string | null;
  candidates: Engine6HeroCandidate[];
}): Engine6ResolvedHero => {
  const wrappedPayload = {
    product: {
      productCode: currentProductCode,
      productUrl: currentSourceProductUrl,
      media: {
        images: candidates.map(candidate => ({
          variants: {
            FULL: {
              url: candidate.candidateUrl ?? candidate.url ?? candidate.normalizedUrl,
              width: candidate.width,
              height: candidate.height,
            },
          },
        })),
      },
    },
  };
  return resolveHero(wrappedPayload);
};
