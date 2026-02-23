import {
  fetchBookingPage,
  normalizeFareHarborBookingUrl,
} from "../../utils/fh/fetchBookingPage";
import { parseBookingPage } from "../../utils/fh/parseBookingPage";
import type { FareHarborStructuredData } from "../../utils/fh/transformFareHarborToAOAContent";

type FareHarborFetchResult = FareHarborStructuredData & {
  itemId: string;
  canonicalBookingUrl: string;
};

const memoryCache = new Map<string, FareHarborFetchResult | null>();

export const getFareHarborTourData = async (
  bookingUrl: string
): Promise<FareHarborFetchResult | null> => {
  const normalized = normalizeFareHarborBookingUrl(bookingUrl);
  if (!normalized) {
    return null;
  }

  const isPreview = process.env.VERCEL_ENV === "preview";
  const cacheKey = normalized.itemId;

  if (!isPreview && memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey) ?? null;
  }

  try {
    const html = await fetchBookingPage(normalized.canonicalBookingUrl);

    if (!html) {
      if (!isPreview) memoryCache.set(cacheKey, null);
      return null;
    }

    const parsed = parseBookingPage(html);

    const result: FareHarborFetchResult = {
      itemId: normalized.itemId,
      canonicalBookingUrl: normalized.canonicalBookingUrl,
      ...parsed,
      pickup: parsed.pickup ?? "unknown",
    };

    if (!isPreview) {
      memoryCache.set(cacheKey, result);
    }

    return result;
  } catch {
    if (!isPreview) memoryCache.set(cacheKey, null);
    return null;
  }
};
