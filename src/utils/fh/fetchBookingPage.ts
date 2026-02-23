const REQUEST_TIMEOUT_MS = 8_000;

type NormalizedBookingUrl = {
  itemId: string;
  canonicalBookingUrl: string;
};

const ITEM_RE = /\/items\/(\d+)/i;

const cache = new Map<string, string | null>();

export const normalizeFareHarborBookingUrl = (
  input: string
): NormalizedBookingUrl | null => {
  try {
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
  } catch {
    return null;
  }
};

export const fetchBookingPage = async (
  bookingUrl: string
): Promise<string | null> => {
  const normalized = normalizeFareHarborBookingUrl(bookingUrl);
  if (!normalized) {
    return null;
  }

  const isPreview = process.env.VERCEL_ENV === "preview";

  if (!isPreview && cache.has(normalized.itemId)) {
    return cache.get(normalized.itemId) ?? null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(normalized.canonicalBookingUrl, {
      method: "GET",
      signal: controller.signal,
      headers: {
        accept: "text/html,application/xhtml+xml",
        "accept-language": "en-US,en;q=0.9",
        "user-agent":
          "AllOutdoorAdventuresBot/1.0 (+https://www.alloutdooradventures.com)",
      },
      cache: isPreview ? "no-store" : "force-cache",
    });

    if (!response.ok) {
      if (!isPreview) {
        cache.set(normalized.itemId, null);
      }
      return null;
    }

    const html = await response.text();
    if (!isPreview) {
      cache.set(normalized.itemId, html);
    }

    return html;
  } catch {
    if (!isPreview) {
      cache.set(normalized.itemId, null);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
};
