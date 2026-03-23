const ENGINE6_VIATOR_AFFILIATE_PARAMS = {
  pid: "P00290915",
  mcid: "42383",
  medium: "link",
} as const;

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

const buildEngine6ViatorSearchUrl = (productCode: string): URL =>
  new URL(
    `${FALLBACK_ENGINE6_VIATOR_SEARCH_URL}/${encodeURIComponent(productCode)}`
  );

export const resolveEngine6OfferUrl = (
  bookingUrl: string | null | undefined
): string | undefined => {
  if (!bookingUrl) {
    return undefined;
  }

  const parsed = normalizePreferredViatorUrl(bookingUrl);
  if (!parsed) {
    return undefined;
  }

  return parsed.toString();
};

export const buildEngine6ViatorBookingUrl = (
  productCode: string,
  _preferredUrl: string | null = null
): string => {
  const url = buildEngine6ViatorSearchUrl(productCode);
  url.searchParams.set("pid", ENGINE6_VIATOR_AFFILIATE_PARAMS.pid);
  url.searchParams.set("mcid", ENGINE6_VIATOR_AFFILIATE_PARAMS.mcid);
  url.searchParams.set("medium", ENGINE6_VIATOR_AFFILIATE_PARAMS.medium);

  return url.toString();
};
