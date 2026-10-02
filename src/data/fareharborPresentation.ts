import type { FareHarborProofProduct } from "./fareharborLeadToGoldProof.generated";

export type FareHarborRatingProvider = "TripAdvisor" | "Google";

export type FareHarborRatingValue = {
  ratingValue: number;
  reviewCount: number;
  provider: FareHarborRatingProvider;
};

const isRatingProvider = (value: string): value is FareHarborRatingProvider =>
  value === "TripAdvisor" || value === "Google";

export type FareHarborRatingSurface = {
  name: string;
  html?: string;
  aggregateRating?: unknown;
};

const normalizeText = (value: string) => value.trim().replace(/\s+/g, " ");

const sameText = (left: string, right: string) =>
  normalizeText(left).toLowerCase() === normalizeText(right).toLowerCase();

const firstNaturalSentence = (paragraphs: string[], title: string) => {
  const text = normalizeText(paragraphs.join(" "));
  if (!text || sameText(text, title)) {
    return "";
  }
  const sentence = text.match(/^.*?[.!?](?=\s|$)/)?.[0]?.trim() ?? "";
  if (sentence.length < 24 || sentence.endsWith("…") || sentence.endsWith("...")) {
    return "";
  }
  const titleWords = title.split(" ").filter(Boolean);
  if (
    titleWords.length >= 4 &&
    sentence.toLowerCase().includes(title.toLowerCase())
  ) {
    return "";
  }
  return sentence;
};

export const fareHarborShortDescription = (
  proof: Pick<FareHarborProofProduct, "title" | "schemaDescription" | "paragraphs">
) => {
  const summary = normalizeText(proof.schemaDescription ?? "");
  const title = normalizeText(proof.title ?? "");
  if (!summary || sameText(summary, title)) {
    return firstNaturalSentence(proof.paragraphs, title);
  }
  if (title && summary.toLowerCase().startsWith(`${title.toLowerCase()} `)) {
    const rest = summary
      .slice(title.length)
      .replace(/^[\s:,\-–—]+/, "")
      .replace(/^(?:is|was|offers|features)\s+/i, "")
      .trim();
    if (rest && /[a-z]/i.test(rest) && !sameText(rest, title)) {
      return /^[a-z]/.test(rest)
        ? `${rest.charAt(0).toUpperCase()}${rest.slice(1)}`
        : rest;
    }
  }
  return summary;
};

export const fareHarborShortDescriptionRepeatsExperience = (
  proof: Pick<FareHarborProofProduct, "title" | "schemaDescription" | "paragraphs">
) => {
  const shortDescription = fareHarborShortDescription(proof);
  const experience = normalizeText(proof.paragraphs.join(" "));
  return Boolean(shortDescription) && shortDescription === experience;
};

export const fareHarborPriceLabel = (
  proof: Pick<FareHarborProofProduct, "visiblePriceLabel">
) => {
  const label = proof.visiblePriceLabel?.trim() ?? "";
  return label || null;
};

export const fareHarborRating = (proof: {
  aggregateRating: {
    ratingValue: number;
    reviewCount: number;
    provider?: string;
  } | null;
}): FareHarborRatingValue | null => {
  const rating = proof.aggregateRating;
  if (!rating || !rating.provider || !isRatingProvider(rating.provider)) {
    return null;
  }
  const { ratingValue, reviewCount } = rating;
  if (
    typeof ratingValue !== "number" ||
    !Number.isFinite(ratingValue) ||
    ratingValue <= 0 ||
    ratingValue > 5
  ) {
    return null;
  }
  if (
    typeof reviewCount !== "number" ||
    !Number.isInteger(reviewCount) ||
    reviewCount <= 0
  ) {
    return null;
  }
  return { ratingValue, reviewCount, provider: rating.provider };
};

export const formatFareHarborRating = (rating: FareHarborRatingValue) => {
  const reviews = rating.reviewCount === 1 ? "review" : "reviews";
  return `★ ${rating.ratingValue.toFixed(1)} (${rating.reviewCount.toLocaleString("en-US")} ${reviews}) · ${rating.provider}`;
};

export const fareHarborAggregateRatingSchema = (
  proof: Pick<FareHarborProofProduct, "aggregateRating">
) => {
  const rating = fareHarborRating(proof);
  if (!rating) {
    return undefined;
  }
  return {
    "@type": "AggregateRating" as const,
    ratingValue: rating.ratingValue,
    reviewCount: rating.reviewCount,
    bestRating: 5,
    worstRating: 1,
    author: {
      "@type": "Organization" as const,
      name: rating.provider,
    },
  };
};

const VISIBLE_RATING =
  /★\s*(\d+(?:\.\d+)?)\s*\(\s*([\d,]+)\s+reviews?\)(?:\s*·\s*(TripAdvisor|Google))?/gi;

const ratingTagPattern = /<[^>]*data-testid="fareharbor-rating"[^>]*>/gi;

const ratingsMatch = (
  actual: FareHarborRatingValue | null,
  expected: FareHarborRatingValue | null
) => {
  if (actual === null || expected === null) {
    return actual === expected;
  }
  return (
    actual.ratingValue === expected.ratingValue &&
    actual.reviewCount === expected.reviewCount &&
    actual.provider === expected.provider
  );
};

const readTaggedRatings = (html: string) => {
  const tags = html.match(ratingTagPattern) ?? [];
  const ratings: FareHarborRatingValue[] = [];
  const errors: string[] = [];
  for (const tag of tags) {
    const value = tag.match(/data-rating-value="([^"]*)"/)?.[1];
    const count = tag.match(/data-review-count="([^"]*)"/)?.[1];
    const ratingValue = value === undefined ? Number.NaN : Number(value);
    const reviewCount =
      count === undefined ? Number.NaN : Number(count.replace(/,/g, ""));
    if (!Number.isFinite(ratingValue) || !Number.isInteger(reviewCount)) {
      errors.push(`malformed FareHarbor rating tag: ${tag}`);
      continue;
    }
    const provider = tag.match(/data-rating-provider="([^"]*)"/)?.[1] ?? "";
    if (!isRatingProvider(provider)) {
      errors.push(`rating tag has no FareHarbor provider: ${tag}`);
      continue;
    }
    ratings.push({ ratingValue, reviewCount, provider });
  }
  return { ratings, errors };
};

const readVisibleRatings = (html: string): FareHarborRatingValue[] =>
  [...html.matchAll(VISIBLE_RATING)].map(match => ({
    ratingValue: Number(match[1]),
    reviewCount: Number(match[2].replace(/,/g, "")),
    provider: match[3] === "Google" ? "Google" : "TripAdvisor",
  }));

const readSchemaRating = (
  aggregateRating: unknown
): { rating: FareHarborRatingValue | null; error?: string } => {
  if (aggregateRating == null) {
    return { rating: null };
  }
  if (typeof aggregateRating !== "object") {
    return { rating: null, error: "schema aggregateRating is not an object" };
  }
  const record = aggregateRating as {
    "@type"?: unknown;
    ratingValue?: unknown;
    reviewCount?: unknown;
    author?: { name?: unknown };
  };
  if (record["@type"] !== "AggregateRating") {
    return { rating: null, error: "schema rating is not AggregateRating" };
  }
  const ratingValue = record.ratingValue;
  const reviewCount = record.reviewCount;
  if (
    typeof ratingValue !== "number" ||
    !Number.isFinite(ratingValue) ||
    typeof reviewCount !== "number" ||
    !Number.isInteger(reviewCount)
  ) {
    return { rating: null, error: "schema rating values are not numeric" };
  }
  const authorName = record.author?.name;
  const provider = authorName === "Google" ? "Google" : "TripAdvisor";
  return {
    rating: { ratingValue, reviewCount, provider },
  };
};

export const fareHarborRatingParityErrors = (input: {
  proof: Pick<FareHarborProofProduct, "aggregateRating">;
  surfaces: FareHarborRatingSurface[];
}) => {
  const expected = fareHarborRating(input.proof);
  const errors: string[] = [];
  for (const surface of input.surfaces) {
    if (surface.html !== undefined) {
      const visible = readVisibleRatings(surface.html);
      const tagged = readTaggedRatings(surface.html);
      errors.push(...tagged.errors.map(error => `${surface.name}: ${error}`));
      if (expected === null) {
        if (visible.length > 0 || tagged.ratings.length > 0) {
          errors.push(
            `${surface.name} shows a rating the FareHarbor source does not provide`
          );
        }
      } else {
        if (visible.length === 0) {
          errors.push(`${surface.name} omits the FareHarbor rating`);
        }
        if (tagged.ratings.length === 0) {
          errors.push(
            `${surface.name} rating text is missing fareharbor-rating data attributes`
          );
        }
        for (const rating of [...visible, ...tagged.ratings]) {
          if (!ratingsMatch(rating, expected)) {
            errors.push(
              `${surface.name} rating ${rating.ratingValue} (${rating.reviewCount}) disagrees with FareHarbor ${expected.ratingValue} (${expected.reviewCount})`
            );
          }
        }
        if (!surface.html.includes(formatFareHarborRating(expected))) {
          errors.push(
            `${surface.name} does not show the formatted FareHarbor rating`
          );
        }
      }
    }
    if ("aggregateRating" in surface) {
      const schema = readSchemaRating(surface.aggregateRating);
      if (schema.error) {
        errors.push(`${surface.name}: ${schema.error}`);
      } else if (!ratingsMatch(schema.rating, expected)) {
        const actual = schema.rating
          ? `${schema.rating.ratingValue} (${schema.rating.reviewCount})`
          : "omitted";
        const wanted = expected
          ? `${expected.ratingValue} (${expected.reviewCount})`
          : "omitted";
        errors.push(
          `${surface.name} schema rating ${actual} disagrees with FareHarbor ${wanted}`
        );
      } else if (expected && schema.rating && surface.aggregateRating && typeof surface.aggregateRating === "object") {
        const author = (
          surface.aggregateRating as {
            author?: { "@type"?: unknown; name?: unknown };
          }
        ).author;
        if (
          !author ||
          author["@type"] !== "Organization" ||
          author.name !== expected.provider
        ) {
          errors.push(
            `${surface.name} schema rating is not attributed to ${expected.provider}`
          );
        }
      }
    }
  }
  return errors;
};
