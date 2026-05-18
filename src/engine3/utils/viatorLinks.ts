const AFFILIATE_PARAMS = [
  ["mcid", "58086"],
  ["pid", "P00290915"],
  ["medium", "link"],
  ["api_version", "2.0"],
  ["uid", "U00174482"],
  ["currency", "USD"],
] as const;

const hasCanonicalViatorPath = (url: string): boolean => /\/d\d+-/i.test(url);

export function buildViatorAffiliateUrl(args: {
  baseUrl?: string | null;
  fallbackUrl?: string | null;
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
    const url = new URL(candidate);

    for (const [key] of AFFILIATE_PARAMS) {
      url.searchParams.delete(key);
    }

    for (const [key, value] of AFFILIATE_PARAMS) {
      url.searchParams.append(key, value);
    }

    return url.toString();
  } catch {
    return candidate;
  }
}
