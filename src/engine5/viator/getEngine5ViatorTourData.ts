import type {
  Engine5ExactProductImage,
  Engine5ImageVariant,
  Engine5ViatorApiTour,
} from "../types";

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

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .map(item => cleanText(item))
        .filter((item): item is string => Boolean(item))
    : [];

const extractHighlights = (product: Record<string, unknown>): string[] => {
  const highlights =
    toStringArray(product.highlights) ||
    toStringArray(asRecord(product.additionalInfo)?.highlights);

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

const readPath = (root: Record<string, unknown>, path: string): unknown => {
  const segments = path.split(".");
  let current: unknown = root;

  for (const segment of segments) {
    const row = asRecord(current);
    if (!row || !(segment in row)) {
      return undefined;
    }
    current = row[segment];
  }

  return current;
};

const extractFromPrice = (product: Record<string, unknown>) => {
  const pathsTried = [
    "priceFrom",
    "fromPrice",
    "pricing.summary.fromPrice",
    "pricing.fromPrice",
    "pricing.price.from",
    "pricing.priceFrom",
    "pricing.amount",
    "price.amount",
    "offers.fromPrice",
    "offer.fromPrice",
  ];

  for (const path of pathsTried) {
    const candidate = cleanText(readPath(product, path));
    if (candidate) {
      return { fromPrice: candidate, pathsTried };
    }
  }

  return { fromPrice: undefined, pathsTried };
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
  const heroSelection = selectCanonicalHero(exactProductImages);
  const fromPrice = extractFromPrice(product);

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
    fromPrice: fromPrice.fromPrice,
    priceCurrency: cleanText(product.currencyCode),
    rating: asNumber(product.rating),
    reviewCount: asNumber(product.reviewCount),
    meetingPoint: cleanText(product.meetingPoint),
    cancellationPolicy: cleanText(product.cancellationPolicy),
    itinerary: extractItinerary(product),
    highlights: extractHighlights(product),
    faqs: extractFaqs(product),
    inclusions: toStringArray(product.inclusions),
    exclusions: toStringArray(product.exclusions),
    additionalInfo: toStringArray(product.additionalInfo),
    exactProductImages,
    canonicalHeroUrl: heroSelection.canonicalHeroUrl,
    heroSelectionSource: heroSelection.heroSelectionSource,
    heroSelectionSize: heroSelection.heroSelectionSize,
    heroSelectionDiagnostics: {
      candidateUrls: heroSelection.candidateUrls,
    },
    provenance: {
      apiFetchAttempted: true,
      apiFetchSucceeded: true,
      descriptionSource: "api",
    },
    priceDiagnostics: {
      pathsTried: fromPrice.pathsTried,
    },
  };
};
