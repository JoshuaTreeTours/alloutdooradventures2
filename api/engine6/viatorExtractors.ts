export type Engine6DiagnosticsPaths = {
  commercialPriceFieldPath: string | null;
  heroImageFieldPath: string | null;
  ratingFieldPath: string | null;
  reviewCountFieldPath: string | null;
  itineraryFieldPath: string | null;
  meetingPointFieldPath: string | null;
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
  itinerary: Array<{ title: string; description?: string; duration?: string }>;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const asNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const asPositiveNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
};

const resolveHeroImage = (product: Record<string, unknown>) => {
  const media = asRecord(product.media);
  const images = Array.isArray(media?.images) ? media?.images : [];

  for (let i = 0; i < images.length; i += 1) {
    const image = asRecord(images[i]);
    if (!image) continue;
    const variants = asRecord(image.variants);

    const candidates = [
      { value: asRecord(variants?.["XXLARGE"])?.url, path: `product.media.images[${i}].variants.XXLARGE.url` },
      { value: asRecord(variants?.["XLARGE"])?.url, path: `product.media.images[${i}].variants.XLARGE.url` },
      { value: asRecord(variants?.["LARGE"])?.url, path: `product.media.images[${i}].variants.LARGE.url` },
      { value: asRecord(variants?.["FULL"])?.url, path: `product.media.images[${i}].variants.FULL.url` },
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

const resolvePrice = (product: Record<string, unknown>) => {
  const direct = [
    { value: asRecord(asRecord(product.pricing)?.summary)?.fromPrice, path: "product.pricing.summary.fromPrice" },
    { value: asRecord(product.pricing)?.fromPrice, path: "product.pricing.fromPrice" },
    { value: asRecord(product.pricingSummary)?.fromPrice, path: "product.pricingSummary.fromPrice" },
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

export const extractEngine6Product = (rawPayload: unknown) => {
  const payload = asRecord(rawPayload);
  const product = asRecord(payload?.product) ?? payload;

  const diagnostics: Engine6DiagnosticsPaths = {
    commercialPriceFieldPath: null,
    heroImageFieldPath: null,
    ratingFieldPath: null,
    reviewCountFieldPath: null,
    itineraryFieldPath: null,
    meetingPointFieldPath: null,
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
    { value: asRecord(product.reviews)?.combinedAverageRating, path: "product.reviews.combinedAverageRating" },
    { value: asRecord(product.reviews)?.averageRating, path: "product.reviews.averageRating" },
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
    { value: asRecord(product.reviews)?.totalReviews, path: "product.reviews.totalReviews" },
    { value: asRecord(product.reviews)?.reviewCount, path: "product.reviews.reviewCount" },
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
    { value: asRecord(asRecord(product.logistics)?.start)?.description, path: "product.logistics.start.description" },
    { value: asRecord(product.meetingPoint)?.description, path: "product.meetingPoint.description" },
    { value: asRecord(product.meetingPoint)?.name, path: "product.meetingPoint.name" },
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

  const itinerary: Array<{ title: string; description?: string; duration?: string }> = [];
  const itinerarySources = [
    { value: product.itineraryItems, path: "product.itineraryItems" },
    { value: asRecord(product.itinerary)?.items, path: "product.itinerary.items" },
  ];
  for (const source of itinerarySources) {
    if (!Array.isArray(source.value)) continue;
    diagnostics.itineraryFieldPath = source.path;
    for (const rowRaw of source.value) {
      const row = asRecord(rowRaw);
      const rowTitle = asNonEmptyString(row?.title) ?? asNonEmptyString(row?.name);
      if (!rowTitle) continue;
      itinerary.push({
        title: rowTitle,
        description: asNonEmptyString(row?.description) ?? undefined,
        duration: asNonEmptyString(row?.duration) ?? undefined,
      });
    }
    break;
  }

  const seoTitle = title && city ? `${title} in ${city}` : title;
  const seoDescription =
    title && city
      ? `Best tour in ${city}${aggregateRating ? ` with a ${aggregateRating}/5 rating` : ""}${reviewCount ? ` and ${reviewCount} reviews` : ""}${meetingPointText ? `. Meeting point: ${meetingPointText}` : ""}.`
      : title;

  return {
    extracted: {
      title,
      seoTitle: seoTitle ?? null,
      seoDescription: seoDescription ?? null,
      city: city ?? null,
      state: state ?? null,
      heroImageUrl: heroImage?.value ?? null,
      cardImageUrl: heroImage?.value ?? null,
      priceAmount: price.amount,
      priceFormatted: price.amount ? `From $${price.amount.toFixed(0)}` : null,
      aggregateRating,
      reviewCount,
      meetingPointText,
      itinerary,
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
  itinerary: [],
});
