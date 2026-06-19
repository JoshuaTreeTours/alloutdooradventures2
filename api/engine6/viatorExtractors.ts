import { normalizeEngine6AggregateRating } from "./rating.js";
import {
  type Engine6HeroCandidate,
  type Engine6HeroQualityClassification,
  type Engine6HeroSourceType,
  resolveProductScopedHero,
} from "./heroResolver.js";
import { classifyTourCategories } from "./tourCategoryClassifier.js";

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
  durationFieldPath: string | null;
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
  primaryDisplayCategory: string | null;
  activityCategories: Array<{ slug: string; label: string }>;
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
  primaryDisplayCategory: null,
  activityCategories: [],
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
  type NormalizedRawPriceValue = string | number | null;
  type PricePathCandidate = {
    amount: number;
    path: string;
    rawValue: NormalizedRawPriceValue;
  };

  const collectPathCandidates = (
    paths: PathSegment[][]
  ): PricePathCandidate[] =>
    paths
      .map(path => {
        const raw = readPath(product, path);
        const amount = parsePriceAmount(raw);
        const rawValue: NormalizedRawPriceValue =
          typeof raw === "string" || typeof raw === "number" ? raw : amount;
        return {
          amount,
          path: formatFieldPath(path),
          rawValue,
        };
      })
      .filter(
        (candidate): candidate is PricePathCandidate =>
          candidate.amount !== null &&
          Number.isFinite(candidate.amount) &&
          candidate.amount > 0
      );

  const selectLowestCandidate = (
    candidates: PricePathCandidate[]
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
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

  const formatMinutesDuration = (minutesValue: number) => {
    const minutes = Math.trunc(minutesValue);
    if (minutes % 60 === 0) {
      const hours = minutes / 60;
      return `${hours} ${hours === 1 ? "hour" : "hours"}`;
    }
    return `${minutes} minutes`;
  };
  const formatVariableMinutesDuration = (
    fromValue: number,
    toValue: number
  ) => {
    const fromMinutes = Math.trunc(fromValue);
    const toMinutes = Math.trunc(toValue);
    if (fromMinutes % 60 === 0 && toMinutes % 60 === 0) {
      const fromHours = fromMinutes / 60;
      const toHours = toMinutes / 60;
      return `${fromHours} to ${toHours} hours`;
    }
    return `${formatMinutesDuration(fromValue)} to ${formatMinutesDuration(toValue)}`;
  };

  const fixedMinutes = parseLooseNumber(
    readPath(product, ["itinerary", "duration", "fixedDurationInMinutes"])
  );
  if (fixedMinutes !== null && fixedMinutes > 0) {
    return {
      value: formatMinutesDuration(fixedMinutes),
      path: "product.itinerary.duration.fixedDurationInMinutes",
    };
  }

  const variableFromMinutes = parseLooseNumber(
    readPath(product, ["itinerary", "duration", "variableDurationFromMinutes"])
  );
  const variableToMinutes = parseLooseNumber(
    readPath(product, ["itinerary", "duration", "variableDurationToMinutes"])
  );
  if (
    variableFromMinutes !== null &&
    variableToMinutes !== null &&
    variableFromMinutes > 0 &&
    variableToMinutes > 0
  ) {
    return {
      value:
        variableFromMinutes === variableToMinutes
          ? formatMinutesDuration(variableFromMinutes)
          : formatVariableMinutesDuration(
              variableFromMinutes,
              variableToMinutes
            ),
      path: "product.itinerary.duration.variableDurationFromMinutes|product.itinerary.duration.variableDurationToMinutes",
    };
  }

  return { value: null as string | null, path: null as string | null };
};

const extractPlaybookRating = (product: RecordLike): NumericResult => {
  for (const path of [
    ["reviews", "combinedAverageRating"],
    ["reviews", "averageRating"],
    ["operatorReviews", "combinedAverageRating"],
    ["operatorReviews", "averageRating"],
    ["rating"],
    ["averageRating"],
    ["reviewSummary", "averageRating"],
  ] as PathSegment[][]) {
    const value = parseLooseNumber(readPath(product, path));
    if (value !== null && value > 0) {
      return { value, path: formatFieldPath(path) };
    }
  }

  return { value: null, path: null };
};

const extractPlaybookReviewCount = (product: RecordLike): NumericResult => {
  const prioritizedPaths = [
    ["reviews", "totalReviews"],
    ["reviews", "operatorReviewCount"],
    ["reviews", "count"],
    ["reviews", "reviewCount"],
    ["operatorReviews", "totalReviews"],
    ["operatorReviews", "operatorReviewCount"],
    ["operatorReviews", "count"],
    ["operatorReviews", "reviewCount"],
    ["reviewSummary", "totalReviews"],
  ] as PathSegment[][];

  for (const path of prioritizedPaths) {
    const value = parseLooseNumber(readPath(product, path));
    if (value !== null && value > 0) {
      return { value: Math.trunc(value), path: formatFieldPath(path) };
    }
  }

  const fallbackTopLevel = parseLooseNumber(readPath(product, ["reviewCount"]));
  if (fallbackTopLevel !== null && fallbackTopLevel > 0) {
    return { value: Math.trunc(fallbackTopLevel), path: "product.reviewCount" };
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

const normalizeItineraryPlaceholderText = (value: string) =>
  value.replace(/\s+/g, " ").replace(/[“”]/g, '"').trim();

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isMechanicalItineraryPlaceholder = (
  value: string,
  title?: string,
  duration?: string
) => {
  const normalized = normalizeItineraryPlaceholderText(value).replace(
    /[.!]+$/,
    ""
  );
  const normalizedLower = normalized.toLowerCase();

  if (
    /^(?:by|pass by|admission included|admission ticket free|historic context|scenic pass-by segment)$/i.test(
      normalized
    )
  ) {
    return true;
  }

  if (
    /^(?:this is a scheduled stop|this portion is viewed|route passes)\b/i.test(
      normalized
    )
  ) {
    return true;
  }

  const normalizedTitle = title
    ? normalizeItineraryPlaceholderText(title).replace(/[.!]+$/, "")
    : "";
  if (normalizedTitle) {
    const titlePattern = escapeRegExp(normalizedTitle);
    if (
      new RegExp(`^pass ${titlePattern} as part of the route$`, "i").test(
        normalized
      )
    ) {
      return true;
    }

    const durationPattern = duration
      ? escapeRegExp(normalizeItineraryPlaceholderText(duration))
      : "[^.]+";
    if (
      new RegExp(
        `^visit ${titlePattern} during the (?:${durationPattern} )?stop$`,
        "i"
      ).test(normalized)
    ) {
      return true;
    }
  }

  return normalizedLower.length === 0;
};

const firstMeaningfulItineraryText = (
  candidates: Array<string | null | undefined>,
  title?: string,
  duration?: string
) =>
  candidates.find(
    candidate =>
      Boolean(candidate) &&
      !isMechanicalItineraryPlaceholder(candidate as string, title, duration)
  );

const cleanItineraryTitle = (value: string) =>
  value
    .replace(/^pass\s+by\s*[:\-–—]?\s*/i, "")
    .replace(/\s*\((pass\s*by)\)\s*$/i, "")
    .trim();

const isLikelyDescriptiveItineraryTitle = (value: string) => {
  const cleaned = cleanItineraryTitle(value) || value.trim();
  const wordCount = cleaned.split(/\s+/).filter(Boolean).length;

  if (/^(?:by|pass by)$/i.test(cleaned)) return true;
  if (/[.!?]$/.test(cleaned)) return true;
  if (/^(?:route passes|visit|pass)\b/i.test(cleaned)) return true;
  if (/^\d+\s+\w+/.test(cleaned)) return true;

  return (
    wordCount > 8 &&
    /\b(?:built|featuring|features|shaded|visitors?|ages|space|dot|located|known|offers?|provides?|includes?|visit|pass(?:es)?|see|view|explore)\b/i.test(
      cleaned
    )
  );
};

const firstConciseItineraryTitle = (
  candidates: Array<string | null | undefined>
) =>
  candidates.find(
    candidate =>
      Boolean(candidate) &&
      !isLikelyDescriptiveItineraryTitle(candidate as string)
  );

const inferKnownLandmarkTitleFromItineraryText = (
  candidates: Array<string | null | undefined>
) => {
  const normalized = candidates
    .filter((candidate): candidate is string => Boolean(candidate))
    .join(" ")
    .replace(/\s+/g, " ")
    .toLowerCase();

  if (!normalized) return null;
  if (/\bcentral park\b/.test(normalized) && /\bcarousel\b/.test(normalized)) {
    return "Central Park Carousel";
  }
  if (
    /\bgame tables?\b/.test(normalized) ||
    /\bwooden trellis\b/.test(normalized)
  ) {
    return "Chess & Checkers House";
  }
  if (
    /\bshakespeare\b/.test(normalized) ||
    /\brobert burns\b/.test(normalized)
  ) {
    return "Literary Walk";
  }
  if (/\bthe dairy\b|\bdairy\b/.test(normalized)) {
    return "The Dairy";
  }
  if (/\bbow bridge\b|\bcast-iron bridge\b/.test(normalized)) {
    return "Bow Bridge";
  }
  if (/\bbethesda fountain\b|\bbethesda terrace\b/.test(normalized)) {
    return "Bethesda Fountain";
  }
  if (/\blombard street\b/.test(normalized)) {
    return "Lombard Street";
  }
  if (/\bjackson square\b/.test(normalized)) {
    return "Jackson Square";
  }

  return null;
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
    asNonEmptyString(row.stopName) ??
    asNonEmptyString(row.attractionName) ??
    asNonEmptyString(row.landmarkName) ??
    asNonEmptyString(row.locationName) ??
    asNonEmptyString(stop?.stopName) ??
    asNonEmptyString(stop?.attractionName) ??
    asNonEmptyString(stop?.landmarkName) ??
    asNonEmptyString(stop?.locationName) ??
    asNonEmptyString(pointOfInterest?.stopName) ??
    asNonEmptyString(pointOfInterest?.attractionName) ??
    asNonEmptyString(pointOfInterest?.landmarkName) ??
    asNonEmptyString(pointOfInterest?.locationName) ??
    asNonEmptyString(pointOfInterestLocation?.locationName) ??
    asNonEmptyString(pointOfInterestLocation?.stopName) ??
    asNonEmptyString(pointOfInterestLocation?.attractionName) ??
    asNonEmptyString(pointOfInterestLocation?.landmarkName) ??
    asNonEmptyString(pointOfInterestLocation?.title) ??
    asNonEmptyString(pointOfInterestLocation?.name);

  const titleCandidates = [
    locationTitle,
    asNonEmptyString(location?.locationName),
    asNonEmptyString(location?.stopName),
    asNonEmptyString(location?.attractionName),
    asNonEmptyString(location?.landmarkName),
    asNonEmptyString(location?.name),
    asNonEmptyString(pointOfInterest?.title),
    asNonEmptyString(pointOfInterest?.name),
    asNonEmptyString(stop?.name),
    asNonEmptyString(stop?.title),
    asNonEmptyString(row.title),
    asNonEmptyString(row.name),
    asNonEmptyString(row.label),
  ];
  const descriptionCandidates = [
    asNonEmptyString(row.description),
    asNonEmptyString(row.summary),
    asNonEmptyString(row.details),
    asNonEmptyString(pointOfInterest?.description),
    asNonEmptyString(stop?.description),
  ];
  const title =
    firstConciseItineraryTitle(titleCandidates) ??
    inferKnownLandmarkTitleFromItineraryText([
      ...titleCandidates,
      ...descriptionCandidates,
    ]);

  if (!title) return null;
  const cleanedTitle = cleanItineraryTitle(title) || title;
  const isPassByFromTitle =
    /\bpass(?:\s|-)?by\b/i.test(title) && cleanedTitle.length > 0;

  const duration =
    asNonEmptyString(row.duration) ??
    asNonEmptyString(row.durationText) ??
    asNonEmptyString(asRecord(row.durationInfo)?.durationText) ??
    asNonEmptyString(asRecord(row.durationInfo)?.label) ??
    undefined;

  const description = firstMeaningfulItineraryText(
    descriptionCandidates,
    cleanedTitle,
    duration
  );
  const admissionNoteFromFields = firstMeaningfulItineraryText(
    [
      asNonEmptyString(row.admissionNote),
      asNonEmptyString(row.admissionTicket),
      asNonEmptyString(row.admission),
      asNonEmptyString(row.ticketNote),
      asNonEmptyString(row.ticketInfo),
      asNonEmptyString(row.inclusion),
      asNonEmptyString(row.inclusions),
      asBoolean(row.admissionIncluded) === true
        ? "Admission Included"
        : asBoolean(row.admissionIncluded) === false
          ? "Admission Not Included"
          : null,
    ],
    cleanedTitle,
    duration
  );
  const admissionNoteFromDescription =
    description && /admission ticket/i.test(description)
      ? description
      : undefined;
  const admissionNote =
    admissionNoteFromFields ?? admissionNoteFromDescription ?? undefined;
  const descriptionWithoutAdmission =
    admissionNoteFromDescription && description === admissionNoteFromDescription
      ? undefined
      : description;
  const stopType =
    isPassByFlag || isPassByFromType || isPassByFromTitle ? "pass-by" : "stop";

  return {
    title: cleanedTitle,
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
      return { value, path: formatFieldPath(path) };
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

  const logistics = asRecord(product.logistics);
  const logisticsStart = logistics?.start;
  const logisticsStartObject = asRecord(logisticsStart);
  const logisticsStartArrayFirst = Array.isArray(logisticsStart)
    ? asRecord(logisticsStart[0])
    : null;

  for (const candidate of [
    {
      value:
        logisticsStartObject?.description ??
        logisticsStartArrayFirst?.description ??
        null,
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

const toCategorySlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const ENGINE6_CATEGORY_CANONICAL_SLUGS: Record<string, string> = {
  "bike-tours": "bike-tour",
  "bicycle-tours": "bike-tour",
  "bicycle-tour": "bike-tour",
  "cycling-tours": "bike-tour",
  "cycling-tour": "bike-tour",
  "e-bike-tours": "bike-tour",
  "e-bike-tour": "bike-tour",
  "ebike-tours": "bike-tour",
  "ebike-tour": "bike-tour",
  "mountain-bike-tours": "bike-tour",
  "mountain-bike-tour": "bike-tour",
  "hiking-tours": "hiking-tour",
  "walking-tours": "walking-tour",
};

const canonicalizeEngine6CategorySlug = (slug: string) =>
  ENGINE6_CATEGORY_CANONICAL_SLUGS[slug] ?? slug;

const normalizeCategoryArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? dedupeStrings(
        value
          .map(item => {
            if (typeof item === "string") return item;
            const row = asRecord(item);
            return (
              asNonEmptyString(row?.label) ??
              asNonEmptyString(row?.title) ??
              asNonEmptyString(row?.name) ??
              asNonEmptyString(row?.description)
            );
          })
          .filter((item): item is string => Boolean(item))
          .map(toCategorySlug)
          .map(canonicalizeEngine6CategorySlug)
      )
    : [];

const extractClassification = ({
  product,
  title,
  overview,
  highlights,
  itinerary,
}: {
  product: RecordLike;
  title: string | null;
  overview: string | null;
  highlights: string[];
  itinerary: Engine6ExtractedItineraryItem[];
}) => {
  const sourceCategories: string[] = [];
  const sourceCategoryPaths: string[] = [];

  for (const path of [
    ["categories"],
    ["tags"],
    ["productCategories"],
    ["activityCategories"],
  ] as PathSegment[][]) {
    const categories = normalizeCategoryArray(readPath(product, path));
    if (categories.length > 0) {
      sourceCategories.push(...categories);
      sourceCategoryPaths.push(formatFieldPath(path));
    }
  }

  const classification = classifyTourCategories({
    title,
    overview,
    description: asNonEmptyString(product.description),
    highlights,
    itinerary,
    categories: sourceCategories,
  });

  return {
    primaryCategory: classification.matchedCategorySlugs[0] ?? null,
    categories: classification.matchedCategorySlugs,
    primaryDisplayCategory: classification.primaryDisplayCategory,
    activityCategories: classification.activityCategories,
    path:
      classification.matchedCategorySlugs.length > 0
        ? [
            sourceCategoryPaths.length > 0
              ? sourceCategoryPaths.join("+")
              : null,
            "inferred:title+overview+description+highlights+itinerary",
          ]
            .filter(Boolean)
            .join("+")
        : null,
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
    durationFieldPath: null,
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
  diagnostics.durationFieldPath = duration.path;

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
  diagnostics.itineraryFieldPath = itinerary.path;
  diagnostics.itineraryItemCount = itinerary.value.length;
  diagnostics.itinerarySourceUsed =
    itinerary.value.length > 0 ? itinerary.path : null;
  diagnostics.itineraryStructuredSourceUsed =
    itinerary.value.length > 0 && itinerary.structuredSourceUsed;

  const itinerarySummary = extractItinerarySummary(product);
  diagnostics.itinerarySummaryFieldPath = itinerarySummary.path;
  diagnostics.itineraryFallbackSummaryUsed =
    itinerary.value.length === 0 && Boolean(itinerarySummary.value);

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

  const classification = extractClassification({
    product,
    title,
    overview: overview.value,
    highlights: highlights.value,
    itinerary: itinerary.value,
  });
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
      itinerary: itinerary.value,
      itinerarySummaryText: itinerarySummary.value,
      faqs: faqs.value,
      included: included.value,
      requirements: requirements.value,
      primaryCategory: classification.primaryCategory,
      categories: classification.categories,
      primaryDisplayCategory: classification.primaryDisplayCategory,
      activityCategories: classification.activityCategories,
    } satisfies Engine6Extracted,
    diagnostics,
    heroCandidates,
    product,
  };
};
