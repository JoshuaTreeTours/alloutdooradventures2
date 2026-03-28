import { normalizeEngine6AggregateRating } from "./rating.js";
import {
  ENGINE6_APPROVED_PLACEHOLDER_IMAGE,
  type Engine6HeroCandidate,
  type Engine6HeroSourceType,
  resolveProductScopedHero,
} from "./heroResolver.js";

export type Engine6DiagnosticsPaths = {
  commercialPriceFieldPath: string | null;
  commercialPriceRawValue: string | number | null;
  priceSourceUsed: "live-price" | "fallback";
  heroImageFieldPath: string | null;
  heroVariantFieldPath: string | null;
  selectedHeroWidth: number | null;
  selectedHeroHeight: number | null;
  imageSourceUsed: Engine6HeroSourceType;
  heroSourceType: Engine6HeroSourceType;
  finalHeroUrl: string | null;
  heroFallbackTriggered: boolean;
  rejectedForeignHeroCandidates: Array<{
    url: string;
    sourceType: Engine6HeroSourceType;
    reason: string;
    candidateProductCode: string | null;
    candidateSourceProductUrl: string | null;
    fieldPath: string | null;
  }>;
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
  meetingPointFieldPath: string | null;
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
  cardImageUrl: string | null;
  productUrl: string | null;
  priceAmount: number | null;
  priceFormatted: string | null;
  aggregateRating: number | null;
  reviewCount: number | null;
  meetingPointText: string | null;
  overviewText: string | null;
  highlights: string[];
  itinerary: Engine6ExtractedItineraryItem[];
  faqs: Engine6ExtractedFaq[];
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

  const numeric = Number(raw.replace(/[^\d.]/g, ""));
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
  cardImageUrl: null,
  productUrl: null,
  priceAmount: null,
  priceFormatted: null,
  aggregateRating: null,
  reviewCount: null,
  meetingPointText: null,
  overviewText: null,
  highlights: [],
  itinerary: [],
  faqs: [],
  requirements: [],
  primaryCategory: null,
  categories: [],
});

const rankVariants = (
  variants: RankedImageVariant[]
): RankedImageVariant | null => {
  const ranked = [...variants].sort((a, b) => {
    if (b.area !== a.area) {
      return b.area - a.area;
    }
    if ((b.width ?? 0) !== (a.width ?? 0)) {
      return (b.width ?? 0) - (a.width ?? 0);
    }
    return (b.height ?? 0) - (a.height ?? 0);
  });

  return ranked[0] ?? null;
};

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

const resolveImageCollectionHero = (
  images: unknown,
  basePathPrefix: PathSegment[],
  sourceType: Exclude<Engine6HeroSourceType, "approved-placeholder">
): HeroImageResult | null => {
  if (!Array.isArray(images)) {
    return null;
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

  for (const entry of prioritizedImages) {
    const image = asRecord(entry.value);
    if (!image) continue;

    const basePath = [...basePathPrefix, entry.index];
    const selectedVariant = rankVariants([
      ...collectRecordVariants(image, basePath),
      ...collectArrayVariants(image, basePath),
    ]);

    if (selectedVariant) {
      return {
        url: selectedVariant.url,
        path: selectedVariant.path,
        variantPath: selectedVariant.variantPath,
        width: selectedVariant.width,
        height: selectedVariant.height,
        sourceType,
      };
    }

    const directUrl =
      asImageUrl(image.url) ??
      asImageUrl(image.src) ??
      asImageUrl(image.imageUrl);
    if (directUrl) {
      const directPath = asImageUrl(image.url)
        ? formatFieldPath([...basePath, "url"])
        : asImageUrl(image.src)
          ? formatFieldPath([...basePath, "src"])
          : formatFieldPath([...basePath, "imageUrl"]);
      return {
        url: directUrl,
        path: directPath,
        variantPath: formatFieldPath(basePath),
        width: parseLooseNumber(image.width),
        height: parseLooseNumber(image.height),
        sourceType,
      };
    }
  }

  return null;
};

const resolveRootImage = (product: RecordLike): HeroImageResult | null =>
  resolveImageCollectionHero(product.images, ["images"], "api-gallery");

const withHeroScope = (
  hero: HeroImageResult,
  productCode: string | null,
  sourceProductUrl: string | null
): Engine6HeroCandidate => ({
  ...hero,
  fieldPath: hero.path,
  candidateProductCode: productCode,
  candidateSourceProductUrl: sourceProductUrl,
});

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

  const mediaHero = resolveImageCollectionHero(
    readPath(product, ["media", "images"]),
    ["media", "images"],
    "api-primary"
  );
  if (mediaHero) {
    candidates.push(withHeroScope(mediaHero, productCode, sourceProductUrl));
  }

  const rootHero = resolveRootImage(product);
  if (rootHero) {
    candidates.push(withHeroScope(rootHero, productCode, sourceProductUrl));
  }

  for (const [path, value] of [
    ["product.imageUrl", product.imageUrl],
    ["product.thumbnailHiResURL", product.thumbnailHiResURL],
    ["product.thumbnailURL", product.thumbnailURL],
  ] as const) {
    const url = asImageUrl(value);
    if (!url) {
      continue;
    }

    candidates.push({
      url,
      sourceType: "api-gallery",
      candidateProductCode: productCode,
      candidateSourceProductUrl: sourceProductUrl,
      fieldPath: path,
      variantPath: path.replace(/\.url$/, ""),
      width: null,
      height: null,
    });
  }

  candidates.push({
    url: ENGINE6_APPROVED_PLACEHOLDER_IMAGE,
    sourceType: "approved-placeholder",
    candidateProductCode: productCode,
    candidateSourceProductUrl: sourceProductUrl,
    fieldPath: "engine6.approved-placeholder",
    variantPath: "engine6.approved-placeholder",
    width: null,
    height: null,
  });

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
  const amountPaths: PathSegment[][] = [
    ["pricing", "summary", "fromPrice"],
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
  ];

  for (const path of amountPaths) {
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

  for (const path of [
    ["pricing", "summary", "fromPriceFormatted"],
    ["pricingSummary", "fromPriceFormatted"],
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

  return {
    amount: null,
    path: null,
    rawValue: null,
  };
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

const extractPlaybookItinerary = (product: RecordLike): ItineraryResult => {
  const normalizeItinerary = (
    value: unknown
  ): Engine6ExtractedItineraryItem[] => {
    const rows = Array.isArray(value)
      ? value
      : Array.isArray(asRecord(value)?.itineraryItems)
        ? (asRecord(value)?.itineraryItems as unknown[])
        : [];

    if (!Array.isArray(rows)) {
      return [];
    }

    return rows
      .map(item => {
        const row = asRecord(item);
        if (!row) return null;

        const pointOfInterest = asRecord(row.pointOfInterest);
        const title =
          asNonEmptyString(row.title) ??
          asNonEmptyString(row.name) ??
          asNonEmptyString(row.label) ??
          asNonEmptyString(pointOfInterest?.title) ??
          asNonEmptyString(pointOfInterest?.name);

        if (!title) return null;

        const description =
          asNonEmptyString(row.description) ??
          asNonEmptyString(row.summary) ??
          asNonEmptyString(pointOfInterest?.description) ??
          undefined;
        const admissionNoteFromFields =
          asNonEmptyString(row.admissionNote) ??
          asNonEmptyString(row.admissionTicket) ??
          asNonEmptyString(row.admission) ??
          asNonEmptyString(row.ticketNote) ??
          asNonEmptyString(row.ticketInfo) ??
          asNonEmptyString(row.inclusion) ??
          asNonEmptyString(row.inclusions);
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
          undefined;
        const descriptionWithoutAdmission =
          admissionNoteFromDescription && description === admissionNoteFromDescription
            ? undefined
            : description;

        return {
          title,
          ...(descriptionWithoutAdmission
            ? { description: descriptionWithoutAdmission }
            : {}),
          ...(duration ? { duration } : {}),
          ...(admissionNote ? { admissionNote } : {}),
        } satisfies Engine6ExtractedItineraryItem;
      })
      .filter((item): item is Engine6ExtractedItineraryItem => Boolean(item));
  };

  for (const path of [
    ["itineraryItems"],
    ["itinerary", "itineraryItems"],
    ["itinerary"],
    ["whatToExpect", "items"],
  ] as PathSegment[][]) {
    const value = normalizeItinerary(readPath(product, path));
    if (value.length > 0) {
      return { value, path: formatFieldPath(path) };
    }
  }

  return { value: [], path: "product.itineraryItems" };
};

const extractMeetingPoint = (product: RecordLike) => {
  for (const candidate of [
    {
      value: asRecord(asRecord(product.logistics)?.start)?.description,
      path: "product.logistics.start.description",
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
    const value = asNonEmptyString(candidate.value);
    if (value) {
      return { value, path: candidate.path };
    }
  }

  return { value: null, path: null as string | null };
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

export const extractEngine6Product = (rawPayload: unknown) => {
  const product = pickProduct(rawPayload);
  const diagnostics: Engine6DiagnosticsPaths = {
    commercialPriceFieldPath: null,
    commercialPriceRawValue: null,
    priceSourceUsed: "fallback",
    heroImageFieldPath: null,
    heroVariantFieldPath: null,
    selectedHeroWidth: null,
    selectedHeroHeight: null,
    imageSourceUsed: "approved-placeholder",
    heroSourceType: "approved-placeholder",
    finalHeroUrl: null,
    heroFallbackTriggered: false,
    rejectedForeignHeroCandidates: [],
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
    meetingPointFieldPath: null,
    faqsFieldPath: null,
    faqFieldPath: null,
    faqCount: 0,
    faqSourceUsed: null,
    classificationFieldPath: null,
  };

  if (!product) {
    return { extracted: emptyExtracted(), diagnostics, product: null };
  }

  const productCode = asNonEmptyString(product.productCode);
  const title = asNonEmptyString(product.title);
  const city =
    asNonEmptyString(asRecord(product.location)?.city) ??
    asNonEmptyString(asRecord(asRecord(product.location)?.address)?.city);
  const state =
    asNonEmptyString(asRecord(product.location)?.state) ??
    asNonEmptyString(asRecord(asRecord(product.location)?.address)?.state);

  const productUrl = extractProductUrl(product);
  diagnostics.productUrlFieldPath = productUrl.path;

  const heroDecision = resolveProductScopedHero({
    currentProductCode: productCode,
    currentSourceProductUrl: productUrl.value,
    candidates: extractPlaybookHeroCandidates({
      product,
      productCode,
      sourceProductUrl: productUrl.value,
    }),
  });
  diagnostics.heroImageFieldPath = heroDecision.finalCandidate.fieldPath ?? null;
  diagnostics.heroVariantFieldPath = heroDecision.finalCandidate.variantPath ?? null;
  diagnostics.selectedHeroWidth = heroDecision.finalCandidate.width ?? null;
  diagnostics.selectedHeroHeight = heroDecision.finalCandidate.height ?? null;
  diagnostics.imageSourceUsed = heroDecision.heroSourceType;
  diagnostics.heroSourceType = heroDecision.heroSourceType;
  diagnostics.finalHeroUrl = heroDecision.heroUrl;
  diagnostics.heroFallbackTriggered = heroDecision.fallbackTriggered;
  diagnostics.rejectedForeignHeroCandidates = heroDecision.rejectedForeignCandidates;

  const price = extractPlaybookPrice(product);
  diagnostics.commercialPriceFieldPath = price.path;
  diagnostics.commercialPriceRawValue = price.rawValue;
  diagnostics.priceSourceUsed =
    price.amount !== null ? "live-price" : "fallback";

  const rating = extractPlaybookRating(product);
  diagnostics.ratingFieldPath = rating.path;

  const reviewCount = extractPlaybookReviewCount(product);
  diagnostics.reviewCountFieldPath = reviewCount.path;

  const meetingPoint = extractMeetingPoint(product);
  diagnostics.meetingPointFieldPath = meetingPoint.path;

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

  const requirements = extractRequirements(product);
  diagnostics.requirementsFieldPath = requirements.path;

  const baseFaqs = extractFaqs(product);
  const mergedFaqs = dedupeStrings(
    baseFaqs.value.map(item => `${item.question}|||${item.answer}`)
  ).map(item => {
    const [question, answer] = item.split("|||");
    return { question, answer } satisfies Engine6ExtractedFaq;
  });
  const faqPath = baseFaqs.value.length > 0
    ? (baseFaqs.path ?? "product.qAndA.items")
    : null;
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
      cardImageUrl: heroDecision.heroUrl ?? null,
      productUrl: productUrl.value,
      priceAmount: price.amount,
      priceFormatted:
        price.amount !== null ? `From $${price.amount.toFixed(0)}` : null,
      aggregateRating: normalizedAggregateRating,
      reviewCount: reviewCount.value,
      meetingPointText: meetingPoint.value,
      overviewText: overview.value,
      highlights: highlights.value,
      itinerary: itinerary.value,
      faqs: faqs.value,
      requirements: requirements.value,
      primaryCategory: classification.primaryCategory,
      categories: classification.categories,
    } satisfies Engine6Extracted,
    diagnostics,
    product,
  };
};
