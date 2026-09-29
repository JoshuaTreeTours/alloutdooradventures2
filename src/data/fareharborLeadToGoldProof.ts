import {
  fareHarborLeadToGoldProofProducts,
  type FareHarborProofProduct,
} from "./fareharborLeadToGoldProof.generated";

const byItemId = new Map(
  fareHarborLeadToGoldProofProducts.map(product => [product.itemId, product])
);

const ITEM_URL_PATTERN = /\/items\/(\d+)(?:\/|$|\?)/;

export const getFareHarborProofProducts = (): FareHarborProofProduct[] =>
  fareHarborLeadToGoldProofProducts;

export const getFareHarborProofByItemId = (
  itemId?: string | null
): FareHarborProofProduct | null => {
  if (!itemId) {
    return null;
  }
  return byItemId.get(itemId) ?? null;
};

export const getFareHarborProofFromTour = (
  tour?: {
    id?: string | null;
    slug?: string | null;
    bookingUrl?: string | null;
  } | null
): FareHarborProofProduct | null => {
  if (!tour) {
    return null;
  }
  const fromUrl = tour.bookingUrl?.match(ITEM_URL_PATTERN)?.[1];
  const fromSlug = tour.slug?.match(/-(\d+)$/)?.[1];
  const fromId = tour.id && /^\d+$/.test(tour.id) ? tour.id : null;
  return getFareHarborProofByItemId(fromUrl ?? fromSlug ?? fromId);
};

export const applyFareHarborProofSchema = <T extends Record<string, unknown>>(
  nodes: T[],
  proof: FareHarborProofProduct
): T[] => {
  const description = proof.paragraphs.join(" ");
  return nodes.map(node => {
    const type = node["@type"];
    if (type !== "Product" && type !== "TouristTrip" && type !== "WebPage") {
      return node;
    }
    const next: Record<string, unknown> = { ...node };
    if (type === "WebPage") {
      next.description = proof.paragraphs[0];
      return next as T;
    }
    next.description = description;
    delete next.aggregateRating;
    if (type === "TouristTrip" && proof.durationIso) {
      next.duration = proof.durationIso;
    }
    if (!proof.offer) {
      delete next.offers;
      return next as T;
    }
    const existing = node.offers;
    const url =
      existing && typeof existing === "object" && existing !== null && "url" in existing
        ? (existing as { url?: unknown }).url
        : undefined;
    next.offers = {
      "@type": "Offer",
      ...(typeof url === "string" ? { url } : {}),
      price: proof.offer.price,
      priceCurrency: proof.offer.priceCurrency,
      availability: proof.offer.availability,
    };
    return next as T;
  });
};
