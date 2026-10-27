import { getFareharborParams, normalizeFareharborUrl } from "../lib/fareharbor";
import type { FareHarborProofProduct } from "./fareharborLeadToGoldProof.generated";

/**
 * The Lead-to-Gold product records contain authoritative FareHarbor operator
 * and item IDs. The old /book paths can resolve to "Booking not found" because
 * they aren't necessarily in the legacy booking catalog. Link directly to the
 * source item using AOA's established affiliate attribution.
 */
export const getFareHarborProofBookingUrl = (
  product: FareHarborProofProduct
): string => {
  if (!/^[a-zA-Z0-9_-]+$/.test(product.company) || !/^\d+$/.test(product.itemId)) {
    throw new Error(
      `Invalid FareHarbor operator/item for Lead-to-Gold product ${product.itemId}`
    );
  }
  const url = new URL(
    `https://fareharbor.com/embeds/book/${product.company}/items/${product.itemId}/`
  );
  const params = getFareharborParams();
  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, value);
  }
  return normalizeFareharborUrl(url.toString());
};
