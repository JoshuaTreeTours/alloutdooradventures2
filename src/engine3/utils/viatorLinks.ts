const AFFILIATE_PARAMS = {
  pid: "P00290915",
  mcid: "42383",
  medium: "link",
} as const;

const hasCanonicalViatorPath = (url: string): boolean => /\/d\d+-/i.test(url);

const withProductCodePath = (url: URL, productCode?: string): URL => {
  if (!productCode) {
    return url;
  }

  const normalizedCode = productCode.trim().toUpperCase();
  if (!normalizedCode) {
    return url;
  }

  const requiredSegment = `/d648-${normalizedCode}`;
  if (new RegExp(`/d\\d+-${normalizedCode}$`, "i").test(url.pathname)) {
    url.pathname = url.pathname.replace(/\/d\d+-/i, "/d648-");
    return url;
  }

  if (/\/d\d+-[^/]+$/i.test(url.pathname)) {
    url.pathname = url.pathname.replace(/\/d\d+-[^/]+$/i, requiredSegment);
    return url;
  }

  url.pathname = `${url.pathname.replace(/\/$/, "")}${requiredSegment}`;
  return url;
};

export function buildViatorAffiliateUrl(args: {
  baseUrl?: string | null;
  fallbackUrl?: string | null;
  productCode?: string | null;
}): string | null {
  const candidate =
    (args.baseUrl && hasCanonicalViatorPath(args.baseUrl)
      ? args.baseUrl
      : null) ||
    (args.fallbackUrl && hasCanonicalViatorPath(args.fallbackUrl)
      ? args.fallbackUrl
      : null) ||
    args.baseUrl ||
    args.fallbackUrl;

  if (!candidate) {
    return null;
  }

  try {
    const url = withProductCodePath(
      new URL(candidate),
      args.productCode ?? undefined
    );

    url.searchParams.set("pid", AFFILIATE_PARAMS.pid);
    url.searchParams.set("mcid", AFFILIATE_PARAMS.mcid);
    url.searchParams.set("medium", AFFILIATE_PARAMS.medium);

    return url.toString();
  } catch {
    return candidate;
  }
}
