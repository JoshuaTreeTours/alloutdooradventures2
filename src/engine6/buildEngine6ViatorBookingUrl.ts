const ENGINE6_VIATOR_AFFILIATE_PARAMS = {
  pid: "P00290915",
  mcid: "42383",
  medium: "link",
} as const;

export const isEngine6ViatorUrl = (url: URL) =>
  url.hostname === "viator.com" ||
  url.hostname.endsWith(".viator.com") ||
  url.hostname === "travelagents.viator.com";

const isCanonicalViatorProductUrl = (url: URL) =>
  isEngine6ViatorUrl(url) &&
  url.pathname.startsWith("/tours/") &&
  !url.pathname.includes("/search/");

const normalizePreferredViatorUrl = (preferredUrl: string | null) => {
  if (!preferredUrl) {
    return null;
  }

  try {
    const parsed = new URL(preferredUrl);
    if (!isCanonicalViatorProductUrl(parsed)) {
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
): string | null => {
  void productCode;
  const url = normalizePreferredViatorUrl(preferredUrl);
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
    return null;
  }

  return (
    resolveEngine6FinalOutboundUrl({
      provider: "viator",
      url: referenceUrl,
    }) ?? null
  );
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
