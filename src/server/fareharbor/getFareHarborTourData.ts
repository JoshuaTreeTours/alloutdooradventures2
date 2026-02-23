import type { FareHarborStructuredData } from "../../utils/fh/transformFareHarborToAOAContent";

type FareHarborFetchResult = FareHarborStructuredData & {
  itemId: string;
  canonicalBookingUrl: string;
};

const memoryCache = new Map<string, FareHarborFetchResult | null>();

const ITEM_RE = /\/items\/(\d+)/i;

const toAbsoluteFareHarborUrl = (input: string) => {
  const parsed = new URL(input);
  if (
    parsed.hostname !== "fareharbor.com" &&
    parsed.hostname !== "www.fareharbor.com"
  ) {
    return null;
  }

  const itemMatch = parsed.pathname.match(ITEM_RE);
  if (!itemMatch?.[1]) {
    return null;
  }

  const itemId = itemMatch[1];
  const companyMatch = parsed.pathname.match(
    /\/embeds\/(?:book|calendar)\/([^/]+)\//i
  );
  const company = companyMatch?.[1];
  if (!company) {
    return null;
  }

  return {
    itemId,
    canonicalBookingUrl: `https://fareharbor.com/embeds/book/${company}/items/${itemId}/`,
  };
};

const parseBullets = (html: string, label: string) => {
  const sectionRegex = new RegExp(
    `<[^>]*>${label}<\/[^>]*>([\\s\\S]*?)(?:<h[23][^>]*>|$)`,
    "i"
  );
  const match = html.match(sectionRegex);
  if (!match?.[1]) {
    return [];
  }

  return Array.from(match[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi))
    .map(entry =>
      entry[1]
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);
};

export const getFareHarborTourData = async (
  bookingUrl: string
): Promise<FareHarborFetchResult | null> => {
  const normalized = toAbsoluteFareHarborUrl(bookingUrl);
  if (!normalized) {
    return null;
  }

  const isPreview = process.env.VERCEL_ENV === "preview";
  const cacheKey = normalized.itemId;

  if (!isPreview && memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey) ?? null;
  }

  try {
    const response = await fetch(normalized.canonicalBookingUrl, {
      headers: {
        "user-agent":
          "AllOutdoorAdventuresBot/1.0 (+https://www.alloutdooradventures.com)",
      },
      cache: isPreview ? "no-store" : "force-cache",
    });

    if (!response.ok) {
      if (!isPreview) memoryCache.set(cacheKey, null);
      return null;
    }

    const html = await response.text();
    const title = html.match(/<title>(.*?)<\/title>/i)?.[1]?.trim();
    const duration = html.match(/Duration[^<]*<[^>]*>([^<]+)/i)?.[1]?.trim();
    const meetingLocation = html
      .match(/Meeting[^<]*<[^>]*>([^<]+)/i)?.[1]
      ?.trim();

    const result: FareHarborFetchResult = {
      itemId: normalized.itemId,
      canonicalBookingUrl: normalized.canonicalBookingUrl,
      title,
      duration,
      meetingLocation,
      included: parseBullets(html, "Included"),
      notIncluded: parseBullets(html, "Not Included"),
      requirements: parseBullets(html, "Requirements"),
      cancellation: html
        .match(/Cancellation[^<]*<[^>]*>([\s\S]*?)<\//i)?.[1]
        ?.replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
      pickup: /pickup\s+included/i.test(html)
        ? "yes"
        : /no\s+pickup/i.test(html)
          ? "no"
          : "unknown",
      itinerary: parseBullets(html, "Itinerary"),
      rawHighlights: parseBullets(html, "Highlights"),
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
