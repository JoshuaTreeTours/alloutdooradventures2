import { santaBarbaraConfig } from "../cities/santa-barbara";

type ViatorDiscoveryProduct = {
  productCode?: string;
  rating?: { combinedAverageRating?: number };
  reviews?: { totalReviews?: number };
  productUrl?: string;
  title?: string;
};

type ViatorDiscoveryResponse = {
  products?: ViatorDiscoveryProduct[];
};

export type ViatorDiscoveredProduct = {
  productCode: string;
  rating: number;
  reviewCount: number;
  canonicalViatorTourUrl: string;
  title?: string;
};

const CATEGORY_SEARCH_TERMS: Record<string, string[]> = {
  sailing: ["sailing", "cruise", "whale"],
  "wine-tours": ["wine", "vineyard", "solvang", "santa ynez"],
  "e-bike": ["ebike", "e-bike", "bike"],
  "walking-tours": ["walking", "history", "architecture"],
  "food-tours": ["food", "tasting", "culinary"],
  "day-trips": ["day trip", "solvang", "los angeles"],
};

const VIATOR_API_BASE_URL = "https://api.viator.com/partner";

const toCanonicalViatorTourUrl = (input?: string): string | null => {
  if (!input) {
    return null;
  }

  try {
    const url = new URL(input);
    return /\/d\d+-/i.test(url.pathname) ? url.toString() : null;
  } catch {
    return null;
  }
};

export const fetchViatorProductsByDestinationAndCategory = async (args: {
  destinationId: string;
  category: string;
  apiKey: string;
  limitPerCategory?: number;
  minRating?: number;
  minReviews?: number;
}): Promise<ViatorDiscoveredProduct[]> => {
  const response = await fetch(`${VIATOR_API_BASE_URL}/products/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;version=2.0",
      Accept: "application/json;version=2.0",
      "Accept-Language": "en-US",
      "exp-api-key": args.apiKey,
    },
    body: JSON.stringify({
      destinationId: Number(args.destinationId),
      searchTerm: CATEGORY_SEARCH_TERMS[args.category]?.[0] ?? args.category,
      count: Math.max(
        (args.limitPerCategory ?? santaBarbaraConfig.ranking.limitPerCategory) *
          3,
        30
      ),
      sort: "TRAVELER_RATING",
    }),
  });

  if (!response.ok) {
    throw new Error(`Viator discovery failed: ${response.status}`);
  }

  const payload = (await response.json()) as ViatorDiscoveryResponse;
  const minRating = args.minRating ?? santaBarbaraConfig.ranking.minRating;
  const minReviews = args.minReviews ?? santaBarbaraConfig.ranking.minReviews;
  const limit =
    args.limitPerCategory ?? santaBarbaraConfig.ranking.limitPerCategory;

  return (payload.products ?? [])
    .map(product => {
      const canonicalUrl = toCanonicalViatorTourUrl(product.productUrl);
      if (!product.productCode || !canonicalUrl) {
        return null;
      }

      return {
        productCode: product.productCode,
        title: product.title,
        rating: product.rating?.combinedAverageRating ?? 0,
        reviewCount: product.reviews?.totalReviews ?? 0,
        canonicalViatorTourUrl: canonicalUrl,
      } satisfies ViatorDiscoveredProduct;
    })
    .filter((product): product is ViatorDiscoveredProduct => Boolean(product))
    .filter(
      product =>
        product.rating >= minRating && product.reviewCount >= minReviews
    )
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, limit);
};
