const ENGINE6_VIATOR_AFFILIATE_PARAMS = {
  pid: "P00290915",
  mcid: "42383",
  medium: "link",
} as const;

const ENGINE6_VIATOR_CANONICAL_URL_BY_PRODUCT_CODE: Record<string, string> = {
  "63657P1":
    "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
  "60136P1":
    "https://www.viator.com/tours/Las-Vegas/Antelope-Canyon-Horseshoe-Bend-Day-Tour-from-Las-Vegas/d684-60136P1",
  "411138P3":
    "https://www.viator.com/tours/Anchorage/Private-Anchorage-Tour-and-Wilderness-Adventure/d4152-411138P3",
  "89173P8":
    "https://www.viator.com/tours/Fort-Lauderdale/Reef-and-Snorkel-Paddle-Tour/d660-89173P8",
  "5024MANSKY":
    "https://www.viator.com/tours/New-York-City/Manhattan-Sky-Tour-New-York-Helicopter-Flight/d687-5024MANSKY",
  "2396AMNH":
    "https://www.viator.com/tours/New-York-City/American-Museum-of-Natural-History/d687-2396AMNH",
};

const FALLBACK_ENGINE6_VIATOR_SEARCH_URL = "https://www.viator.com/search";

const normalizePreferredViatorUrl = (preferredUrl: string | null) => {
  if (!preferredUrl) {
    return null;
  }

  try {
    const parsed = new URL(preferredUrl);
    if (!parsed.hostname.endsWith("viator.com")) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const resolveEngine6OfferUrl = (
  bookingUrl: string | null | undefined
): string | undefined => {
  if (!bookingUrl) {
    return undefined;
  }

  const parsed = normalizePreferredViatorUrl(bookingUrl);
  if (!parsed || parsed.pathname.includes("/search/")) {
    return undefined;
  }

  return parsed.toString();
};

export const buildEngine6ViatorBookingUrl = (
  productCode: string,
  preferredUrl: string | null = null
): string => {
  const canonicalUrl =
    ENGINE6_VIATOR_CANONICAL_URL_BY_PRODUCT_CODE[productCode];
  const url =
    normalizePreferredViatorUrl(preferredUrl) ??
    (canonicalUrl ? new URL(canonicalUrl) : null) ??
    new URL(
      `${FALLBACK_ENGINE6_VIATOR_SEARCH_URL}/${encodeURIComponent(productCode)}`
    );

  url.searchParams.set("pid", ENGINE6_VIATOR_AFFILIATE_PARAMS.pid);
  url.searchParams.set("mcid", ENGINE6_VIATOR_AFFILIATE_PARAMS.mcid);
  url.searchParams.set("medium", ENGINE6_VIATOR_AFFILIATE_PARAMS.medium);

  return url.toString();
};
