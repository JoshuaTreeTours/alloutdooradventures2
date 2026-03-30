import type {
  LegacyFhExtractionInput,
  LegacyFhMigratedProductRecord,
  LegacyFhItineraryStop,
} from "./types";

const stripTags = (value: string) =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

const extractAttribute = (html: string, pattern: RegExp) =>
  pattern.exec(html)?.[1]?.trim() ?? null;

const collectListItems = (sectionHtml: string | null) => {
  if (!sectionHtml) {
    return [];
  }

  return Array.from(sectionHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi))
    .map(match => stripTags(match[1] ?? ""))
    .filter(Boolean);
};

const collectParagraphs = (sectionHtml: string | null) => {
  if (!sectionHtml) {
    return [];
  }

  return Array.from(sectionHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi))
    .map(match => stripTags(match[1] ?? ""))
    .filter(Boolean);
};

const countWords = (value: string | null) => {
  if (!value) {
    return 0;
  }

  return value.trim().split(/\s+/).filter(Boolean).length;
};

const collectItinerary = (
  sectionHtml: string | null
): LegacyFhItineraryStop[] => {
  if (!sectionHtml) {
    return [];
  }

  const articleStops = Array.from(
    sectionHtml.matchAll(
      /<article[^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>[\s\S]*?<\/article>/gi
    )
  )
    .map(match => ({
      title: stripTags(match[1] ?? ""),
      description: stripTags(match[2] ?? "") || undefined,
    }))
    .filter(stop => stop.title);

  if (articleStops.length > 0) {
    return articleStops;
  }

  return collectListItems(sectionHtml).map(item => ({ title: item }));
};

const firstMatchingSection = (html: string, keys: string[]) => {
  for (const key of keys) {
    const sectionMatch = html.match(
      new RegExp(
        `<section[^>]*data-(?:legacy|fh)=["']${key}["'][^>]*>([\\s\\S]*?)<\\/section>`,
        "i"
      )
    );

    if (sectionMatch?.[1]) {
      return sectionMatch[1];
    }
  }

  return null;
};

const dedupeUrls = (urls: Array<string | null | undefined>) =>
  Array.from(new Set(urls.filter((url): url is string => Boolean(url))));

const parsePrice = (label: string | null) => {
  if (!label) {
    return null;
  }

  const match = label.match(/\$\s*([\d,]+(?:\.\d{1,2})?)/);
  if (!match?.[1]) {
    return null;
  }

  const amount = Number.parseFloat(match[1].replace(/,/g, ""));
  return Number.isFinite(amount) ? amount : null;
};

type ExtractedRatingSnapshot = {
  rating: number | null;
  reviewCount: number | null;
  confidence: "none" | "medium" | "high";
};

const parseNumericRating = (value: string | null) => {
  if (!value) {
    return null;
  }
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 5) {
    return null;
  }
  return parsed;
};

const parseReviewCount = (value: string | null) => {
  if (!value) {
    return null;
  }
  const parsed = Number.parseInt(value.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const extractVisibleRatingSnapshot = (
  html: string
): ExtractedRatingSnapshot => {
  const explicitRating = parseNumericRating(
    extractAttribute(html, /data-legacy=["']rating["'][^>]*>([^<]+)</i) ??
      extractAttribute(html, /data-fh=["']rating["'][^>]*>([^<]+)</i)
  );
  const explicitReviews = parseReviewCount(
    extractAttribute(html, /data-legacy=["']reviews?["'][^>]*>([^<]+)</i) ??
      extractAttribute(html, /data-fh=["']reviews?["'][^>]*>([^<]+)</i)
  );

  const textRating = parseNumericRating(
    extractAttribute(
      html,
      /(?:^|[^0-9])([0-5](?:\.\d)?)\s*(?:\/\s*5|out of 5)/i
    )
  );
  const textReviews = parseReviewCount(
    extractAttribute(html, /([\d,]+)\s+reviews?/i)
  );

  const rating = explicitRating ?? textRating;
  const reviewCount = explicitReviews ?? textReviews;

  return {
    rating,
    reviewCount,
    confidence:
      explicitRating !== null || explicitReviews !== null
        ? "high"
        : rating !== null || reviewCount !== null
          ? "medium"
          : "none",
  };
};

const extractStructuredRatingSnapshot = (
  html: string
): ExtractedRatingSnapshot => {
  const matches = Array.from(
    html.matchAll(
      /"aggregateRating"\s*:\s*\{[\s\S]*?"ratingValue"\s*:\s*"?([0-5](?:\.\d+)?)"?[\s\S]*?"reviewCount"\s*:\s*"?([\d,]+)"?/gi
    )
  );

  if (matches.length === 0) {
    return { rating: null, reviewCount: null, confidence: "none" };
  }

  const top = matches[0];
  return {
    rating: parseNumericRating(top?.[1] ?? null),
    reviewCount: parseReviewCount(top?.[2] ?? null),
    confidence: "medium",
  };
};

const hasRatingConflict = (
  a: ExtractedRatingSnapshot,
  b: ExtractedRatingSnapshot
) => {
  const ratingConflict =
    a.rating !== null &&
    b.rating !== null &&
    Math.abs(a.rating - b.rating) > 0.05;
  const reviewConflict =
    a.reviewCount !== null &&
    b.reviewCount !== null &&
    a.reviewCount !== b.reviewCount;
  return ratingConflict || reviewConflict;
};

const resolveRatingSnapshot = (
  sources: ExtractedRatingSnapshot[]
): { rating: number | null; reviewCount: number | null } => {
  const detected = sources.filter(
    source => source.rating !== null || source.reviewCount !== null
  );
  if (detected.length === 0) {
    return { rating: null, reviewCount: null };
  }

  for (let i = 0; i < detected.length; i += 1) {
    for (let j = i + 1; j < detected.length; j += 1) {
      if (hasRatingConflict(detected[i], detected[j])) {
        return { rating: null, reviewCount: null };
      }
    }
  }

  const selected =
    detected.find(source => source.confidence === "high") ?? detected[0];
  return {
    rating: selected.rating,
    reviewCount: selected.reviewCount,
  };
};

const normalizeMeetingPoint = (meetingInfo: string | null) => {
  if (!meetingInfo) {
    return null;
  }

  return meetingInfo
    .replace(/^meeting point\s*:\s*/i, "")
    .replace(/^meeting point\s*-\s*/i, "")
    .trim();
};

const normalizeHighlights = (highlights: string[]) =>
  highlights
    .map(value =>
      value
        .replace(/^[\u2022•\-*]+\s*/, "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);

const parseDuration = (sourceHtml: string) => {
  const durationSection = firstMatchingSection(sourceHtml, [
    "duration",
    "details",
  ]);
  const sectionParagraph = collectParagraphs(durationSection)[0] ?? null;
  const durationText =
    sectionParagraph ??
    extractAttribute(
      sourceHtml,
      /data-legacy=["']duration["'][^>]*>([^<]+)</i
    ) ??
    extractAttribute(sourceHtml, /Duration\s*:\s*([^<\n]+)(?:<|$)/i) ??
    null;

  return durationText?.trim() ?? null;
};

const sanitizeOverviewSentence = (value: string) =>
  value
    .replace(/\b(viator|fareharbor)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

const dedupeSentences = (sentences: string[]) => {
  const seen = new Set<string>();
  const normalized = [];

  for (const sentence of sentences) {
    const cleaned = sanitizeOverviewSentence(sentence)
      .replace(/^[\u2022•\-*]+\s*/, "")
      .trim();

    if (!cleaned) {
      continue;
    }

    const key = cleaned.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    normalized.push(cleaned);
  }

  return normalized;
};

const buildOverviewText = ({
  bookingParagraphs,
  publicParagraphs,
  activityParagraphs,
  highlights,
  itinerary,
}: {
  bookingParagraphs: string[];
  publicParagraphs: string[];
  activityParagraphs: string[];
  highlights: string[];
  itinerary: LegacyFhItineraryStop[];
}) => {
  const preferredOverview =
    bookingParagraphs.length > 0 ? bookingParagraphs : publicParagraphs;
  const fallbackOverview =
    bookingParagraphs.length > 0 ? publicParagraphs : bookingParagraphs;

  const overviewSentences = dedupeSentences([
    ...preferredOverview,
    ...fallbackOverview,
  ]);

  let composed = overviewSentences.join(" ");

  if (countWords(composed) < 100) {
    const itinerarySentences = itinerary
      .flatMap(stop => [stop.title, stop.description].filter(Boolean))
      .map(value => value as string);

    const expansionSentences = dedupeSentences([
      ...activityParagraphs,
      ...highlights,
      ...itinerarySentences,
    ]);

    const mergedSentences = dedupeSentences([
      ...overviewSentences,
      ...expansionSentences,
    ]);
    composed = mergedSentences.join(" ");
  }

  const words = countWords(composed);
  const lowConfidence = words > 0 && words < 100;

  if (words === 0) {
    return {
      text: null,
      wordCount: 0,
      lowConfidence: true,
    };
  }

  const sentenceChunks = composed
    .split(/(?<=[.!?])\s+/)
    .map(chunk => chunk.trim())
    .filter(Boolean);
  const midpoint = Math.ceil(sentenceChunks.length / 2);
  const paragraphOne = sentenceChunks.slice(0, midpoint).join(" ");
  const paragraphTwo = sentenceChunks.slice(midpoint).join(" ");
  const text = paragraphTwo
    ? `${paragraphOne}\n\n${paragraphTwo}`
    : paragraphOne;

  return {
    text,
    wordCount: countWords(text),
    lowConfidence,
  };
};

const selectDeterministicHeroImage = (images: string[]) => {
  const preferredPrimary = images.find(url =>
    /(cover|primary|hero|main)/i.test(url)
  );
  if (preferredPrimary) {
    return preferredPrimary;
  }

  const preferredAction = images.find(url =>
    /(bike|cycling|action|ride|trail|scenic)/i.test(url)
  );
  if (preferredAction) {
    return preferredAction;
  }

  return images[0] ?? null;
};

export const extractLegacyFhProductRecord = (
  input: LegacyFhExtractionInput
): LegacyFhMigratedProductRecord => {
  const sourceHtml = [input.publicHtml, input.bookingHtml]
    .filter(Boolean)
    .join("\n");
  const title =
    extractAttribute(sourceHtml, /<h1[^>]*>([\s\S]*?)<\/h1>/i)?.trim() ||
    input.fallback.title;

  const heroImageFromMeta = extractAttribute(
    sourceHtml,
    /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i
  );

  const imageCandidates = [
    heroImageFromMeta,
    ...Array.from(
      sourceHtml.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi)
    ).map(match => match[1]?.trim() ?? null),
    ...(input.fallback.galleryImages ?? []),
    input.fallback.heroImageUrl ?? null,
  ];

  const galleryImages = dedupeUrls(imageCandidates).filter(url =>
    /^https?:\/\//i.test(url)
  );

  const heroImageUrl =
    selectDeterministicHeroImage(galleryImages) ??
    input.fallback.heroImageUrl ??
    heroImageFromMeta;

  const priceLabel =
    extractAttribute(
      sourceHtml,
      /data-legacy=["']price["'][^>]*>\s*([^<]+)\s*</i
    ) ??
    collectListItems(
      firstMatchingSection(sourceHtml, ["pricing", "price"])
    )[0] ??
    null;

  const resolvedRatingSnapshot = resolveRatingSnapshot([
    extractVisibleRatingSnapshot(input.publicHtml),
    extractVisibleRatingSnapshot(input.bookingHtml ?? ""),
    extractStructuredRatingSnapshot(sourceHtml),
  ]);

  const bookingOverviewParagraphs = collectParagraphs(
    firstMatchingSection(input.bookingHtml ?? "", [
      "overview",
      "activity-details",
      "description",
    ])
  );

  const publicOverviewParagraphs = collectParagraphs(
    firstMatchingSection(input.publicHtml, [
      "overview",
      "activity-details",
      "description",
    ])
  );

  const highlights = normalizeHighlights(
    collectListItems(
      firstMatchingSection(sourceHtml, ["highlights", "top-highlights"])
    )
  );

  const itinerary = collectItinerary(
    firstMatchingSection(sourceHtml, ["itinerary", "stops"])
  );

  const inclusions = collectListItems(
    firstMatchingSection(sourceHtml, ["inclusions", "included"])
  );

  const exclusions = collectListItems(
    firstMatchingSection(sourceHtml, ["exclusions", "excluded"])
  );

  const additionalInfo = collectListItems(
    firstMatchingSection(sourceHtml, ["additional-info", "requirements"])
  );

  const meetingInfo = normalizeMeetingPoint(
    collectParagraphs(
      firstMatchingSection(sourceHtml, ["meeting", "details"])
    )[0] ?? null
  );

  const cancellationSummary =
    collectParagraphs(
      firstMatchingSection(sourceHtml, ["cancellation", "policy"])
    )[0] ?? null;

  const pricingOptions = collectListItems(
    firstMatchingSection(sourceHtml, ["pricing", "price"])
  )
    .map(option => ({
      label: option,
      amount: parsePrice(option),
    }))
    .filter(
      (
        option
      ): option is {
        label: string;
        amount: number;
      } => typeof option.amount === "number" && Number.isFinite(option.amount)
    );
  const priceAmountFromOptions =
    pricingOptions.length > 0
      ? Math.min(...pricingOptions.map(option => option.amount))
      : null;
  const priceAmount = priceAmountFromOptions ?? parsePrice(priceLabel);
  const durationText = parseDuration(sourceHtml);
  const activityDetailsParagraphs = collectParagraphs(
    firstMatchingSection(sourceHtml, [
      "activity-details",
      "details",
      "description",
    ])
  );
  const composedOverview = buildOverviewText({
    bookingParagraphs: bookingOverviewParagraphs,
    publicParagraphs: publicOverviewParagraphs,
    activityParagraphs: activityDetailsParagraphs,
    highlights,
    itinerary,
  });

  return {
    slug: input.slug,
    canonicalPath: input.canonicalPath,
    bookingPath: input.bookingPath,
    title,
    operator: input.operator,
    heroImageUrl,
    galleryImages,
    priceSnapshot: {
      amount: priceAmount,
      currency: "USD",
      label:
        priceAmount !== null ? `From $${priceAmount.toFixed(0)}` : priceLabel,
      options: pricingOptions,
    },
    ratingSnapshot: {
      rating: resolvedRatingSnapshot.rating,
      reviewCount: resolvedRatingSnapshot.reviewCount,
    },
    overview: composedOverview.text,
    overviewWordCount: composedOverview.wordCount,
    overviewLowConfidence: composedOverview.lowConfidence,
    highlights,
    itinerary,
    inclusions,
    exclusions,
    meetingInfo,
    durationText,
    additionalInfo,
    cancellationSummary,
    sourceType: "legacy_fh_migrated",
  };
};
