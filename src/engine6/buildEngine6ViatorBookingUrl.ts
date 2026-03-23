const ENGINE6_VIATOR_AFFILIATE_PARAMS = {
  pid: "P00290915",
  mcid: "42383",
  medium: "link",
} as const;

const FALLBACK_ENGINE6_VIATOR_SEARCH_URL = "https://www.viator.com/search";

export const isEngine6ViatorUrl = (url: URL) =>
  url.hostname === "viator.com" ||
  url.hostname.endsWith(".viator.com") ||
  url.hostname === "travelagents.viator.com";

const normalizePreferredViatorUrl = (preferredUrl: string | null) => {
  if (!preferredUrl) {
    return null;
  }

  try {
    const parsed = new URL(preferredUrl);
    if (!isEngine6ViatorUrl(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const buildEngine6ViatorReferenceUrl = (
  productCode: string,
  preferredUrl: string | null = null
): string => {
  const url =
    normalizePreferredViatorUrl(preferredUrl) ??
    new URL(
      `${FALLBACK_ENGINE6_VIATOR_SEARCH_URL}/${encodeURIComponent(productCode)}`
    );

  url.searchParams.delete("pid");
  url.searchParams.delete("mcid");
  url.searchParams.delete("medium");

  return url.toString();
};

export const buildEngine6ViatorBookingUrl = (
  productCode: string,
  preferredUrl: string | null = null
): string =>
  resolveEngine6FinalOutboundUrl({
    provider: "viator",
    url: buildEngine6ViatorReferenceUrl(productCode, preferredUrl),
  }) ?? buildEngine6ViatorReferenceUrl(productCode, preferredUrl);

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
}): string | undefined => {
  const outboundUrl = resolveEngine6FinalOutboundUrl({ provider, url });
  if (!outboundUrl) {
    return undefined;
  }

  if (provider !== "viator") {
    return outboundUrl;
  }

  const parsed = normalizePreferredViatorUrl(outboundUrl);
  if (!parsed || parsed.pathname.includes("/search/")) {
    return undefined;
  }

  return outboundUrl;
};
