import type { Engine5ExactProductImage, Engine5ImageVariant } from "../types";

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
  typeof value === "object" && value !== null ? (value as RecordLike) : undefined;

const cleanText = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const asNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

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

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .map(item => cleanText(item))
        .filter((item): item is string => Boolean(item))
    : [];

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
    .map(segment => (typeof segment === "number" ? `[${segment}]` : `.${segment}`))
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

export const extractViatorPrice = (input: unknown): ViatorExtractedPrice | null => {
  const product = pickProduct(input);
  if (!product) {
    return null;
  }

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

export const extractViatorRating = (input: unknown): ExtractedValue<number> | null => {
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
    ["reviews", "totalReviews"],
    ["reviews", "count"],
  ];

  for (const path of paths) {
    const raw = readPath(product, path);
    const value = parseLooseNumber(raw);
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      return { value: Math.trunc(value), fieldPath: formatFieldPath(path) };
    }
  }

  return null;
};

export const extractViatorDuration = (input: unknown): ExtractedValue<string> | null => {
  const product = pickProduct(input);
  if (!product) {
    return null;
  }

  const paths: PathSegment[][] = [
    ["duration"],
    ["durationText"],
    ["itinerary", "duration"],
    ["summary", "duration"],
  ];

  for (const path of paths) {
    const value = cleanText(readPath(product, path));
    if (value) {
      return { value, fieldPath: formatFieldPath(path) };
    }
  }

  return null;
};

export const extractViatorMeetingPoint = (
  input: unknown
): ExtractedValue<string> | null => {
  const product = pickProduct(input);
  if (!product) {
    return null;
  }

  const fromLocationObject = (value: unknown): string | undefined => {
    const row = asRecord(value);
    if (!row) {
      return undefined;
    }

    const parts = [
      cleanText(row.name),
      cleanText(row.address),
      cleanText(row.city),
      cleanText(row.state),
      cleanText(row.country),
    ].filter((part): part is string => Boolean(part));

    return parts.length > 0 ? parts.join(", ") : undefined;
  };

  const paths: Array<{ path: PathSegment[]; transform?: (value: unknown) => string | undefined }> = [
    { path: ["meetingPoint"], transform: value => cleanText(value) ?? fromLocationObject(value) },
    {
      path: ["meetingAndPickup", "meetingPoint"],
      transform: value => cleanText(value) ?? fromLocationObject(value),
    },
    { path: ["startLocation"], transform: value => cleanText(value) ?? fromLocationObject(value) },
    { path: ["locations", 0], transform: value => cleanText(value) ?? fromLocationObject(value) },
  ];

  for (const candidate of paths) {
    const raw = readPath(product, candidate.path);
    const value = candidate.transform ? candidate.transform(raw) : cleanText(raw);
    if (value) {
      return { value, fieldPath: formatFieldPath(candidate.path) };
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

  const normalizeItinerary = (value: unknown): ViatorItineraryItem[] => {
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
    const normalized = normalizeItinerary(readPath(product, path));
    if (normalized.length > 0) {
      return { value: normalized, fieldPath: formatFieldPath(path) };
    }
  }

  return { value: [], fieldPath: "product.itineraryItems" };
};

export const extractViatorFaqs = (
  input: unknown
): ExtractedValue<Array<{ question: string; answer: string }>> | null => {
  const product = pickProduct(input);
  if (!product) {
    return null;
  }

  const normalizeFaqs = (
    value: unknown
  ): Array<{ question: string; answer: string }> => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map(item => {
        const row = asRecord(item);
        if (!row) {
          return undefined;
        }

        const question =
          cleanText(row.question) ?? cleanText(row.title) ?? cleanText(row.q);
        const answer =
          cleanText(row.answer) ??
          cleanText(row.description) ??
          cleanText(row.a);

        if (!question || !answer) {
          return undefined;
        }

        return { question, answer };
      })
      .filter((item): item is { question: string; answer: string } => Boolean(item));
  };

  const paths: PathSegment[][] = [
    ["faqs"],
    ["faq"],
    ["questionsAndAnswers"],
    ["qAndA", "items"],
  ];

  for (const path of paths) {
    const normalized = normalizeFaqs(readPath(product, path));
    if (normalized.length > 0) {
      return { value: normalized, fieldPath: formatFieldPath(path) };
    }
  }

  return { value: [], fieldPath: "product.faqs" };
};

export const extractViatorImages = (
  input: unknown
): ExtractedValue<Engine5ExactProductImage[]> | null => {
  const product = pickProduct(input);
  if (!product) {
    return null;
  }

  const imageCollections = [
    readPath(product, ["images"]),
    readPath(product, ["media", "images"]),
    readPath(product, ["productImages"]),
  ].filter(value => Array.isArray(value));

  const rawImages =
    (imageCollections.find(collection => Array.isArray(collection)) as unknown[]) ?? [];

  const normalized = rawImages
    .map(item => {
      const row = asRecord(item);
      if (!row) {
        return undefined;
      }

      const variantsRaw = [
        ...(Array.isArray(row.variants) ? row.variants : []),
        ...(Array.isArray(row.sizes) ? row.sizes : []),
      ];

      const variants: Engine5ImageVariant[] = variantsRaw
        .map(variant => {
          const variantRow = asRecord(variant);
          if (!variantRow) {
            return undefined;
          }

          const url =
            asImageUrl(variantRow.url) ?? asImageUrl(variantRow.src) ?? asImageUrl(variantRow.imageUrl);
          if (!url) {
            return undefined;
          }

          return {
            url,
            width: asNumber(variantRow.width),
            height: asNumber(variantRow.height),
          };
        })
        .filter(isDefined);

      const directUrl =
        asImageUrl(row.url) ?? asImageUrl(row.src) ?? asImageUrl(row.imageUrl);

      if (directUrl && !variants.some(variant => variant.url === directUrl)) {
        variants.push({
          url: directUrl,
          width: asNumber(row.width),
          height: asNumber(row.height),
        });
      }

      if (!directUrl && variants.length === 0) {
        return undefined;
      }

      return {
        url: directUrl,
        isCover: row.isCover === true || row.cover === true,
        variants,
      };
    })
    .filter(isDefined)
    .sort((a, b) => Number(b.isCover) - Number(a.isCover));

  return {
    value: normalized,
    fieldPath: imageCollections.length > 0 ? "product.images" : "product.images",
  };
};

export const extractViatorHeroImage = (
  input: unknown
): ViatorExtractedHeroImage | null => {
  const product = pickProduct(input);
  if (!product) {
    return null;
  }

  const mediaImages = readPath(product, ["media", "images"]);
  const rootImages = readPath(product, ["images"]);

  const prioritizedMediaImages = Array.isArray(mediaImages)
    ? [...mediaImages].sort((a, b) => {
        const aCover = asRecord(a)?.isCover === true || asRecord(a)?.cover === true;
        const bCover = asRecord(b)?.isCover === true || asRecord(b)?.cover === true;
        return Number(bCover) - Number(aCover);
      })
    : [];

  const imageEntries: Array<{ image: unknown; basePath: PathSegment[] }> = [];

  if (Array.isArray(prioritizedMediaImages)) {
    prioritizedMediaImages.forEach(image => {
      const originalIndex = (mediaImages as unknown[]).indexOf(image);
      imageEntries.push({ image, basePath: ["media", "images", originalIndex] });
    });
  }

  if (Array.isArray(rootImages) && rootImages.length > 0) {
    imageEntries.push({ image: rootImages[0], basePath: ["images", 0] });
  }

  const resolveVariantUrl = (
    image: RecordLike,
    variantName: string,
    variantPath: PathSegment[]
  ): ViatorExtractedHeroImage | null => {
    const variants = asRecord(image.variants);
    const variant = asRecord(variants?.[variantName]);
    const url = asImageUrl(variant?.url);
    if (!url) {
      return null;
    }

    return {
      url,
      fieldPath: formatFieldPath(variantPath),
      width: asNumber(variant?.width),
      height: asNumber(variant?.height),
    };
  };

  for (const entry of imageEntries) {
    const image = asRecord(entry.image);
    if (!image) {
      continue;
    }

    const variantsByPriority = ["FULL", "HIGH_RESOLUTION", "LARGE"];
    for (const variantKey of variantsByPriority) {
      const resolved = resolveVariantUrl(image, variantKey, [
        ...entry.basePath,
        "variants",
        variantKey,
        "url",
      ]);
      if (resolved) {
        return resolved;
      }
    }

    const directUrl = asImageUrl(image.url);
    if (directUrl) {
      return {
        url: directUrl,
        fieldPath: formatFieldPath([...entry.basePath, "url"]),
        width: asNumber(image.width),
        height: asNumber(image.height),
      };
    }
  }

  return null;
};

export const extractViatorHighlights = (input: unknown): string[] => {
  const product = pickProduct(input);
  if (!product) {
    return [];
  }

  const fromHighlights = toStringArray(product.highlights);
  if (fromHighlights.length > 0) {
    return fromHighlights;
  }

  return toStringArray(product.bulletPoints);
};
