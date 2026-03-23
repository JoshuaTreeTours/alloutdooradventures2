const ENGINE6_VIATOR_AFFILIATE_PARAMS = {
  pid: "P00290915",
  mcid: "42383",
  medium: "link",
} as const;

const hasCanonicalViatorProductPath = (url: URL): boolean =>
  url.hostname.endsWith("viator.com") &&
  url.pathname.startsWith("/tours/") &&
  /\/d\d+-/i.test(url.pathname);

export const normalizeEngine6ViatorProductUrl = (
  preferredUrl: string | null | undefined
): URL | null => {
  if (!preferredUrl) {
    return null;
  }

  try {
    const parsed = new URL(preferredUrl);
    return hasCanonicalViatorProductPath(parsed) ? parsed : null;
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

  try {
    const parsed = new URL(bookingUrl);
    return parsed.toString();
  } catch {
    return undefined;
  }
};

export const buildEngine6ViatorBookingUrl = (
  preferredUrl: string | null | undefined
): string | undefined => {
  const url = normalizeEngine6ViatorProductUrl(preferredUrl);
  if (!url) {
    return undefined;
  }

  url.searchParams.set("pid", ENGINE6_VIATOR_AFFILIATE_PARAMS.pid);
  url.searchParams.set("mcid", ENGINE6_VIATOR_AFFILIATE_PARAMS.mcid);
  url.searchParams.set("medium", ENGINE6_VIATOR_AFFILIATE_PARAMS.medium);

  return url.toString();
};
