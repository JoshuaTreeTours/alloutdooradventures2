const ENGINE6_VIATOR_AFFILIATE_PARAMS = {
  pid: "P00290915",
  mcid: "42383",
  medium: "link",
} as const;

const ENGINE6_VIATOR_CANONICAL_URL_BY_PRODUCT_CODE: Record<string, string> = {
  "163873P16":
    "https://www.viator.com/tours/Utah/East-Zion-Top-of-the-World-Jeep-Tour/d785-163873P16",
  "132218P75":
    "https://www.viator.com/tours/Las-Vegas/Grand-Canyon-Skywalk-Hoover-Dam-Day-Trip-W-Lunch-from-Las-Vegas/d684-132218P75",
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

const isViatorProductDetailPath = (pathname: string) =>
  /^\/tours\/[^/]+\/[^/]+\/d\d+-[A-Z0-9]+$/i.test(pathname);

const withAffiliateParams = (url: URL) => {
  url.searchParams.set("pid", ENGINE6_VIATOR_AFFILIATE_PARAMS.pid);
  url.searchParams.set("mcid", ENGINE6_VIATOR_AFFILIATE_PARAMS.mcid);
  url.searchParams.set("medium", ENGINE6_VIATOR_AFFILIATE_PARAMS.medium);
  return url;
};

export const resolveEngine6OfferUrl = (
  bookingUrl: string | null | undefined
): string | undefined => {
  if (!bookingUrl) {
    return undefined;
  }

  const parsed = normalizePreferredViatorUrl(bookingUrl);
  if (!parsed || !isViatorProductDetailPath(parsed.pathname)) {
    return undefined;
  }

  return parsed.toString();
};

export const buildEngine6ViatorBookingUrl = (
  productCode: string,
  preferredUrl: string | null = null
): string => {
  const normalizedProductCode = productCode.trim().toUpperCase();
  const preferred = normalizePreferredViatorUrl(preferredUrl);
  const canonicalUrl =
    ENGINE6_VIATOR_CANONICAL_URL_BY_PRODUCT_CODE[normalizedProductCode];

  if (preferred && isViatorProductDetailPath(preferred.pathname)) {
    return withAffiliateParams(preferred).toString();
  }

  if (canonicalUrl) {
    return withAffiliateParams(new URL(canonicalUrl)).toString();
  }

  const fallback =
    preferred ??
    new URL(
      `${FALLBACK_ENGINE6_VIATOR_SEARCH_URL}/${encodeURIComponent(normalizedProductCode)}`
    );
  return withAffiliateParams(fallback).toString();
};
