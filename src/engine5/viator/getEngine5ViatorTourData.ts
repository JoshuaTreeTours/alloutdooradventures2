import type {
  Engine5ExactProductImage,
  Engine5ImageVariant,
  Engine5ViatorApiTour,
} from "../types";
import { getEngine5ExactProductHeroOverride } from "./imageOverrides";

const cleanText = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;

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

const asNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const asNumberLike = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;

  const normalized = value.replace(/,/g, "").replace(/\/5$/, "").trim();
  if (!normalized) return undefined;

  const matched = normalized.match(/\d+(?:\.\d+)?/);
  const parsed = Number(matched?.[0] ?? normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const getTextFromMixedValue = (value: unknown): string | undefined => {
  const asString = cleanText(value);
  if (asString) return asString;

  const row = asRecord(value);
  if (!row) return undefined;

  return (
    cleanText(row.text) ??
    cleanText(row.value) ??
    cleanText(row.title) ??
    cleanText(row.label) ??
    cleanText(row.description) ??
    cleanText(row.summary) ??
    cleanText(row.name)
  );
};

const getTextArrayFromMixedValues = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .map(item => getTextFromMixedValue(item))
        .filter((item): item is string => Boolean(item))
    : [];

const toStringArray = getTextArrayFromMixedValues;

const extractHighlights = (product: Record<string, unknown>): string[] => {
  const highlightsFromArray = toStringArray(product.highlights);

  const highlightsFromObjects = Array.isArray(product.highlights)
    ? product.highlights
        .map(item => {
          const row = asRecord(item);
          if (!row) return undefined;
          return (
            cleanText(row.text) ??
            cleanText(row.title) ??
            cleanText(row.description)
          );
        })
        .filter((item): item is string => Boolean(item))
    : [];

  const highlights = [
    ...highlightsFromArray,
    ...highlightsFromObjects,
    ...toStringArray(asRecord(product.additionalInfo)?.highlights),
  ];

  if (highlights.length > 0) return highlights;

  const raw = Array.isArray(product.bulletPoints)
    ? product.bulletPoints
    : Array.isArray(product.whyYouAreSeeingThis)
      ? product.whyYouAreSeeingThis
      : [];

  return raw
    .map(item => cleanText(item))
    .filter((item): item is string => Boolean(item));
};

const extractFaqs = (
  product: Record<string, unknown>
): Array<{ question: string; answer: string }> => {
  const raw =
    (product.faqs as unknown[]) ??
    (product.faq as unknown[]) ??
    (product.questionsAndAnswers as unknown[]) ??
    (asRecord(product.additionalInfo)?.faqs as unknown[]) ??
    [];

  if (!Array.isArray(raw)) return [];

  return raw
    .map(item => {
      const row = asRecord(item);
      if (!row) return undefined;
      const question =
        cleanText(row.question) ?? cleanText(row.title) ?? cleanText(row.q);
      const answer =
        cleanText(row.answer) ?? cleanText(row.description) ?? cleanText(row.a);
      if (!question || !answer) return undefined;
      return { question, answer };
    })
    .filter((item): item is { question: string; answer: string } =>
      Boolean(item)
    );
};

const extractItinerary = (product: Record<string, unknown>) => {
  const raw =
    (product.itineraryItems as unknown[]) ??
    (product.itinerary as unknown[]) ??
    (asRecord(product.description)?.sections as unknown[]) ??
    [];

  if (!Array.isArray(raw)) return [];

  return raw
    .map(item => {
      const row = asRecord(item);
      if (!row) return undefined;
      const title =
        cleanText(row.title) ?? cleanText(row.name) ?? cleanText(row.label);
      const description = cleanText(row.description) ?? cleanText(row.summary);
      const duration = cleanText(row.duration) ?? cleanText(row.durationText);
      if (!title) return undefined;
      return { title, description, duration };
    })
    .filter(
      (
        item
      ): item is { title: string; description?: string; duration?: string } =>
        Boolean(item)
    );
};

const getFromNested = (
  product: Record<string, unknown>,
  path: string[]
): unknown => {
  let current: unknown = product;
  for (const segment of path) {
    const row = asRecord(current);
    if (!row) return undefined;
    current = row[segment];
  }
  return current;
};

const getMeetingPointText = (
  product: Record<string, unknown>
): string | undefined => {
  const direct = cleanText(product.meetingPoint);
  if (direct) return direct;

  const meetingPoint = asRecord(product.meetingPoint);
  if (meetingPoint) {
    const addressText = [
      cleanText(meetingPoint.address),
      cleanText(meetingPoint.description),
      cleanText(asRecord(meetingPoint.location)?.name),
      cleanText(asRecord(meetingPoint.location)?.address),
    ]
      .filter((item): item is string => Boolean(item))
      .join(", ");

    if (addressText) return addressText;
  }

  return cleanText(getFromNested(product, ["logistics", "meetingPoint"]));
};

const getCancellationText = (
  product: Record<string, unknown>
): string | undefined => {
  return (
    cleanText(product.cancellationPolicy) ??
    cleanText(getFromNested(product, ["cancellation", "summary"])) ??
    cleanText(getFromNested(product, ["cancellationPolicy", "description"])) ??
    cleanText(getFromNested(product, ["cancellationPolicy", "text"]))
  );
};

const getFromPriceText = (
  product: Record<string, unknown>
): string | undefined => {
  return (
    cleanText(product.priceFrom) ??
    cleanText(product.fromPrice) ??
    cleanText(getFromNested(product, ["pricing", "summary", "fromPrice"])) ??
    cleanText(getFromNested(product, ["pricing", "fromPrice"])) ??
    cleanText(getFromNested(product, ["pricing", "fromPriceFormatted"]))
  );
};

const extractExactProductImages = (
  product: Record<string, unknown>
): Engine5ExactProductImage[] => {
  const rawImages = Array.isArray(product.images) ? product.images : [];

  return rawImages
    .map(image => {
      const row = asRecord(image);
      if (!row) return undefined;

      const variantsRaw = Array.isArray(row.variants) ? row.variants : [];
      const variants: Engine5ImageVariant[] = variantsRaw
        .map(variant => {
          const variantRow = asRecord(variant);
          if (!variantRow) return undefined;
          const url = asImageUrl(variantRow.url);
          if (!url) return undefined;
          return {
            url,
            width: asNumber(variantRow.width),
            height: asNumber(variantRow.height),
          };
        })
        .filter((variant): variant is Engine5ImageVariant => Boolean(variant));

      const directUrl = asImageUrl(row.url);
      if (directUrl && !variants.some(variant => variant.url === directUrl)) {
        variants.push({
          url: directUrl,
          width: asNumber(row.width),
          height: asNumber(row.height),
        });
      }

      if (!directUrl && variants.length === 0) return undefined;

      return {
        url: directUrl,
        isCover: row.isCover === true,
        variants,
      };
    })
    .filter((image): image is Engine5ExactProductImage => Boolean(image));
};

const rankVariant = (variant: Engine5ImageVariant): number => {
  const width = variant.width ?? 0;
  const height = variant.height ?? 0;
  const hasLandscapeShape = width > height;
  const isPreferredLandscape = hasLandscapeShape && width >= 1100;
  const area = width * height;

  if (isPreferredLandscape) {
    return 3_000_000_000 + area;
  }

  if (hasLandscapeShape) {
    return 2_000_000_000 + area;
  }

  return 1_000_000_000 + area;
};

const selectCanonicalHero = (
  exactProductImages: Engine5ExactProductImage[]
) => {
  const withVariants = exactProductImages.filter(
    image => image.variants.length > 0
  );
  const coverImages = withVariants.filter(image => image.isCover);
  const candidates = coverImages.length > 0 ? coverImages : withVariants;

  const allCandidateUrls = Array.from(
    new Set(
      exactProductImages.flatMap(image =>
        image.variants.map(variant => variant.url)
      )
    )
  );

  if (candidates.length === 0) {
    return {
      canonicalHeroUrl: undefined,
      heroSelectionSource: "missing" as const,
      heroSelectionSize: undefined,
      candidateUrls: allCandidateUrls,
    };
  }

  const selectedVariant = candidates
    .flatMap(image => image.variants)
    .sort((a, b) => rankVariant(b) - rankVariant(a))[0];

  if (!selectedVariant) {
    return {
      canonicalHeroUrl: undefined,
      heroSelectionSource: "missing" as const,
      heroSelectionSize: undefined,
      candidateUrls: allCandidateUrls,
    };
  }

  return {
    canonicalHeroUrl: selectedVariant.url,
    heroSelectionSource: "api-images-payload" as const,
    heroSelectionSize: {
      width: selectedVariant.width,
      height: selectedVariant.height,
    },
    candidateUrls: allCandidateUrls,
  };
};

export const getEngine5ViatorTourData = async (
  productCode: string
): Promise<Engine5ViatorApiTour> => {
  const normalizedCode = productCode.trim().toUpperCase();
  if (!normalizedCode) {
    throw new Error("Engine5 requires a Viator product code");
  }

  const response = await fetch(
    `/api/engine5/viator-product?productCode=${encodeURIComponent(normalizedCode)}`
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Engine5 Viator API unavailable for ${normalizedCode}: ${response.status} ${errorBody}`
    );
  }

  const payload = (await response.json()) as Record<string, unknown>;
  const product =
    (payload.product as Record<string, unknown> | undefined) ?? payload;

  const title = cleanText(product.title) ?? cleanText(product.productTitle);
  const description =
    cleanText(product.shortDescription) ??
    cleanText(product.summary) ??
    cleanText(asRecord(product.description)?.text) ??
    cleanText(product.description);
  const bookingUrl = cleanText(product.productUrl) ?? cleanText(product.seoUrl);
  const exactProductImages = extractExactProductImages(product);
  const heroSelectionFromApi = selectCanonicalHero(exactProductImages);
  const overrideHeroUrl = getEngine5ExactProductHeroOverride(normalizedCode);
  const shouldUseOverride =
    heroSelectionFromApi.heroSelectionSource === "missing" &&
    Boolean(overrideHeroUrl);

  const heroSelection = shouldUseOverride
    ? {
        canonicalHeroUrl: overrideHeroUrl,
        heroSelectionSource: "exact-product-override" as const,
        heroSelectionSize: undefined,
        candidateUrls: heroSelectionFromApi.candidateUrls,
      }
    : heroSelectionFromApi;

  if (
    !title ||
    !description ||
    !bookingUrl ||
    !heroSelection.canonicalHeroUrl ||
    heroSelection.heroSelectionSource === "missing"
  ) {
    throw new Error(
      `Engine5 Viator API payload incomplete for ${normalizedCode}: required fields missing`
    );
  }

  return {
    productCode: normalizedCode,
    title,
    description,
    bookingUrl,
    duration: cleanText(product.duration) ?? cleanText(product.durationText),
    startTime:
      cleanText(product.startTime) ??
      cleanText(asRecord(product.schedule)?.startTime),
    fromPrice: getFromPriceText(product),
    priceCurrency:
      cleanText(product.currencyCode) ??
      cleanText(
        getFromNested(product, ["pricing", "summary", "currencyCode"])
      ) ??
      cleanText(getFromNested(product, ["pricing", "currencyCode"])),
    rating:
      asNumberLike(product.rating) ??
      asNumberLike(
        getFromNested(product, ["reviewSummary", "combinedAverageRating"])
      ) ??
      asNumberLike(
        getFromNested(product, ["reviews", "combinedAverageRating"])
      ),
    reviewCount:
      asNumberLike(product.reviewCount) ??
      asNumberLike(getFromNested(product, ["reviewSummary", "totalReviews"])) ??
      asNumberLike(getFromNested(product, ["reviews", "totalReviews"])),
    meetingPoint: getMeetingPointText(product),
    cancellationPolicy: getCancellationText(product),
    itinerary: extractItinerary(product),
    highlights: extractHighlights(product),
    faqs: extractFaqs(product),
    inclusions: [
      ...toStringArray(product.inclusions),
      ...toStringArray(getFromNested(product, ["included"])),
    ].filter((item, index, all) => all.indexOf(item) === index),
    exclusions: [
      ...toStringArray(product.exclusions),
      ...toStringArray(getFromNested(product, ["excluded"])),
    ].filter((item, index, all) => all.indexOf(item) === index),
    additionalInfo: [
      ...toStringArray(product.additionalInfo),
      ...toStringArray(getFromNested(product, ["importantInformation"])),
      ...toStringArray(getFromNested(product, ["travelerInformation"])),
    ].filter((item, index, all) => all.indexOf(item) === index),
    exactProductImages,
    canonicalHeroUrl: heroSelection.canonicalHeroUrl,
    heroSelectionSource: heroSelection.heroSelectionSource,
    heroSelectionSize: heroSelection.heroSelectionSize,
    heroSelectionDiagnostics: {
      candidateUrls: heroSelection.candidateUrls,
      overrideUsed: shouldUseOverride,
    },
    provenance: {
      apiFetchAttempted: true,
      apiFetchSucceeded: true,
      descriptionSource: "api",
    },
  };
};
