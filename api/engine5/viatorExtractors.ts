type RecordLike = Record<string, unknown>;
type PathSegment = string | number;

type ExtractedValue<T> = {
  value: T;
  fieldPath: string;
};

export type ViatorExtractedHeroImage = {
  url: string;
  fieldPath: string;
  width?: number;
  height?: number;
};

export type ViatorExtractedPrice = {
  amount: number;
  formattedPrice?: string;
  fieldPath: string;
};

export type ViatorItineraryItem = {
  title: string;
  description?: string;
  duration?: string;
};

const asRecord = (value: unknown): RecordLike | undefined =>
  typeof value === "object" && value !== null
    ? (value as RecordLike)
    : undefined;

const cleanText = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const isDefined = <T>(value: T | undefined): value is T => value !== undefined;
const parseLooseNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const raw = cleanText(value);
  if (!raw) {
    return undefined;
  }

  const normalized = raw
    .replace(/,/g, "")
    .replace(/out of\s*5/gi, "")
    .replace(/[^\d.-]/g, "");

  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const asImageUrl = (value: unknown): string | undefined => {
  const url = cleanText(value);
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.toString()
      : undefined;
  } catch {
    return undefined;
  }
};

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

const parsePriceAmount = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  const raw = cleanText(value);
  if (!raw) {
    return undefined;
  }

  if (/^\$?0(?:\.0+)?$/.test(raw.replace(/,/g, ""))) {
    return undefined;
  }

  const numeric = Number(raw.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return undefined;
  }

  return numeric;
};

const pickProduct = (input: unknown): RecordLike | undefined => {
  const root = asRecord(input);
  if (!root) {
    return undefined;
  }

  return asRecord(root.product) ?? root;
};

export const extractViatorPrice = (
  input: unknown
): ViatorExtractedPrice | null => {
  const product = pickProduct(input);
  if (!product) {
    return null;
  }

  const bookingOptions = Array.isArray(product.bookingOptions)
    ? product.bookingOptions
    : [];
  const bookableItems = Array.isArray(product.bookableItems)
    ? product.bookableItems
    : [];

  const amountPaths: PathSegment[][] = [
    ["pricing", "summary", "fromPrice"],
    ["pricingSummary", "fromPrice"],
    ["pricing", "fromPrice"],
    ["price", "fromPrice"],
    ["fromPrice"],
    ["priceFrom"],
    ...bookableItems.flatMap((_, index) => [
      ["bookableItems", index, "pricingSummary", "fromPrice"],
      ["bookableItems", index, "pricing", "summary", "fromPrice"],
      ["bookableItems", index, "price", "fromPrice"],
      [
        "bookableItems",
        index,
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
        index,
        "seasonalPricingRecords",
        0,
        "pricingDetails",
        0,
        "price",
        "partnerNetPrice",
      ],
    ]),
    ...bookingOptions.flatMap((_, index) => [
      ["bookingOptions", index, "price", "fromPrice"],
      ["bookingOptions", index, "price", "amount"],
    ]),
  ];

  const formattedPaths: PathSegment[][] = [
    ["pricing", "summary", "fromPriceFormatted"],
    ["pricingSummary", "fromPriceFormatted"],
  ];

  for (const path of amountPaths) {
    const raw = readPath(product, path);
    const amount = parsePriceAmount(raw);
    if (typeof amount === "number") {
      return {
        amount,
        formattedPrice: typeof raw === "string" ? raw : undefined,
        fieldPath: formatFieldPath(path),
      };
    }
  }

  for (const path of formattedPaths) {
    const raw = readPath(product, path);
    const amount = parsePriceAmount(raw);
    if (typeof amount === "number") {
      const formatted = cleanText(raw);
      return {
        amount,
        formattedPrice: formatted,
        fieldPath: formatFieldPath(path),
      };
    }
  }

  return null;
};

export const extractViatorRating = (
  input: unknown
): ExtractedValue<number> | null => {
  const product = pickProduct(input);
  if (!product) {
    return null;
  }

  const paths: PathSegment[][] = [
    ["rating"],
    ["averageRating"],
    ["reviewSummary", "averageRating"],
    ["reviews", "combinedAverageRating"],
    ["reviews", "averageRating"],
  ];

  for (const path of paths) {
    const raw = readPath(product, path);
    const value = parseLooseNumber(raw);
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return { value, fieldPath: formatFieldPath(path) };
    }
  }

  return null;
};

export const extractViatorReviewCount = (
  input: unknown
): ExtractedValue<number> | null => {
  const product = pickProduct(input);
  if (!product) {
    return null;
  }

  const paths: PathSegment[][] = [
    ["reviewCount"],
    ["reviewSummary", "totalReviews"],
    ["reviews", "count"],
    ["reviews", "total"],
  ];

  for (const path of paths) {
    const raw = readPath(product, path);
    const value = parseLooseNumber(raw);
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      return { value, fieldPath: formatFieldPath(path) };
    }
  }

  return null;
};

export const extractViatorHeroImage = (
  input: unknown
): ViatorExtractedHeroImage | null => {
  const product = pickProduct(input);
  if (!product) {
    return null;
  }

  const imageGroups: Array<{ basePath: PathSegment[]; images: unknown[] }> = [];

  const mediaImages = readPath(product, ["media", "images"]);
  if (Array.isArray(mediaImages)) {
    imageGroups.push({ basePath: ["media", "images"], images: mediaImages });
  }

  const rootImages = readPath(product, ["images"]);
  if (Array.isArray(rootImages)) {
    imageGroups.push({ basePath: ["images"], images: rootImages });
  }

  const variantPriority = [
    "FULL",
    "HIGH_RESOLUTION",
    "LARGE",
    "MEDIUM",
    "SMALL",
  ];

  for (const group of imageGroups) {
    const images = group.images;
    const indexedRows = images
      .map((image, index) => {
        const row = asRecord(image);
        return row ? { row, index } : undefined;
      })
      .filter(isDefined);

    const coverRows = indexedRows.filter(item => item.row.isCover === true);
    const allRows = indexedRows;

    const candidateRows = coverRows.length > 0 ? coverRows : allRows;

    for (const candidate of candidateRows) {
      const row = candidate.row as RecordLike;
      const variants = asRecord(row.variants);

      if (variants) {
        for (const key of variantPriority) {
          const variant = asRecord(variants[key]);
          const url = asImageUrl(variant?.url);
          if (url) {
            return {
              url,
              fieldPath: formatFieldPath([
                ...group.basePath,
                candidate.index,
                "variants",
                key,
                "url",
              ]),
              width:
                typeof variant?.width === "number"
                  ? (variant.width as number)
                  : undefined,
              height:
                typeof variant?.height === "number"
                  ? (variant.height as number)
                  : undefined,
            };
          }
        }
      }

      const directUrl = asImageUrl(row.url);
      if (directUrl) {
        return {
          url: directUrl,
          fieldPath: formatFieldPath([
            ...group.basePath,
            candidate.index,
            "url",
          ]),
          width:
            typeof row.width === "number" ? (row.width as number) : undefined,
          height:
            typeof row.height === "number" ? (row.height as number) : undefined,
        };
      }
    }
  }

  return null;
};

export const extractViatorItinerary = (
  input: unknown
): ExtractedValue<ViatorItineraryItem[]> | null => {
  const product = pickProduct(input);
  if (!product) {
    return null;
  }

  const normalize = (value: unknown): ViatorItineraryItem[] => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item): ViatorItineraryItem | undefined => {
        const row = asRecord(item);
        if (!row) {
          return undefined;
        }

        const title =
          cleanText(row.title) ?? cleanText(row.name) ?? cleanText(row.label);
        if (!title) {
          return undefined;
        }

        return {
          title,
          description: cleanText(row.description) ?? cleanText(row.summary),
          duration: cleanText(row.duration) ?? cleanText(row.durationText),
        };
      })
      .filter(isDefined);
  };

  const paths: PathSegment[][] = [
    ["itineraryItems"],
    ["itinerary", "itineraryItems"],
    ["itinerary"],
    ["whatToExpect", "items"],
  ];

  for (const path of paths) {
    const normalized = normalize(readPath(product, path));
    if (normalized.length > 0) {
      return { value: normalized, fieldPath: formatFieldPath(path) };
    }
  }

  return { value: [], fieldPath: "product.itineraryItems" };
};
