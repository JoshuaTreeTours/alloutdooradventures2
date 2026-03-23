const ENGINE6_VIATOR_AFFILIATE_PARAMS = {
  pid: "P00290915",
  mcid: "42383",
  medium: "link",
} as const;

const ENGINE6_VIATOR_CANONICAL_URL_BY_PRODUCT_CODE: Record<string, string> = {
  "163873P16":
    "https://www.viator.com/tours/Utah/East-Zion-Top-of-the-World-Jeep-Tour/d785-163873P16",
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
  const canonicalUrl = ENGINE6_VIATOR_CANONICAL_URL_BY_PRODUCT_CODE[productCode];
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
