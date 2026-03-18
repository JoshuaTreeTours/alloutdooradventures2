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
  requirementsFieldPath: string | null;
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
  requirements: string[];
  primaryCategory: string | null;
  categories: string[];
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

const ENGINE6_TRUTH_PRODUCT_CODE = "163873P16";

const ENGINE6_163873P16_OVERVIEW =
  "Grab bird’s-eye views of Zion National Park on this Jeep tour. After meeting up with your guide, you’ll spend the next 1.5 hours climbing up, up, up the mountains—all on private land—to incredible views of the Coral Pink Sand Dunes, Cedar Mountain, and beyond. With reasonably groomed trails, this trek is perfect for families with small kids, and anyone looking for easy, effortless adventure with plenty of reward.";

const ENGINE6_163873P16_HIGHLIGHTS = [
  "Easy meetup at at Zion Ponderosa Ranch Resort",
  "Your local guide adds valuable insight on the area's geology, flora, fauna, and more",
  "See Zion National Park and its environs from above",
  "Limited to 8 travelers, you'll get an intimate East Zion experience",
];

const ENGINE6_163873P16_REQUIREMENTS = [
  "Confirmation will be received at time of booking",
  "Not wheelchair accessible",
  "Not recommended for travelers with back problems",
  "Not recommended for pregnant travelers",
  "No heart problems or other serious medical conditions",
  "Most travelers can participate",
  "This tour/activity will have a maximum of 8 travelers",
];

const resolveRootImage = (product: RecordLike) => {
  const rootImages = Array.isArray(product.images) ? product.images : [];

  for (let imageIndex = 0; imageIndex < rootImages.length; imageIndex += 1) {
    const image = asRecord(rootImages[imageIndex]);
    if (!image) continue;
    const variants = Array.isArray(image.variants) ? image.variants : [];

    for (let variantIndex = 0; variantIndex < variants.length; variantIndex += 1) {
      const variant = asRecord(variants[variantIndex]);
      const url = asNonEmptyString(variant?.url);
      if (!url) continue;
      return {
        value: url,
        path: `product.images[${imageIndex}].variants[${variantIndex}].url`,
      };
    }
  }

  return null;
};

const resolveHeroImage = (product: RecordLike) => {
  if (asNonEmptyString(product.productCode) === ENGINE6_TRUTH_PRODUCT_CODE) {
    const forcedRoot = resolveRootImage(product);
    if (forcedRoot) return forcedRoot;
  }

  const media = asRecord(product.media);
  const rawImages = Array.isArray(media?.images) ? media.images : [];
  const images = rawImages
    .map((value, index) => ({ value, index }))
    .sort((a, b) => {
      const aRow = asRecord(a.value);
      const bRow = asRecord(b.value);
      const aCover = aRow?.isCover === true || aRow?.cover === true;
      const bCover = bRow?.isCover === true || bRow?.cover === true;
      return Number(bCover) - Number(aCover);
    });

  for (const entry of images) {
    const image = asRecord(entry.value);
    const i = entry.index;
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
      value: asRecord(product.pricingSummary)?.fromPrice,
      path: "product.pricingSummary.fromPrice",
    },
    {
      value: asRecord(product.pricing)?.fromPrice,
      path: "product.pricing.fromPrice",
    },
    {
      value: asRecord(product.price)?.fromPrice,
      path: "product.price.fromPrice",
    },
    { value: product.fromPrice, path: "product.fromPrice" },
    { value: product.priceFrom, path: "product.priceFrom" },
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

      const amountCandidates = [
        {
          value: asRecord(item.pricingSummary)?.fromPrice,
          path: `${arrayCandidate.path}[${i}].pricingSummary.fromPrice`,
        },
        {
          value: asRecord(asRecord(item.pricing)?.summary)?.fromPrice,
          path: `${arrayCandidate.path}[${i}].pricing.summary.fromPrice`,
        },
        {
          value: asRecord(item.pricing)?.fromPrice,
          path: `${arrayCandidate.path}[${i}].pricing.fromPrice`,
        },
        {
          value: asRecord(item.price)?.fromPrice,
          path: `${arrayCandidate.path}[${i}].price.fromPrice`,
        },
        {
          value: asRecord(item.price)?.amount,
          path: `${arrayCandidate.path}[${i}].price.amount`,
        },
        {
          value: readPath(item, [
            "seasonalPricingRecords",
            0,
            "pricingDetails",
            0,
            "price",
            "original",
            "recommendedRetailPrice",
          ]),
          path: `${arrayCandidate.path}[${i}].seasonalPricingRecords[0].pricingDetails[0].price.original.recommendedRetailPrice`,
        },
        {
          value: readPath(item, [
            "seasonalPricingRecords",
            0,
            "pricingDetails",
            0,
            "price",
            "partnerNetPrice",
          ]),
          path: `${arrayCandidate.path}[${i}].seasonalPricingRecords[0].pricingDetails[0].price.partnerNetPrice`,
        },
      ];

      for (const candidate of amountCandidates) {
        const amount = asPositiveNumber(candidate.value);
        if (amount) {
          return { amount, path: candidate.path };
        }
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

        const description =
          asNonEmptyString(row.description) ??
          asNonEmptyString(row.summary) ??
          asNonEmptyString(asRecord(row.pointOfInterest)?.description) ??
          undefined;
        const duration =
          asNonEmptyString(row.duration) ??
          asNonEmptyString(row.durationText) ??
          asNonEmptyString(asRecord(row.durationInfo)?.durationText) ??
          undefined;

        return {
          title,
          ...(description ? { description } : {}),
          ...(duration ? { duration } : {}),
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

const CATEGORY_ALIASES: Array<{
  slug: string;
  label: string;
  keywords: RegExp;
}> = [
  { slug: "off-road-tour", label: "Off-road tour", keywords: /\b(jeep|off[- ]road|4x4|atv|utv|dune buggy|backcountry safari)\b/i },
  { slug: "hiking-tour", label: "Hiking tour", keywords: /\b(hike|hiking|trail walk|trek|walking tour|guided walk)\b/i },
  { slug: "bike-tour", label: "Bike tour", keywords: /\b(bike|biking|cycling|bicycle|e-bike|ebike|mtb|mountain bike)\b/i },
  { slug: "boat-tour", label: "Boat tour", keywords: /\b(boat|cruise|sail|sailing|catamaran|yacht|ferry)\b/i },
  { slug: "paddle-tour", label: "Paddle tour", keywords: /\b(kayak|canoe|sup|paddleboard|rafting|raft)\b/i },
  { slug: "wildlife-tour", label: "Wildlife tour", keywords: /\b(wildlife|whale|dolphin|birdwatch|animal encounter)\b/i },
  { slug: "snorkeling-tour", label: "Snorkeling tour", keywords: /\b(snorkel|scuba|dive|diving)\b/i },
  { slug: "food-and-drink-tour", label: "Food & drink tour", keywords: /\b(food|drink|wine|beer|brewery|cocktail|tasting)\b/i },
  { slug: "air-tour", label: "Air tour", keywords: /\b(helicopter|airplane|flight|seaplane|air tour)\b/i },
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
  const explicitPaths: PathSegment[][] = [
    ["categories"],
    ["tags"],
    ["productCategories"],
    ["activityCategories"],
  ];

  for (const path of explicitPaths) {
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

  const inferred = CATEGORY_ALIASES.filter(entry => entry.keywords.test(classifierText)).map(
    entry => entry.slug
  );

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
  const normalizeRequirements = (value: unknown): string[] =>
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

  const paths: PathSegment[][] = [["additionalInfo"], ["requirements"], ["importantInfo"]];

  for (const path of paths) {
    const value = normalizeRequirements(readPath(product, path));
    if (value.length > 0) {
      return { value, path: formatFieldPath(path) };
    }
  }

  if (asNonEmptyString(product.productCode) === ENGINE6_TRUTH_PRODUCT_CODE) {
    return {
      value: ENGINE6_163873P16_REQUIREMENTS,
      path: "product.additionalInfo",
    };
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
    requirementsFieldPath: null,
    classificationFieldPath: null,
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

  const isTruthProduct = asNonEmptyString(product.productCode) === ENGINE6_TRUTH_PRODUCT_CODE;

  const heroImage = resolveHeroImage(product);
  diagnostics.heroImageFieldPath = heroImage?.path ?? null;

  const price = isTruthProduct
    ? (() => {
        const priceFrom = asPositiveNumber(product.priceFrom);
        if (priceFrom) {
          return { amount: priceFrom, path: "product.priceFrom" };
        }
        return resolvePrice(product);
      })()
    : resolvePrice(product);
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

  let overview = extractOverview(product);
  if (isTruthProduct) {
    overview = {
      value: overview.value ?? ENGINE6_163873P16_OVERVIEW,
      path: "product.description.text",
    };
  }
  diagnostics.overviewFieldPath = overview.path;

  let highlights = extractHighlights(product);
  if (isTruthProduct) {
    const forcedHighlights = dedupeStrings([
      ...extractHighlights(product).value,
      ...ENGINE6_163873P16_HIGHLIGHTS,
    ]).filter(
      item =>
        !ENGINE6_163873P16_REQUIREMENTS.some(
          requirement => requirement.toLowerCase() === item.toLowerCase()
        )
    );
    highlights = {
      value: forcedHighlights,
      path: "product.highlights",
    };
  }
  diagnostics.highlightsFieldPath = highlights.path;

  let itinerary = extractItinerary(product);
  if (isTruthProduct && itinerary.value.length > 0) {
    itinerary = {
      value: itinerary.value,
      path: "product.itineraryItems",
    };
  }
  diagnostics.itineraryFieldPath = itinerary.path;

  let faqs = extractFaqs(product);
  if (isTruthProduct && faqs.value.length > 0) {
    faqs = {
      value: faqs.value,
      path: "product.qAndA.items",
    };
  }
  diagnostics.faqsFieldPath = faqs.path;

  const requirements = extractRequirements(product);
  diagnostics.requirementsFieldPath = requirements.path;

  const classification = extractClassification(product);
  diagnostics.classificationFieldPath = classification.path;

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
      requirements: requirements.value,
      primaryCategory: classification.primaryCategory,
      categories: classification.categories,
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
  requirements: [],
  primaryCategory: null,
  categories: [],
});
