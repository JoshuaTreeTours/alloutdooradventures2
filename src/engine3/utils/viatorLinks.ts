const AFFILIATE_PARAMS = {
  pid: "P00290915",
  mcid: "42383",
  medium: "link",
} as const;

const VIATOR_HOST = "www.viator.com";

const trim = (value?: string | null): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : undefined;
};

const hasCanonicalViatorPath = (url: string): boolean => /\/d\d+-/i.test(url);

const isViatorHost = (hostname: string): boolean =>
  hostname === "viator.com" || hostname.endsWith(".viator.com");

const parseViatorTourPathParts = (url: URL) => {
  const parts = url.pathname.split("/").filter(Boolean);
  const toursIndex = parts.findIndex(segment => segment.toLowerCase() === "tours");

  if (toursIndex < 0) {
    return null;
  }

  const destination = parts[toursIndex + 1];
  const slug = parts[toursIndex + 2];
  const detailSegment = parts[toursIndex + 3];

  return {
    destination,
    slug,
    detailSegment,
  };
};

const composeCanonicalPath = (input: {
  destination?: string;
  slug?: string;
  detailSegment?: string;
  productCode?: string;
}): string | null => {
  const destination = trim(input.destination);
  const slug = trim(input.slug);
  const productCode = trim(input.productCode)?.toUpperCase();

  if (!destination || !slug || !productCode) {
    return null;
  }

  const destinationIdMatch = trim(input.detailSegment)?.match(/^d(\d+)-/i);
  const destinationId = destinationIdMatch?.[1] ?? "648";

  return `/tours/${destination}/${slug}/d${destinationId}-${productCode}`;
};

export function buildViatorAffiliateUrl(args: {
  baseUrl?: string | null;
  fallbackUrl?: string | null;
  productCode?: string | null;
}): string | null {
  const candidates = [trim(args.baseUrl), trim(args.fallbackUrl)].filter(
    (value): value is string => Boolean(value)
  );

  if (!candidates.length) {
    return null;
  }

  const preferredCandidate =
    candidates.find(candidate => hasCanonicalViatorPath(candidate)) ?? candidates[0];

  try {
    const parsedCandidates = candidates
      .map(candidate => {
        try {
          return new URL(candidate);
        } catch {
          return null;
        }
      })
      .filter((value): value is URL => value !== null && isViatorHost(value.hostname));

    const url = new URL(preferredCandidate);

    if (!isViatorHost(url.hostname)) {
      return null;
    }

    const pathParts = parseViatorTourPathParts(url);
    const fallbackPathParts = parsedCandidates
      .map(candidate => parseViatorTourPathParts(candidate))
      .find(Boolean);

    const canonicalPath = composeCanonicalPath({
      destination: pathParts?.destination ?? fallbackPathParts?.destination,
      slug: pathParts?.slug ?? fallbackPathParts?.slug,
      detailSegment: pathParts?.detailSegment ?? fallbackPathParts?.detailSegment,
      productCode: args.productCode ?? pathParts?.detailSegment?.split("-").slice(1).join("-"),
    });

    if (canonicalPath) {
      url.pathname = canonicalPath;
    }

    if (!hasCanonicalViatorPath(url.pathname)) {
      return null;
    }

    url.protocol = "https:";
    url.hostname = VIATOR_HOST;

    url.searchParams.set("pid", AFFILIATE_PARAMS.pid);
    url.searchParams.set("mcid", AFFILIATE_PARAMS.mcid);
    url.searchParams.set("medium", AFFILIATE_PARAMS.medium);

    return url.toString();
  } catch {
    return null;
  }
}
