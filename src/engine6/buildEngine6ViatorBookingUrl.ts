const ENGINE6_VIATOR_AFFILIATE_PARAMS = {
  pid: "P00290915",
  mcid: "42383",
  medium: "link",
} as const;

const VIATOR_WWW_HOST = "www.viator.com";
const LOCALE_PREFIX_PATTERN = /^\/[a-z]{2}(?:-[A-Z]{2})?(?=\/)/;

export const isEngine6ViatorUrl = (url: URL) =>
  url.hostname === "viator.com" ||
  url.hostname.endsWith(".viator.com") ||
  url.hostname === "travelagents.viator.com";

const normalizeViatorPathname = (pathname: string) =>
  pathname.replace(LOCALE_PREFIX_PATTERN, "") || "/";

const isCanonicalViatorProductPathname = (pathname: string) =>
  /^\/tours\/[^?#]+/i.test(pathname) || /^\/tours\/[A-Z0-9]+$/i.test(pathname);

const normalizePreferredViatorUrl = (preferredUrl: string | null) => {
  if (!preferredUrl) {
    return null;
  }

  try {
    const parsed = new URL(preferredUrl);
    if (!isEngine6ViatorUrl(parsed)) {
      return null;
    }

    parsed.hostname = VIATOR_WWW_HOST;
    parsed.pathname = normalizeViatorPathname(parsed.pathname);

    if (!isCanonicalViatorProductPathname(parsed.pathname)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const buildFallbackViatorProductUrl = (productCode: string) => {
  const normalizedProductCode = productCode.trim();
  if (!normalizedProductCode) {
    return null;
  }

  return new URL(
    `https://${VIATOR_WWW_HOST}/tours/${encodeURIComponent(normalizedProductCode)}`
  );
};

const logResolvedEngine6ViatorUrls = ({
  productCode,
  canonicalUrl,
  outboundUrl,
}: {
  productCode: string;
  canonicalUrl: string | null;
  outboundUrl: string | null;
}) => {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.info(`[engine6-viator-url] productCode=${productCode}`);
  console.info(
    `[engine6-viator-url] canonicalUrl=${canonicalUrl ?? "<missing>"}`
  );
  console.info(
    `[engine6-viator-url] outboundUrl=${outboundUrl ?? "<missing>"}`
  );
};

export const buildEngine6ViatorReferenceUrl = (
  productCode: string,
  preferredUrl: string | null = null
): string | null => {
  const url =
    normalizePreferredViatorUrl(preferredUrl) ??
    buildFallbackViatorProductUrl(productCode);
  if (!url) {
    return null;
  }

  url.searchParams.delete("pid");
  url.searchParams.delete("mcid");
  url.searchParams.delete("medium");

  return url.toString();
};

export const buildEngine6ViatorBookingUrl = (
  productCode: string,
  preferredUrl: string | null = null
): string | null => {
  const referenceUrl = buildEngine6ViatorReferenceUrl(
    productCode,
    preferredUrl
  );
  if (!referenceUrl) {
    logResolvedEngine6ViatorUrls({
      productCode,
      canonicalUrl: null,
      outboundUrl: null,
    });
    return null;
  }

  const outboundUrl =
    resolveEngine6FinalOutboundUrl({
      provider: "viator",
      url: referenceUrl,
    }) ?? null;

  logResolvedEngine6ViatorUrls({
    productCode,
    canonicalUrl: referenceUrl,
    outboundUrl,
  });

  return outboundUrl;
};

export const resolveEngine6FinalOutboundUrl = ({
  provider,
  url,
}: {
  provider: string | null | undefined;
  url: string | null | undefined;
}): string | undefined => {
  if (!url) {
    return undefined;
  }

  if (provider !== "viator") {
    return url;
  }

  const parsed = normalizePreferredViatorUrl(url);
  if (!parsed) {
    return undefined;
  }

  parsed.searchParams.set("pid", ENGINE6_VIATOR_AFFILIATE_PARAMS.pid);
  parsed.searchParams.set("mcid", ENGINE6_VIATOR_AFFILIATE_PARAMS.mcid);
  parsed.searchParams.set("medium", ENGINE6_VIATOR_AFFILIATE_PARAMS.medium);

  return parsed.toString();
};

export const resolveEngine6OfferUrl = ({
  provider,
  url,
}: {
  provider: string | null | undefined;
  url: string | null | undefined;
}): string | undefined => resolveEngine6FinalOutboundUrl({ provider, url });
