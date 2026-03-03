const AFFILIATE_PARAMS = {
  pid: "P00290915",
  mcid: "42383",
  medium: "link",
} as const;

const hasCanonicalViatorPath = (url: string): boolean => /\/d\d+-/i.test(url);

export function buildViatorAffiliateUrl(args: {
  baseUrl?: string | null;
  fallbackUrl?: string | null;
}): string | null {
  const candidate =
    (args.baseUrl && hasCanonicalViatorPath(args.baseUrl) ? args.baseUrl : null) ||
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

    url.searchParams.set("pid", AFFILIATE_PARAMS.pid);
    url.searchParams.set("mcid", AFFILIATE_PARAMS.mcid);
    url.searchParams.set("medium", AFFILIATE_PARAMS.medium);

    return url.toString();
  } catch {
    return candidate;
  }
}

