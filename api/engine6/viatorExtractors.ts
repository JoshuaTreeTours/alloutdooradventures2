export type Engine6DiagnosticsPaths = {
  commercialPriceFieldPath: string | null;
  heroImageFieldPath: string | null;
  ratingFieldPath: string | null;
  reviewCountFieldPath: string | null;
  overviewFieldPath: string | null;
  highlightsFieldPath: string | null;
  itineraryFieldPath: string | null;
  meetingPointFieldPath: string | null;
  faqsFieldPath: string | null;
};

export type Engine6ExtractedFaq = {
  question: string;
  answer: string;
};

export type Engine6ExtractedItineraryItem = {
  title: string;
  description?: string;
  duration?: string;
};

export type Engine6Extracted = {
  title: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  city: string | null;
  state: string | null;
  heroImageUrl: string | null;
  cardImageUrl: string | null;
  priceAmount: number | null;
  priceFormatted: string | null;
  aggregateRating: number | null;
  reviewCount: number | null;
  meetingPointText: string | null;
  overviewText: string | null;
  highlights: string[];
  itinerary: Engine6ExtractedItineraryItem[];
  faqs: Engine6ExtractedFaq[];
};

type RecordLike = Record<string, unknown>;
type PathSegment = string | number;

const asRecord = (value: unknown): RecordLike | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordLike)
    : null;

const readPath = (root: unknown, path: PathSegment[]): unknown => {
  let cursor = root;

  for (const segment of path) {
    if (typeof segment === "number") {
      if (!Array.isArray(cursor)) return undefined;
      cursor = cursor[segment];
      continue;
    }

    if (typeof cursor !== "object" || cursor === null) return undefined;
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
  if (typeof value !== "string") return null;
  const normalized = stripHtml(value);
  return normalized.length > 0 ? normalized : null;
};

const asPositiveNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0)
    return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
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

const resolveHeroImage = (product: RecordLike) => {
  const media = asRecord(product.media);
  const images = Array.isArray(media?.images) ? media.images : [];

  for (let i = 0; i < images.length; i += 1) {
    const image = asRecord(images[i]);
    if (!image) continue;
    const variants = asRecord(image.variants);

    const candidates = [
      {
        value: asRecord(variants?.["XXLARGE"])?.url,
        path: `product.media.images[${i}].variants.XXLARGE.url`,
      },
      {
        value: asRecord(variants?.["XLARGE"])?.url,
        path: `product.media.images[${i}].variants.XLARGE.url`,
      },
      {
        value: asRecord(variants?.["LARGE"])?.url,
        path: `product.media.images[${i}].variants.LARGE.url`,
      },
      {
        value: asRecord(variants?.["FULL"])?.url,
        path: `product.media.images[${i}].variants.FULL.url`,
      },
      { value: image.src, path: `product.media.images[${i}].src` },
    ];

    for (const candidate of candidates) {
      const hit = asNonEmptyString(candidate.value);
      if (hit) return { value: hit, path: candidate.path };
    }
  }

  const fallbacks = [
    { value: product.imageUrl, path: "product.imageUrl" },
    { value: product.thumbnailHiResURL, path: "product.thumbnailHiResURL" },
    { value: product.thumbnailURL, path: "product.thumbnailURL" },
  ];

  for (const fallback of fallbacks) {
    const hit = asNonEmptyString(fallback.value);
    if (hit) return { value: hit, path: fallback.path };
  }

  return null;
};

const resolvePrice = (product: RecordLike) => {
  const direct = [
    {
      value: asRecord(asRecord(product.pricing)?.summary)?.fromPrice,
      path: "product.pricing.summary.fromPrice",
    },
    {
      value: asRecord(product.pricing)?.fromPrice,
      path: "product.pricing.fromPrice",
    },
    {
      value: asRecord(product.pricingSummary)?.fromPrice,
      path: "product.pricingSummary.fromPrice",
    },
  ];

  for (const candidate of direct) {
    const amount = asPositiveNumber(candidate.value);
    if (amount) return { amount, path: candidate.path };
  }

  const arrays = [
    { value: product.bookingOptions, path: "product.bookingOptions" },
    { value: product.bookableItems, path: "product.bookableItems" },
  ];

  for (const arrayCandidate of arrays) {
    if (!Array.isArray(arrayCandidate.value)) continue;

    for (let i = 0; i < arrayCandidate.value.length; i += 1) {
      const item = asRecord(arrayCandidate.value[i]);
      if (!item) continue;

      const summaryAmount = asPositiveNumber(
        asRecord(asRecord(item.pricing)?.summary)?.fromPrice
      );
      if (summaryAmount) {
        return {
          amount: summaryAmount,
          path: `${arrayCandidate.path}[${i}].pricing.summary.fromPrice`,
        };
      }

      const plainAmount = asPositiveNumber(asRecord(item.pricing)?.fromPrice);
      if (plainAmount) {
        return {
          amount: plainAmount,
          path: `${arrayCandidate.path}[${i}].pricing.fromPrice`,
        };
      }
    }
  }

  return { amount: null, path: null as string | null };
};

const extractOverview = (product: RecordLike) => {
  const paths: PathSegment[][] = [
    ["description", "text"],
    ["description"],
    ["descriptionLong"],
    ["overview"],
    ["summary"],
    ["shortDescription"],
  ];

  for (const path of paths) {
    const value = asNonEmptyString(readPath(product, path));
    if (value) {
      return { value, path: formatFieldPath(path) };
    }
  }

  return { value: null, path: null as string | null };
};

const extractHighlights = (product: RecordLike) => {
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

  const paths: PathSegment[][] = [
    ["highlights"],
    ["bulletPoints"],
    ["additionalInfo"],
    ["features"],
  ];

  for (const path of paths) {
    const value = normalizeStringArray(readPath(product, path));
    if (value.length > 0) {
      return { value, path: formatFieldPath(path) };
    }
  }

  return { value: [], path: null as string | null };
};

const extractItinerary = (product: RecordLike) => {
  const normalizeItinerary = (
    value: unknown
  ): Engine6ExtractedItineraryItem[] => {
    const rows = Array.isArray(value)
      ? value
      : Array.isArray(asRecord(value)?.itineraryItems)
        ? (asRecord(value)?.itineraryItems as unknown[])
        : [];

    if (!Array.isArray(rows)) return [];

    return rows
      .map(item => {
        const row = asRecord(item);
        if (!row) return null;

        const title =
          asNonEmptyString(row.title) ??
          asNonEmptyString(row.name) ??
          asNonEmptyString(row.label) ??
          asNonEmptyString(asRecord(row.pointOfInterest)?.title) ??
          asNonEmptyString(asRecord(row.pointOfInterest)?.name);

        if (!title) return null;

        return {
          title,
          description:
            asNonEmptyString(row.description) ??
            asNonEmptyString(row.summary) ??
            asNonEmptyString(asRecord(row.pointOfInterest)?.description) ??
            undefined,
          duration:
            asNonEmptyString(row.duration) ??
            asNonEmptyString(row.durationText) ??
            asNonEmptyString(asRecord(row.durationInfo)?.durationText) ??
            undefined,
        } satisfies Engine6ExtractedItineraryItem;
      })
      .filter((item): item is Engine6ExtractedItineraryItem => Boolean(item));
  };

  const paths: PathSegment[][] = [
    ["itineraryItems"],
    ["itinerary", "items"],
    ["itinerary", "itineraryItems"],
    ["itinerary"],
    ["whatToExpect", "items"],
  ];

  for (const path of paths) {
    const value = normalizeItinerary(readPath(product, path));
    if (value.length > 0) {
      return { value, path: formatFieldPath(path) };
    }
  }

  return { value: [], path: null as string | null };
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

  const paths: PathSegment[][] = [
    ["faqs"],
    ["faq"],
    ["questionsAndAnswers"],
    ["qAndA", "items"],
  ];

  for (const path of paths) {
    const value = normalizeFaqs(readPath(product, path));
    if (value.length > 0) {
      return { value, path: formatFieldPath(path) };
    }
  }

  return { value: [], path: null as string | null };
};

export const extractEngine6Product = (rawPayload: unknown) => {
  const payload = asRecord(rawPayload);
  const product = asRecord(payload?.product) ?? payload;

  const diagnostics: Engine6DiagnosticsPaths = {
    commercialPriceFieldPath: null,
    heroImageFieldPath: null,
    ratingFieldPath: null,
    reviewCountFieldPath: null,
    overviewFieldPath: null,
    highlightsFieldPath: null,
    itineraryFieldPath: null,
    meetingPointFieldPath: null,
    faqsFieldPath: null,
  };

  if (!product) {
    return { extracted: emptyExtracted(), diagnostics, product: null };
  }

  const title = asNonEmptyString(product.title);
  const city =
    asNonEmptyString(asRecord(product.location)?.city) ??
    asNonEmptyString(asRecord(asRecord(product.location)?.address)?.city);
  const state =
    asNonEmptyString(asRecord(product.location)?.state) ??
    asNonEmptyString(asRecord(asRecord(product.location)?.address)?.state);

  const heroImage = resolveHeroImage(product);
  diagnostics.heroImageFieldPath = heroImage?.path ?? null;

  const price = resolvePrice(product);
  diagnostics.commercialPriceFieldPath = price.path;

  const ratingCandidates = [
    { value: product.rating, path: "product.rating" },
    {
      value: asRecord(product.reviews)?.combinedAverageRating,
      path: "product.reviews.combinedAverageRating",
    },
    {
      value: asRecord(product.reviews)?.averageRating,
      path: "product.reviews.averageRating",
    },
  ];
  let aggregateRating: number | null = null;
  for (const c of ratingCandidates) {
    const n = asPositiveNumber(c.value);
    if (n) {
      aggregateRating = n;
      diagnostics.ratingFieldPath = c.path;
      break;
    }
  }

  const reviewCandidates = [
    { value: product.reviewCount, path: "product.reviewCount" },
    {
      value: asRecord(product.reviews)?.totalReviews,
      path: "product.reviews.totalReviews",
    },
    {
      value: asRecord(product.reviews)?.reviewCount,
      path: "product.reviews.reviewCount",
    },
  ];
  let reviewCount: number | null = null;
  for (const c of reviewCandidates) {
    const n = asPositiveNumber(c.value);
    if (n) {
      reviewCount = n;
      diagnostics.reviewCountFieldPath = c.path;
      break;
    }
  }

  const meetingCandidates = [
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
  ];
  let meetingPointText: string | null = null;
  for (const c of meetingCandidates) {
    const s = asNonEmptyString(c.value);
    if (s) {
      meetingPointText = s;
      diagnostics.meetingPointFieldPath = c.path;
      break;
    }
  }

  const overview = extractOverview(product);
  diagnostics.overviewFieldPath = overview.path;

  const highlights = extractHighlights(product);
  diagnostics.highlightsFieldPath = highlights.path;

  const itinerary = extractItinerary(product);
  diagnostics.itineraryFieldPath = itinerary.path;

  const faqs = extractFaqs(product);
  diagnostics.faqsFieldPath = faqs.path;

  const seoTitle = title && city ? `${title} in ${city}` : title;
  const seoDescription =
    title && city
      ? dedupeStrings([
          firstParagraph(overview.value),
          `Best tour in ${city}`,
          aggregateRating ? `Rated ${aggregateRating}/5` : null,
          reviewCount ? `${reviewCount} reviews` : null,
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
      heroImageUrl: heroImage?.value ?? null,
      cardImageUrl: heroImage?.value ?? null,
      priceAmount: price.amount,
      priceFormatted: price.amount ? `From $${price.amount.toFixed(0)}` : null,
      aggregateRating,
      reviewCount,
      meetingPointText,
      overviewText: overview.value,
      highlights: highlights.value,
      itinerary: itinerary.value,
      faqs: faqs.value,
    } satisfies Engine6Extracted,
    diagnostics,
    product,
  };
};

const emptyExtracted = (): Engine6Extracted => ({
  title: null,
  seoTitle: null,
  seoDescription: null,
  city: null,
  state: null,
  heroImageUrl: null,
  cardImageUrl: null,
  priceAmount: null,
  priceFormatted: null,
  aggregateRating: null,
  reviewCount: null,
  meetingPointText: null,
  overviewText: null,
  highlights: [],
  itinerary: [],
  faqs: [],
});
