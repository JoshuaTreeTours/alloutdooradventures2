const CANONICAL_ASN = "fhdn";
const CANONICAL_ASN_REF = "alloutdooradventures";
const CANONICAL_REF = "https://www.alloutdooradventures.com";
const CANONICAL_BACK = "https://www.alloutdooradventures.com/";

type FareharborNormalizationStats = {
  normalizedAsnToFhdn: number;
  fixedMissingAsnRef: number;
};

const stats: FareharborNormalizationStats = {
  normalizedAsnToFhdn: 0,
  fixedMissingAsnRef: 0,
};

const isDev = process.env.NODE_ENV !== "production";

const logStats = (reason: string) => {
  if (!isDev) {
    return;
  }

  console.info("[fareharbor-normalize]", reason, {
    normalizedAsnToFhdn: stats.normalizedAsnToFhdn,
    fixedMissingAsnRef: stats.fixedMissingAsnRef,
  });
};

const dedupeSearchParamsKeepingLast = (url: URL) => {
  const entries = Array.from(url.searchParams.entries());
  const deduped = new Map<string, string>();

  entries.forEach(([key, value]) => {
    deduped.set(key, value);
  });

  url.search = "";
  deduped.forEach((value, key) => {
    url.searchParams.append(key, value);
  });
};

export const getFareharborOperatorSlugFromUrl = (url?: string) => {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("fareharbor.com")) {
      return null;
    }

    const match = parsed.pathname.match(
      /\/embeds\/(?:book|calendar)\/([^/]+)\//
    );
    return match?.[1] ?? null;
  } catch {
    return null;
  }
};

export const normalizeFareharborUrl = (url: string): string => {
  try {
    const parsed = new URL(url);

    if (
      !parsed.hostname.includes("fareharbor.com") ||
      !parsed.pathname.includes("/embeds/book/")
    ) {
      return url;
    }

    dedupeSearchParamsKeepingLast(parsed);

    const currentAsn = parsed.searchParams.get("asn");
    if (currentAsn !== CANONICAL_ASN) {
      parsed.searchParams.set("asn", CANONICAL_ASN);
      stats.normalizedAsnToFhdn += 1;
      logStats("asn normalized");
    }

    const currentAsnRef = parsed.searchParams.get("asn-ref");
    if (currentAsnRef !== CANONICAL_ASN_REF) {
      if (!currentAsnRef) {
        stats.fixedMissingAsnRef += 1;
        logStats("missing asn-ref fixed");
      }
      parsed.searchParams.set("asn-ref", CANONICAL_ASN_REF);
    }

    if (!parsed.searchParams.get("ref")) {
      parsed.searchParams.set("ref", CANONICAL_REF);
    } else if (!parsed.searchParams.get("ref")?.startsWith("http")) {
      parsed.searchParams.set("ref", CANONICAL_REF);
    }

    if (!parsed.searchParams.get("back")) {
      parsed.searchParams.set("back", CANONICAL_BACK);
    }

    return parsed.toString();
  } catch {
    return url;
  }
};
