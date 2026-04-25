import { normalizeEngine6AggregateRating } from "./rating.js";
import {
  type Engine6HeroCandidate,
  type Engine6HeroQualityClassification,
  type Engine6HeroSourceType,
  resolveProductScopedHero,
} from "./heroResolver.js";

export type Engine6DiagnosticsPaths = {
  commercialPriceFieldPath: string | null;
  commercialPriceRawValue: string | number | null;
  priceSourceUsed: "live-price" | "fallback";
  hasAnyViablePriceCandidate: boolean;
  viablePriceCandidateFieldPaths: string[];
  priceIntegrityViolation: boolean;
  extractionFailure: boolean;
  heroImageFieldPath: string | null;
  heroVariantFieldPath: string | null;
  selectedHeroWidth: number | null;
  selectedHeroHeight: number | null;
  imageSourceUsed: Engine6HeroSourceType;
  heroSourceType: Engine6HeroSourceType;
  heroQualityClassification: Engine6HeroQualityClassification;
  finalHeroUrl: string | null;
  heroFallbackTriggered: boolean;
  heroCandidatesPresent: boolean;
  heroCandidateCount: number;
  heroCandidateCountBeforeFiltering: number;
  heroCandidateCountAfterFiltering: number;
  heroPlaceholderFallbackReason: string | null;
  captionPrecedenceApplied: boolean;
  candidateFamilyIdentityDeterminable: boolean;
  heroSurfaceParity: {
    page: boolean;
    card: boolean;
    schema: boolean;
  };
  activeProductCode: string | null;
  resolvedHeroUrl: string | null;
  rejectedForeignCandidateCount: number;
  rejectedForeignCandidateExamples: string[];
  rejectedForeignHeroCandidates: Array<{
    url: string;
    sourceType: Engine6HeroSourceType;
    reason: string;
    candidateProductCode: string | null;
    candidateSourceProductUrl: string | null;
    fieldPath: string | null;
  }>;
  heroSourceProductCode: string | null;
  heroSourceProductUrl: string | null;
  heroSourceFieldPath: string | null;
  heroHost: string | null;
  productUrlFieldPath: string | null;
  ratingFieldPath: string | null;
  reviewCountFieldPath: string | null;
  overviewFieldPath: string | null;
  highlightsFieldPath: string | null;
  requirementsFieldPath: string | null;
  highlightClassificationReason: string | null;
  itineraryFieldPath: string | null;
  itineraryItemCount: number;
  itinerarySourceUsed: string | null;
  itineraryStructuredSourceUsed?: boolean;
  itineraryFallbackSummaryUsed?: boolean;
  itinerarySummaryFieldPath: string | null;
  meetingPointFieldPath: string | null;
  meetingPointRawText: string | null;
  meetingPointSummaryApplied: boolean;
  meetingPointSummaryReason: string | null;
  faqsFieldPath: string | null;
  faqFieldPath: string | null;
  faqCount: number;
  faqSourceUsed: string | null;
  classificationFieldPath: string | null;
};

export type Engine6ExtractedFaq = {
  question: string;
  answer: string;
};

export type Engine6ExtractedItineraryItem = {
  title: string;
  stopType?: "stop" | "pass-by";
  sectionLabel?: string;
  description?: string;
  duration?: string;
  admissionNote?: string;
};

export type Engine6Extracted = {
  title: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  city: string | null;
  state: string | null;
  heroImageUrl: string | null;
  productUrl: string | null;
  priceAmount: number | null;
  priceFormatted: string | null;
  durationText: string | null;
  aggregateRating: number | null;
  reviewCount: number | null;
  meetingPointText: string | null;
  overviewText: string | null;
  highlights: string[];
  itinerary: Engine6ExtractedItineraryItem[];
  itinerarySummaryText: string | null;
  faqs: Engine6ExtractedFaq[];
  included: string[];
  requirements: string[];
  primaryCategory: string | null;
  categories: string[];
};

type RecordLike = Record<string, unknown>;
type PathSegment = string | number;

type HeroImageResult = Omit<Engine6HeroCandidate, "fieldPath"> & {
  url: string;
  path: string;
  variantPath: string;
};

type RankedImageVariant = {
  url: string;
  path: string;
  variantPath: string;
  width: number | null;
  height: number | null;
  area: number;
};

type PriceResult = {
  amount: number | null;
  path: string | null;
  rawValue: string | number | null;
};

type NumericResult = {
  value: number | null;
  path: string | null;
};

type ItineraryResult = {
  value: Engine6ExtractedItineraryItem[];
  path: string;
  structuredSourceUsed: boolean;
};

type ViablePriceDetectionResult = {
  hasAnyViablePriceCandidate: boolean;
  detectedFieldPaths: string[];
};

const asRecord = (value: unknown): RecordLike | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordLike)
    : null;

const readPath = (root: unknown, path: PathSegment[]): unknown => {
  let cursor = root;

  for (const segment of path) {
    if (typeof segment === "number") {
      if (!Array.isArray(cursor)) {
        return undefined;
      }
      cursor = cursor[segment];
      continue;
    }

    if (typeof cursor !== "object" || cursor === null) {
      return undefined;
    }

    cursor = (cursor as RecordLike)[segment];
  }

  return cursor;
};

const formatFieldPath = (path: PathSegment[]) =>
  `product${path
    .map(segment =>
      typeof segment === "number" ? `[${segment}]` : `.${segment}`
    )
    .join("")}`;

const stripHtml = (value: string) =>
  value
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*\/p\s*>/gi, "\n\n")
    .replace(/<\s*\/li\s*>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const asNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = stripHtml(value);
  return normalized.length > 0 ? normalized : null;
};

const asBoolean = (value: unknown): boolean | null => {
  if (typeof value === "boolean") return value;
  const normalized = asNonEmptyString(value)?.toLowerCase();
  if (!normalized) return null;
  if (["true", "yes", "1"].includes(normalized)) return true;
  if (["false", "no", "0"].includes(normalized)) return false;
  return null;
};

const parseLooseNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const raw = asNonEmptyString(value);
  if (!raw) {
    return null;
  }

  const normalized = raw
    .replace(/,/g, "")
    .replace(/out of\s*5/gi, "")
    .replace(/[^\d.-]/g, "");

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const parsePriceAmount = (value: unknown): number | null => {
  const objectValue = asRecord(value);
  if (objectValue) {
    const nestedAmount =
      parsePriceAmount(objectValue.amount) ??
      parsePriceAmount(objectValue.fromPrice) ??
      parsePriceAmount(objectValue.value);
    if (nestedAmount !== null) {
      return nestedAmount;
    }
  }

  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  const raw = asNonEmptyString(value);
  if (!raw) {
    return null;
  }

  if (/^\$?0(?:\.0+)?$/.test(raw.replace(/,/g, ""))) {
    return null;
  }

  const firstNumericToken = raw.match(/\d[\d,]*(?:\.\d+)?/)?.[0] ?? "";
  const numeric = Number(firstNumericToken.replace(/,/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
};

const asHttpUrl = (value: unknown): string | null => {
  const url = asNonEmptyString(value);
  if (!url) return null;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
};

const asImageUrl = (value: unknown): string | null => asHttpUrl(value);

const LOCATION_CITY_PATTERNS = [
  /\bdeparting from\s+([A-Z][A-Za-zÀ-ÖØ-öø-ÿ' -]{1,60}?)(?=\s+(?:to|is|at)\b|,|\.)/i,
  /\bfrom\s+([A-Z][A-Za-zÀ-ÖØ-öø-ÿ' -]{1,60}?)(?=\s+(?:to|is|at)\b|,|\.)/i,
];

const LOCATION_COUNTRY_PATTERNS = [
  /\b(Switzerland|United States|USA|Canada|Mexico)\b/i,
];

const normalizeLocationToken = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,;:!?]+$/, "");

const inferCityFromText = (text: string | null) => {
  if (!text) return null;
  for (const pattern of LOCATION_CITY_PATTERNS) {
    const match = text.match(pattern);
    if (!match?.[1]) continue;
    const normalized = normalizeLocationToken(match[1]);
    if (normalized.length >= 2) {
      return normalized;
    }
  }
  return null;
};

const inferCountryFromText = (text: string | null) => {
  if (!text) return null;
  for (const pattern of LOCATION_COUNTRY_PATTERNS) {
    const match = text.match(pattern);
    const token = match?.[1];
    if (!token) continue;
    if (/^usa$/i.test(token)) {
      return "United States";
    }
    return normalizeLocationToken(token);
  }
  return null;
};

const asViatorProductUrl = (value: unknown): string | null => {
  const url = asHttpUrl(value);
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith("viator.com") ? parsed.toString() : null;
  } catch {
    return null;
  }
};

const dedupeStrings = (values: Array<string | null | undefined>) => {
  const seen = new Set<string>();
  const deduped: string[] = [];

  for (const value of values) {
    const normalized = typeof value === "string" ? value.trim() : "";
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(normalized);
  }

  return deduped;
};

const ITINERARY_FILLER_PATTERN =
  /\b(?:you will|you'll|enjoy|experience|your guide|expert guide|fluent in your chosen language|take you on a journey|discover|delight in|get to|have the chance to|perfect for|unforgettable|renowned|must-visit|don't miss|fascinating history|bustling hub of activity)\b/gi;

const inferSummaryStopType = (
  value: string
): "pass-by" | "stop" | "visit" | "cruise" => {
  const text = value.toLowerCase();
  if (/\b(pass[\s-]?by|drive by|drive past)\b/.test(text)) return "pass-by";
  if (/\b(cruise|boat|sail|ferry|lake crossing)\b/.test(text)) return "cruise";
  if (
    /\b(visit|museum|cathedral|church|gallery|market|plaza|square)\b/.test(text)
  )
    return "visit";
  return "stop";
};

const normalizeStopTitle = (sentence: string, index: number) => {
  const compact = sentence.replace(/\s+/g, " ").trim();
  const locationMatch =
    compact.match(
      /\b(?:at|to|in|from|through|toward|towards|near)\s+([A-ZÀ-ÖØ-Ý][\wÀ-ÖØ-öø-ÿ'&-]*(?:\s+[A-ZÀ-ÖØ-Ý][\wÀ-ÖØ-öø-ÿ'&-]*){0,4})/
    )?.[1] ??
    compact.match(
      /\b([A-ZÀ-ÖØ-Ý][\wÀ-ÖØ-öø-ÿ'&-]*(?:\s+[A-ZÀ-ÖØ-Ý][\wÀ-ÖØ-öø-ÿ'&-]*){0,4})\b/
    )?.[1] ??
    null;

  const place = (locationMatch ?? `Route segment ${index + 1}`)
    .replace(/[^\wÀ-ÖØ-öø-ÿ' -]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const stopType = inferSummaryStopType(compact);
  const contextWord =
    stopType === "cruise"
      ? "Cruise Segment"
      : stopType === "pass-by"
        ? "Pass-By Segment"
        : stopType === "visit"
          ? "Visit Stop"
          : "Route Stop";
  const combined = `${place} ${contextWord}`.trim();
  const words = combined.split(/\s+/).filter(Boolean).slice(0, 8);

  if (words.length < 4) {
    words.push("City", "Highlights");
  }
  return words.slice(0, 8).join(" ");
};

const truncateWords = (value: string, maxWords: number) => {
  const words = value.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return value;
  return `${words.slice(0, maxWords).join(" ")}.`;
};

const inferStopFeature = (value: string) => {
  const text = value.toLowerCase();
  if (/\b(museum|gallery|exhibit)\b/.test(text)) return "Museum Visit";
  if (/\b(cathedral|church|basilica|temple)\b/.test(text))
    return "Historic Landmark Stop";
  if (/\b(lake|river|harbor|bay|waterfront)\b/.test(text))
    return "Waterfront Segment";
  if (/\b(old town|historic center|city center|downtown)\b/.test(text))
    return "Old Town Walk";
  if (/\b(viewpoint|hill|overlook|summit)\b/.test(text))
    return "Viewpoint Stop";
  if (/\b(station|terminal|railway)\b/.test(text))
    return "Transit Corridor Pass-By";
  if (/\b(bridge|dam)\b/.test(text)) return "Landmark Photo Stop";
  if (/\b(cruise|boat|sail|ferry)\b/.test(text)) return "Cruise Segment";
  return "City Highlights Stop";
};

const inferStopPlace = (value: string, index: number) => {
  const match =
    value.match(
      /\b([A-ZÀ-ÖØ-Ý][\wÀ-ÖØ-öø-ÿ'&-]*(?:\s+[A-ZÀ-ÖØ-Ý][\wÀ-ÖØ-öø-ÿ'&-]*){0,3})\b/
    )?.[1] ?? null;
  return (match ?? `City Segment ${index + 1}`)
    .replace(/\b(Railway main station|Main station)\b/gi, "Main Station")
    .replace(/\b(Zürich)\b/g, "Zurich")
    .replace(/\s+/g, " ")
    .trim();
};

const buildStopSummary = (
  place: string,
  feature: string,
  stopType: "pass-by" | "stop" | "visit" | "cruise",
  parentContext?: string | null
) => {
  const inferNoun = () => {
    const text = `${place} ${feature}`.toLowerCase();
    if (/\bpark\b/.test(text)) return "park";
    if (/\bstation|terminal\b/.test(text)) return "station";
    if (/\bbridge\b/.test(text)) return "bridge";
    if (/\bmuseum|gallery\b/.test(text)) return "museum";
    if (/\bcathedral|church|temple|basilica\b/.test(text)) return "landmark";
    if (/\bavenue|street|boulevard|road\b/.test(text)) return "street corridor";
    if (/\bhill|overlook|viewpoint|summit\b/.test(text)) return "viewpoint";
    if (/\blake|river|harbor|bay|waterfront\b/.test(text)) return "waterfront";
    if (/\bold town|downtown|midtown|district|center\b/.test(text))
      return "district";
    return "landmark";
  };
  const noun = inferNoun();
  const contextPlace = parentContext
    ? inferStopPlace(parentContext, 0).replace(/\s+/g, " ")
    : null;
  const action =
    stopType === "pass-by"
      ? "Pass"
      : stopType === "cruise"
        ? "Cruise through"
        : stopType === "visit"
          ? "Visit"
          : "Stop at";
  return truncateWords(
    `${action} ${place}, a notable ${noun}${contextPlace ? ` in ${contextPlace}` : ""}. This stop highlights local geography and landmark significance.`,
    28
  );
};

const normalizeUnifiedItineraryItems = (
  items: Engine6ExtractedItineraryItem[],
  parentContext?: string | null
): Engine6ExtractedItineraryItem[] => {
  return items.map((item, index) => {
    const sourceText = [
      item.title,
      item.description ?? "",
      item.sectionLabel ?? "",
      parentContext ?? "",
    ]
      .join(" ")
      .replace(ITINERARY_FILLER_PATTERN, "")
      .replace(/\s+/g, " ")
      .trim();
    const stopType = inferSummaryStopType(
      `${item.stopType ?? ""} ${sourceText}`.trim()
    );
    const place = inferStopPlace(sourceText, index);
    const feature = inferStopFeature(sourceText);
    const title = normalizeStopTitle(`${place} ${feature}`, index);
    const description = buildStopSummary(
      place,
      feature,
      stopType,
      parentContext
    );

    return {
      ...item,
      title,
      stopType,
      description,
    };
  });
};

const summarizeItineraryToHtmlStops = (rawValue: string) => {
  const clean = stripHtml(rawValue)
    .replace(ITINERARY_FILLER_PATTERN, "")
    .replace(/\b(?:the|a|an)\s+(?:famous|iconic|beautiful|stunning)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!clean) return null;

  const sentences = clean
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);
  const clausePool =
    sentences.length > 0
      ? sentences
      : clean
          .split(/\s*(?:,|;|•|\|)\s*/)
          .map(chunk => chunk.trim())
          .filter(Boolean);
  if (clausePool.length === 0) return null;

  const targetStopCount = Math.min(5, Math.max(3, clausePool.length));
  const clusteredStops = Array.from({ length: targetStopCount }, (_, index) => {
    const bucket: string[] = [];
    for (
      let cursor = index;
      cursor < clausePool.length;
      cursor += targetStopCount
    ) {
      bucket.push(clausePool[cursor] ?? "");
    }
    const chunk = bucket.join(" ").trim();
    return chunk || clausePool[index % clausePool.length] || clean;
  }).filter(Boolean);

  const dedupedStops = dedupeStrings(
    clusteredStops.map(stop =>
      stop
        .replace(/\b(old town|historic center|city center)\b/gi, "old town")
        .replace(/\s+/g, " ")
        .trim()
    )
  );
  if (dedupedStops.length === 0) return null;

  const normalizedStops = dedupedStops.slice(0, 5).map((stopText, index) => {
    const stopType = inferSummaryStopType(stopText);
    const place = inferStopPlace(stopText, index);
    const feature = inferStopFeature(stopText);
    const title = normalizeStopTitle(`${place} ${feature}`, index);
    const summary = buildStopSummary(place, feature, stopType, clean);
    return { title, summary, stopType };
  });

  while (normalizedStops.length < 3) {
    const seed = normalizedStops[normalizedStops.length - 1] ?? {
      title: "City Center Highlights Stop",
      summary:
        "City Center covers the route sequence and landmark context before the next itinerary segment.",
      stopType: "stop" as const,
    };
    normalizedStops.push({
      title: normalizeStopTitle(seed.title, normalizedStops.length),
      summary: truncateWords(seed.summary, 28),
      stopType: seed.stopType,
    });
  }

  return normalizedStops
    .map(
      stop =>
        `<div class="itinerary-stop" data-stop-type="${stop.stopType}"><h3>${escapeHtml(
          stop.title
        )}</h3><p>${escapeHtml(stop.summary)}</p></div>`
    )
    .join("");
};

const firstParagraph = (value: string | null) =>
  value?.split(/\n\n+/)[0]?.trim() ?? null;

const pickProduct = (rawPayload: unknown): RecordLike | null => {
  const payload = asRecord(rawPayload);
  return asRecord(payload?.product) ?? payload;
};

const emptyExtracted = (): Engine6Extracted => ({
  title: null,
  seoTitle: null,
  seoDescription: null,
  city: null,
  state: null,
  heroImageUrl: null,
  productUrl: null,
  priceAmount: null,
  priceFormatted: null,
  durationText: null,
  aggregateRating: null,
  reviewCount: null,
  meetingPointText: null,
  overviewText: null,
  highlights: [],
  itinerary: [],
  itinerarySummaryText: null,
  faqs: [],
  included: [],
  requirements: [],
  primaryCategory: null,
  categories: [],
});

const collectArrayVariants = (
  image: RecordLike,
  basePath: PathSegment[]
): RankedImageVariant[] => {
  const variantsRaw = Array.isArray(image.variants)
    ? image.variants
    : Array.isArray(image.sizes)
      ? image.sizes
      : [];

  return variantsRaw
    .map((value, index) => ({ value, index }))
    .map(entry => {
      const variant = asRecord(entry.value);
      const url =
        asImageUrl(variant?.url) ??
        asImageUrl(variant?.src) ??
        asImageUrl(variant?.imageUrl);
      if (!url) {
        return null;
      }

      const width = parseLooseNumber(variant?.width);
      const height = parseLooseNumber(variant?.height);
      return {
        url,
        path: formatFieldPath([...basePath, "variants", entry.index, "url"]),
        variantPath: formatFieldPath([...basePath, "variants", entry.index]),
        width,
        height,
        area: (width ?? 0) * (height ?? 0),
      } satisfies RankedImageVariant;
    })
    .filter((entry): entry is RankedImageVariant => Boolean(entry));
};

const collectRecordVariants = (
  image: RecordLike,
  basePath: PathSegment[]
): RankedImageVariant[] => {
  const variants = asRecord(image.variants);
  if (!variants) {
    return [];
  }

  return Object.entries(variants)
    .map(([variantKey, rawVariant]) => {
      const variant = asRecord(rawVariant);
      const url = asImageUrl(variant?.url);
      if (!url) {
        return null;
      }

      const width = parseLooseNumber(variant?.width);
      const height = parseLooseNumber(variant?.height);
      return {
        url,
        path: formatFieldPath([...basePath, "variants", variantKey, "url"]),
        variantPath: formatFieldPath([...basePath, "variants", variantKey]),
        width,
        height,
        area: (width ?? 0) * (height ?? 0),
      } satisfies RankedImageVariant;
    })
    .filter((entry): entry is RankedImageVariant => Boolean(entry));
};

const resolveImageCollectionHeroCandidates = (
  images: unknown,
  basePathPrefix: PathSegment[],
  sourceType: Exclude<Engine6HeroSourceType, "none">
): HeroImageResult[] => {
  if (!Array.isArray(images)) {
    return [];
  }

  const prioritizedImages = images
    .map((value, index) => ({ value, index }))
    .sort((a, b) => {
      const aImage = asRecord(a.value);
      const bImage = asRecord(b.value);
      const aCover = aImage?.isCover === true || aImage?.cover === true;
      const bCover = bImage?.isCover === true || bImage?.cover === true;
      return Number(bCover) - Number(aCover);
    });
  const candidates: HeroImageResult[] = [];

  for (const entry of prioritizedImages) {
    const image = asRecord(entry.value);
    if (!image) continue;

    const basePath = [...basePathPrefix, entry.index];
    const imageVariants = [
      ...collectRecordVariants(image, basePath),
      ...collectArrayVariants(image, basePath),
    ].sort((a, b) => {
      if (b.area !== a.area) {
        return b.area - a.area;
      }
      if ((b.width ?? 0) !== (a.width ?? 0)) {
        return (b.width ?? 0) - (a.width ?? 0);
      }
      return (b.height ?? 0) - (a.height ?? 0);
    });

    if (imageVariants.length > 0) {
      const seenImageVariantUrls = new Set<string>();
      for (const variant of imageVariants) {
        if (seenImageVariantUrls.has(variant.url)) {
          continue;
        }
        seenImageVariantUrls.add(variant.url);
        candidates.push({
          url: variant.url,
          path: variant.path,
          variantPath: variant.variantPath,
          width: variant.width,
          height: variant.height,
          sourceType,
        });
      }
    }

    const directUrl =
      asImageUrl(image.url) ??
      asImageUrl(image.src) ??
      asImageUrl(image.imageUrl);
    if (
      directUrl &&
      !imageVariants.some(variant => variant.url === directUrl)
    ) {
      const directPath = asImageUrl(image.url)
        ? formatFieldPath([...basePath, "url"])
        : asImageUrl(image.src)
          ? formatFieldPath([...basePath, "src"])
          : formatFieldPath([...basePath, "imageUrl"]);
      candidates.push({
        url: directUrl,
        path: directPath,
        variantPath: formatFieldPath(basePath),
        width: parseLooseNumber(image.width),
        height: parseLooseNumber(image.height),
        sourceType,
      });
    }
  }

  return candidates;
};

const withHeroScope = (
  hero: HeroImageResult,
  productCode: string | null,
  sourceProductUrl: string | null
): Engine6HeroCandidate => {
  const normalizeHeroPath = (path: string) =>
    path
      .replace(/^product\.product\./, "product.")
      .replace(/^media\./, "product.media.");
  const normalizedSourceFieldPath = normalizeHeroPath(hero.path);
  const normalizedVariantPath = normalizeHeroPath(hero.variantPath);

  return {
    ...hero,
    variantPath: normalizedVariantPath,
    sourceFieldPath: normalizedSourceFieldPath,
    sourceProductCode: productCode,
    sourceProductUrl,
  };
};

const extractPlaybookHeroCandidates = ({
  product,
  productCode,
  sourceProductUrl,
}: {
  product: RecordLike;
  productCode: string | null;
  sourceProductUrl: string | null;
}): Engine6HeroCandidate[] => {
  const candidates: Engine6HeroCandidate[] = [];

  const mediaHeroes = resolveImageCollectionHeroCandidates(
    readPath(product, ["media", "images"]),
    ["product", "media", "images"],
    "api-primary"
  );
  candidates.push(
    ...mediaHeroes.map(hero =>
      withHeroScope(hero, productCode, sourceProductUrl)
    )
  );

  return candidates;
};

const extractProductUrl = (product: RecordLike) => {
  for (const path of [
    ["productUrl"],
    ["productURL"],
    ["webUrl"],
    ["webURL"],
    ["canonicalUrl"],
    ["url"],
  ] as PathSegment[][]) {
    const value = asViatorProductUrl(readPath(product, path));
    if (value) {
      return { value, path: formatFieldPath(path) };
    }
  }

  return { value: null, path: null as string | null };
};

const extractPlaybookPrice = (product: RecordLike): PriceResult => {
  const collectPathCandidates = (
    paths: PathSegment[][]
  ): Array<{ amount: number; path: string; rawValue: unknown }> =>
    paths
      .map(path => {
        const raw = readPath(product, path);
        const amount = parsePriceAmount(raw);
        return {
          amount,
          path: formatFieldPath(path),
          rawValue:
            typeof raw === "string" || typeof raw === "number" ? raw : amount,
        };
      })
      .filter(
        (
          candidate
        ): candidate is { amount: number; path: string; rawValue: unknown } =>
          candidate.amount !== null &&
          Number.isFinite(candidate.amount) &&
          candidate.amount > 0
      );

  const selectLowestCandidate = (
    candidates: Array<{ amount: number; path: string; rawValue: unknown }>
  ): PriceResult | null => {
    if (candidates.length === 0) {
      return null;
    }
    const selected = [...candidates].sort((a, b) => a.amount - b.amount)[0];
    return {
      amount: selected.amount,
      path: selected.path,
      rawValue: selected.rawValue,
    };
  };

  const primaryCandidate = selectLowestCandidate(
    collectPathCandidates([["pricing", "summary", "fromPrice"]])
  );
  if (primaryCandidate) {
    return primaryCandidate;
  }

  const fallbackCandidate = selectLowestCandidate(
    collectPathCandidates([
      ["pricingInfo", "fromPrice"],
      ["pricingInfo", "price"],
      ["pricingInfo", "amount"],
      ["pricingInfo", "summary", "fromPrice"],
      ["pricingSummary", "fromPrice"],
      ["pricing", "fromPrice"],
      ["price", "fromPrice"],
      ["fromPrice"],
      ["priceFrom"],
      ["bookableItems", 0, "pricingSummary", "fromPrice"],
      ["bookableItems", 0, "pricing", "summary", "fromPrice"],
      ["bookableItems", 0, "price", "fromPrice"],
      ["bookingOptions", 0, "price", "fromPrice"],
      ["bookingOptions", 0, "price", "amount"],
      [
        "bookableItems",
        0,
        "seasonalPricingRecords",
        0,
        "pricingDetails",
        0,
        "price",
        "original",
        "recommendedRetailPrice",
      ],
      [
        "bookableItems",
        0,
        "seasonalPricingRecords",
        0,
        "pricingDetails",
        0,
        "price",
        "partnerNetPrice",
      ],
      ["productOptions", 0, "pricing", "summary", "fromPrice"],
      ["productOptions", 0, "pricing", "fromPrice"],
      ["productOptions", 0, "price", "fromPrice"],
      ["productOptions", 0, "price", "amount"],
    ])
  );
  if (fallbackCandidate) {
    return fallbackCandidate;
  }

  for (const path of [
    ["pricing", "summary", "fromPriceFormatted"],
    ["pricingSummary", "fromPriceFormatted"],
    ["pricingInfo", "summary", "fromPriceFormatted"],
    ["pricingInfo", "fromPriceFormatted"],
  ] as PathSegment[][]) {
    const raw = readPath(product, path);
    const amount = parsePriceAmount(raw);
    if (amount !== null) {
      return {
        amount,
        path: formatFieldPath(path),
        rawValue:
          typeof raw === "string" || typeof raw === "number" ? raw : amount,
      };
    }
  }

  const pricingSubtreeCandidates: Array<{
    root: unknown;
    path: string;
  }> = [
    { root: product.pricingInfo, path: "product.pricingInfo" },
    { root: product.productOptions, path: "product.productOptions" },
    { root: product.bookableItems, path: "product.bookableItems" },
    { root: product.bookingOptions, path: "product.bookingOptions" },
  ];

  const collectNumericPriceCandidates = (
    root: unknown,
    basePath: string,
    depth = 0
  ): Array<{ amount: number; path: string }> => {
    if (depth > 5) {
      return [];
    }

    if (Array.isArray(root)) {
      return root.flatMap((item, index) =>
        collectNumericPriceCandidates(item, `${basePath}[${index}]`, depth + 1)
      );
    }

    const row = asRecord(root);
    if (!row) {
      return [];
    }

    const priceCandidates: Array<{ amount: number; path: string }> = [];
    for (const [key, value] of Object.entries(row)) {
      const keyLc = key.toLowerCase();
      const isLikelyPriceField =
        keyLc.includes("price") ||
        keyLc.includes("amount") ||
        keyLc.includes("fare");

      if (isLikelyPriceField) {
        const parsed = parsePriceAmount(value);
        if (parsed !== null) {
          priceCandidates.push({ amount: parsed, path: `${basePath}.${key}` });
        }
      }

      priceCandidates.push(
        ...collectNumericPriceCandidates(value, `${basePath}.${key}`, depth + 1)
      );
    }

    return priceCandidates;
  };

  const subtreeCandidate = pricingSubtreeCandidates
    .flatMap(candidate =>
      collectNumericPriceCandidates(candidate.root, candidate.path)
    )
    .filter(candidate => {
      const pathLc = candidate.path.toLowerCase();
      if (!Number.isFinite(candidate.amount) || candidate.amount <= 0) {
        return false;
      }
      if (
        pathLc.includes("total") ||
        pathLc.includes("tax") ||
        pathLc.includes("fee") ||
        pathLc.includes("surcharge")
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.amount - b.amount)[0];

  if (subtreeCandidate) {
    return {
      amount: subtreeCandidate.amount,
      path: subtreeCandidate.path,
      rawValue: subtreeCandidate.amount,
    };
  }

  const legacyPriceCandidates = [
    parsePriceAmount(readPath(product, ["pricingInfo", "price", "fromPrice"])),
    parsePriceAmount(readPath(product, ["pricingInfo", "price", "amount"])),
    parsePriceAmount(
      readPath(product, [
        "productOptions",
        0,
        "pricingInfo",
        "price",
        "fromPrice",
      ])
    ),
    parsePriceAmount(
      readPath(product, ["productOptions", 0, "pricingInfo", "price", "amount"])
    ),
  ].filter((value): value is number => value !== null && value > 0);

  if (legacyPriceCandidates.length > 0) {
    const min = Math.min(...legacyPriceCandidates);
    return {
      amount: min,
      path: "product.pricingInfo|product.productOptions[*].pricingInfo",
      rawValue: min,
    };
  }

  return {
    amount: null,
    path: null,
    rawValue: null,
  };
};

const detectViableViatorCommercialPriceCandidates = (
  product: RecordLike
): ViablePriceDetectionResult => {
  const candidatePaths = [
    ["pricing", "summary", "fromPrice"],
    ["pricingInfo", "fromPrice"],
    ["pricingInfo", "price"],
    ["pricingInfo", "amount"],
  ] as PathSegment[][];

  const detectedFieldPaths = candidatePaths
    .filter(path => {
      const amount = parsePriceAmount(readPath(product, path));
      return amount !== null && amount > 0;
    })
    .map(path => formatFieldPath(path));

  return {
    hasAnyViablePriceCandidate: detectedFieldPaths.length > 0,
    detectedFieldPaths,
  };
};

const buildPriceLabel = ({ amount }: { amount: number | null }) => {
  if (amount === null) {
    return null;
  }
  const hasCents = Math.round(amount * 100) % 100 !== 0;
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(amount);
  return `From ${formatted}`;
};

const extractDuration = (product: RecordLike) => {
  for (const path of [
    ["duration"],
    ["durationText"],
    ["durationFixed"],
    ["durationSummary"],
    ["durationInfo", "durationText"],
    ["durationInfo", "label"],
    ["itinerary", "duration", "formattedDuration"],
    ["itinerary", "duration", "durationText"],
  ] as PathSegment[][]) {
    const value = asNonEmptyString(readPath(product, path));
    if (value) {
      return { value, path: formatFieldPath(path) };
    }
  }

  const fixedMinutes = parseLooseNumber(
    readPath(product, ["itinerary", "duration", "fixedDurationInMinutes"])
  );
  if (fixedMinutes !== null && fixedMinutes > 0) {
    const minutes = Math.trunc(fixedMinutes);
    if (minutes % 60 === 0) {
      const hours = minutes / 60;
      return {
        value: `${hours} ${hours === 1 ? "hour" : "hours"}`,
        path: "product.itinerary.duration.fixedDurationInMinutes",
      };
    }
    return {
      value: `${minutes} minutes`,
      path: "product.itinerary.duration.fixedDurationInMinutes",
    };
  }

  return { value: null as string | null, path: null as string | null };
};

const extractPlaybookRating = (product: RecordLike): NumericResult => {
  for (const path of [
    ["rating"],
    ["averageRating"],
    ["reviewSummary", "averageRating"],
    ["reviews", "combinedAverageRating"],
    ["reviews", "averageRating"],
  ] as PathSegment[][]) {
    const value = parseLooseNumber(readPath(product, path));
    if (value !== null && value > 0) {
      return { value, path: formatFieldPath(path) };
    }
  }

  return { value: null, path: null };
};

const extractPlaybookReviewCount = (product: RecordLike): NumericResult => {
  for (const path of [
    ["reviewCount"],
    ["reviewSummary", "totalReviews"],
    ["reviews", "totalReviews"],
    ["reviews", "count"],
    ["reviews", "reviewCount"],
  ] as PathSegment[][]) {
    const value = parseLooseNumber(readPath(product, path));
    if (value !== null && value >= 0) {
      return { value: Math.trunc(value), path: formatFieldPath(path) };
    }
  }

  return { value: null, path: null };
};

const extractOverview = (product: RecordLike) => {
  for (const path of [
    ["description", "text"],
    ["description"],
    ["descriptionLong"],
    ["overview"],
    ["summary"],
    ["shortDescription"],
  ] as PathSegment[][]) {
    const value = asNonEmptyString(readPath(product, path));
    if (value) {
      return { value, path: formatFieldPath(path) };
    }
  }

  return { value: null, path: null as string | null };
};

const normalizeStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? dedupeStrings(
        value.map(item => {
          if (typeof item === "string") return asNonEmptyString(item);
          const row = asRecord(item);
          return (
            asNonEmptyString(row?.text) ??
            asNonEmptyString(row?.title) ??
            asNonEmptyString(row?.label) ??
            asNonEmptyString(row?.description)
          );
        })
      )
    : [];

const extractHighlights = (product: RecordLike) => {
  for (const path of [
    ["highlights"],
    ["bulletPoints"],
    ["additionalInfo"],
    ["features"],
  ] as PathSegment[][]) {
    const value = normalizeStringArray(readPath(product, path));
    if (value.length > 0) {
      return { value, path: formatFieldPath(path) };
    }
  }

  return { value: [], path: null as string | null };
};

const normalizeSingleItineraryItem = (
  row: RecordLike
): Engine6ExtractedItineraryItem | null => {
  const pointOfInterest = asRecord(row.pointOfInterest);
  const pointOfInterestLocation = asRecord(row.pointOfInterestLocation);
  const stop = asRecord(row.stop);
  const location = asRecord(row.location);
  const stopTypeRaw =
    asNonEmptyString(row.stopType) ??
    asNonEmptyString(row.activityType) ??
    asNonEmptyString(stop?.type);
  const isPassByFlag =
    asBoolean(row.isPassBy) ??
    asBoolean(row.passBy) ??
    asBoolean(row.passByWithoutStopping) ??
    false;
  const isPassByFromType = /pass[\s_-]?by/i.test(stopTypeRaw ?? "");

  const locationTitle =
    asNonEmptyString(pointOfInterestLocation?.locationName) ??
    asNonEmptyString(pointOfInterestLocation?.title) ??
    asNonEmptyString(pointOfInterestLocation?.name);
  const inferredTitleFromDescription = (() => {
    const descriptionText = asNonEmptyString(row.description);
    if (!descriptionText) return null;

    const firstSentence =
      descriptionText.split(/(?<=[.!?])\s+/)[0]?.trim() ?? "";
    if (!firstSentence) return null;

    const locationPattern =
      /\b(?:arrive in|continue to|final stop[:\s]+|visit|return to|journey in)\s+([A-ZÀ-ÖØ-Ý][\wÀ-ÖØ-öø-ÿ'&\-]*(?:[\s,/]+[A-ZÀ-ÖØ-Ý][\wÀ-ÖØ-öø-ÿ'&\-]*){0,5})/;
    const match = firstSentence.match(locationPattern);
    if (match?.[1]) {
      return match[1].replace(/[.,:;]+$/, "").trim();
    }

    return firstSentence.replace(/[.,:;]+$/, "").trim() || null;
  })();

  const title =
    locationTitle ??
    asNonEmptyString(row.title) ??
    asNonEmptyString(row.name) ??
    asNonEmptyString(row.label) ??
    asNonEmptyString(pointOfInterest?.title) ??
    asNonEmptyString(pointOfInterest?.name) ??
    asNonEmptyString(stop?.name) ??
    asNonEmptyString(stop?.title) ??
    asNonEmptyString(location?.name) ??
    inferredTitleFromDescription;

  if (!title) return null;
  const cleanedTitle = title.replace(/\s*\((pass\s*by)\)\s*$/i, "").trim();
  const isPassByFromTitle =
    /\bpass(?:\s|-)?by\b/i.test(title) && cleanedTitle.length > 0;

  const description =
    asNonEmptyString(row.description) ??
    asNonEmptyString(row.summary) ??
    asNonEmptyString(row.details) ??
    asNonEmptyString(pointOfInterest?.description) ??
    asNonEmptyString(stop?.description) ??
    undefined;
  const admissionNoteFromFields =
    asNonEmptyString(row.admissionNote) ??
    asNonEmptyString(row.admissionTicket) ??
    asNonEmptyString(row.admission) ??
    asNonEmptyString(row.ticketNote) ??
    asNonEmptyString(row.ticketInfo) ??
    asNonEmptyString(row.inclusion) ??
    asNonEmptyString(row.inclusions) ??
    (asBoolean(row.admissionIncluded) === true
      ? "Admission Included"
      : asBoolean(row.admissionIncluded) === false
        ? "Admission Not Included"
        : null);
  const admissionNoteFromDescription =
    description && /admission ticket/i.test(description)
      ? description
      : undefined;
  const admissionNote =
    admissionNoteFromFields ?? admissionNoteFromDescription ?? undefined;
  const duration =
    asNonEmptyString(row.duration) ??
    asNonEmptyString(row.durationText) ??
    asNonEmptyString(asRecord(row.durationInfo)?.durationText) ??
    asNonEmptyString(asRecord(row.durationInfo)?.label) ??
    undefined;
  const descriptionWithoutAdmission =
    admissionNoteFromDescription && description === admissionNoteFromDescription
      ? undefined
      : description;
  const stopType =
    isPassByFlag || isPassByFromType || isPassByFromTitle ? "pass-by" : "stop";

  return {
    title: cleanedTitle || title,
    stopType,
    ...(descriptionWithoutAdmission
      ? { description: descriptionWithoutAdmission }
      : {}),
    ...(duration ? { duration } : {}),
    ...(admissionNote ? { admissionNote } : {}),
  } satisfies Engine6ExtractedItineraryItem;
};

const extractPlaybookItinerary = (product: RecordLike): ItineraryResult => {
  const collectNestedStopRows = (
    value: unknown,
    inheritedSectionLabel?: string
  ): Array<{ row: RecordLike; sectionLabel: string | null }> => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.flatMap(item =>
        collectNestedStopRows(item, inheritedSectionLabel)
      );
    }

    const row = asRecord(value);
    if (!row) return [];

    const sectionLabel =
      asNonEmptyString(row.dayTitle) ??
      asNonEmptyString(row.dayLabel) ??
      asNonEmptyString(row.dayName) ??
      asNonEmptyString(row.sectionTitle) ??
      asNonEmptyString(row.segmentTitle) ??
      inheritedSectionLabel ??
      null;

    const looksLikeStopRow =
      asNonEmptyString(row.title) ||
      asNonEmptyString(row.name) ||
      asNonEmptyString(row.label) ||
      asNonEmptyString(row.description) ||
      asRecord(row.pointOfInterestLocation) ||
      asRecord(row.pointOfInterest) ||
      asRecord(row.stop) ||
      asRecord(row.location);

    const nested = [
      row.itineraryItems,
      row.items,
      row.stops,
      row.locations,
      row.dayItems,
      row.activities,
      row.pointsOfInterest,
      row.points,
      row.dayPlans,
      row.days,
      row.itineraryDays,
    ];

    const nestedRows = nested.flatMap(item =>
      collectNestedStopRows(item, sectionLabel ?? inheritedSectionLabel)
    );

    if (!looksLikeStopRow) {
      return nestedRows;
    }

    return [
      { row, sectionLabel: inheritedSectionLabel ?? null },
      ...nestedRows,
    ];
  };

  const normalizeItinerary = (
    value: unknown
  ): Engine6ExtractedItineraryItem[] => {
    const rows = collectNestedStopRows(value);
    if (!Array.isArray(rows)) {
      return [];
    }

    const seen = new Set<string>();
    return rows
      .map(item => {
        const parsed = normalizeSingleItineraryItem(item.row);
        if (!parsed) return null;

        const dedupeKey = [
          parsed.title.toLowerCase(),
          (parsed.description ?? "").toLowerCase(),
          (parsed.duration ?? "").toLowerCase(),
          parsed.stopType ?? "stop",
          (item.sectionLabel ?? "").toLowerCase(),
        ].join("|");

        if (seen.has(dedupeKey)) {
          return null;
        }
        seen.add(dedupeKey);

        return item.sectionLabel
          ? { ...parsed, sectionLabel: item.sectionLabel }
          : parsed;
      })
      .filter((item): item is Engine6ExtractedItineraryItem => Boolean(item));
  };

  const structuredPaths: PathSegment[][] = [
    ["itineraryItems"],
    ["itinerary", "itineraryItems"],
    ["itinerary", "items"],
    ["itinerary", "stops"],
    ["itinerary", "days"],
    ["itinerary", "dayPlans"],
    ["itinerary", "itineraryDays"],
    ["itinerary", "locations"],
    ["whatToExpect", "items"],
    ["whatToExpect", "stops"],
    ["whatToExpect", "days"],
    ["whatToExpect", "itineraryDays"],
    ["structuredItinerary", "days"],
    ["structuredItinerary", "items"],
  ];

  for (const path of structuredPaths) {
    const value = normalizeItinerary(readPath(product, path));
    if (value.length > 0) {
      return {
        value,
        path: formatFieldPath(path),
        structuredSourceUsed: true,
      };
    }
  }

  for (const path of [["itinerary"], ["whatToExpect"]] as PathSegment[][]) {
    const value = normalizeItinerary(readPath(product, path));
    if (value.length > 0) {
      return {
        value,
        path: formatFieldPath(path),
        structuredSourceUsed: false,
      };
    }
  }

  return {
    value: [],
    path: "product.itineraryItems",
    structuredSourceUsed: false,
  };
};

const extractItinerarySummary = (product: RecordLike) => {
  for (const path of [
    ["itinerarySummary"],
    ["itinerary", "summary"],
    ["itinerary", "description"],
    ["whatToExpect", "description"],
    ["whatToExpectSummary"],
  ] as PathSegment[][]) {
    const value = asNonEmptyString(readPath(product, path));
    if (value) {
      return {
        value:
          summarizeItineraryToHtmlStops(value) ??
          '<div class="itinerary-stop"><h3>Route segment landmark and feature stop</h3><p>Itinerary sequence is available at booking confirmation with confirmed local stops and movement order.</p></div><div class="itinerary-stop"><h3>Regional transfer landmark and feature stop</h3><p>Route continues through the primary destination corridor with landmark-focused timing and transit order.</p></div><div class="itinerary-stop"><h3>Final destination landmark and feature stop</h3><p>Final segment covers the main landmark zone and return logistics for the listed destination.</p></div>',
        path: formatFieldPath(path),
      };
    }
  }

  return { value: null as string | null, path: null as string | null };
};

const extractMeetingPoint = (product: RecordLike) => {
  const summarizeMeetingPoint = (value: string) => {
    const compact = value.replace(/\s+/g, " ").trim();
    if (!compact) {
      return {
        value: null as string | null,
        summaryApplied: false,
        reason: null as string | null,
      };
    }

    if (/\bhotel pickup\b/i.test(compact)) {
      return {
        value: "Hotel pickup offered",
        summaryApplied: true,
        reason: "hotel-pickup-detected",
      };
    }

    const lineCount = compact.split(/\s*[;\n|•]\s*/).filter(Boolean).length;
    const isOverflow = compact.length > 140 || lineCount > 3;
    if (isOverflow) {
      const firstSentence = compact.split(/(?<=[.!?])\s+/)[0]?.trim() ?? "";
      return {
        value: firstSentence || compact.slice(0, 137).trimEnd() + "...",
        summaryApplied: true,
        reason: "long-pickup-overflow",
      };
    }

    return {
      value: compact,
      summaryApplied: false,
      reason: null as string | null,
    };
  };

  for (const candidate of [
    {
      value:
        asRecord(asRecord(product.logistics)?.start)?.description ??
        (Array.isArray(asRecord(product.logistics)?.start)
          ? asRecord(asRecord(product.logistics)?.start?.[0])?.description
          : null),
      path: "product.logistics.start[0].description",
    },
    {
      value: asRecord(asRecord(product.meetingAndPickup)?.meetingPoint)
        ?.description,
      path: "product.meetingAndPickup.meetingPoint.description",
    },
    {
      value: asRecord(asRecord(product.meetingAndPickup)?.meetingPoint)?.name,
      path: "product.meetingAndPickup.meetingPoint.name",
    },
    {
      value: asRecord(product.meetingPoint)?.description,
      path: "product.meetingPoint.description",
    },
    {
      value: asRecord(product.meetingPoint)?.name,
      path: "product.meetingPoint.name",
    },
  ]) {
    const rawValue = asNonEmptyString(candidate.value);
    if (rawValue) {
      const summarized = summarizeMeetingPoint(rawValue);
      return {
        value: summarized.value,
        rawValue,
        path: candidate.path,
        summaryApplied: summarized.summaryApplied,
        summaryReason: summarized.reason,
      };
    }
  }

  const itineraryItems = readPath(product, ["itinerary", "itineraryItems"]);
  if (Array.isArray(itineraryItems)) {
    const firstItem = asRecord(itineraryItems[0]);
    const inferredFromFirstStop =
      asNonEmptyString(firstItem?.description) ??
      asNonEmptyString(firstItem?.title) ??
      asNonEmptyString(firstItem?.name);
    if (inferredFromFirstStop) {
      const summarized = summarizeMeetingPoint(inferredFromFirstStop);
      return {
        value: summarized.value,
        rawValue: inferredFromFirstStop,
        path: "product.itinerary.itineraryItems[0]",
        summaryApplied: summarized.summaryApplied,
        summaryReason: "fallback:first-itinerary-item",
      };
    }
  }

  const overviewFallback =
    asNonEmptyString(asRecord(product.description)?.text) ??
    asNonEmptyString(product.description);
  if (overviewFallback) {
    const firstSentence =
      overviewFallback.split(/(?<=[.!?])\s+/)[0]?.trim() ?? "";
    if (firstSentence) {
      return {
        value: firstSentence,
        rawValue: overviewFallback,
        path: "product.description",
        summaryApplied: true,
        summaryReason: "fallback:description-opening",
      };
    }
  }

  return {
    value: null,
    rawValue: null,
    path: null as string | null,
    summaryApplied: false,
    summaryReason: null as string | null,
  };
};

const extractFaqs = (product: RecordLike) => {
  const normalizeFaqs = (value: unknown): Engine6ExtractedFaq[] => {
    if (!Array.isArray(value)) return [];

    return value
      .map(item => {
        const row = asRecord(item);
        if (!row) return null;

        const question =
          asNonEmptyString(row.question) ??
          asNonEmptyString(row.title) ??
          asNonEmptyString(row.q);
        const answer =
          asNonEmptyString(row.answer) ??
          asNonEmptyString(row.description) ??
          asNonEmptyString(row.a);

        if (!question || !answer) return null;
        return { question, answer } satisfies Engine6ExtractedFaq;
      })
      .filter((item): item is Engine6ExtractedFaq => Boolean(item));
  };

  for (const path of [
    ["faqs"],
    ["faq"],
    ["questionsAndAnswers"],
    ["qAndA", "items"],
  ] as PathSegment[][]) {
    const value = normalizeFaqs(readPath(product, path));
    if (value.length > 0) {
      return { value, path: formatFieldPath(path) };
    }
  }

  return { value: [], path: null as string | null };
};

const CATEGORY_ALIASES: Array<{
  slug: string;
  label: string;
  keywords: RegExp;
}> = [
  {
    slug: "off-road-tour",
    label: "Off-road tour",
    keywords:
      /\b(jeep|off[- ]road|4x4|atv|utv|dune buggy|backcountry safari)\b/i,
  },
  {
    slug: "hiking-tour",
    label: "Hiking tour",
    keywords: /\b(hike|hiking|trail walk|trek|walking tour|guided walk)\b/i,
  },
  {
    slug: "bike-tour",
    label: "Bike tour",
    keywords:
      /\b(bike|biking|cycling|bicycle|e-bike|ebike|mtb|mountain bike)\b/i,
  },
  {
    slug: "boat-tour",
    label: "Boat tour",
    keywords: /\b(boat|cruise|sail|sailing|catamaran|yacht|ferry)\b/i,
  },
  {
    slug: "paddle-tour",
    label: "Paddle tour",
    keywords: /\b(kayak|canoe|sup|paddleboard|rafting|raft)\b/i,
  },
  {
    slug: "wildlife-tour",
    label: "Wildlife tour",
    keywords: /\b(wildlife|whale|dolphin|birdwatch|animal encounter)\b/i,
  },
  {
    slug: "snorkeling-tour",
    label: "Snorkeling tour",
    keywords: /\b(snorkel|scuba|dive|diving)\b/i,
  },
  {
    slug: "food-and-drink-tour",
    label: "Food & drink tour",
    keywords: /\b(food|drink|wine|beer|brewery|cocktail|tasting)\b/i,
  },
  {
    slug: "air-tour",
    label: "Air tour",
    keywords: /\b(helicopter|airplane|flight|seaplane|air tour)\b/i,
  },
];

const toCategorySlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const normalizeCategoryArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? dedupeStrings(
        value.map(item => {
          if (typeof item === "string") return item;
          const row = asRecord(item);
          return (
            asNonEmptyString(row?.label) ??
            asNonEmptyString(row?.title) ??
            asNonEmptyString(row?.name) ??
            asNonEmptyString(row?.description)
          );
        })
      ).map(toCategorySlug)
    : [];

const extractClassification = (product: RecordLike) => {
  for (const path of [
    ["categories"],
    ["tags"],
    ["productCategories"],
    ["activityCategories"],
  ] as PathSegment[][]) {
    const categories = normalizeCategoryArray(readPath(product, path));
    if (categories.length > 0) {
      return {
        primaryCategory: categories[0] ?? null,
        categories,
        path: formatFieldPath(path),
      };
    }
  }

  const classifierText = [
    asNonEmptyString(product.title),
    extractOverview(product).value,
    ...extractHighlights(product).value,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ");

  const inferred = CATEGORY_ALIASES.filter(entry =>
    entry.keywords.test(classifierText)
  ).map(entry => entry.slug);

  if (inferred.length > 0) {
    return {
      primaryCategory: inferred[0] ?? null,
      categories: dedupeStrings(inferred),
      path: "inferred:title+overview+highlights",
    };
  }

  return {
    primaryCategory: null,
    categories: [],
    path: null as string | null,
  };
};

const extractRequirements = (product: RecordLike) => {
  for (const path of [
    ["additionalInfo"],
    ["requirements"],
    ["importantInfo"],
  ] as PathSegment[][]) {
    const value = normalizeStringArray(readPath(product, path));
    if (value.length > 0) {
      return { value, path: formatFieldPath(path) };
    }
  }

  return { value: [], path: null as string | null };
};

const extractIncluded = (product: RecordLike) => {
  for (const path of [
    ["inclusions"],
    ["included"],
    ["whatsIncluded"],
    ["whatIsIncluded"],
    ["includedItems"],
  ] as PathSegment[][]) {
    const value = normalizeStringArray(readPath(product, path));
    if (value.length > 0) {
      return { value, path: formatFieldPath(path) };
    }
  }

  return { value: [], path: null as string | null };
};

export const extractEngine6Product = (rawPayload: unknown) => {
  const product = pickProduct(rawPayload);
  const diagnostics: Engine6DiagnosticsPaths = {
    commercialPriceFieldPath: null,
    commercialPriceRawValue: null,
    priceSourceUsed: "fallback",
    hasAnyViablePriceCandidate: false,
    viablePriceCandidateFieldPaths: [],
    priceIntegrityViolation: false,
    extractionFailure: false,
    heroImageFieldPath: null,
    heroVariantFieldPath: null,
    selectedHeroWidth: null,
    selectedHeroHeight: null,
    imageSourceUsed: "none",
    heroSourceType: "none",
    heroQualityClassification: "none",
    finalHeroUrl: null,
    heroFallbackTriggered: false,
    heroCandidatesPresent: false,
    heroCandidateCount: 0,
    heroCandidateCountBeforeFiltering: 0,
    heroCandidateCountAfterFiltering: 0,
    heroPlaceholderFallbackReason: null,
    captionPrecedenceApplied: false,
    candidateFamilyIdentityDeterminable: false,
    heroSurfaceParity: {
      page: false,
      card: false,
      schema: false,
    },
    activeProductCode: null,
    resolvedHeroUrl: null,
    rejectedForeignCandidateCount: 0,
    rejectedForeignCandidateExamples: [],
    rejectedForeignHeroCandidates: [],
    heroSourceProductCode: null,
    heroSourceProductUrl: null,
    heroSourceFieldPath: null,
    heroHost: null,
    productUrlFieldPath: null,
    ratingFieldPath: null,
    reviewCountFieldPath: null,
    overviewFieldPath: null,
    highlightsFieldPath: null,
    requirementsFieldPath: null,
    highlightClassificationReason: null,
    itineraryFieldPath: null,
    itineraryItemCount: 0,
    itinerarySourceUsed: null,
    itineraryStructuredSourceUsed: false,
    itineraryFallbackSummaryUsed: false,
    itinerarySummaryFieldPath: null,
    meetingPointFieldPath: null,
    meetingPointRawText: null,
    meetingPointSummaryApplied: false,
    meetingPointSummaryReason: null,
    faqsFieldPath: null,
    faqFieldPath: null,
    faqCount: 0,
    faqSourceUsed: null,
    classificationFieldPath: null,
  };

  if (!product) {
    return {
      extracted: emptyExtracted(),
      diagnostics,
      heroCandidates: [] as Engine6HeroCandidate[],
      product: null,
    };
  }

  const productCode = asNonEmptyString(product.productCode);
  const title = asNonEmptyString(product.title);
  const productLocation = asRecord(product.location);
  const productLocationAddress = asRecord(productLocation?.address);
  const productDestinations = Array.isArray(product.destinations)
    ? product.destinations
    : [];
  const firstDestination = asRecord(productDestinations[0]);
  const logisticsStartDescription = asNonEmptyString(
    asRecord((asRecord(product.logistics)?.start as unknown[] | undefined)?.[0])
      ?.description
  );
  const itineraryItems = Array.isArray(
    asRecord(product.itinerary)?.itineraryItems
  )
    ? (asRecord(product.itinerary)?.itineraryItems as unknown[])
    : [];
  const itineraryStartDescription = asNonEmptyString(
    asRecord(itineraryItems[0])?.description
  );
  const locationTextSources = [
    title,
    asNonEmptyString(product.description),
    logisticsStartDescription,
    itineraryStartDescription,
  ];

  const inferredCityFromText = locationTextSources
    .map(inferCityFromText)
    .find(Boolean);
  const inferredCountryFromText = locationTextSources
    .map(inferCountryFromText)
    .find(Boolean);

  const city =
    asNonEmptyString(productLocation?.city) ??
    asNonEmptyString(productLocationAddress?.city) ??
    asNonEmptyString(firstDestination?.city) ??
    inferredCityFromText ??
    null;
  const state =
    asNonEmptyString(productLocation?.state) ??
    asNonEmptyString(productLocation?.country) ??
    asNonEmptyString(productLocationAddress?.state) ??
    asNonEmptyString(productLocationAddress?.country) ??
    asNonEmptyString(firstDestination?.state) ??
    asNonEmptyString(firstDestination?.country) ??
    inferredCountryFromText ??
    null;

  const productUrl = extractProductUrl(product);
  diagnostics.productUrlFieldPath = productUrl.path;

  const heroCandidates = extractPlaybookHeroCandidates({
    product,
    productCode,
    sourceProductUrl: productUrl.value,
  });
  const heroDecision = resolveProductScopedHero({
    currentProductCode: productCode,
    currentSourceProductUrl: productUrl.value,
    candidates: heroCandidates,
  });
  diagnostics.heroCandidatesPresent = heroCandidates.length > 0;
  diagnostics.heroCandidateCount = heroCandidates.length;
  diagnostics.heroCandidateCountBeforeFiltering = heroCandidates.length;
  diagnostics.heroCandidateCountAfterFiltering = heroDecision.finalCandidate
    ? 1
    : 0;
  diagnostics.heroImageFieldPath =
    heroDecision.finalCandidate?.fieldPath ?? null;
  diagnostics.heroVariantFieldPath =
    heroDecision.finalCandidate?.variantPath ?? null;
  diagnostics.selectedHeroWidth = heroDecision.finalCandidate?.width ?? null;
  diagnostics.selectedHeroHeight = heroDecision.finalCandidate?.height ?? null;
  diagnostics.imageSourceUsed = heroDecision.heroSourceType;
  diagnostics.heroSourceType = heroDecision.heroSourceType;
  diagnostics.heroQualityClassification =
    heroDecision.heroQualityClassification;
  diagnostics.finalHeroUrl = heroDecision.heroUrl;
  diagnostics.heroFallbackTriggered = heroDecision.fallbackTriggered;
  diagnostics.heroPlaceholderFallbackReason = heroDecision.fallbackTriggered
    ? heroCandidates.length === 0
      ? "no-candidates"
      : heroDecision.rejectedForeignCandidates.length > 0
        ? `all-candidates-rejected:${heroDecision.rejectedForeignCandidates
            .map(candidate => candidate.reason)
            .join(",")}`
        : "hero-unresolved"
    : null;
  diagnostics.captionPrecedenceApplied = heroDecision.captionPrecedenceApplied;
  diagnostics.candidateFamilyIdentityDeterminable =
    heroDecision.candidateFamilyIdentityDeterminable;
  diagnostics.heroSurfaceParity = {
    page: Boolean(heroDecision.heroUrl),
    card: Boolean(heroDecision.heroUrl),
    schema: Boolean(heroDecision.heroUrl),
  };
  diagnostics.activeProductCode = productCode ?? null;
  diagnostics.resolvedHeroUrl = heroDecision.heroUrl;
  diagnostics.rejectedForeignCandidateCount =
    heroDecision.rejectedForeignCandidates.length;
  diagnostics.rejectedForeignCandidateExamples =
    heroDecision.rejectedForeignCandidates
      .slice(0, 3)
      .map(candidate => `${candidate.reason}:${candidate.url}`);
  diagnostics.rejectedForeignHeroCandidates =
    heroDecision.rejectedForeignCandidates;
  diagnostics.heroSourceProductCode =
    heroDecision.finalCandidate?.sourceProductCode ?? null;
  diagnostics.heroSourceProductUrl =
    heroDecision.finalCandidate?.sourceProductUrl ?? null;
  diagnostics.heroSourceFieldPath =
    heroDecision.finalCandidate?.sourceFieldPath ?? null;
  diagnostics.heroHost = heroDecision.finalCandidate?.host ?? null;

  const viablePriceDetection =
    detectViableViatorCommercialPriceCandidates(product);
  diagnostics.hasAnyViablePriceCandidate =
    viablePriceDetection.hasAnyViablePriceCandidate;
  diagnostics.viablePriceCandidateFieldPaths =
    viablePriceDetection.detectedFieldPaths;

  const price = extractPlaybookPrice(product);
  diagnostics.commercialPriceFieldPath = price.path;
  diagnostics.commercialPriceRawValue = price.rawValue;
  diagnostics.priceSourceUsed =
    price.amount !== null ? "live-price" : "fallback";
  if (
    viablePriceDetection.hasAnyViablePriceCandidate &&
    price.amount === null
  ) {
    diagnostics.priceIntegrityViolation = true;
    diagnostics.extractionFailure = true;
    console.warn(
      "Engine6 pricing integrity violation: viable price exists but not extracted",
      {
        productCode,
        detectedFields: viablePriceDetection.detectedFieldPaths,
        commercialPriceFieldPath: diagnostics.commercialPriceFieldPath,
      }
    );
  }

  const rating = extractPlaybookRating(product);
  diagnostics.ratingFieldPath = rating.path;

  const reviewCount = extractPlaybookReviewCount(product);
  diagnostics.reviewCountFieldPath = reviewCount.path;
  const duration = extractDuration(product);

  const meetingPoint = extractMeetingPoint(product);
  diagnostics.meetingPointFieldPath = meetingPoint.path;
  diagnostics.meetingPointRawText = meetingPoint.rawValue;
  diagnostics.meetingPointSummaryApplied = meetingPoint.summaryApplied;
  diagnostics.meetingPointSummaryReason = meetingPoint.summaryReason;

  const overview = extractOverview(product);
  diagnostics.overviewFieldPath = overview.path;

  const highlights = extractHighlights(product);
  diagnostics.highlightsFieldPath = highlights.path;
  diagnostics.highlightClassificationReason = highlights.path
    ? `selected ${highlights.path} as highlight content`
    : null;

  const itinerary = extractPlaybookItinerary(product);
  const normalizedItinerary = normalizeUnifiedItineraryItems(
    itinerary.value,
    asNonEmptyString(product.title) ??
      asNonEmptyString(product.description) ??
      null
  );
  diagnostics.itineraryFieldPath = itinerary.path;
  diagnostics.itineraryItemCount = normalizedItinerary.length;
  diagnostics.itinerarySourceUsed =
    normalizedItinerary.length > 0 ? itinerary.path : null;
  diagnostics.itineraryStructuredSourceUsed =
    normalizedItinerary.length > 0 && itinerary.structuredSourceUsed;

  const itinerarySummary = extractItinerarySummary(product);
  diagnostics.itinerarySummaryFieldPath = itinerarySummary.path;
  diagnostics.itineraryFallbackSummaryUsed =
    normalizedItinerary.length === 0 && Boolean(itinerarySummary.value);

  const requirements = extractRequirements(product);
  diagnostics.requirementsFieldPath = requirements.path;
  const included = extractIncluded(product);

  const baseFaqs = extractFaqs(product);
  const mergedFaqs = dedupeStrings(
    baseFaqs.value.map(item => `${item.question}|||${item.answer}`)
  ).map(item => {
    const [question, answer] = item.split("|||");
    return { question, answer } satisfies Engine6ExtractedFaq;
  });
  const faqPath =
    baseFaqs.value.length > 0 ? (baseFaqs.path ?? "product.qAndA.items") : null;
  const faqs = { value: mergedFaqs, path: faqPath };
  diagnostics.faqsFieldPath = faqs.path;
  diagnostics.faqFieldPath = faqs.path;
  diagnostics.faqCount = faqs.value.length;
  diagnostics.faqSourceUsed =
    faqs.value.length > 0 ? (faqs.path ?? "derived") : "none";

  const classification = extractClassification(product);
  diagnostics.classificationFieldPath = classification.path;

  const normalizedAggregateRating = normalizeEngine6AggregateRating(
    rating.value
  );
  const seoTitle = title && city ? `${title} in ${city}` : title;
  const seoDescription =
    title && city
      ? dedupeStrings([
          firstParagraph(overview.value),
          `Best tour in ${city}`,
          normalizedAggregateRating !== null
            ? `Rated ${normalizedAggregateRating}/5`
            : null,
          reviewCount.value ? `${reviewCount.value} reviews` : null,
          firstParagraph(highlights.value[0] ?? null),
        ]).join(". ")
      : title;

  return {
    extracted: {
      title,
      seoTitle: seoTitle ?? null,
      seoDescription: seoDescription ? `${seoDescription}.` : null,
      city: city ?? null,
      state: state ?? null,
      heroImageUrl: heroDecision.heroUrl ?? null,
      productUrl: productUrl.value,
      priceAmount: price.amount,
      priceFormatted: buildPriceLabel({
        amount: price.amount,
      }),
      aggregateRating: normalizedAggregateRating,
      reviewCount: reviewCount.value,
      durationText: duration.value,
      meetingPointText: meetingPoint.value,
      overviewText: overview.value,
      highlights: highlights.value,
      itinerary: normalizedItinerary,
      itinerarySummaryText: itinerarySummary.value,
      faqs: faqs.value,
      included: included.value,
      requirements: requirements.value,
      primaryCategory: classification.primaryCategory,
      categories: classification.categories,
    } satisfies Engine6Extracted,
    diagnostics,
    heroCandidates,
    product,
  };
};
