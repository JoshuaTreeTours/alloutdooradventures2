import type { Engine5ExactProductImage, Engine5ImageVariant } from "../types";

type RecordLike = Record<string, unknown>;

type PathSegment = string | number;

type ExtractedValue<T> = {
  value: T;
  fieldPath: string;
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

  if (/^\$?0(?:\.0+)?$/u.test(raw.replace(/,/g, ""))) {
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

const parsePositiveNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().replace(/,/g, "");
  if (!normalized) {
    return undefined;
  }

  const direct = Number(normalized);
  if (Number.isFinite(direct) && direct > 0) {
    return direct;
  }

  const fallbackMatch = normalized.match(/\d+(?:\.\d+)?/);
  if (!fallbackMatch) {
    return undefined;
  }

  const fallback = Number(fallbackMatch[0]);
  return Number.isFinite(fallback) && fallback > 0 ? fallback : undefined;
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
    const value = parsePositiveNumber(readPath(product, path));
    if (typeof value === "number") {
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
    const value = parsePositiveNumber(readPath(product, path));
    if (typeof value === "number") {
      return { value, fieldPath: formatFieldPath(path) };
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
      .filter((item): item is ViatorItineraryItem => Boolean(item));
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

  const toVariantObject = (value: unknown): Record<string, unknown> | undefined =>
    asRecord(value);

  const variantCandidatesInOrder = (
    image: RecordLike,
    basePath: PathSegment[]
  ): Array<{ url: string; fieldPath: string }> => {
    const variants = toVariantObject(image.variants);
    const orderedVariantKeys = ["FULL", "HIGH_RESOLUTION", "LARGE"] as const;

    const ordered = orderedVariantKeys
      .map(key => {
        const candidate = asRecord(variants?.[key]);
        const url = asImageUrl(candidate?.url ?? variants?.[key]);
        if (!url) {
          return undefined;
        }

        return {
          url,
          fieldPath: formatFieldPath([...basePath, "variants", key, "url"]),
        };
      })
      .filter((item): item is { url: string; fieldPath: string } => Boolean(item));

    const directUrl = asImageUrl(image.url);
    if (directUrl) {
      ordered.push({
        url: directUrl,
        fieldPath: formatFieldPath([...basePath, "url"]),
      });
    }

    return ordered;
  };

  const livePathCandidates: Array<{ path: PathSegment[]; fallbackFieldPath: string }> = [
    { path: ["media", "images"], fallbackFieldPath: "product.media.images[0].url" },
    { path: ["images"], fallbackFieldPath: "product.images[0].url" },
  ];

  for (const candidate of livePathCandidates) {
    const collection = readPath(product, candidate.path);
    if (!Array.isArray(collection) || collection.length === 0) {
      continue;
    }

    const imageRecord = asRecord(collection[0]);
    if (!imageRecord) {
      continue;
    }

    const basePath = [...candidate.path, 0];
    const prioritizedUrls = variantCandidatesInOrder(imageRecord, basePath);
    if (prioritizedUrls.length === 0) {
      continue;
    }

    const variants: Engine5ImageVariant[] = prioritizedUrls.map(item => ({
      url: item.url,
    }));

    return {
      value: [
        {
          isCover: true,
          url: prioritizedUrls[0]?.url,
          variants,
        },
      ],
      fieldPath: prioritizedUrls[0]?.fieldPath ?? candidate.fallbackFieldPath,
    };
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
        .filter((variant): variant is Engine5ImageVariant => Boolean(variant));

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
    .filter((image): image is Engine5ExactProductImage => Boolean(image))
    .sort((a, b) => Number(b.isCover) - Number(a.isCover));

  return {
    value: normalized,
    fieldPath: imageCollections.length > 0 ? "product.images" : "product.images",
  };
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
