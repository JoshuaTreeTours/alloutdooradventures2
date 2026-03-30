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

const collectItinerary = (sectionHtml: string | null): LegacyFhItineraryStop[] => {
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

const pickCanonicalHero = (heroImageUrl: string | null, galleryImages: string[]) => {
  if (heroImageUrl) {
    return heroImageUrl;
  }

  return galleryImages.find(url => /^https?:\/\//i.test(url)) ?? null;
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

export const extractLegacyFhProductRecord = (
  input: LegacyFhExtractionInput
): LegacyFhMigratedProductRecord => {
  const sourceHtml = [input.publicHtml, input.bookingHtml].filter(Boolean).join("\n");
  const title =
    extractAttribute(sourceHtml, /<h1[^>]*>([\s\S]*?)<\/h1>/i)?.trim() ||
    input.fallback.title;

  const heroImageFromMeta = extractAttribute(
    sourceHtml,
    /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i
  );

  const imageCandidates = [
    heroImageFromMeta,
    ...Array.from(sourceHtml.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi)).map(
      match => match[1]?.trim() ?? null
    ),
    ...(input.fallback.galleryImages ?? []),
    input.fallback.heroImageUrl ?? null,
  ];

  const galleryImages = dedupeUrls(imageCandidates).filter(url =>
    /^https?:\/\//i.test(url)
  );

  const heroImageUrl = pickCanonicalHero(input.fallback.heroImageUrl ?? heroImageFromMeta, galleryImages);

  const priceLabel =
    extractAttribute(sourceHtml, /data-legacy=["']price["'][^>]*>\s*([^<]+)\s*</i) ??
    collectListItems(firstMatchingSection(sourceHtml, ["pricing", "price"]))[0] ??
    null;

  const ratingValue = extractAttribute(sourceHtml, /data-legacy=["']rating["'][^>]*>([^<]+)</i);
  const reviewValue = extractAttribute(sourceHtml, /data-legacy=["']reviews?["'][^>]*>([^<]+)</i);

  const overviewParagraphs = collectParagraphs(
    firstMatchingSection(sourceHtml, ["overview", "activity-details", "description"])
  );

  const highlights = collectListItems(
    firstMatchingSection(sourceHtml, ["highlights", "top-highlights"])
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

  const meetingInfo =
    collectParagraphs(firstMatchingSection(sourceHtml, ["meeting", "details"]))[0] ??
    null;

  const cancellationSummary =
    collectParagraphs(firstMatchingSection(sourceHtml, ["cancellation", "policy"]))[0] ??
    null;

  const parsedRating =
    ratingValue && Number.isFinite(Number.parseFloat(ratingValue))
      ? Number.parseFloat(ratingValue)
      : (input.fallback.ratingSnapshot?.rating ?? null);

  const parsedReviewCount = reviewValue
    ? Number.parseInt(reviewValue.replace(/[^\d]/g, ""), 10)
    : (input.fallback.ratingSnapshot?.reviewCount ?? null);

  const priceAmount = parsePrice(priceLabel);

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
      label: priceLabel,
    },
    ratingSnapshot: {
      rating: parsedRating,
      reviewCount:
        typeof parsedReviewCount === "number" && Number.isFinite(parsedReviewCount)
          ? parsedReviewCount
          : null,
    },
    overview: overviewParagraphs.length > 0 ? overviewParagraphs.join("\n\n") : null,
    highlights,
    itinerary,
    inclusions,
    exclusions,
    meetingInfo,
    additionalInfo,
    cancellationSummary,
    sourceType: "legacy_fh_migrated",
  };
};
